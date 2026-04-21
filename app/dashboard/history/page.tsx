import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Target, Clock, FileSearch, Eye } from "lucide-react";
import type { SkillAnalysisRecord } from "@/lib/types";

export default async function HistoryPage() {
  const supabase = await createClient();

  const { data: analyses } = await supabase
    .from("skill_analyses")
    .select("*")
    .order("created_at", { ascending: false });

  const allAnalyses = (analyses || []) as SkillAnalysisRecord[];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-accent/10 text-accent border-accent/20";
    if (score >= 60) return "bg-chart-4/10 text-chart-4 border-chart-4/20";
    return "bg-destructive/10 text-destructive border-destructive/20";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analysis History</h1>
          <p className="mt-1 text-muted-foreground">
            View all your past skill gap analyses.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/analyze">New Analysis</Link>
        </Button>
      </div>

      {allAnalyses.length > 0 ? (
        <div className="grid gap-4">
          {allAnalyses.map((analysis) => (
            <Card key={analysis.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {analysis.target_role}
                    </h3>
                    <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(analysis.created_at).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                      <span>
                        {analysis.analysis_result?.skillGaps?.length || 0} skill gaps
                        identified
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={getScoreColor(
                        analysis.analysis_result?.overallScore || 0
                      )}
                    >
                      {analysis.analysis_result?.overallScore || 0}% Ready
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/history/${analysis.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileSearch className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-semibold text-foreground">
              No analyses yet
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Start by analyzing your resume for your target role.
            </p>
            <Button className="mt-4" asChild>
              <Link href="/dashboard/analyze">Start Your First Analysis</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
