import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const benefits = [
  "Free skill gap analysis",
  "Personalized learning paths",
  "AI-powered mock interviews",
  "Progress tracking dashboard",
];

export function CTASection() {
  return (
    <section className="px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-16 sm:px-12 sm:py-20">
          {/* Background decoration */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary-foreground/5" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-foreground/5" />

          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
              Ready to Bridge Your Skill Gap?
            </h2>
            <p className="mt-4 text-pretty text-lg text-primary-foreground/80">
              Join thousands of fresh graduates who are accelerating their
              careers with AI-powered insights.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-2 text-sm text-primary-foreground/90"
                >
                  <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                  {benefit}
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="gap-2 font-semibold"
              >
                <Link href="/auth/sign-up">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
