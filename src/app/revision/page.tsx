"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { CARDS } from "@/lib/flashcards";
import { LESSONS } from "@/data/lessons";
import { LESSON_BY_ID } from "@/data/lessons";
import { Badge, Empty, PageHeader, Tabs } from "@/components/ui";
import { actions, useStore } from "@/lib/store";
import { lessonMastery, MASTERY_LABEL } from "@/lib/mastery";
import { BANK_PUBLIC } from "@/data/cumulative";

type Tab = "cards" | "notebook" | "weak" | "saved" | "cumulative";

function Cards() {
  const { state, update } = useStore();
  const [flip, setFlip] = useState(false);
  const [seed, setSeed] = useState(0);
  const due = useMemo(() => CARDS.filter((c) => (state.cards[c.id]?.due ?? 0) <= Date.now()).sort((a, b) => (state.cards[a.id]?.box ?? 0) - (state.cards[b.id]?.box ?? 0)), [state.cards, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const c = due[0];
  if (!c) return <Empty title="All caught up">No cards are due. Cards you rated Hard or Again return sooner; Easy cards come back after longer gaps.</Empty>;
  const rate = (r: 0 | 1 | 2 | 3) => { update(actions.rateCard(c.id, r)); setFlip(false); setSeed(seed + 1); };
  return (
    <div className="mx-auto max-w-xl">
      <p className="muted mb-2">{due.length} card(s) due · from <Link className="underline" href={`/lessons/${c.lessonId}`}>{LESSON_BY_ID[c.lessonId]?.title}</Link></p>
      <button onClick={() => setFlip(!flip)} className="card block min-h-[200px] w-full text-left" aria-live="polite"><p className="label">{flip ? "Answer" : "Question"}</p><p className="mt-2 text-lg">{flip ? c.back : c.front}</p>{!flip && <p className="muted mt-6">Tap to reveal</p>}</button>
      {flip && <div className="mt-3 grid grid-cols-4 gap-2"><button className="btn" onClick={() => rate(0)}>Again</button><button className="btn" onClick={() => rate(1)}>Hard</button><button className="btn" onClick={() => rate(2)}>Good</button><button className="btn" onClick={() => rate(3)}>Easy</button></div>}
    </div>
  );
}

function Notebook() {
  const { state, update } = useStore();
  const [showResolved, setShowResolved] = useState(false);
  const list = state.mistakes.filter((m) => showResolved || !m.resolved);
  return (
    <div>
      <label className="mb-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />Show resolved</label>
      {!list.length && <Empty title="Your notebook is empty">Questions you get wrong in lesson quizzes, classwork, exercises and exams are collected here automatically with explanations.</Empty>}
      <ul className="space-y-3">{list.map((m) => (
        <li key={m.id} className={`card ${m.resolved ? "opacity-60" : ""}`}><div className="flex flex-wrap items-center justify-between gap-2"><Badge>{m.kind}</Badge><span className="text-xs text-ink-500">{new Date(m.at).toLocaleDateString()}</span></div>
          <p className="mt-2 whitespace-pre-wrap font-medium">{m.question}</p>{m.code && <pre className="code">{m.code}</pre>}
          <p className="mt-1 text-sm"><strong>Your answer:</strong> {m.submitted}</p>{m.correct && <p className="text-sm"><strong>Correct answer:</strong> {m.correct}</p>}{m.explanation && <p className="mt-2 rounded-lg bg-ink-50 p-2 text-sm">{m.explanation}</p>}
          <div className="mt-3 flex flex-wrap gap-2">{m.lessonId && <Link className="btn btn-sm" href={`/lessons/${m.lessonId}`}>Related lesson</Link>}{m.kind === "exercise" && <Link className="btn btn-sm" href="/coding-lab">Retry in lab</Link>}{!m.resolved && <button className="btn btn-sm" onClick={() => update(actions.resolveMistake(m.id))}>I understand this now</button>}</div></li>))}</ul>
    </div>
  );
}

function Weak() {
  const { state } = useStore();
  const weak = LESSONS.filter((l) => lessonMastery(state, l.id) === "needs-revision");
  if (!weak.length) return <Empty title="No weak topics detected" href="/exams" cta="Take a mock examination">Weak topics are identified from real assessment results (quizzes, exercises, classwork and exams). Complete some assessments and they will appear here.</Empty>;
  return <ul className="space-y-3">{weak.map((l) => <li key={l.id} className="card flex flex-wrap items-center justify-between gap-2"><div><p className="font-semibold">{l.title}</p><p className="muted">{MASTERY_LABEL[lessonMastery(state, l.id)]}</p></div><div className="flex gap-2"><Link className="btn btn-sm" href={`/lessons/${l.id}`}>Review lesson</Link>{l.independent.exerciseId && <Link className="btn btn-sm btn-primary" href={`/coding-lab/${l.independent.exerciseId}`}>Practise</Link>}</div></li>)}</ul>;
}

function Saved() {
  const { state, update } = useStore();
  if (!state.bookmarks.length) return <Empty title="Nothing saved yet">Bookmark lessons from the lesson page and formulas from the Mathematics Laboratory.</Empty>;
  return <ul className="grid gap-3 md:grid-cols-2">{state.bookmarks.map((b) => <li key={b.id} className="card flex items-start justify-between gap-2"><div><Badge>{b.kind}</Badge><p className="mt-1 font-medium">{b.kind === "lesson" ? <Link className="underline" href={`/lessons/${b.ref}`}>{b.label}</Link> : b.label}</p>{b.body && <p className="font-mono text-sm">{b.body}</p>}</div><button className="btn btn-sm" onClick={() => update(actions.toggleBookmark(b))}>Remove</button></li>)}</ul>;
}

function Cumulative() {
  const [qs, setQs] = useState<typeof BANK_PUBLIC>([]);
  const [i, setI] = useState(0); const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0); const [done, setDone] = useState(false);
  const start = () => { const pool = [...BANK_PUBLIC].sort(() => Math.random() - 0.5).slice(0, 8); setQs(pool); setI(0); setSel(null); setScore(0); setDone(false); };
  if (!qs.length) return <div className="card max-w-xl"><h2 className="h2">Cumulative quiz</h2><p className="muted my-2">Eight mixed questions drawn from every lesson you have access to, to encourage long-term retention. Immediate feedback after each question. These are practice questions for revision (the examination centre keeps its answer keys on the server).</p><button className="btn btn-primary" onClick={start}>Start quiz</button></div>;
  if (done) return <div className="card max-w-xl"><h2 className="h2">Score: {score}/{qs.length}</h2><button className="btn btn-primary mt-3" onClick={start}>New quiz</button></div>;
  const q = qs[i];
  return (
    <div className="card max-w-xl"><p className="label">Question {i + 1} of {qs.length}</p><p className="font-medium">{q.q}</p>
      <div className="mt-3 grid gap-2">{q.options.map((o, j) => <button key={j} disabled={sel !== null} onClick={() => { setSel(j); if (j === q.answer) setScore(score + 1); }} className={`rounded-lg border p-2 text-left text-sm ${sel === null ? "border-ink-100 hover:bg-ink-50" : j === q.answer ? "border-emerald-400 bg-emerald-50" : j === sel ? "border-red-300 bg-red-50" : "border-ink-100"}`}>{o}</button>)}</div>
      {sel !== null && <><p className="mt-3 rounded-lg bg-ink-50 p-2 text-sm">{q.explain}</p><button className="btn btn-primary mt-3" onClick={() => (i + 1 >= qs.length ? setDone(true) : (setI(i + 1), setSel(null)))}>{i + 1 >= qs.length ? "Finish" : "Next"}</button></>}</div>
  );
}

export default function Revision() {
  const [tab, setTab] = useState<Tab>("cards");
  return (
    <div><PageHeader title="Revision Centre" subtitle="Flashcards with spaced repetition, a mistake notebook, weak-topic revision, saved items and cumulative quizzes." />
      <Tabs<Tab> value={tab} onChange={setTab} tabs={[{ id: "cards", label: "Flashcards" }, { id: "notebook", label: "Mistake notebook" }, { id: "weak", label: "Weak topics" }, { id: "cumulative", label: "Cumulative quiz" }, { id: "saved", label: "Saved examples and formulas" }]} />
      {tab === "cards" && <Cards />}{tab === "notebook" && <Notebook />}{tab === "weak" && <Weak />}{tab === "cumulative" && <Cumulative />}{tab === "saved" && <Saved />}
    </div>
  );
}
