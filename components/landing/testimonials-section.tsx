import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "SkillBridge helped me understand exactly what I was missing for my dream role. Within 3 months of following the learning path, I landed a job at a top tech company!",
    name: "Priya Sharma",
    role: "Software Developer",
    company: "Tech Startup",
  },
  {
    quote:
      "The mock interview feature was a game-changer. The AI asked questions I actually faced in real interviews. I felt so much more confident!",
    name: "Rahul Patel",
    role: "Data Analyst",
    company: "Fortune 500",
  },
  {
    quote:
      "As a fresher, I had no idea what skills employers were looking for. SkillBridge gave me a clear roadmap and helped me prioritize my learning.",
    name: "Ananya Gupta",
    role: "UI/UX Designer",
    company: "Design Agency",
  },
];

export function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Success Stories from Fresh Graduates
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Join thousands of graduates who have successfully bridged their
            skill gaps and landed their dream jobs.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="relative rounded-xl border border-border bg-card p-6"
            >
              <Quote className="absolute right-4 top-4 h-8 w-8 text-primary/10" />
              <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                &quot;{testimonial.quote}&quot;
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="font-medium text-foreground">
                    {testimonial.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {testimonial.role} at {testimonial.company}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
