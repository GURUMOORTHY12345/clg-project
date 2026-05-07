import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

async function* streamSkillAnalysis(
  resumeText: string,
  targetRole: string
): AsyncGenerator<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `You are an expert career counselor and skill gap analyzer. Analyze the following resume for a fresh graduate targeting a ${targetRole} position.

RESUME:
${resumeText}

TARGET ROLE: ${targetRole}

Provide a comprehensive skill gap analysis in this EXACT JSON format:
{
  "overallScore": <number 0-100>,
  "currentSkills": [{"name": "<skill>", "level": "beginner|intermediate|advanced", "yearsOfExperience": <number or null>}],
  "requiredSkills": [{"name": "<skill>", "importance": "critical|important|nice-to-have", "currentLevel": "none|beginner|intermediate|advanced", "targetLevel": "beginner|intermediate|advanced"}],
  "skillGaps": [{"skill": "<skill>", "gap": "large|medium|small", "priority": <1-10>, "recommendation": "<text>"}],
  "learningPath": [{"phase": <number>, "title": "<text>", "duration": "<text>", "skills": ["<skill>"], "resources": [{"type": "course|tutorial|documentation|project", "name": "<text>", "url": "<url or null>", "estimatedTime": "<text>"}]}],
  "strengths": ["<text>"],
  "areasForImprovement": ["<text>"],
  "interviewTopics": [{"topic": "<text>", "importance": "high|medium|low", "preparationTips": ["<text>"]}],
  "summary": "<text>"
}

Requirements:
1. Overall readiness score (0-100)
2. Current skills extracted from the resume with their levels
3. Required skills for the ${targetRole} role with importance levels
4. Specific skill gaps with priorities and recommendations
5. A structured learning path with phases, durations, and specific resources (use real course names and URLs when possible)
6. Key strengths to highlight in interviews
7. Areas that need improvement
8. Important interview topics with preparation tips
9. A brief summary of the analysis

Be specific, actionable, and encouraging. Focus on practical advice for fresh graduates.

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, no additional text.`;

  try {
    const stream = await model.generateContentStream(prompt);

    for await (const chunk of stream.stream) {
      if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
        yield chunk.candidates[0].content.parts[0].text;
      }
    }
  } catch (error) {
    console.error("[v0] Gemini stream error:", error);
    throw error;
  }
}


export type SkillAnalysis = {
  overallScore: number;
  currentSkills: { name: string; level: "beginner" | "intermediate" | "advanced"; yearsOfExperience: number | null }[];
  requiredSkills: { name: string; importance: "critical" | "important" | "nice-to-have"; currentLevel: "none" | "beginner" | "intermediate" | "advanced"; targetLevel: "beginner" | "intermediate" | "advanced" }[];
  skillGaps: { skill: string; gap: "large" | "medium" | "small"; priority: number; recommendation: string }[];
  learningPath: { phase: number; title: string; duration: string; skills: string[]; resources: { type: "course" | "tutorial" | "documentation" | "project"; name: string; url: string | null; estimatedTime: string }[] }[];
  strengths: string[];
  areasForImprovement: string[];
  interviewTopics: { topic: string; importance: "high" | "medium" | "low"; preparationTips: string[] }[];
  summary: string;
};

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
    // Create an encoder for SSE
    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let jsonBuffer = "";

          for await (const chunk of streamSkillAnalysis(resumeText, targetRole)) {
            jsonBuffer += chunk;

            // Try to parse complete objects from the buffer
            let lastValidIndex = -1;
            let braceCount = 0;
            let inString = false;
            let escapeNext = false;

            for (let i = 0; i < jsonBuffer.length; i++) {
              const char = jsonBuffer[i];

              if (escapeNext) {
                escapeNext = false;
                continue;
              }

              if (char === "\\") {
                escapeNext = true;
                continue;
              }

              if (char === '"') {
                inString = !inString;
                continue;
              }

              if (!inString) {
                if (char === "{") braceCount++;
                if (char === "}") {
                  braceCount--;
                  if (braceCount === 0) {
                    lastValidIndex = i;
                  }
                }
              }
            }

            // If we have a complete JSON object, send it
            if (lastValidIndex !== -1) {
              const jsonStr = jsonBuffer.substring(0, lastValidIndex + 1);
              try {
                const obj = JSON.parse(jsonStr);
                const data = `data: ${JSON.stringify({ type: "object", object: obj })}\n\n`;
                controller.enqueue(encoder.encode(data));
                jsonBuffer = jsonBuffer.substring(lastValidIndex + 1);
              } catch {
                // Not valid JSON yet, keep buffering
              }
            }
          }

          // Send any remaining JSON
          if (jsonBuffer.trim()) {
            try {
              const obj = JSON.parse(jsonBuffer);
              const data = `data: ${JSON.stringify({ type: "object", object: obj })}\n\n`;
              controller.enqueue(encoder.encode(data));
            } catch {
              console.error("[v0] Failed to parse final JSON:", jsonBuffer);
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("[v0] Stream error:", error);
          const errorMsg = error instanceof Error ? error.message : "Analysis failed";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", error: { message: errorMsg } })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
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
