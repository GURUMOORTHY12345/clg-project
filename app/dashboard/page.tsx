import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  FileSearch,
  MessageSquare,
  TrendingUp,
  Target,
  Clock,
  ArrowRight,
} from "lucide-react";
import type { SkillAnalysisRecord, MockInterview } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch recent analyses
  const { data: analyses } = await supabase
    .from("skill_analyses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  // Fetch recent interviews
  const { data: interviews } = await supabase
    .from("mock_interviews")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(3);

  const recentAnalyses = (analyses || []) as SkillAnalysisRecord[];
  const recentInterviews = (interviews || []) as MockInterview[];

  const displayName =
    user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";

  // Calculate stats
  const totalAnalyses = recentAnalyses.length;
  const totalInterviews = recentInterviews.length;
  const latestScore = recentAnalyses[0]?.analysis_result?.overallScore || null;
  const averageInterviewScore =
    recentInterviews.length > 0
      ? Math.round(
          recentInterviews
            .filter((i) => i.score !== null)
            .reduce((acc, i) => acc + (i.score || 0), 0) /
            recentInterviews.filter((i) => i.score !== null).length
        ) || null
      : null;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {displayName}!
        </h1>
        <p className="mt-1 text-muted-foreground">
          Track your progress and continue your career preparation journey.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <FileSearch className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                New Skill Analysis
              </h3>
              <p className="text-sm text-muted-foreground">
                Upload your resume and get AI insights
              </p>
            </div>
            <Button asChild>
              <Link href="/dashboard/analyze">
                Start
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-accent/5">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
              <MessageSquare className="h-6 w-6 text-accent-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Mock Interview</h3>
              <p className="text-sm text-muted-foreground">
                Practice with AI interviewer
              </p>
            </div>
            <Button variant="secondary" asChild>
              <Link href="/dashboard/interview">
                Practice
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Analyses
            </CardTitle>
            <FileSearch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalAnalyses}
            </div>
            <p className="text-xs text-muted-foreground">
              Skill gap analyses completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Latest Score
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {latestScore !== null ? `${latestScore}%` : "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              Job readiness score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mock Interviews
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {totalInterviews}
            </div>
            <p className="text-xs text-muted-foreground">
              Practice sessions completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Interview Score
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {averageInterviewScore !== null ? `${averageInterviewScore}%` : "-"}
            </div>
            <p className="text-xs text-muted-foreground">
              Average performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Analyses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Analyses</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/history">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentAnalyses.length > 0 ? (
              <div className="space-y-4">
                {recentAnalyses.map((analysis) => (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Target className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {analysis.target_role}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {new Date(analysis.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-primary">
                        {analysis.analysis_result?.overallScore || 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <FileSearch className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No analyses yet
                </p>
                <Button size="sm" className="mt-4" asChild>
                  <Link href="/dashboard/analyze">Start your first analysis</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Interviews */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Interviews</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/interview">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentInterviews.length > 0 ? (
              <div className="space-y-4">
                {recentInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                        <MessageSquare className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {interview.target_role}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {new Date(interview.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {interview.score !== null ? (
                        <>
                          <p className="text-lg font-semibold text-accent">
                            {interview.score}%
                          </p>
                          <p className="text-xs text-muted-foreground">Score</p>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          In progress
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No interviews yet
                </p>
                <Button size="sm" className="mt-4" asChild>
                  <Link href="/dashboard/interview">Start practicing</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
