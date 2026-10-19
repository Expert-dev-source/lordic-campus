"use client";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ExamMeta, PublicQuestion } from "@/lib/types";
import { Empty, Loading, PageHeader } from "@/components/ui";
import { actions, uid, useStore, type ExamAttempt } from "@/lib/store";

type Answer = number | number[] | boolean | string;
type Session = { startedAt: number; answers: Record<string, Answer>; flagged: string[] };
const skey = (id: string) => `lc-exam-session-${id}`;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s % 60)).padStart(2, "0")}`;

export default function AttemptPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { update, ready } = useStore();
  const [data, setData] = useState<{ meta: ExamMeta; questions: PublicQuestion[]; totalMarks: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [idx, setIdx] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [confirm, setConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState<"saved" | "saving">("saved");
  const submittedRef = useRef(false);

  useEffect(() => {
    fetch(`/api/exams/${id}`).then(async (r) => { if (!r.ok) throw new Error("Exam not found"); return r.json(); }).then(setData).catch((e) => setErr(String(e.message || e)));
    try { const raw = localStorage.getItem(skey(id)); if (raw) setSession(JSON.parse(raw)); } catch { /* ignore */ }
  }, [id]);

  const persist = useCallback((s: Session | null) => {
    setSaved("saving");
    try { if (s) localStorage.setItem(skey(id), JSON.stringify(s)); else localStorage.removeItem(skey(id)); } catch { /* ignore */ }
    setTimeout(() => setSaved("saved"), 250);
  }, [id]);

  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);

  const submit = useCallback(async (auto = false) => {
    if (!data || !session || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const r = await fetch(`/api/exams/${id}/grade`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: session.answers }) });
      if (!r.ok) throw new Error("Marking failed");
      const g = await r.json();
      const byLesson: Record<string, { score: number; max: number }> = {};
      for (const q of g.results) { byLesson[q.lessonId] ??= { score: 0, max: 0 }; byLesson[q.lessonId].score += q.marksAwarded; byLesson[q.lessonId].max += q.marks; }
      const attempt: ExamAttempt = { id: uid("att"), examId: id, at: Date.now(), durationSec: Math.min(Math.round((Date.now() - session.startedAt) / 1000), data.meta.durationMin * 60), score: g.score, max: g.max, percent: g.percent, passed: g.passed, byTopic: g.byTopic, byLesson, results: g.results };
      update(actions.recordExam(attempt));
      for (const q of g.results as ExamAttempt["results"]) if (!q.correct) update(actions.addMistake({ kind: "exam", question: q.prompt, code: q.code, submitted: q.submitted, correct: q.correctAnswer, explanation: q.explanation, lessonId: q.lessonId }));
      persist(null);
      router.push(`/exams/${id}/results/${attempt.id}${auto ? "?auto=1" : ""}`);
    } catch {
      submittedRef.current = false; setSubmitting(false);
      setErr("Could not submit. Your answers are saved: check your connection and try again.");
    }
  }, [data, session, id, update, router, persist]);

  const remaining = useMemo(() => (data && session ? Math.max(0, Math.round((session.startedAt + data.meta.durationMin * 60000 - now) / 1000)) : 0), [data, session, now]);
  useEffect(() => { if (session && data && remaining === 0) submit(true); }, [remaining, session, data, submit]);

  if (err && !data) return <Empty title="Could not load the examination" href="/exams" cta="Back to examinations">{err}</Empty>;
  if (!data || !ready) return <Loading />;
  const { meta, questions } = data;

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title={meta.title} subtitle={meta.description} />
        <section className="card">
          <h2 className="h3">Before you start</h2>
          <dl className="mt-3 grid grid-cols-2 gap-y-1 text-sm"><dt className="text-ink-500">Duration</dt><dd>{meta.durationMin} minutes</dd><dt className="text-ink-500">Questions</dt><dd>{questions.length}</dd><dt className="text-ink-500">Total marks</dt><dd>{data.totalMarks}</dd><dt className="text-ink-500">Pass mark</dt><dd>{meta.passPercent}%</dd><dt className="text-ink-500">Resources</dt><dd>{meta.resources}</dd><dt className="text-ink-500">Review</dt><dd>{meta.review}</dd></dl>
          <h3 className="h3 mt-5">Rules</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{meta.rules.map((r) => <li key={r}>{r}</li>)}</ul>
          <div className="mt-5 flex gap-3"><button className="btn btn-gold" onClick={() => { const s = { startedAt: Date.now(), answers: {}, flagged: [] }; setSession(s); persist(s); }}>Begin examination</button><Link href="/exams" className="btn">Cancel</Link></div>
        </section>
      </div>
    );
  }

  const q = questions[idx];
  const ans = session.answers[q.id];
  const setAns = (v: Answer | undefined) => { const a = { ...session.answers }; if (v === undefined || v === "" || (Array.isArray(v) && !v.length)) delete a[q.id]; else a[q.id] = v; const s = { ...session, answers: a }; setSession(s); persist(s); };
  const toggleFlag = () => { const f = session.flagged.includes(q.id) ? session.flagged.filter((x) => x !== q.id) : [...session.flagged, q.id]; const s = { ...session, flagged: f }; setSession(s); persist(s); };
  const answered = questions.filter((x) => session.answers[x.id] !== undefined).length;
  const low = remaining <= 120;

  return (
    <div>
      <div className="sticky top-0 z-20 -mx-4 mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-ink-100 bg-paper/95 px-4 py-2 backdrop-blur sm:-mx-8 sm:px-8 lg:top-0">
        <div><p className="font-serif text-lg font-semibold">{meta.title}</p><p className="text-xs text-ink-500">Question {idx + 1} of {questions.length} · {answered} answered · <span aria-live="polite">{saved === "saved" ? "All answers saved" : "Saving…"}</span></p></div>
        <div role="timer" aria-label="Time remaining" className={`rounded-lg px-3 py-1.5 font-mono text-lg font-semibold ${low ? "bg-red-100 text-red-800" : "bg-ink-900 text-white"}`}>{fmt(remaining)}</div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <section className="card" aria-labelledby="qtext">
          <div className="flex justify-between text-xs text-ink-500"><span>{q.topic} · {q.difficulty}</span><span>{q.marks} mark{q.marks > 1 ? "s" : ""}</span></div>
          <p id="qtext" className="mt-2 text-lg font-medium">{q.prompt}</p>
          {q.code && <pre className="code">{q.code}</pre>}
          <div className="mt-3">
            {q.type === "single" && <div className="grid gap-2" role="radiogroup" aria-labelledby="qtext">{q.options!.map((o, j) => <label key={j} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm ${ans === j ? "border-ink-700 bg-ink-50" : "border-ink-100 hover:bg-ink-50"}`}><input type="radio" name="opt" className="mt-1" checked={ans === j} onChange={() => setAns(j)} /><span>{o}</span></label>)}</div>}
            {q.type === "multi" && <div className="grid gap-2"><p className="text-xs text-ink-500">Select all that apply.</p>{q.options!.map((o, j) => { const cur = (ans as number[] | undefined) ?? []; const on = cur.includes(j); return <label key={j} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-3 text-sm ${on ? "border-ink-700 bg-ink-50" : "border-ink-100 hover:bg-ink-50"}`}><input type="checkbox" className="mt-1" checked={on} onChange={() => setAns(on ? cur.filter((x) => x !== j) : [...cur, j].sort())} /><span>{o}</span></label>; })}</div>}
            {q.type === "tf" && <div className="flex gap-3" role="radiogroup" aria-labelledby="qtext">{[true, false].map((v) => <label key={String(v)} className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border p-3 text-sm ${ans === v ? "border-ink-700 bg-ink-50" : "border-ink-100 hover:bg-ink-50"}`}><input type="radio" name="tf" checked={ans === v} onChange={() => setAns(v)} />{v ? "True" : "False"}</label>)}</div>}
            {(q.type === "numeric" || q.type === "short" || q.type === "trace") && <div><label className="label" htmlFor="free">{q.type === "numeric" ? "Your numeric answer" : q.type === "trace" ? "Exact output (use a space between lines)" : "Your answer"}</label><input id="free" className="input max-w-md" inputMode={q.type === "numeric" ? "decimal" : "text"} value={(ans as string) ?? ""} onChange={(e) => setAns(e.target.value)} autoComplete="off" /></div>}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2"><button className="btn" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>← Previous</button><button className="btn" disabled={idx === questions.length - 1} onClick={() => setIdx(idx + 1)}>Next →</button></div>
            <div className="flex gap-2"><button className={`btn ${session.flagged.includes(q.id) ? "btn-gold" : ""}`} onClick={toggleFlag}>{session.flagged.includes(q.id) ? "⚑ Flagged" : "⚐ Flag for review"}</button><button className="btn btn-primary" onClick={() => setConfirm(true)}>Submit examination</button></div>
          </div>
        </section>
        <aside className="card h-fit"><h2 className="h3">Question navigator</h2>
          <div className="mt-3 grid grid-cols-5 gap-1.5">{questions.map((x, i) => { const a = session.answers[x.id] !== undefined; const f = session.flagged.includes(x.id); return <button key={x.id} aria-label={`Question ${i + 1}${a ? ", answered" : ", not answered"}${f ? ", flagged" : ""}`} onClick={() => setIdx(i)} className={`relative rounded-md border py-1.5 text-xs font-medium ${i === idx ? "border-ink-900 ring-2 ring-gold-400" : "border-ink-200"} ${a ? "bg-ink-800 text-white" : "bg-white"}`}>{i + 1}{f && <span className="absolute -right-1 -top-1 text-[10px]">⚑</span>}</button>; })}</div>
          <p className="muted mt-3">Dark = answered · ⚑ = flagged</p>
        </aside>
      </div>
      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" aria-labelledby="ctitle">
          <div className="card max-w-md"><h2 id="ctitle" className="h2">Submit examination?</h2>
            <p className="mt-2 text-sm">You have answered {answered} of {questions.length} questions{session.flagged.length ? ` and flagged ${session.flagged.length}` : ""}. {questions.length - answered > 0 && <strong>{questions.length - answered} unanswered question(s) will score zero.</strong>} You cannot change answers after submitting.</p>
            {err && <p className="mt-2 text-sm text-red-700">{err}</p>}
            <div className="mt-4 flex justify-end gap-2"><button className="btn" onClick={() => setConfirm(false)}>Keep working</button><button className="btn btn-gold" disabled={submitting} onClick={() => submit()}>{submitting ? "Marking…" : "Submit now"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
