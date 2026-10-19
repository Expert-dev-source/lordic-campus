import type { State } from "./state";
import { EXERCISES } from "@/data/exercises";
import { CLASSWORK } from "@/data/classwork";
import { LESSONS } from "@/data/lessons";

export type MasteryLevel = "not-started" | "learning" | "practising" | "needs-revision" | "demonstrated" | "mastered";
export const MASTERY_LABEL: Record<MasteryLevel, string> = {
  "not-started": "Not started", learning: "Learning", practising: "Practising", "needs-revision": "Needs revision", demonstrated: "Demonstrated", mastered: "Mastered",
};

/** Evidence values are fractions 0..1 from real assessments. Opening a lesson is never evidence. */
export function lessonEvidence(s: State, lessonId: string): number[] {
  const ev: number[] = [];
  const chk = s.checks[lessonId];
  if (chk && chk.total > 0) ev.push(chk.correct / chk.total);
  for (const ex of EXERCISES.filter((e) => e.lessonId === lessonId)) {
    const st = s.exercises[ex.id];
    if (st && st.attempts > 0 && st.total > 0) ev.push(st.passed ? 1 : st.bestPassed / st.total);
  }
  for (const cw of CLASSWORK.filter((c) => c.lessonId === lessonId)) {
    const st = s.classwork[cw.id];
    if (st && st.max > 0) ev.push(st.score / st.max);
  }
  for (const a of s.exams) {
    const b = a.byLesson[lessonId];
    if (b && b.max > 0) ev.push(b.score / b.max);
  }
  return ev;
}

export function masteryFromEvidence(opened: boolean, ev: number[]): MasteryLevel {
  if (ev.length === 0) return opened ? "learning" : "not-started";
  const avg = ev.reduce((a, b) => a + b, 0) / ev.length;
  if (avg < 0.6) return "needs-revision";
  if (ev.length >= 3 && avg >= 0.85) return "mastered";
  if (ev.length >= 2 && avg >= 0.7) return "demonstrated";
  return "practising";
}

export function lessonMastery(s: State, lessonId: string): MasteryLevel {
  return masteryFromEvidence(!!s.opened[lessonId] || !!s.done[lessonId], lessonEvidence(s, lessonId));
}

export function courseProgress(s: State, courseId: string) {
  const ls = LESSONS.filter((l) => l.courseId === courseId);
  const done = ls.filter((l) => s.done[l.id]).length;
  return { total: ls.length, done, percent: ls.length ? Math.round((done / ls.length) * 100) : 0 };
}
