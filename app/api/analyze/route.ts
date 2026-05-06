import { streamText, Output } from "ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Use AI Gateway by default (zero config), or custom OpenAI API key if provided
function getModel() {
  // AI Gateway is recommended and requires no API key setup
  return "openai/gpt-4o-mini";
}

const skillAnalysisSchema = z.object({
  overallScore: z.number().min(0).max(100),
  currentSkills: z.array(
    z.object({
      name: z.string(),
      level: z.enum(["beginner", "intermediate", "advanced"]),
      yearsOfExperience: z.number().nullable(),
    })
  ),
  requiredSkills: z.array(
    z.object({
      name: z.string(),
      importance: z.enum(["critical", "important", "nice-to-have"]),
      currentLevel: z.enum(["none", "beginner", "intermediate", "advanced"]),
      targetLevel: z.enum(["beginner", "intermediate", "advanced"]),
    })
  ),
  skillGaps: z.array(
    z.object({
      skill: z.string(),
      gap: z.enum(["large", "medium", "small"]),
      priority: z.number().min(1).max(10),
      recommendation: z.string(),
    })
  ),
  learningPath: z.array(
    z.object({
      phase: z.number(),
      title: z.string(),
      duration: z.string(),
      skills: z.array(z.string()),
      resources: z.array(
        z.object({
          type: z.enum(["course", "tutorial", "documentation", "project"]),
          name: z.string(),
          url: z.string().nullable(),
          estimatedTime: z.string(),
        })
      ),
    })
  ),
  strengths: z.array(z.string()),
  areasForImprovement: z.array(z.string()),
  interviewTopics: z.array(
    z.object({
      topic: z.string(),
      importance: z.enum(["high", "medium", "low"]),
      preparationTips: z.array(z.string()),
    })
  ),
  summary: z.string(),
});

export type SkillAnalysis = z.infer<typeof skillAnalysisSchema>;

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { resumeText, targetRole } = await req.json();

  if (!resumeText || !targetRole) {
    return new Response("Missing resume text or target role", { status: 400 });
  }

  try {
    const result = streamText({
      model: getModel(),
      output: Output.object({ schema: skillAnalysisSchema }),
      prompt: `You are an expert career counselor and skill gap analyzer. Analyze the following resume for a fresh graduate targeting a ${targetRole} position.

RESUME:
${resumeText}

TARGET ROLE: ${targetRole}

Provide a comprehensive skill gap analysis including:
1. Overall readiness score (0-100)
2. Current skills extracted from the resume with their levels
3. Required skills for the ${targetRole} role with importance levels
4. Specific skill gaps with priorities and recommendations
5. A structured learning path with phases, durations, and specific resources (use real course names and URLs when possible)
6. Key strengths to highlight in interviews
7. Areas that need improvement
8. Important interview topics with preparation tips
9. A brief summary of the analysis

Be specific, actionable, and encouraging. Focus on practical advice for fresh graduates.`,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[v0] Analyze error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Analysis failed";
    
    // Return error in SSE format so client can parse it
    return new Response(
      `data: ${JSON.stringify({ type: "error", error: { message: errorMessage } })}\n\n`,
      {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      }
    );
  }
}
