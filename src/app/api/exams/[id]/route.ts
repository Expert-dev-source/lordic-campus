import { NextResponse } from "next/server";
import { EXAM_BY_ID } from "@/data/exams-meta";
import { BANK_BY_ID, toPublic } from "@/server/exam-bank";

export const dynamic = "force-dynamic";

// Returns the exam definition and the questions WITHOUT answers or explanations.
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const meta = EXAM_BY_ID[id];
  if (!meta) return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  const questions = meta.questionIds.map((qid) => BANK_BY_ID[qid]).filter(Boolean).map(toPublic);
  const marks = questions.reduce((s, q) => s + q.marks, 0);
  return NextResponse.json({ meta, questions, totalMarks: marks }, { headers: { "Cache-Control": "no-store" } });
}
