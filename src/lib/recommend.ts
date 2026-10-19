import type { State } from "./state";
import { LESSONS } from "@/data/lessons";
import { lessonEvidence, lessonMastery } from "./mastery";
import { EXERCISES } from "@/data/exercises";

export type Recommendation = { text: string; href: string; label: string };

/** Recommendations come from actual evidence (quiz, exercise and exam results), not time spent. */
export function recommendations(s: State): Recommendation[] {
  const recs: Recommendation[] = [];
  const weak = LESSONS.filter((l) => lessonMastery(s, l.id) === "needs-revision");
  for (const l of weak.slice(0, 2)) {
    const ev = lessonEvidence(s, l.id);
    const avg = Math.round((ev.reduce((a, b) => a + b, 0) / ev.length) * 100);
    const ex = EXERCISES.find((e) => e.lessonId === l.id && !s.exercises[e.id]?.passed);
    recs.push({
      text: `You scored about ${avg}% on "${l.title}". Review the worked example${ex ? ` and complete the exercise "${ex.title}"` : ""} before your next assessment.`,
      href: `/lessons/${l.id}`, label: "Review lesson",
    });
  }
  const unpassed = EXERCISES.find((e) => s.exercises[e.id]?.attempts && !s.exercises[e.id].passed);
  if (unpassed) recs.push({ text: `You have an unfinished exercise: "${unpassed.title}". Try the next hint if you are stuck.`, href: `/coding-lab/${unpassed.id}`, label: "Continue exercise" });
  const open = s.mistakes.filter((m) => !m.resolved).length;
  if (open >= 3) recs.push({ text: `You have ${open} unresolved items in your mistake notebook. Retry a few today.`, href: "/revision", label: "Open notebook" });
  const next = LESSONS.find((l) => !s.done[l.id]);
  if (next) recs.push({ text: `Next lesson: "${next.title}".`, href: `/lessons/${next.id}`, label: "Start lesson" });
  if (!s.exams.length && Object.keys(s.done).length >= 3) recs.push({ text: "You have completed several lessons. Try the Foundations Quiz to check your understanding.", href: "/exams", label: "See examinations" });
  return recs.slice(0, 4);
}
