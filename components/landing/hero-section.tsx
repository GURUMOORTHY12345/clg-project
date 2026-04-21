import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Brain, Target } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 left-0 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <Brain className="h-4 w-4 text-primary" />
            AI-Powered Career Analysis
          </div>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Bridge the Gap Between{" "}
            <span className="text-primary">Your Skills</span> and{" "}
            <span className="text-primary">Dream Job</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Upload your resume, select your target role, and get instant AI-powered
            insights on skill gaps, personalized learning paths, and interview
            preparation tailored for fresh graduates.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="gap-2">
              <Link href="/auth/sign-up">
                Start Your Analysis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#how-it-works">See How It Works</Link>
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span>Detailed Skill Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Personalized Learning Paths</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span>AI Mock Interviews</span>
            </div>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative rounded-xl border border-border bg-card p-2 shadow-2xl shadow-primary/10">
            <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-chart-4/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-accent/60" />
            </div>
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-muted/30">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="flex h-full flex-col p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="h-4 w-32 rounded bg-foreground/10" />
          <div className="mt-2 h-3 w-48 rounded bg-foreground/5" />
        </div>
        <div className="h-8 w-24 rounded-md bg-primary/20" />
      </div>

      <div className="grid flex-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/20" />
            <div className="h-3 w-20 rounded bg-foreground/10" />
          </div>
          <div className="text-2xl font-bold text-foreground">78%</div>
          <div className="mt-1 h-2 w-16 rounded bg-foreground/5" />
          <div className="mt-3 h-2 w-full rounded-full bg-muted">
            <div className="h-2 w-3/4 rounded-full bg-primary" />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-accent/20" />
            <div className="h-3 w-24 rounded bg-foreground/10" />
          </div>
          <div className="text-2xl font-bold text-foreground">12</div>
          <div className="mt-1 h-2 w-20 rounded bg-foreground/5" />
          <div className="mt-3 space-y-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                <div className="h-2 flex-1 rounded bg-foreground/5" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-chart-4/20" />
            <div className="h-3 w-28 rounded bg-foreground/10" />
          </div>
          <div className="text-2xl font-bold text-foreground">5</div>
          <div className="mt-1 h-2 w-24 rounded bg-foreground/5" />
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-8 flex-1 rounded bg-chart-4/20"
                style={{ height: `${20 + i * 8}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
