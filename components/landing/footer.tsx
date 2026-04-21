import Link from "next/link";
import { Sparkles } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">
              SkillBridge
            </span>
          </Link>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="#features" className="hover:text-foreground">
              Features
            </Link>
            <Link href="#how-it-works" className="hover:text-foreground">
              How It Works
            </Link>
            <Link href="#testimonials" className="hover:text-foreground">
              Testimonials
            </Link>
            <Link href="/auth/login" className="hover:text-foreground">
              Login
            </Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SkillBridge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
