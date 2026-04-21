import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { AnalysisResults } from "@/components/analyzer/analysis-results";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { SkillAnalysisRecord } from "@/lib/types";
import { ExportWrapper } from "./export-wrapper";

export default async function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: analysis, error } = await supabase
    .from("skill_analyses")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !analysis) {
    notFound();
  }

  const analysisRecord = analysis as SkillAnalysisRecord;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/history">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {analysisRecord.target_role}
            </h1>
            <p className="text-sm text-muted-foreground">
              Analyzed on{" "}
              {new Date(analysisRecord.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <ExportWrapper
          analysis={analysisRecord.analysis_result}
          targetRole={analysisRecord.target_role}
        />
      </div>

      <AnalysisResults analysis={analysisRecord.analysis_result} />
    </div>
  );
}
