import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { targetRole, questions, status, score, feedback, analysisId } =
    await req.json();

  const { data, error } = await supabase
    .from("mock_interviews")
    .insert({
      user_id: user.id,
      analysis_id: analysisId || null,
      target_role: targetRole,
      questions: questions || [],
      status: status || "in_progress",
      score: score || null,
      feedback: feedback || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, questions, status, score, feedback } = await req.json();

  const { error } = await supabase
    .from("mock_interviews")
    .update({
      questions,
      status,
      score,
      feedback,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
