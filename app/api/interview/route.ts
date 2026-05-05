import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

interface Message {
  role: "user" | "assistant";
  text: string;
  id?: string;
  parts?: Array<{ type: string; text?: string }>;
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages, targetRole } = await req.json();

  if (!process.env.GEMINI_API_KEY) {
    return new Response("GEMINI_API_KEY not configured", { status: 500 });
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

    // Convert message history for Gemini
    const history: Array<{ role: string; parts: Array<{ text: string }> }> = [];
    
    // Add system message as first user message if this is the start of conversation
    if (messages.length === 0 || (messages.length === 1 && messages[0].role === "user")) {
      history.push({
        role: "user",
        parts: [{ text: systemPrompt }],
      });
      history.push({
        role: "model",
        parts: [{ text: "I understand. I'm ready to conduct this mock interview." }],
      });
    } else {
      // For subsequent messages, add history without system instruction
      for (const msg of messages) {
        let text = "";
        if (msg.text) {
          text = msg.text;
        } else if (msg.parts && Array.isArray(msg.parts)) {
          text = msg.parts
            .filter((p: any) => p.type === "text" && p.text)
            .map((p: any) => p.text)
            .join("");
        }
        
        if (text) {
          history.push({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text }],
          });
        }
      }
    }

    // Start chat session
    const chat = model.startChat({
      history: history.slice(0, -1), // Exclude the last user message
    });

    // Get the last user message
    const lastUserMessage =
      messages.length > 0 && messages[messages.length - 1].role === "user"
        ? messages[messages.length - 1].text || ""
        : "";

    if (!lastUserMessage) {
      return new Response("No user message provided", { status: 400 });
    }

    // Send message and get response
    const result = await chat.sendMessage(lastUserMessage);
    const response = await result.response;
    const responseText = response.text();

    // Create SSE response
    let sseContent = "";

    // Format as SSE with the response
    sseContent += `data: ${JSON.stringify({
      type: "text",
      text: responseText,
    })}\n\n`;
    sseContent += `data: [DONE]\n\n`;

    return new Response(sseContent, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Gemini API error:", error);
    return new Response(
      JSON.stringify({
        error: "Interview failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500 }
    );
  }
}
