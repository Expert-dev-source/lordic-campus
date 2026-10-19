import { describe, it, expect } from "vitest";
import { spawnSync } from "child_process";
import { mkdtempSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { LESSONS } from "@/data/lessons";
import { COURSE_BY_ID } from "@/data/courses";
import { EXERCISE_BY_ID } from "@/data/exercises";

function run(prelude: string[], code: string): string {
  const dir = mkdtempSync(path.join(tmpdir(), "lc-"));
  const program = [
    "import io, contextlib, json",
    `pre = json.loads(${JSON.stringify(JSON.stringify(prelude))})`,
    `code = json.loads(${JSON.stringify(JSON.stringify(code))})`,
    "ns = {}",
    "with contextlib.redirect_stdout(io.StringIO()):",
    "    for p in pre:",
    "        try:",
    "            exec(p, ns)",
    "        except Exception:",
    "            pass",
    "exec(code, ns)",
  ].join("\n");
  const r = spawnSync("python3", ["-I", "-c", program], { encoding: "utf8", cwd: dir, timeout: 20000 });
  if (r.status !== 0) throw new Error(r.stderr);
  return r.stdout;
}
const norm = (s: string) => s.split("\n").map((l) => l.trimEnd()).join("\n").trim();

describe("lesson content", () => {
  for (const l of LESSONS) {
    it(`${l.id}: code samples produce their documented output`, () => {
      const codes: string[] = [];
      for (const b of l.blocks) {
        if (b.t !== "code") continue;
        if (b.out && !b.code.includes("input(") && !b.out.startsWith("(")) {
          expect(norm(run(codes, b.code)), `${l.id} block`).toBe(norm(b.out));
        }
        codes.push(b.code);
      }
      for (const w of l.worked) {
        if (w.output && !w.solution.includes("input(") && !w.solution.startsWith("#")) {
          expect(norm(run(codes, w.solution)), `${l.id} worked`).toBe(norm(w.output));
        }
      }
    });

    it(`${l.id}: structure is complete`, () => {
      expect(COURSE_BY_ID[l.courseId]).toBeTruthy();
      expect(l.objectives.length).toBeGreaterThan(0);
      expect(l.worked.length).toBeGreaterThan(0);
      expect(l.check.length).toBeGreaterThanOrEqual(3);
      for (const q of l.check) {
        expect(q.options.length).toBeGreaterThanOrEqual(2);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
      }
      if (l.independent.exerciseId) expect(EXERCISE_BY_ID[l.independent.exerciseId]).toBeTruthy();
      expect(l.terms.length).toBeGreaterThan(0);
    });
  }
  it("every module of Computer Programming I has at least one lesson", () => {
    for (let m = 1; m <= 12; m++) expect(LESSONS.some((l) => l.moduleNo === m)).toBe(true);
  });
});
