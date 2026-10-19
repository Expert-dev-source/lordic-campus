import { describe, it, expect } from "vitest";
import { spawnSync } from "child_process";
import { ASSIGNMENTS } from "@/data/assignments";

const SOLUTIONS: Record<string, string> = {
  "as-1-grading": `
import math
def letter_grade(score):
    if score >= 70: return 'A'
    elif score >= 60: return 'B'
    elif score >= 50: return 'C'
    elif score >= 45: return 'D'
    elif score >= 40: return 'E'
    return 'F'

def _to_score(raw):
    try:
        v = float(raw)
    except (ValueError, TypeError):
        return None
    if math.isnan(v) or v < 0 or v > 100:
        return None
    return v

def process_scores(raw_scores):
    valid, invalid = [], []
    for raw in raw_scores:
        v = _to_score(raw)
        if v is None:
            invalid.append(raw)
        else:
            valid.append(v)
    average = sum(valid) / len(valid) if valid else None
    return {'valid': valid, 'invalid': invalid, 'average': average, 'grades': [letter_grade(v) for v in valid]}
`,
  "as-3-search-sort": `
def count_linear(items, target):
    n = 0
    for x in items:
        n += 1
        if x == target:
            return n
    return n

def count_binary(items, target):
    low, high, n = 0, len(items) - 1, 0
    while low <= high:
        n += 1
        mid = (low + high) // 2
        if items[mid] == target:
            return n
        elif items[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return n
`,
};

describe("assignments", () => {
  for (const a of ASSIGNMENTS) {
    it(`${a.id}: rubric totals 100`, () => {
      expect(a.rubric.reduce((s, r) => s + r.marks, 0)).toBe(100);
    });
    if (a.tests) {
      it(`${a.id}: reference solution passes all tests; starter does not`, () => {
        const run = (src: string) => {
          const prog = [
            "import json",
            `src = json.loads(${JSON.stringify(JSON.stringify(src))})`,
            `tests = json.loads(${JSON.stringify(JSON.stringify(a.tests))})`,
            "res = []",
            "for t in tests:",
            "    ns = {}",
            "    try:",
            "        exec(src, ns)",
            "        got = repr(eval(t['expr'], ns))",
            "    except Exception as e:",
            "        got = 'ERR ' + repr(e)",
            "    res.append([t['expr'], t['expected'], got, got == t['expected']])",
            "print(json.dumps(res))",
          ].join("\n");
          const r = spawnSync("python3", ["-I", "-c", prog], { encoding: "utf8" });
          return JSON.parse(r.stdout) as [string, string, string, boolean][];
        };
        const good = run(SOLUTIONS[a.id]);
        expect(good.filter((x) => !x[3])).toEqual([]);
        const bad = run(a.starter!);
        expect(bad.some((x) => !x[3])).toBe(true);
        // every auto criterion points at real tests
        for (const c of a.autoCriteria ?? []) for (const i of c.testIndexes) expect(a.tests![i]).toBeTruthy();
      });
    }
  }
});
