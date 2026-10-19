import type { ServerQuestion } from "./exam-bank";

export type AnswerValue = number | number[] | boolean | string | null | undefined;

export type QuestionResult = {
  id: string;
  correct: boolean;
  marksAwarded: number;
  marks: number;
  topic: string;
  lessonId: string;
  prompt: string;
  code?: string;
  submitted: string;
  correctAnswer: string;
  explanation: string;
};

const norm = (s: string) => s.trim().replace(/\s+/g, " ");

export function isCorrect(q: ServerQuestion, a: AnswerValue): boolean {
  if (a === null || a === undefined || a === "") return false;
  switch (q.type) {
    case "single":
      return typeof a === "number" && a === q.answer;
    case "tf":
      return typeof a === "boolean" && a === q.answer;
    case "multi": {
      if (!Array.isArray(a) || !Array.isArray(q.answer)) return false;
      const x = [...new Set(a)].sort();
      const y = [...(q.answer as number[])].sort();
      return x.length === y.length && x.every((v, i) => v === y[i]);
    }
    case "numeric": {
      const n = typeof a === "number" ? a : Number(String(a).trim());
      if (!Number.isFinite(n)) return false;
      return Math.abs(n - (q.answer as number)) <= (q.tolerance ?? 1e-9);
    }
    case "trace": {
      const given = norm(String(a));
      return (q.answer as string[]).some((x) => norm(x) === given);
    }
    case "short": {
      const given = norm(String(a)).toLowerCase();
      return (q.answer as string[]).some((x) => norm(x).toLowerCase() === given);
    }
  }
  return false;
}

export function describeAnswer(q: ServerQuestion): string {
  switch (q.type) {
    case "single": return q.options?.[q.answer as number] ?? "";
    case "multi": return (q.answer as number[]).map((i) => q.options?.[i]).join("; ");
    case "tf": return q.answer ? "True" : "False";
    case "numeric": return String(q.answer);
    default: return (q.answer as string[])[0];
  }
}

export function describeSubmitted(q: ServerQuestion, a: AnswerValue): string {
  if (a === null || a === undefined || a === "") return "(no answer)";
  if (q.type === "single" && typeof a === "number") return q.options?.[a] ?? String(a);
  if (q.type === "multi" && Array.isArray(a)) return a.length ? a.map((i) => q.options?.[i]).join("; ") : "(no answer)";
  if (q.type === "tf") return a === true ? "True" : "False";
  return String(a);
}

export function gradeAttempt(questions: ServerQuestion[], answers: Record<string, AnswerValue>) {
  const results: QuestionResult[] = questions.map((q) => {
    const a = answers[q.id];
    const ok = isCorrect(q, a);
    return {
      id: q.id, correct: ok, marksAwarded: ok ? q.marks : 0, marks: q.marks, topic: q.topic, lessonId: q.lessonId,
      prompt: q.prompt, code: q.code, submitted: describeSubmitted(q, a), correctAnswer: describeAnswer(q), explanation: q.explain,
    };
  });
  const score = results.reduce((s, r) => s + r.marksAwarded, 0);
  const max = results.reduce((s, r) => s + r.marks, 0);
  const byTopic: Record<string, { score: number; max: number }> = {};
  for (const r of results) {
    byTopic[r.topic] ??= { score: 0, max: 0 };
    byTopic[r.topic].score += r.marksAwarded;
    byTopic[r.topic].max += r.marks;
  }
  return { results, score, max, percent: max ? Math.round((score / max) * 1000) / 10 : 0, byTopic };
}
