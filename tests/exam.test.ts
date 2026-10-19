import { describe, it, expect } from "vitest";
import { spawnSync } from "child_process";
import { BANK, BANK_BY_ID, toPublic } from "@/server/exam-bank";
import { EXAMS } from "@/data/exams-meta";
import { gradeAttempt, isCorrect } from "@/server/grade";
import { LESSON_BY_ID } from "@/data/lessons";

const py = (code: string) => spawnSync("python3", ["-I", "-c", code], { encoding: "utf8", timeout: 10000 });

describe("exam bank", () => {
  it("ids are unique and every question references a real lesson", () => {
    expect(new Set(BANK.map((q) => q.id)).size).toBe(BANK.length);
    for (const q of BANK) expect(LESSON_BY_ID[q.lessonId], q.id).toBeTruthy();
  });
  it("every exam references existing questions", () => {
    for (const e of EXAMS) for (const id of e.questionIds) expect(BANK_BY_ID[id], `${e.id}:${id}`).toBeTruthy();
  });
  it("choice questions have a valid answer index", () => {
    for (const q of BANK) {
      if (q.type === "single") expect(q.answer as number).toBeLessThan(q.options!.length);
      if (q.type === "multi") for (const i of q.answer as number[]) expect(i).toBeLessThan(q.options!.length);
    }
  });
  it("code-tracing answers match what real Python prints", () => {
    for (const q of BANK.filter((x) => x.type === "trace")) {
      const r = py(q.code!);
      expect(r.status, `${q.id}: ${r.stderr}`).toBe(0);
      const actual = r.stdout.trim().split(/\s+/).join(" ");
      expect((q.answer as string[]).map((a) => a.trim().split(/\s+/).join(" ")), q.id).toContain(actual);
    }
  });
  it("numeric answers match real Python where an expression is given", () => {
    const exprs: Record<string, string> = { q12: "17 // 5", q13: "2 ** 5", q29: "len(set([1, 2, 2, 3, 3, 3]))" };
    for (const [id, e] of Object.entries(exprs)) expect(Number(py(`print(${e})`).stdout.trim()), id).toBe(BANK_BY_ID[id].answer);
    expect(BANK_BY_ID.q19.answer).toBe(6);
    expect(BANK_BY_ID.q32.answer).toBe(3);
  });
  it("public questions never contain answers or explanations", () => {
    for (const q of BANK) {
      const s = JSON.stringify(toPublic(q));
      expect(s).not.toContain('"answer"');
      expect(s).not.toContain('"explain"');
      expect(s).not.toContain(q.explain);
    }
  });
});

describe("marking", () => {
  const q = (id: string) => BANK_BY_ID[id];
  it("handles each question type", () => {
    expect(isCorrect(q("q01"), 1)).toBe(true);
    expect(isCorrect(q("q01"), 0)).toBe(false);
    expect(isCorrect(q("q02"), true)).toBe(true);
    expect(isCorrect(q("q02"), "true")).toBe(false);
    expect(isCorrect(q("q08"), [2, 0])).toBe(true);
    expect(isCorrect(q("q08"), [0])).toBe(false);
    expect(isCorrect(q("q12"), "3")).toBe(true);
    expect(isCorrect(q("q12"), " 3.0 ")).toBe(true);
    expect(isCorrect(q("q12"), "abc")).toBe(false);
    expect(isCorrect(q("q03"), "  34 ")).toBe(true);
    expect(isCorrect(q("q31"), "WITH")).toBe(true);
    expect(isCorrect(q("q31"), undefined)).toBe(false);
  });
  it("totals marks and topic scores", () => {
    const exam = EXAMS.find((e) => e.id === "exam-quiz-foundations")!;
    const qs = exam.questionIds.map((id) => BANK_BY_ID[id]);
    const all = Object.fromEntries(qs.map((x) => [x.id, x.type === "single" || x.type === "multi" || x.type === "tf" ? x.answer : Array.isArray(x.answer) ? (x.answer as string[])[0] : String(x.answer)]));
    const perfect = gradeAttempt(qs, all as never);
    expect(perfect.percent).toBe(100);
    const none = gradeAttempt(qs, {});
    expect(none.score).toBe(0);
    expect(none.max).toBe(perfect.max);
    expect(Object.values(perfect.byTopic).reduce((a, t) => a + t.score, 0)).toBe(perfect.score);
  });
});
