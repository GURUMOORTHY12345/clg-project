"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, BookOpen, Code2 } from "lucide-react";

interface ReadinessCategoryProps {
  score: number;
}

export function ReadinessCategory({ score }: ReadinessCategoryProps) {
  const getCategory = () => {
    if (score >= 70) return { label: "Job Ready", color: "bg-green-100 text-green-800 border-green-300" };
    if (score >= 40) return { label: "Intermediate", color: "bg-yellow-100 text-yellow-800 border-yellow-300" };
    return { label: "Beginner", color: "bg-red-100 text-red-800 border-red-300" };
  };

  const category = getCategory();

  return (
    <Badge className={`text-lg px-4 py-2 font-semibold border ${category.color}`}>
      {category.label}
    </Badge>
  );
}

interface ProjectRecommendationsProps {
  skillGaps: Array<{ skill: string }>;
}

const PROJECT_IDEAS: Record<string, string> = {
  "React": "Build a React dashboard with data visualization and real-time updates",
  "Vue": "Create a Vue.js single-page application with component composition",
  "SQL": "Design and build a database management system with CRUD operations",
  "Python": "Develop a Python automation script or data processing application",
  "Node.js": "Build a REST API server with Express.js and database integration",
  "JavaScript": "Create an interactive web application with vanilla JavaScript",
  "TypeScript": "Refactor an existing project using TypeScript for type safety",
  "Docker": "Containerize an application and set up a multi-container environment",
  "AWS": "Deploy an application to AWS with EC2, S3, and RDS",
  "Git": "Contribute to an open-source project using Git workflow",
  "Testing": "Write comprehensive unit and integration tests for a project",
  "CSS": "Build a responsive website with modern CSS and animations",
  "MongoDB": "Create a NoSQL database design for a real-world scenario",
  "REST API": "Design and implement a RESTful API with proper documentation",
  "DevOps": "Set up CI/CD pipeline for automated testing and deployment",
};

export function ProjectRecommendations({ skillGaps }: ProjectRecommendationsProps) {
  const projects = skillGaps
    .slice(0, 3)
    .map((gap) => PROJECT_IDEAS[gap.skill] || `Build a project focusing on ${gap.skill}`)
    .filter((p) => p);

  if (projects.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Code2 className="h-5 w-5 text-primary" />
          Project Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.map((project, index) => (
          <div key={index} className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {index + 1}
            </div>
            <p className="text-sm text-muted-foreground">{project}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface ResumeTipsProps {
  role: string;
}

const RESUME_TIPS = [
  "Add specific projects with measurable outcomes and impact metrics",
  "Use action verbs like 'Developed', 'Implemented', 'Designed' instead of passive language",
  "Include quantifiable achievements (e.g., 'Improved performance by 40%')",
  "Highlight technical skills relevant to your target role",
  "Add links to GitHub, portfolio, or live project demos",
];

export function ResumeTips({ role }: ResumeTipsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lightbulb className="h-5 w-5 text-chart-4" />
          Resume Tips for {role}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {RESUME_TIPS.map((tip, index) => (
          <div key={index} className="flex gap-3">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-chart-4/10 text-xs font-semibold text-chart-4">
              {index + 1}
            </div>
            <p className="text-sm text-muted-foreground">{tip}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface FreeCoursesProps {
  skillGaps: Array<{ skill: string }>;
}

const FREE_COURSES: Record<string, { name: string; platform: string; url: string }[]> = {
  "React": [
    { name: "React Basics", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=4UZrsTqkcW4" },
    { name: "React Documentation", platform: "Official Docs", url: "https://react.dev" },
  ],
  "Vue": [
    { name: "Vue 3 Essentials", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=FXpIoQ_rT_c" },
  ],
  "SQL": [
    { name: "SQL Tutorial", platform: "W3Schools", url: "https://www.w3schools.com/sql/" },
    { name: "SQL for Beginners", platform: "YouTube", url: "https://www.youtube.com/watch?v=HXV3zeQKqGY" },
  ],
  "Python": [
    { name: "Python for Beginners", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=rfscVS0vtik" },
    { name: "Python Basics", platform: "W3Schools", url: "https://www.w3schools.com/python/" },
  ],
  "JavaScript": [
    { name: "JavaScript Basics", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=PkZYUJad_-0" },
    { name: "JavaScript Tutorial", platform: "W3Schools", url: "https://www.w3schools.com/js/" },
  ],
  "Node.js": [
    { name: "Node.js Tutorial", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=RLtK4dK2YN0" },
  ],
  "TypeScript": [
    { name: "TypeScript Basics", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=gieEQFLvZOw" },
  ],
  "CSS": [
    { name: "CSS Tutorial", platform: "W3Schools", url: "https://www.w3schools.com/css/" },
    { name: "CSS Flexbox", platform: "YouTube", url: "https://www.youtube.com/watch?v=JJSoEo8JSnc" },
  ],
  "Docker": [
    { name: "Docker Tutorial", platform: "freeCodeCamp", url: "https://www.youtube.com/watch?v=fqMOX6JJhGo" },
  ],
  "Git": [
    { name: "Git Tutorial", platform: "W3Schools", url: "https://www.w3schools.com/git/" },
    { name: "Git for Beginners", platform: "YouTube", url: "https://www.youtube.com/watch?v=8JJ101D3knE" },
  ],
};

export function FreeCourses({ skillGaps }: FreeCoursesProps) {
  const courses = skillGaps
    .slice(0, 3)
    .flatMap((gap) => FREE_COURSES[gap.skill] || [])
    .slice(0, 3);

  if (courses.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5 text-accent" />
          Recommended Free Courses
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {courses.map((course, index) => (
          <a
            key={index}
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-foreground">{course.name}</p>
                <p className="text-xs text-muted-foreground">{course.platform}</p>
              </div>
              <Badge variant="outline" className="shrink-0">→</Badge>
            </div>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}
