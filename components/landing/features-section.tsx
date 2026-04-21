import {
  Brain,
  FileText,
  LineChart,
  MessageSquare,
  Route,
  Download,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Smart Resume Parsing",
    description:
      "Upload your resume and our AI instantly extracts your skills, experience, and education to create a comprehensive profile.",
  },
  {
    icon: Brain,
    title: "AI Skill Gap Analysis",
    description:
      "Get detailed insights on what skills you have, what you need, and exactly where the gaps are for your target role.",
  },
  {
    icon: Route,
    title: "Personalized Learning Paths",
    description:
      "Receive a customized roadmap with curated courses, resources, and milestones to bridge your skill gaps efficiently.",
  },
  {
    icon: LineChart,
    title: "Visual Progress Dashboard",
    description:
      "Track your improvement with beautiful charts showing skill development, completed courses, and interview readiness.",
  },
  {
    icon: MessageSquare,
    title: "AI Mock Interviews",
    description:
      "Practice with our AI interviewer that adapts questions based on your target role and provides real-time feedback.",
  },
  {
    icon: Download,
    title: "Export & Share",
    description:
      "Download your analysis as a professional PDF report to share with mentors or use during job applications.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-muted/30 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need to Land Your Dream Job
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            Our AI-powered platform provides comprehensive tools to analyze,
            learn, and practice your way to career success.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
