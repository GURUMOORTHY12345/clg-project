import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

interface Message {
  role: "user" | "assistant";
  text: string;
  id?: string;
  parts?: Array<{ type: string; text?: string }>;
}

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

    const { messages, targetRole } = body;

    // Validate required fields
    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          error: "Messages must be an array",
          code: "INVALID_MESSAGES",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!targetRole?.trim()) {
      return new Response(
        JSON.stringify({
          error: "Target role is required",
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
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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

      // Convert and validate message history for Gemini
      const history: Array<{ role: string; parts: Array<{ text: string }> }> =
        [];

      // Initialize with system instruction as first exchange
      if (messages.length === 0) {
        history.push({
          role: "user",
          parts: [{ text: systemPrompt }],
        });
        history.push({
          role: "model",
          parts: [
            { text: "I understand. I'm ready to conduct this mock interview." },
          ],
        });
      } else {
        // Process message history
        for (const msg of messages) {
          if (!msg || typeof msg !== "object") {
            console.warn("Invalid message format:", msg);
            continue;
          }

          let text = "";
          if (msg.text && typeof msg.text === "string") {
            text = msg.text;
          } else if (msg.parts && Array.isArray(msg.parts)) {
            text = msg.parts
              .filter((p: any) => p && p.type === "text" && p.text)
              .map((p: any) => p.text)
              .join("");
          }

          if (text.trim()) {
            const role =
              msg.role === "user" || msg.role === "user" ? "user" : "model";
            history.push({
              role,
              parts: [{ text }],
            });
          }
        }

        // If only user message(s) exist, add system prompt context
        if (history.length === 0) {
          history.push({
            role: "user",
            parts: [{ text: systemPrompt }],
          });
          history.push({
            role: "model",
            parts: [
              { text: "I understand. I'm ready to conduct this mock interview." },
            ],
          });
        }
      }

      // Get the last user message to send
      let lastUserMessage = "";
      if (messages.length > 0 && messages[messages.length - 1]) {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.text && typeof lastMsg.text === "string") {
          lastUserMessage = lastMsg.text;
        } else if (lastMsg.parts && Array.isArray(lastMsg.parts)) {
          lastUserMessage = lastMsg.parts
            .filter((p: any) => p && p.type === "text" && p.text)
            .map((p: any) => p.text)
            .join("");
        }
      }

      if (!lastUserMessage.trim()) {
        return new Response(
          JSON.stringify({
            error: "No user message provided",
            code: "MISSING_MESSAGE",
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Start chat session with history (excluding last message)
      const chat = model.startChat({
        history: history.slice(0, -1),
      });

      // Send the last user message
      const result = await chat.sendMessage(lastUserMessage);
      const response = await result.response;
      const responseText = response.text();

      if (!responseText) {
        return new Response(
          JSON.stringify({
            error: "Empty response from AI service",
            code: "EMPTY_RESPONSE",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // Format as SSE response
      const sseContent = `data: ${JSON.stringify({
        type: "text",
        text: responseText,
      })}\n\ndata: [DONE]\n\n`;

      return new Response(sseContent, {
        status: 200,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } catch (geminiError: any) {
      console.error("Gemini API error:", geminiError);

      // Determine appropriate status code
      const statusCode =
        geminiError?.status === 404 ? 500 : geminiError?.status || 500;
      const errorMessage =
        geminiError?.message || "AI service request failed";
      const errorCode =
        geminiError?.status === 404
          ? "MODEL_NOT_AVAILABLE"
          : "AI_SERVICE_ERROR";

      // Format error as SSE
      const errorSse = `data: ${JSON.stringify({
        type: "error",
        error: errorMessage,
        code: errorCode,
      })}\n\n`;

      return new Response(errorSse, {
        status: statusCode,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      });
    }
  } catch (err) {
    console.error("Unexpected error in interview route:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Internal server error";

    // Format error as SSE
    const errorSse = `data: ${JSON.stringify({
      type: "error",
      error: errorMessage,
      code: "INTERNAL_ERROR",
    })}\n\n`;

    return new Response(errorSse, {
      status: 500,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  }
}
