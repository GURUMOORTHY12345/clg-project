import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
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
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", code: "AUTH_REQUIRED" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate request body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request body",
          code: "INVALID_JSON",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { resumeText, targetRole } = body;

    // Validate required fields
    if (!resumeText?.trim()) {
      return new Response(
        JSON.stringify({
          error: "Resume text is required and cannot be empty",
          code: "MISSING_RESUME",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!targetRole?.trim()) {
      return new Response(
        JSON.stringify({
          error: "Target role is required and cannot be empty",
          code: "MISSING_TARGET_ROLE",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY environment variable not configured");
      return new Response(
        JSON.stringify({
          error: "Server configuration error",
          code: "API_KEY_MISSING",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      
      const text = result.text?.trim() ?? "";

      if (!text) {
        return new Response(
          JSON.stringify({
            error: "Empty response from AI service",
            code: "EMPTY_RESPONSE",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("No JSON found in Gemini response:", text);
        return new Response(
          JSON.stringify({
            error: "AI response format invalid",
            code: "INVALID_RESPONSE_FORMAT",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // Parse and validate JSON
      let analysisData: SkillAnalysis;
      try {
        analysisData = JSON.parse(jsonMatch[0]);
      } catch (parseErr) {
        console.error("Failed to parse JSON:", parseErr);
        return new Response(
          JSON.stringify({
            error: "Failed to parse AI response as JSON",
            code: "JSON_PARSE_ERROR",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // Validate against schema
      try {
        const validated = skillAnalysisSchema.parse(analysisData);
        return new Response(JSON.stringify(validated), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (validationErr) {
        console.error("Schema validation failed:", validationErr);
        return new Response(
          JSON.stringify({
            error: "AI response failed validation",
            code: "VALIDATION_ERROR",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (geminiError: any) {
      console.error("Gemini API error:", geminiError);

      // Handle specific Gemini API errors
      const statusCode =
        geminiError?.status === 404 ? 500 : geminiError?.status || 500;
      const errorMessage =
        geminiError?.message || "AI service request failed";
      const errorCode =
        geminiError?.status === 404
          ? "MODEL_NOT_AVAILABLE"
          : "AI_SERVICE_ERROR";

      return new Response(
        JSON.stringify({
          error: errorMessage,
          code: errorCode,
        }),
        { status: statusCode, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("Unexpected error in analyze route:", err);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
