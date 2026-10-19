import { LESSONS } from "@/data/lessons";

export type Card = { id: string; front: string; back: string; lessonId: string; course: string };
export const CARDS: Card[] = LESSONS.flatMap((l) =>
  l.terms.map((t, i) => ({ id: `${l.id}-t${i}`, front: `Define: ${t.term}`, back: t.def, lessonId: l.id, course: l.courseId }))
).concat(
  LESSONS.flatMap((l) => l.check.map((c, i) => ({ id: `${l.id}-c${i}`, front: c.q, back: `${c.options[c.answer]}. ${c.explain}`, lessonId: l.id, course: l.courseId })))
);
