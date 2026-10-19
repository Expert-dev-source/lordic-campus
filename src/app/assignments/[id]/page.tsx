"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ASSIGNMENT_BY_ID } from "@/data/assignments";
import { Badge, Empty, Loading, PageHeader } from "@/components/ui";
import { Editor, OutputPanel } from "@/components/CodeRunner";
import { runPython, type RunResult } from "@/lib/pyrunner";
import { actions, useStore } from "@/lib/store";
import { letterGrade, round1 } from "@/lib/grading";

const words = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

export default function AssignmentPage() {
  const { id } = useParams<{ id: string }>();
  const { state, ready, update } = useStore();
  const a = ASSIGNMENT_BY_ID[id];
  const [code, setCode] = useState("");
  const [text, setText] = useState("");
  const [self, setSelf] = useState<Record<string, number>>({});
  const [res, setRes] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [init, setInit] = useState(false);

  useEffect(() => {
    if (!ready || !a || init) return;
    const last = state.assignments[a.id]?.submissions.slice(-1)[0];
    setCode(last?.code ?? a.starter ?? "");
    setText(last?.text ?? "");
    setSelf(last?.self ?? {});
    setInit(true);
  }, [ready, a, init, state.assignments]);

  if (!a) return <Empty title="Assignment not found" href="/assignments" cta="Back to assignments" />;
  if (!ready || !init) return <Loading />;
  const subs = state.assignments[a.id]?.submissions ?? [];

  const runTests = async () => { if (!a.tests) return; setRunning(true); setRes(await runPython(code, { tests: a.tests })); setRunning(false); };

  const autoMarks = (r: RunResult | null): Record<string, number> => {
    const out: Record<string, number> = {};
    for (const c of a.autoCriteria ?? []) {
      const row = a.rubric.find((x) => x.criterion === c.criterion)!;
      const total = c.testIndexes.length;
      const passed = r?.results ? c.testIndexes.filter((i) => r.results![i]?.pass).length : 0;
      out[c.criterion] = Math.round((row.marks * passed) / total);
    }
    return out;
  };
  const auto = autoMarks(res);
  const selfRows = a.rubric.filter((r) => !r.auto);
  const selfTotal = selfRows.reduce((s, r) => s + Math.min(r.marks, Math.max(0, self[r.criterion] ?? 0)), 0);
  const autoTotal = Object.values(auto).reduce((s, n) => s + n, 0);
  const total = autoTotal + selfTotal;

  const submit = async () => {
    setMsg(null);
    if (a.written && words(text) < a.written.minWords) { setMsg(`Your ${a.written.label.toLowerCase()} needs at least ${a.written.minWords} words (currently ${words(text)}).`); return; }
    let r = res;
    if (a.tests) {
      setRunning(true); r = await runPython(code, { tests: a.tests }); setRes(r); setRunning(false);
      if (!r.results) { setMsg("Your code could not be run: fix the error first. " + (r.error ?? "")); return; }
    }
    const am = autoMarks(r);
    const st = selfRows.reduce((s, row) => s + Math.min(row.marks, Math.max(0, self[row.criterion] ?? 0)), 0);
    const t = Object.values(am).reduce((s, n) => s + n, 0) + st;
    update(actions.recordAssignment(a.id, { at: Date.now(), code: a.tests ? code : undefined, text: a.written ? text : undefined, auto: am, self: self, total: t }));
    setMsg(`Submitted. Total ${t}/100 (${letterGrade(t)}). Automatic marks: ${Object.values(am).reduce((s, n) => s + n, 0)}; self-assessed marks: ${st}.`);
  };

  return (
    <div>
      <p className="mb-2 text-sm"><Link className="underline" href="/assignments">Assignments</Link> / {a.title}</p>
      <PageHeader title={a.title} subtitle={<span className="flex flex-wrap gap-2"><Badge tone="gold">{a.type}</Badge><Badge>{a.deadlineNote}</Badge></span>} />
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <section className="card"><h2 className="h3">Background and context</h2><p className="mt-2 text-sm">{a.background}</p></section>
          <section className="card"><h2 className="h3">Requirements</h2><ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">{a.requirements.map((r) => <li key={r}>{r}</li>)}</ol></section>
          <section className="card"><h2 className="h3">Learning objectives</h2><ul className="mt-2 list-disc pl-5 text-sm">{a.objectives.map((r) => <li key={r}>{r}</li>)}</ul><h2 className="h3 mt-4">Required deliverables</h2><ul className="mt-2 list-disc pl-5 text-sm">{a.deliverables.map((r) => <li key={r}>{r}</li>)}</ul><h2 className="h3 mt-4">Acceptance criteria</h2><ul className="mt-2 list-disc pl-5 text-sm">{a.acceptance.map((r) => <li key={r}>{r}</li>)}</ul><h2 className="h3 mt-4">Submission format</h2><p className="mt-1 text-sm">{a.format}</p></section>
          <section className="card"><h2 className="h3">Marking rubric (100)</h2>
            <table className="mt-2 w-full text-sm"><tbody>{a.rubric.map((r) => (<tr key={r.criterion} className="border-t border-ink-100 align-top"><td className="py-2 pr-2"><strong>{r.criterion}</strong><div className="text-xs text-ink-500">{r.descriptor}</div></td><td className="py-2 text-right whitespace-nowrap">{r.marks}</td></tr>))}</tbody></table>
            <p className="muted mt-2">Self-assessed criteria are marked by you against the descriptor. Be honest: the point is to learn to judge your own work. Everything is shown transparently in Grades.</p>
          </section>
          <section className="card"><h2 className="h3">Relevant resources</h2><ul className="mt-2 list-disc pl-5 text-sm">{a.resources.map((r) => <li key={r}>{r}</li>)}</ul></section>
        </div>

        <div className="space-y-4 lg:col-span-3">
          {a.tests && (
            <section className="card">
              <h2 className="h3">Your solution</h2>
              <div className="mt-2 overflow-hidden rounded-xl border border-ink-800"><Editor value={code} onChange={setCode} rows={18} /><OutputPanel res={null} running={running} /></div>
              <div className="mt-2 flex gap-2"><button className="btn btn-primary" onClick={runTests} disabled={running}>✔ Run acceptance tests</button><button className="btn" onClick={() => setCode(a.starter ?? "")}>Reset to starter</button></div>
              {res?.error && <p className="mt-2 whitespace-pre-wrap rounded-lg bg-red-50 p-2 font-mono text-xs text-red-800">{res.error}</p>}
              {res?.results && (<ul className="mt-3 space-y-1.5">{res.results.map((t, i) => <li key={i} className={`rounded-lg border p-2 text-xs ${t.pass ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>{t.pass ? "✔" : "✘"} {t.hidden ? `Hidden test ${i + 1}` : <span className="font-mono">{t.expr}</span>}{!t.pass && !t.hidden && <div className="font-mono">expected {t.expected}, got {t.error ? t.error.split("\n").slice(-1)[0] : t.got}</div>}</li>)}</ul>)}
            </section>
          )}
          {a.written && (
            <section className="card"><h2 className="h3">{a.written.label}</h2>
              <textarea className="input mt-2 font-sans" rows={a.tests ? 8 : 16} aria-label={a.written.label} value={text} onChange={(e) => setText(e.target.value)} placeholder={a.written.placeholder} />
              <p className={`mt-1 text-xs ${words(text) >= a.written.minWords ? "text-emerald-700" : "text-ink-500"}`}>{words(text)} / {a.written.minWords} words minimum</p>
            </section>
          )}
          <section className="card"><h2 className="h3">Self-assessment</h2>
            <div className="mt-2 space-y-3">{selfRows.map((r) => (<div key={r.criterion}><label className="flex items-center justify-between gap-3 text-sm"><span><strong>{r.criterion}</strong> <span className="text-ink-500">(0 to {r.marks})</span><div className="text-xs text-ink-500">{r.descriptor}</div></span><input type="number" className="input w-20" min={0} max={r.marks} value={self[r.criterion] ?? ""} onChange={(e) => setSelf({ ...self, [r.criterion]: Math.max(0, Math.min(r.marks, Number(e.target.value) || 0)) })} /></label></div>))}</div>
            <p className="mt-3 text-sm">Projected total: <strong>{round1(total)}/100 ({letterGrade(total)})</strong> <span className="text-ink-500">(automatic {autoTotal} + self-assessed {selfTotal})</span></p>
            <div className="mt-3 flex items-center gap-3"><button className="btn btn-gold" onClick={submit} disabled={running}>Submit assignment</button></div>
            {msg && <p className="mt-2 rounded-lg bg-ink-50 p-2 text-sm" role="status">{msg}</p>}
          </section>
          <section className="card"><h2 className="h3">Submission history and feedback</h2>
            {subs.length ? <ul className="mt-2 space-y-2 text-sm">{[...subs].reverse().map((s, i) => <li key={i} className="rounded-lg bg-ink-50 p-2">{new Date(s.at).toLocaleString()}: <strong>{s.total}/100 ({letterGrade(s.total)})</strong>{Object.keys(s.auto).length > 0 && <> · automatic: {Object.entries(s.auto).map(([k, v]) => `${k} ${v}`).join(", ")}</>}</li>)}</ul> : <p className="mt-2 text-sm text-ink-500">No submissions yet.</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
