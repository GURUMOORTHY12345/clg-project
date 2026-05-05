import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

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

  if (!process.env.GEMINI_API_KEY) {
    return new Response("GEMINI_API_KEY not configured", { status: 500 });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are an expert career counselor and skill gap analyzer. Analyze the following resume for a fresh graduate targeting a ${targetRole} position.

RESUME:
${resumeText}

TARGET ROLE: ${targetRole}

Provide a comprehensive skill gap analysis as a JSON object with these fields:
{
  "overallScore": number 0-100,
  "currentSkills": [{"name": string, "level": "beginner"|"intermediate"|"advanced", "yearsOfExperience": number|null}],
  "requiredSkills": [{"name": string, "importance": "critical"|"important"|"nice-to-have", "currentLevel": "none"|"beginner"|"intermediate"|"advanced", "targetLevel": "beginner"|"intermediate"|"advanced"}],
  "skillGaps": [{"skill": string, "gap": "large"|"medium"|"small", "priority": number 1-10, "recommendation": string}],
  "learningPath": [{"phase": number, "title": string, "duration": string, "skills": string[], "resources": [{"type": "course"|"tutorial"|"documentation"|"project", "name": string, "url": string|null, "estimatedTime": string}]}],
  "strengths": string[],
  "areasForImprovement": string[],
  "interviewTopics": [{"topic": string, "importance": "high"|"medium"|"low", "preparationTips": string[]}],
  "summary": string
}

Be specific, actionable, and encouraging. Focus on practical advice for fresh graduates. Return ONLY valid JSON, no additional text.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let analysisData: SkillAnalysis;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      analysisData = JSON.parse(jsonMatch[0]);
      
      // Validate with schema
      const validated = skillAnalysisSchema.parse(analysisData);
      
      return new Response(JSON.stringify(validated), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      return new Response(
        JSON.stringify({
          error: "Failed to parse AI response",
          details: parseError instanceof Error ? parseError.message : "Unknown error",
        }),
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    return new Response(
      JSON.stringify({
        error: "Analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}
