import { describe, it, expect } from "vitest";
import { letterGrade } from "@/lib/grading";
import { masteryFromEvidence, lessonMastery } from "@/lib/mastery";
import { DEFAULT_STATE, actions } from "@/lib/state";
import { gradebook } from "@/lib/gradebook";
import { truthTable, parse } from "@/lib/boolexpr";
import { mean, median, modes, variance, quartiles, derivative, polyString, linearEquation, mulberry32, toBase, fromBase } from "@/lib/mathtools";

describe("grading policy", () => {
  it("matches the documented boundaries", () => {
    const cases: [number, string][] = [[100, "A"], [70, "A"], [69.9, "B"], [60, "B"], [59, "C"], [50, "C"], [49, "D"], [45, "D"], [44, "E"], [40, "E"], [39, "F"], [0, "F"]];
    for (const [p, g] of cases) expect(letterGrade(p)).toBe(g);
  });
});

describe("mastery", () => {
  it("never counts opening a lesson as evidence", () => {
    expect(masteryFromEvidence(false, [])).toBe("not-started");
    expect(masteryFromEvidence(true, [])).toBe("learning");
  });
  it("is evidence-based", () => {
    expect(masteryFromEvidence(true, [0.4])).toBe("needs-revision");
    expect(masteryFromEvidence(true, [0.8])).toBe("practising");
    expect(masteryFromEvidence(true, [0.8, 0.8])).toBe("demonstrated");
    expect(masteryFromEvidence(true, [0.9, 0.9, 1])).toBe("mastered");
  });
  it("uses stored checks, exercises and exams", () => {
    let s = actions.openLesson("prog1-4-1")(DEFAULT_STATE);
    expect(lessonMastery(s, "prog1-4-1")).toBe("learning");
    s = actions.recordCheck("prog1-4-1", 1, 3)(s);
    expect(lessonMastery(s, "prog1-4-1")).toBe("needs-revision");
    s = actions.recordExercise("ex-grade", "code", 8, 8)(s);
    s = actions.recordCheck("prog1-4-1", 3, 3)(s);
    expect(["demonstrated", "mastered", "practising"]).toContain(lessonMastery(s, "prog1-4-1"));
  });
});

describe("gradebook", () => {
  it("is empty without evidence and weights only categories with data", () => {
    expect(gradebook(DEFAULT_STATE).overall).toBeNull();
    let s = actions.recordCheck("prog1-1-1", 3, 3)(DEFAULT_STATE);
    expect(gradebook(s).overall).toBe(100);
    s = actions.recordClasswork("cw-1-trace", 5, 10, {})(s);
    const g = gradebook(s);
    // quizzes 100% (weight 10) and classwork 50% (weight 20): (1000 + 1000) / 30 = 66.7
    expect(g.overall).toBe(66.7);
    expect(g.letter).toBe("B");
  });
});

describe("boolean expressions", () => {
  it("builds truth tables", () => {
    const t = truthTable("A AND B");
    expect(t.vars).toEqual(["A", "B"]);
    expect(t.rows.map((r) => r.out)).toEqual([false, false, false, true]);
    expect(truthTable("A OR NOT A").kind).toContain("tautology");
    expect(truthTable("A AND NOT A").kind).toContain("contradiction");
    expect(truthTable("A XOR B").rows.map((r) => r.out)).toEqual([false, true, true, false]);
    expect(truthTable("!(A & B) | C").rows.length).toBe(8);
  });
  it("respects precedence and rejects bad input without evaluating code", () => {
    expect(truthTable("A OR B AND C").rows.map((r) => r.out)).toEqual([false, false, false, true, true, true, true, true]);
    expect(() => parse("A AND (B")).toThrow();
    expect(() => parse("process.exit()")).toThrow();
    expect(() => parse("")).toThrow();
  });
});

describe("math tools", () => {
  it("statistics", () => {
    expect(mean([2, 4, 6])).toBe(4);
    expect(median([1, 3, 2])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(modes([1, 2, 2, 3])).toEqual([2]);
    expect(modes([1, 2, 3])).toEqual([]);
    expect(variance([2, 4, 4, 4, 5, 5, 7, 9])).toBe(4);
    expect(quartiles([1, 2, 3, 4, 5, 6, 7, 8]).q2).toBe(4.5);
  });
  it("power rule", () => {
    expect(derivative([1, 0, 0, 0])).toEqual([3, 0, 0]); // x^3 -> 3x^2
    expect(polyString([3, 0, 0])).toBe("3x^2");
    expect(polyString([2, -3, 1])).toBe("2x^2 - 3x + 1");
    expect(derivative([5])).toEqual([0]);
  });
  it("linear equation generator has integer answers", () => {
    const r = mulberry32(42);
    for (let i = 0; i < 50; i++) {
      const q = linearEquation(r);
      expect(Number.isInteger(q.answer)).toBe(true);
    }
  });
  it("base conversion", () => {
    expect(toBase(255, 2)).toBe("11111111");
    expect(toBase(255, 16)).toBe("FF");
    expect(fromBase("1010", 2)).toBe(10);
    expect(() => fromBase("12", 2)).toThrow();
  });
});
