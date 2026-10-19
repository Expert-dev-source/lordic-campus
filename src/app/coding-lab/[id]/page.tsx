"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { EXERCISE_BY_ID } from "@/data/exercises";
import { LESSON_BY_ID } from "@/data/lessons";
import { Badge, CodeBlock, Empty, Loading, PageHeader } from "@/components/ui";
import { Editor, OutputPanel } from "@/components/CodeRunner";
import { runPython, type RunResult } from "@/lib/pyrunner";
import { actions, useStore } from "@/lib/store";

export default function ExercisePage() {
  const { id } = useParams<{ id: string }>();
  const { state, ready, update } = useStore();
  const ex = EXERCISE_BY_ID[id];
  const [code, setCode] = useState("");
  const [hints, setHints] = useState(0);
  const [res, setRes] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<"run" | "test" | null>(null);
  const [stdin, setStdin] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!ready || !ex || loaded) return;
    const st = state.exercises[ex.id];
    setCode(st?.code && st.code.trim() ? st.code : ex.starter);
    setHints(st?.hintsUsed ?? 0);
    setLoaded(true);
  }, [ready, ex, state.exercises, loaded]);

  if (!ex) return <Empty title="Exercise not found" href="/coding-lab" cta="All exercises" />;
  if (!ready || !loaded) return <Loading />;
  const lesson = LESSON_BY_ID[ex.lessonId];
  const st = state.exercises[ex.id];
  const showSolution = hints >= 5;
  const canSolution = (st?.attempts ?? 0) >= 1;

  const run = async () => { setMode("run"); setRunning(true); setRes(await runPython(code, { stdin })); setRunning(false); };
  const test = async () => {
    setMode("test"); setRunning(true);
    const r = await runPython(code, { tests: ex.tests });
    setRes(r); setRunning(false);
    if (r.results) {
      const passed = r.results.filter((t) => t.pass).length;
      update(actions.recordExercise(ex.id, code, passed, r.results.length, hints));
      if (passed < r.results.length) {
        const first = r.results.find((t) => !t.pass && !t.hidden) ?? r.results.find((t) => !t.pass);
        if (first) update(actions.addMistake({ kind: "exercise", question: `${ex.title}: ${first.hidden ? "a hidden test" : first.expr}`, submitted: first.error ?? first.got ?? "(no result)", correct: first.hidden ? undefined : first.expected, explanation: ex.explanation, lessonId: ex.lessonId }));
      }
    } else if (r.error) {
      update(actions.recordExercise(ex.id, code, 0, ex.tests.length, hints));
    }
  };
  const save = (c: string) => { setCode(c); };
  const passedNow = res?.results ? res.results.filter((t) => t.pass).length : 0;
  const allPass = !!res?.results && passedNow === res.results.length && mode === "test";

  return (
    <div>
      <p className="mb-2 text-sm"><Link className="underline" href="/coding-lab">Coding Laboratory</Link> / {ex.title}</p>
      <PageHeader title={ex.title} subtitle={<span className="flex flex-wrap items-center gap-2"><Badge>{ex.difficulty}</Badge>{st?.passed && <Badge tone="green">Passed</Badge>}{lesson && <Link className="underline" href={`/lessons/${lesson.id}`}>Lesson: {lesson.title}</Link>}</span>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card">
          <h2 className="h3">Problem statement</h2>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-sm leading-6">{ex.prompt}</pre>
          <h3 className="h3 mt-5">Tests ({ex.tests.length})</h3>
          <ul className="mt-2 space-y-1 text-sm">
            {ex.tests.map((t, i) => <li key={i} className="font-mono text-xs">{t.hidden ? <span className="text-ink-400">Hidden test {i + 1}: checks an edge case</span> : <>{t.setup ? <span className="text-ink-400">{t.setup.replace(/\n/g, "; ")}; </span> : null}{t.expr} → {t.expected}</>}</li>)}
          </ul>

          <h3 className="h3 mt-5">Progressive hints</h3>
          <div className="mt-2 space-y-2">
            {ex.hints.slice(0, Math.min(hints, 4)).map((h, i) => <div key={i} className="rounded-lg bg-gold-50 p-2 text-sm"><strong>Hint {i + 1}:</strong> <span className="whitespace-pre-wrap">{h}</span></div>)}
            {hints < 4 && <button className="btn btn-sm" onClick={() => setHints(hints + 1)}>Show hint {hints + 1} of 4</button>}
            {hints >= 4 && !showSolution && (<div><button className="btn btn-sm" disabled={!canSolution} onClick={() => setHints(5)}>Reveal solution</button>{!canSolution && <span className="ml-2 text-xs text-ink-500">Run the tests at least once first: attempting the problem is how you learn.</span>}</div>)}
            {showSolution && (<div><p className="label">Solution</p><CodeBlock code={ex.solution} /><p className="text-sm"><strong>Why it works:</strong> {ex.explanation}</p></div>)}
          </div>
          {st && st.history.length > 0 && (<><h3 className="h3 mt-5">Attempt history</h3><ul className="mt-2 text-xs text-ink-600">{[...st.history].reverse().slice(0, 6).map((h, i) => <li key={i}>{new Date(h.at).toLocaleString()}: {h.passed}/{h.total} tests passed</li>)}</ul></>)}
        </section>

        <section>
          <div className="overflow-hidden rounded-xl border border-ink-800">
            <Editor value={code} onChange={save} rows={16} />
            <OutputPanel res={mode === "run" ? res : null} running={running && mode === "run"} />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button className="btn" onClick={run} disabled={running}>▶ Run</button>
            <button className="btn btn-primary" onClick={test} disabled={running}>✔ Run tests</button>
            <button className="btn" onClick={() => { setCode(ex.starter); setRes(null); }}>Reset</button>
            <button className="btn" onClick={() => update(actions.saveExerciseDraft(ex.id, code, hints))}>Save draft</button>
          </div>
          <div className="mt-2"><label className="label" htmlFor="si">Input for input() calls</label><textarea id="si" className="input font-mono" rows={2} value={stdin} onChange={(e) => setStdin(e.target.value)} /></div>

          {mode === "test" && (
            <div className="card mt-4" aria-live="polite">
              <h2 className="h3">Test results</h2>
              {running && <p className="mt-2 text-sm">Running tests…</p>}
              {!running && res?.error && !res.results && <p className="mt-2 whitespace-pre-wrap rounded-lg bg-red-50 p-2 font-mono text-xs text-red-800">{res.error}</p>}
              {!running && res?.error && res.results && <p className="mt-2 whitespace-pre-wrap rounded-lg bg-red-50 p-2 font-mono text-xs text-red-800">Your code has an error:{"\n"}{res.error}</p>}
              {!running && res?.results && (
                <>
                  <p className={`mt-2 font-semibold ${allPass ? "text-emerald-700" : "text-amber-700"}`}>{allPass ? "🎉 All tests passed!" : `${passedNow} of ${res.results.length} tests passed`}</p>
                  <ul className="mt-2 space-y-1.5">
                    {res.results.map((t, i) => (
                      <li key={i} className={`rounded-lg border p-2 text-xs ${t.pass ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                        <span className="font-semibold">{t.pass ? "✔ Pass" : "✘ Fail"}</span> {t.hidden ? `Hidden test ${i + 1}` : <span className="font-mono">{t.expr}</span>}
                        {!t.pass && !t.hidden && (<div className="mt-1 font-mono">expected {t.expected}, got {t.error ? <span className="text-red-700">{t.error.split("\n").slice(-1)[0]}</span> : t.got}</div>)}
                        {!t.pass && t.hidden && <div className="mt-1">An edge case failed. Think about empty, zero, negative or boundary inputs.</div>}
                      </li>
                    ))}
                  </ul>
                  {allPass && <p className="mt-3 text-sm">Nice work. Review the explanation, then try the next exercise or the related classwork.</p>}
                </>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
