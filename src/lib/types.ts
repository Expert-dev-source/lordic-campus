export type Verification = "provisional" | "reference" | "supplementary" | "confirm";

export const VERIFICATION_LABEL: Record<Verification, string> = {
  provisional: "Provisional placement",
  reference: "Listed in an official reference curriculum",
  supplementary: "Supplementary preparation material",
  confirm: "University-specific confirmation required",
};

export type Course = {
  id: string;
  number: number;
  level: 100 | 200 | 300 | 400 | 500;
  title: string;
  purpose: string;
  modules: string[];
  status: Verification;
  code: string | null; // official course code, only when verified
  semester: string | null; // only when verified
  hasContent: boolean; // true when full lessons exist in this build
  prerequisites: string[];
  practical: string;
  assessment: string;
};

export type Block =
  | { t: "p"; text: string }
  | { t: "h"; text: string }
  | { t: "code"; code: string; out?: string }
  | { t: "list"; items: string[] }
  | { t: "callout"; kind: "misconception" | "tip" | "why"; text: string };

export type CheckQ = { q: string; options: string[]; answer: number; explain: string };

export type Lesson = {
  id: string;
  courseId: string;
  moduleNo: number;
  title: string;
  minutes: number;
  difficulty: "Beginner" | "Elementary" | "Intermediate";
  prerequisites: string[];
  objectives: string[];
  blocks: Block[];
  worked: { problem: string; approach: string; steps: string[]; solution: string; output?: string; mistakes: string[] }[];
  demo: { title: string; code: string; stdin?: string; instruction: string };
  guided: { q: string; hints: string[]; answer: string };
  independent: { q: string; exerciseId?: string };
  check: CheckQ[];
  summary: string[];
  terms: { term: string; def: string }[];
};

export type PyTest = { setup?: string; expr: string; expected: string; hidden?: boolean };

export type Exercise = {
  id: string;
  lessonId: string;
  title: string;
  difficulty: "Beginner" | "Elementary" | "Intermediate";
  prompt: string;
  starter: string;
  tests: PyTest[];
  hints: string[]; // 4 progressive hints; the 5th level reveals the solution
  solution: string;
  explanation: string;
};

export type ClassworkTask =
  | { type: "mc"; q: string; options: string[]; answer: number; marks: number; explain: string }
  | { type: "short"; q: string; accept: string[]; marks: number; explain: string }
  | { type: "trace"; q: string; code: string; accept: string[]; marks: number; explain: string }
  | { type: "code"; q: string; exerciseId: string; marks: number; explain: string };

export type Classwork = {
  id: string;
  title: string;
  courseId: string;
  lessonId: string;
  category: string;
  difficulty: "Beginner" | "Elementary" | "Intermediate";
  minutes: number;
  instructions: string;
  objectives: string[];
  tasks: ClassworkTask[];
};

export type RubricRow = { criterion: string; marks: number; auto?: boolean; descriptor: string };

export type Assignment = {
  id: string;
  title: string;
  type: string;
  courseId: string;
  background: string;
  requirements: string[];
  objectives: string[];
  deliverables: string[];
  acceptance: string[];
  format: string;
  rubric: RubricRow[];
  resources: string[];
  starter?: string;
  tests?: PyTest[];
  autoCriteria?: { criterion: string; testIndexes: number[] }[];
  written?: { label: string; minWords: number; placeholder: string };
  deadlineNote: string;
};

export type Project = {
  id: string;
  n: number;
  tier: "Beginner" | "Intermediate" | "Advanced";
  title: string;
  problem: string;
  users: string;
  outcomes: string[];
  prerequisites: string[];
  requirements: string[];
  acceptance: string[];
  architecture: string[];
  milestones: string[];
  reflection: string[];
};

export type ExamMeta = {
  id: string;
  title: string;
  kind: string;
  courseId: string;
  description: string;
  durationMin: number;
  topics: string[];
  questionIds: string[];
  passPercent: number;
  retake: string;
  review: string;
  resources: string;
  rules: string[];
  generated: boolean;
};

export type PublicQuestion = {
  id: string;
  type: "single" | "multi" | "tf" | "numeric" | "short" | "trace";
  topic: string;
  lessonId: string;
  difficulty: "Easy" | "Medium" | "Hard";
  marks: number;
  prompt: string;
  code?: string;
  options?: string[];
};
