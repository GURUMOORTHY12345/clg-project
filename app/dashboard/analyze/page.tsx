"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ResumeUpload } from "@/components/analyzer/resume-upload";
import { RoleSelector } from "@/components/analyzer/role-selector";
import { AnalysisResults } from "@/components/analyzer/analysis-results";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import type { SkillAnalysis, TargetRole } from "@/lib/types";
import { Sparkles, Upload, FileText } from "lucide-react";
import { ExportButton } from "@/components/analyzer/export-button";

export default function AnalyzePage() {
  const router = useRouter();
  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState<TargetRole | "">("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<SkillAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inputMethod, setInputMethod] = useState<"upload" | "paste">("upload");

  const canAnalyze = resumeText.trim().length >= 50 && targetRole !== "";

  const handleAnalyze = async () => {
    if (!canAnalyze) return;

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, targetRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze resume");
      }

      // Parse SSE stream manually
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let buffer = "";
      let partialObject = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data:")) {
            const data = trimmed.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === "object" && parsed.object) {
                partialObject = JSON.stringify(parsed.object);
                // Try to parse as complete analysis
                try {
                  const analysisData = parsed.object as SkillAnalysis;
                  if (analysisData.overallScore !== undefined) {
                    setAnalysis(analysisData);
                  }
                } catch {
                  // Still streaming
                }
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }

      // Final parse attempt
      if (partialObject) {
        try {
          const finalAnalysis = JSON.parse(partialObject) as SkillAnalysis;
          setAnalysis(finalAnalysis);

          // Save the analysis
          await fetch("/api/analyze/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              targetRole,
              resumeText,
              analysis: finalAnalysis,
            }),
          });
        } catch {
          // Use whatever we got
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResumeText("");
    setTargetRole("");
    setAnalysis(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Skill Gap Analysis
        </h1>
        <p className="mt-1 text-muted-foreground">
          Upload your resume and select your target role to get personalized
          insights.
        </p>
      </div>

      {!analysis ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Start Your Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs
              value={inputMethod}
              onValueChange={(v) => setInputMethod(v as "upload" | "paste")}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Resume
                </TabsTrigger>
                <TabsTrigger value="paste" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Paste Text
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-4">
                <ResumeUpload
                  onTextExtracted={setResumeText}
                  disabled={isAnalyzing}
                />
              </TabsContent>

              <TabsContent value="paste" className="mt-4">
                <div className="space-y-2">
                  <Label htmlFor="resume-text">Resume Content</Label>
                  <Textarea
                    id="resume-text"
                    placeholder="Paste your resume text here..."
                    className="min-h-[200px]"
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    disabled={isAnalyzing}
                  />
                  <p className="text-xs text-muted-foreground">
                    {resumeText.length} characters
                    {resumeText.length < 50 && " (minimum 50 required)"}
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <RoleSelector
              value={targetRole}
              onChange={setTargetRole}
              disabled={isAnalyzing}
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              onClick={handleAnalyze}
              disabled={!canAnalyze || isAnalyzing}
              className="w-full gap-2"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Analyzing your skills...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze My Skills
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Analysis Results
              </h2>
              <p className="text-sm text-muted-foreground">
                Target Role: {targetRole}
              </p>
            </div>
            <div className="flex gap-2">
              <ExportButton analysis={analysis} targetRole={targetRole} />
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/history")}
              >
                View History
              </Button>
              <Button variant="outline" onClick={handleReset}>
                New Analysis
              </Button>
            </div>
          </div>

          <AnalysisResults analysis={analysis} />
        </div>
      )}
    </div>
  );
}
