import { LESSONS } from "./lessons";

// Revision questions come from the lesson knowledge checks (which already show their answers in the lessons).
export const BANK_PUBLIC = LESSONS.flatMap((l) => l.check.map((c) => ({ q: c.q, options: c.options, answer: c.answer, explain: c.explain, lessonId: l.id })));
