export type Note = { id: string; title: string; body: string; courseId?: string; lessonId?: string; at: number };
export type Bookmark = { id: string; kind: "lesson" | "code" | "formula"; ref: string; label: string; body?: string };
export type ExState = { attempts: number; passed: boolean; bestPassed: number; total: number; code: string; hintsUsed: number; history: { at: number; passed: number; total: number }[] };
export type CwState = { score: number; max: number; at: number; attempts: number; answers: Record<string, string> };
export type AsSub = { at: number; code?: string; text?: string; auto: Record<string, number>; self: Record<string, number>; total: number };
export type ExamAttempt = {
  id: string; examId: string; at: number; durationSec: number; score: number; max: number; percent: number; passed: boolean;
  byTopic: Record<string, { score: number; max: number }>; byLesson: Record<string, { score: number; max: number }>;
  results: { id: string; correct: boolean; marksAwarded: number; marks: number; topic: string; lessonId: string; prompt: string; code?: string; submitted: string; correctAnswer: string; explanation: string }[];
};
export type Mistake = { id: string; kind: "check" | "exam" | "classwork" | "exercise"; question: string; code?: string; submitted: string; correct?: string; explanation?: string; lessonId?: string; at: number; resolved: boolean };
export type PlanItem = { id: string; title: string; subject: string; minutes: number; date: string; done: boolean; missed?: boolean; link?: string };
export type Report = { id: string; at: number; where: string; text: string };

export type State = {
  version: 1;
  profile: { name: string; dailyMinutes: number; institution: string };
  opened: Record<string, number>;
  done: Record<string, number>;
  checks: Record<string, { correct: number; total: number; at: number }>;
  notes: Note[];
  bookmarks: Bookmark[];
  exercises: Record<string, ExState>;
  classwork: Record<string, CwState>;
  assignments: Record<string, { submissions: AsSub[] }>;
  exams: ExamAttempt[];
  mistakes: Mistake[];
  cards: Record<string, { box: number; due: number; seen: number }>;
  plan: PlanItem[];
  projects: Record<string, Record<string, boolean>>;
  reports: Report[];
  enrolled: Record<string, boolean>;
};

export const DEFAULT_STATE: State = {
  version: 1,
  profile: { name: "", dailyMinutes: 60, institution: "" },
  opened: {}, done: {}, checks: {}, notes: [], bookmarks: [], exercises: {}, classwork: {}, assignments: {}, exams: [], mistakes: [], cards: {}, plan: [], projects: {}, reports: [], enrolled: { prog1: true },
};

export function uid(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function merge(raw: unknown): State {
  if (!raw || typeof raw !== "object") return DEFAULT_STATE;
  const r = raw as Partial<State>;
  return { ...DEFAULT_STATE, ...r, profile: { ...DEFAULT_STATE.profile, ...(r.profile ?? {}) }, version: 1 };
}

// ---------- action helpers (pure state transformers) ----------
export const actions = {
  openLesson: (id: string) => (s: State): State => (s.opened[id] ? s : { ...s, opened: { ...s.opened, [id]: Date.now() } }),
  completeLesson: (id: string) => (s: State): State => ({ ...s, done: { ...s.done, [id]: s.done[id] ?? Date.now() } }),
  recordCheck: (id: string, correct: number, total: number) => (s: State): State => ({ ...s, checks: { ...s.checks, [id]: { correct, total, at: Date.now() } } }),
  addMistake: (m: Omit<Mistake, "id" | "at" | "resolved">) => (s: State): State => {
    const dup = s.mistakes.find((x) => !x.resolved && x.question === m.question && x.submitted === m.submitted);
    if (dup) return s;
    return { ...s, mistakes: [{ ...m, id: uid("m"), at: Date.now(), resolved: false }, ...s.mistakes] };
  },
  resolveMistake: (id: string) => (s: State): State => ({ ...s, mistakes: s.mistakes.map((m) => (m.id === id ? { ...m, resolved: true } : m)) }),
  saveNote: (n: Note) => (s: State): State => ({ ...s, notes: s.notes.some((x) => x.id === n.id) ? s.notes.map((x) => (x.id === n.id ? n : x)) : [n, ...s.notes] }),
  deleteNote: (id: string) => (s: State): State => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }),
  toggleBookmark: (b: Bookmark) => (s: State): State => ({ ...s, bookmarks: s.bookmarks.some((x) => x.id === b.id) ? s.bookmarks.filter((x) => x.id !== b.id) : [b, ...s.bookmarks] }),
  recordExercise: (id: string, code: string, passed: number, total: number, hintsUsed?: number) => (s: State): State => {
    const prev = s.exercises[id];
    const ok = total > 0 && passed === total;
    return {
      ...s,
      exercises: {
        ...s.exercises,
        [id]: {
          attempts: (prev?.attempts ?? 0) + 1,
          passed: ok || !!prev?.passed,
          bestPassed: Math.max(prev?.bestPassed ?? 0, passed),
          total,
          code,
          hintsUsed: Math.max(prev?.hintsUsed ?? 0, hintsUsed ?? 0),
          history: [...(prev?.history ?? []).slice(-19), { at: Date.now(), passed, total }],
        },
      },
    };
  },
  saveExerciseDraft: (id: string, code: string, hintsUsed: number) => (s: State): State => {
    const prev = s.exercises[id];
    return { ...s, exercises: { ...s.exercises, [id]: { attempts: prev?.attempts ?? 0, passed: prev?.passed ?? false, bestPassed: prev?.bestPassed ?? 0, total: prev?.total ?? 0, code, hintsUsed: Math.max(prev?.hintsUsed ?? 0, hintsUsed), history: prev?.history ?? [] } } };
  },
  recordClasswork: (id: string, score: number, max: number, answers: Record<string, string>) => (s: State): State => {
    const prev = s.classwork[id];
    return { ...s, classwork: { ...s.classwork, [id]: { score, max, at: Date.now(), attempts: (prev?.attempts ?? 0) + 1, answers } } };
  },
  recordAssignment: (id: string, sub: AsSub) => (s: State): State => ({ ...s, assignments: { ...s.assignments, [id]: { submissions: [...(s.assignments[id]?.submissions ?? []), sub] } } }),
  recordExam: (a: ExamAttempt) => (s: State): State => ({ ...s, exams: [a, ...s.exams] }),
  rateCard: (id: string, rating: 0 | 1 | 2 | 3) => (s: State): State => {
    const prev = s.cards[id] ?? { box: 0, due: 0, seen: 0 };
    const box = rating === 0 ? 0 : Math.min(5, prev.box + (rating === 1 ? 0 : rating === 2 ? 1 : 2));
    const days = [0, 1, 2, 4, 8, 16][box];
    return { ...s, cards: { ...s.cards, [id]: { box, due: Date.now() + days * 86400000, seen: prev.seen + 1 } } };
  },
  toggleProjectStep: (pid: string, step: string) => (s: State): State => {
    const cur = s.projects[pid] ?? {};
    return { ...s, projects: { ...s.projects, [pid]: { ...cur, [step]: !cur[step] } } };
  },
};
