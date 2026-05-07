import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, targetRole, interviewId } = await req.json();

  const systemPrompt = `You are an expert technical interviewer conducting a mock interview for a ${targetRole} position. Your role is to:

1. Ask relevant interview questions one at a time (mix of technical, behavioral, and situational)
2. Wait for the candidate's response before asking the next question
3. Provide constructive feedback on answers when appropriate
4. Adapt difficulty based on the candidate's performance
5. Be encouraging but honest

Start by introducing yourself and asking the first question. Keep questions relevant to a fresh graduate applying for a ${targetRole} role.

After each answer, you may:
- Acknowledge the answer briefly
- Ask a follow-up question OR move to a new topic
- Provide brief tips if the answer could be improved

After about 5-8 questions, wrap up the interview with:
1. A brief summary of strengths observed
2. Areas for improvement
3. An overall score out of 100
4. Final encouragement

Format your final feedback clearly with headers.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Convert messages format to Gemini format
    const conversationHistory = messages.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Remove the last message temporarily to use as input
    const userMessage = conversationHistory.pop();

    const chat = model.startChat({
      history: conversationHistory,
      generationConfig: {
        maxOutputTokens: 1024,
      },
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const stream = await chat.sendMessageStream(
            userMessage?.parts[0]?.text || "Hello"
          );

          for await (const chunk of stream.stream) {
            if (chunk.candidates?.[0]?.content?.parts?.[0]?.text) {
              const text = chunk.candidates[0].content.parts[0].text;
              const data = `data: ${JSON.stringify({ type: "text", text })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("[v0] Interview stream error:", error);
          const errorMsg = error instanceof Error ? error.message : "Interview failed";
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
    console.error("[v0] Interview error:", error);

    const errorMessage = error instanceof Error ? error.message : "Interview failed";

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
