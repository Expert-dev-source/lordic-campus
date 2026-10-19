import type { State } from "./state";
import { letterGrade, pct, round1 } from "./grading";
import { ASSIGNMENT_BY_ID, ASSIGNMENTS } from "@/data/assignments";

export const WEIGHTS = { quizzes: 10, classwork: 20, assignments: 30, exams: 40 } as const;

export type Category = { key: keyof typeof WEIGHTS; label: string; weight: number; percent: number | null; detail: string };

export function gradebook(s: State) {
  const checks = Object.values(s.checks).filter((c) => c.total > 0);
  const quizzes = checks.length ? checks.reduce((a, c) => a + pct(c.correct, c.total), 0) / checks.length : null;

  const cw = Object.values(s.classwork).filter((c) => c.max > 0);
  const classwork = cw.length ? cw.reduce((a, c) => a + pct(c.score, c.max), 0) / cw.length : null;

  const asPercents: number[] = [];
  for (const a of ASSIGNMENTS) {
    const subs = s.assignments[a.id]?.submissions ?? [];
    if (subs.length) asPercents.push(subs[subs.length - 1].total);
  }
  const assignments = asPercents.length ? asPercents.reduce((a, b) => a + b, 0) / asPercents.length : null;

  const bestByExam: Record<string, number> = {};
  for (const e of s.exams) bestByExam[e.examId] = Math.max(bestByExam[e.examId] ?? 0, e.percent);
  const exVals = Object.values(bestByExam);
  const exams = exVals.length ? exVals.reduce((a, b) => a + b, 0) / exVals.length : null;

  const cats: Category[] = [
    { key: "quizzes", label: "Lesson quizzes", weight: WEIGHTS.quizzes, percent: quizzes, detail: `Average of the latest score on each of ${checks.length} lesson quiz(zes).` },
    { key: "classwork", label: "Classwork", weight: WEIGHTS.classwork, percent: classwork, detail: `Average percentage across ${cw.length} classwork set(s) (latest attempt).` },
    { key: "assignments", label: "Assignments", weight: WEIGHTS.assignments, percent: assignments, detail: `Average of the latest submission for ${asPercents.length} assignment(s). Includes self-assessed criteria.` },
    { key: "exams", label: "Examinations", weight: WEIGHTS.exams, percent: exams, detail: `Average of your best attempt on each of ${exVals.length} examination(s).` },
  ];
  const withData = cats.filter((c) => c.percent !== null);
  const wSum = withData.reduce((a, c) => a + c.weight, 0);
  const overall = wSum > 0 ? withData.reduce((a, c) => a + (c.percent as number) * c.weight, 0) / wSum : null;
  return { cats, overall: overall === null ? null : round1(overall), letter: overall === null ? null : letterGrade(overall), weightUsed: wSum };
}

export function assignmentTitle(id: string) {
  return ASSIGNMENT_BY_ID[id]?.title ?? id;
}
