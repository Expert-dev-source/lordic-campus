import { describe, it, expect } from "vitest";
import { spawnSync } from "child_process";
import { EXERCISES } from "@/data/exercises";
import { LESSONS } from "@/data/lessons";

function runPy(program: string): { out: string; err: string; status: number | null } {
  const r = spawnSync("python3", ["-I", "-c", program], { encoding: "utf8", timeout: 20000 });
  return { out: r.stdout, err: r.stderr, status: r.status };
}

describe("coding exercises", () => {
  for (const ex of EXERCISES) {
    it(`${ex.id}: reference solution passes every test`, () => {
      const prog = [
        "import json,sys",
        `src = json.loads(${JSON.stringify(JSON.stringify(ex.solution))})`,
        `tests = json.loads(${JSON.stringify(JSON.stringify(ex.tests))})`,
        "bad = []",
        "for t in tests:",
        "    ns = {}",
        "    exec(src, ns)",
        "    if t.get('setup'): exec(t['setup'], ns)",
        "    got = repr(eval(t['expr'], ns))",
        "    if got != t['expected']: bad.append([t['expr'], t['expected'], got])",
        "print(json.dumps(bad))",
      ].join("\n");
      const r = runPy(prog);
      expect(r.err).toBe("");
      expect(JSON.parse(r.out)).toEqual([]);
    });

    it(`${ex.id}: starter code does NOT pass all tests (no giveaway)`, () => {
      const prog = [
        "import json",
        `src = json.loads(${JSON.stringify(JSON.stringify(ex.starter))})`,
        `tests = json.loads(${JSON.stringify(JSON.stringify(ex.tests))})`,
        "passed = 0",
        "for t in tests:",
        "    ns = {}",
        "    try:",
        "        exec(src, ns)",
        "        if t.get('setup'): exec(t['setup'], ns)",
        "        if repr(eval(t['expr'], ns)) == t['expected']: passed += 1",
        "    except Exception:",
        "        pass",
        "print(json.dumps([passed, len(tests)]))",
      ].join("\n");
      const [passed, total] = JSON.parse(runPy(prog).out);
      expect(passed).toBeLessThan(total);
    });

    it(`${ex.id}: has 5 hint levels and belongs to a real lesson`, () => {
      expect(ex.hints.length).toBe(5);
      expect(LESSONS.some((l) => l.id === ex.lessonId)).toBe(true);
    });
  }
});
