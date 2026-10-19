import type { ExamMeta } from "@/lib/types";

const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => `q${String(a + i).padStart(2, "0")}`);
const RULES = [
  "Answers are not shown during the attempt; full explanations appear after you submit.",
  "The timer keeps running even if you leave the page. When it ends your saved answers are submitted.",
  "These are practice questions written for Lordic Campus. They are not official university past questions.",
  "No webcam or screen monitoring is used in the personal study version.",
];

export const EXAMS: ExamMeta[] = [
  { id: "exam-quiz-foundations", title: "Foundations Quiz", kind: "Topic test", courseId: "prog1", description: "Programs, input and output, variables and type conversion.", durationMin: 15, topics: ["How programs work", "Input, processing, output", "Variables and types", "Type conversion"], questionIds: range(1, 11), passPercent: 50, retake: "Unlimited retakes", review: "Full review after submission", resources: "Closed book. No code editor.", rules: RULES, generated: true },
  { id: "exam-test-control", title: "Operators and Control Flow Class Test", kind: "Class test", courseId: "prog1", description: "Operators, conditions and loops.", durationMin: 20, topics: ["Operators", "Conditions", "Loops"], questionIds: range(12, 22), passPercent: 50, retake: "Unlimited retakes", review: "Full review after submission", resources: "Closed book. No code editor.", rules: RULES, generated: true },
  { id: "exam-mid", title: "Mid-course Mock Examination", kind: "Mid-semester mock", courseId: "prog1", description: "A mixed paper covering Modules 1 to 6.", durationMin: 30, topics: ["Modules 1-6"], questionIds: ["q01", "q02", "q05", "q06", "q07", "q08", "q09", "q10", "q12", "q13", "q14", "q15", "q16", "q17", "q19", "q20", "q21", "q23", "q24", "q25"], passPercent: 50, retake: "Unlimited retakes", review: "Full review after submission", resources: "Closed book. No code editor.", rules: RULES, generated: true },
  { id: "exam-final", title: "Full Mock Semester Examination", kind: "Full mock", courseId: "prog1", description: "The complete Computer Programming I paper: all modules.", durationMin: 60, topics: ["All modules"], questionIds: range(1, 39), passPercent: 50, retake: "Unlimited retakes", review: "Full review after submission", resources: "Closed book. No code editor.", rules: RULES, generated: true },
];
export const EXAM_BY_ID: Record<string, ExamMeta> = Object.fromEntries(EXAMS.map((e) => [e.id, e]));
