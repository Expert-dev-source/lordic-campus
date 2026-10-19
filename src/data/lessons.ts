import type { Lesson } from "@/lib/types";
import { LESSONS_A } from "./lessons-a";
import { LESSONS_B } from "./lessons-b";

export const LESSONS: Lesson[] = [...LESSONS_A, ...LESSONS_B];
export const LESSON_BY_ID: Record<string, Lesson> = Object.fromEntries(LESSONS.map((l) => [l.id, l]));

export const PROG1_MODULES = [
  "How Programs Work", "Variables and Data Types", "Operators", "Conditions", "Loops", "Functions",
  "Strings and Collections", "Files and Errors", "Algorithms", "Object-Oriented Programming", "Testing and Debugging", "Final Programming Project",
];

export function lessonsForCourse(courseId: string): Lesson[] {
  return LESSONS.filter((l) => l.courseId === courseId);
}
export function nextLesson(id: string): Lesson | undefined {
  const i = LESSONS.findIndex((l) => l.id === id);
  return i >= 0 ? LESSONS[i + 1] : undefined;
}
