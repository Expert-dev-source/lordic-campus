import type { State } from "./state";
import { EXERCISES } from "@/data/exercises";
import { LESSONS } from "@/data/lessons";
import { gradebook } from "./gradebook";

export type Achievement = { id: string; title: string; desc: string; earned: boolean };

export function computeXp(s: State) {
  const lessons = Object.keys(s.done).length * 20;
  const ex = Object.values(s.exercises).filter((e) => e.passed).length * 30;
  const cw = Object.values(s.classwork).reduce((a, c) => a + Math.round((c.score / Math.max(1, c.max)) * 25), 0);
  const exams = s.exams.reduce((a, e) => a + Math.round(e.percent / 4), 0);
  const asg = Object.values(s.assignments).filter((a) => a.submissions.length).length * 50;
  return lessons + ex + cw + exams + asg;
}
export function levelFromXp(xp: number) {
  const level = Math.floor(Math.sqrt(xp / 50)) + 1;
  const base = 50 * (level - 1) ** 2;
  const next = 50 * level ** 2;
  return { level, base, next, progress: (xp - base) / (next - base) };
}

export function achievements(s: State): Achievement[] {
  const passedEx = Object.values(s.exercises).filter((e) => e.passed).length;
  const gb = gradebook(s);
  return [
    { id: "first-lesson", title: "First Lesson", desc: "Complete your first lesson.", earned: Object.keys(s.done).length >= 1 },
    { id: "first-pass", title: "It Runs!", desc: "Pass all tests on a coding exercise.", earned: passedEx >= 1 },
    { id: "five-ex", title: "Practitioner", desc: "Pass five coding exercises.", earned: passedEx >= 5 },
    { id: "all-ex", title: "Lab Master", desc: "Pass every coding exercise.", earned: passedEx >= EXERCISES.length },
    { id: "exam-pass", title: "Examined", desc: "Pass a mock examination.", earned: s.exams.some((e) => e.passed) },
    { id: "exam-top", title: "Distinction", desc: "Score 70% or more in a mock examination.", earned: s.exams.some((e) => e.percent >= 70) },
    { id: "assignment", title: "Submitted", desc: "Submit an assignment.", earned: Object.values(s.assignments).some((a) => a.submissions.length) },
    { id: "course-done", title: "Course Complete", desc: "Complete every lesson in Computer Programming I.", earned: LESSONS.every((l) => s.done[l.id]) },
    { id: "mistake-fixed", title: "Learning from Errors", desc: "Resolve a mistake from your notebook.", earned: s.mistakes.some((m) => m.resolved) },
    { id: "grade-a", title: "Grade A", desc: "Reach an overall course grade of A.", earned: gb.letter === "A" },
  ];
}
