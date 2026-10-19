import type { ClassworkTask } from "./types";

const norm = (s: string) => s.trim().replace(/\s+/g, " ");

export function markTask(t: ClassworkTask, answer: string | undefined, exercisePassed: boolean): boolean {
  if (t.type === "code") return exercisePassed;
  if (answer === undefined || answer.trim() === "") return false;
  if (t.type === "mc") return Number(answer) === t.answer;
  if (t.type === "trace") return t.accept.some((a) => norm(a) === norm(answer));
  // short answer: exact match for short tokens, keyword containment for longer ones
  const given = norm(answer).toLowerCase();
  return t.accept.some((a) => {
    const x = norm(a).toLowerCase();
    return given === x || (x.length > 3 && given.includes(x));
  });
}
