export interface SkillAnalysis {
  overallScore: number;
  currentSkills: {
    name: string;
    level: "beginner" | "intermediate" | "advanced";
    yearsOfExperience: number | null;
  }[];
  requiredSkills: {
    name: string;
    importance: "critical" | "important" | "nice-to-have";
    currentLevel: "none" | "beginner" | "intermediate" | "advanced";
    targetLevel: "beginner" | "intermediate" | "advanced";
  }[];
  skillGaps: {
    skill: string;
    gap: "large" | "medium" | "small";
    priority: number;
    recommendation: string;
  }[];
  learningPath: {
    phase: number;
    title: string;
    duration: string;
    skills: string[];
    resources: {
      type: "course" | "tutorial" | "documentation" | "project";
      name: string;
      url: string | null;
      estimatedTime: string;
    }[];
  }[];
  strengths: string[];
  areasForImprovement: string[];
  interviewTopics: {
    topic: string;
    importance: "high" | "medium" | "low";
    preparationTips: string[];
  }[];
  summary: string;
}

export interface SkillAnalysisRecord {
  id: string;
  user_id: string;
  target_role: string;
  resume_text: string | null;
  analysis_result: SkillAnalysis;
  created_at: string;
  updated_at: string;
}

export interface MockInterview {
  id: string;
  user_id: string;
  analysis_id: string | null;
  target_role: string;
  questions: InterviewQuestion[];
  status: "in_progress" | "completed";
  score: number | null;
  feedback: string | null;
  created_at: string;
  updated_at: string;
}

export interface InterviewQuestion {
  question: string;
  type: "technical" | "behavioral" | "situational";
  answer?: string;
  feedback?: string;
  score?: number;
}

export const TARGET_ROLES = [
  "Software Developer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "UI/UX Designer",
  "Product Manager",
  "Business Analyst",
  "DevOps Engineer",
  "Cloud Engineer",
  "Cybersecurity Analyst",
  "Mobile App Developer",
  "QA Engineer",
] as const;

export type TargetRole = (typeof TARGET_ROLES)[number];
