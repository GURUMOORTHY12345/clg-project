"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResumeUploadProps {
  onTextExtracted: (text: string) => void;
  disabled?: boolean;
}

export function ResumeUpload({ onTextExtracted, disabled }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractTextFromFile = async (file: File): Promise<string> => {
    if (file.type === "text/plain") {
      return await file.text();
    }

    // For PDF files, we'll extract text client-side
    if (file.type === "application/pdf") {
      // Import pdf.js dynamically
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) => ("str" in item ? item.str : ""))
          .join(" ");
        text += pageText + "\n";
      }

      return text;
    }

    throw new Error("Unsupported file type. Please upload a PDF or TXT file.");
  };

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsProcessing(true);

      try {
        const text = await extractTextFromFile(file);
        if (text.trim().length < 50) {
          throw new Error(
            "Could not extract enough text from the file. Please try a different file or paste your resume text directly."
          );
        }
        setFile(file);
        onTextExtracted(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to process file");
        setFile(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [onTextExtracted]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    [handleFile]
  );

  const removeFile = () => {
    setFile(null);
    setError(null);
    onTextExtracted("");
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative rounded-lg border-2 border-dashed p-8 text-center transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50",
          disabled && "pointer-events-none opacity-50"
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <div className="text-left">
              <p className="font-medium text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={removeFile}
              className="ml-2"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {isProcessing ? "Processing..." : "Drop your resume here"}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                or click to browse (PDF, TXT)
              </p>
            </div>
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileInput}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={disabled || isProcessing}
            />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
