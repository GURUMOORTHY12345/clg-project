import { streamText, convertToModelMessages, UIMessage } from "ai";
import { createClient } from "@/lib/supabase/server";

// Use Google Gemini through Vercel AI Gateway (free, no credit card needed)
function getModel() {
  return "google/gemini-2-flash";
}

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

  const result = streamText({
    model: getModel(),
    system: systemPrompt,
    messages: await convertToModelMessages(messages as UIMessage[]),
  });

  return result.toUIMessageStreamResponse();
}
