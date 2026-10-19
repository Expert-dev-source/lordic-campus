import { NextResponse } from "next/server";
import { EXAM_BY_ID } from "@/data/exams-meta";
import { BANK_BY_ID } from "@/server/exam-bank";
import { gradeAttempt, type AnswerValue } from "@/server/grade";

export const dynamic = "force-dynamic";

// Marks an attempt on the server so answer keys never reach the browser before submission.
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const meta = EXAM_BY_ID[id];
  if (!meta) return NextResponse.json({ error: "Exam not found" }, { status: 404 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const answers = (body as { answers?: Record<string, AnswerValue> })?.answers;
  if (!answers || typeof answers !== "object" || Array.isArray(answers)) {
    return NextResponse.json({ error: "answers must be an object" }, { status: 400 });
  }
  // Only accept answers for questions that belong to this exam, with sane types and sizes.
  const clean: Record<string, AnswerValue> = {};
  for (const qid of meta.questionIds) {
    const v = answers[qid];
    if (typeof v === "string") clean[qid] = v.slice(0, 500);
    else if (typeof v === "number" || typeof v === "boolean") clean[qid] = v;
    else if (Array.isArray(v) && v.every((x) => typeof x === "number")) clean[qid] = (v as number[]).slice(0, 20);
  }
  const questions = meta.questionIds.map((q) => BANK_BY_ID[q]).filter(Boolean);
  const graded = gradeAttempt(questions, clean);
  return NextResponse.json({ ...graded, passed: graded.percent >= meta.passPercent }, { headers: { "Cache-Control": "no-store" } });
}
