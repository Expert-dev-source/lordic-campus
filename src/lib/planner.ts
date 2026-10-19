import { LESSONS } from "@/data/lessons";
import { EXERCISES } from "@/data/exercises";
import type { PlanItem, State } from "./state";
import { uid } from "./state";

export const isoDate = (d: Date) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
export const addDays = (iso: string, n: number) => {
  const d = new Date(iso + "T12:00:00");
  d.setDate(d.getDate() + n);
  return isoDate(d);
};

/** Suggests activities for a day that fit within the student's available minutes. */
export function suggestPlan(s: State, date: string): PlanItem[] {
  const budget = s.profile.dailyMinutes;
  const items: PlanItem[] = [];
  let used = 0;
  const add = (title: string, subject: string, minutes: number, link?: string) => {
    if (used + minutes > budget) return false;
    if (s.plan.some((p) => p.date === date && p.title === title)) return false;
    items.push({ id: uid("p"), title, subject, minutes, date, done: false, link });
    used += minutes;
    return true;
  };
  const open = s.mistakes.filter((m) => !m.resolved).length;
  const nextLessons = LESSONS.filter((l) => !s.done[l.id]);
  if (nextLessons[0]) add(`Learn: ${nextLessons[0].title}`, "Programming", Math.min(nextLessons[0].minutes, Math.max(15, budget - 20)), `/lessons/${nextLessons[0].id}`);
  const ex = EXERCISES.find((e) => !s.exercises[e.id]?.passed);
  if (ex) add(`Coding exercise: ${ex.title}`, "Programming", 20, `/coding-lab/${ex.id}`);
  if (open > 0) add("Review mistakes from your notebook", "Revision", 15, "/revision");
  add("Practise algebra or logic in the Mathematics Laboratory", "Mathematics", 25, "/math-lab");
  if (nextLessons[1]) add(`Learn: ${nextLessons[1].title}`, "Programming", nextLessons[1].minutes, `/lessons/${nextLessons[1].id}`);
  return items;
}

/** Moves missed (past, not done) items forward without penalty. */
export function reschedule(s: State, today: string): PlanItem[] {
  let offset = 0;
  return s.plan.map((p) => {
    if (!p.done && p.date < today) {
      const day = addDays(today, Math.floor(offset / 2));
      offset++;
      return { ...p, date: day, missed: false };
    }
    return p;
  });
}
