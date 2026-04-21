import { Upload, Target, Sparkles, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload Your Resume",
    description:
      "Simply upload your resume in PDF or text format. Our AI will parse and analyze your current skills and experience.",
  },
  {
    icon: Target,
    step: "02",
    title: "Select Target Role",
    description:
      "Choose from popular fresher roles like Software Developer, Data Analyst, UI/UX Designer, and more.",
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Get AI Analysis",
    description:
      "Receive instant, detailed insights on your skill gaps with percentage scores and prioritized recommendations.",
  },
  {
    icon: TrendingUp,
    step: "04",
    title: "Learn & Grow",
    description:
      "Follow your personalized learning path, practice with mock interviews, and track your progress to job readiness.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Your Journey to Career Success
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Four simple steps to identify your skill gaps and create a clear
            path to your dream job.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-8 top-0 hidden h-full w-px bg-border md:block" />

            <div className="space-y-12">
              {steps.map((step, index) => (
                <div key={step.step} className="relative flex gap-6">
                  {/* Step indicator */}
                  <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-background">
                    <step.icon className="h-7 w-7 text-primary" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2 pt-2">
                    <div className="mb-1 text-sm font-semibold text-primary">
                      Step {step.step}
                    </div>
                    <h3 className="mb-2 text-xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>

                  {/* Arrow to next step (hidden on last item) */}
                  {index < steps.length - 1 && (
                    <div className="absolute -bottom-6 left-8 hidden h-6 w-px bg-primary/30 md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
