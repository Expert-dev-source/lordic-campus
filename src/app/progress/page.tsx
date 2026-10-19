"use client";
import Link from "next/link";
import { LESSONS } from "@/data/lessons";
import { EXERCISES } from "@/data/exercises";
import { PageHeader, Badge, ProgressBar, Stat } from "@/components/ui";
import { useStore } from "@/lib/store";
import { courseProgress, lessonEvidence, lessonMastery, MASTERY_LABEL, type MasteryLevel } from "@/lib/mastery";
import { achievements, computeXp, levelFromXp } from "@/lib/achievements";
import { PROJECTS } from "@/data/projects";

const TONE: Record<MasteryLevel, "neutral" | "amber" | "blue" | "red" | "green" | "gold"> = { "not-started": "neutral", learning: "blue", practising: "amber", "needs-revision": "red", demonstrated: "green", mastered: "gold" };

export default function Progress() {
  const { state } = useStore();
  const p = courseProgress(state, "prog1");
  const xp = computeXp(state); const lv = levelFromXp(xp);
  const passed = EXERCISES.filter((e) => state.exercises[e.id]?.passed).length;
  const attempts = Object.values(state.exercises).reduce((a, e) => a + e.attempts, 0);
  const ach = achievements(state);
  return (
    <div>
      <PageHeader title="Progress" subtitle="Mastery is judged from evidence: quiz, exercise, classwork and examination results. Opening a lesson is never counted as understanding it." actions={<Link href="/grades" className="btn">View grades</Link>} />
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Lessons completed" value={`${p.done}/${p.total}`} /><Stat label="Exercises passed" value={`${passed}/${EXERCISES.length}`} sub={`${attempts} test runs`} /><Stat label="Exam attempts" value={state.exams.length} /><Stat label="Level" value={lv.level} sub={`${xp} XP`} />
      </div>
      <section className="card mb-6"><h2 className="h2 mb-3">Topic mastery</h2>
        <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead className="text-left text-xs uppercase text-ink-500"><tr><th className="py-2">Topic</th><th>Evidence items</th><th>Accuracy</th><th>Status</th></tr></thead>
          <tbody>{LESSONS.map((l) => { const ev = lessonEvidence(state, l.id); const acc = ev.length ? Math.round((ev.reduce((a, b) => a + b, 0) / ev.length) * 100) : null; const m = lessonMastery(state, l.id); return <tr key={l.id} className="border-t border-ink-100"><td className="py-2"><Link className="underline" href={`/lessons/${l.id}`}>{l.title}</Link></td><td>{ev.length}</td><td className="w-40">{acc === null ? "–" : <div className="flex items-center gap-2"><span className="w-9">{acc}%</span><div className="w-24"><ProgressBar value={acc} /></div></div>}</td><td><Badge tone={TONE[m]}>{MASTERY_LABEL[m]}</Badge></td></tr>; })}</tbody></table></div>
        <p className="muted mt-3">Mastery levels: Not started → Learning (lesson opened) → Practising → Needs revision (under 60% on evidence) → Demonstrated (2+ items, 70%+) → Mastered (3+ items, 85%+).</p>
      </section>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="card"><h2 className="h2 mb-2">Projects</h2><ul className="space-y-1 text-sm">{PROJECTS.slice(0, 7).map((x) => { const d = x.milestones.filter((m) => state.projects[x.id]?.[m]).length; return <li key={x.id} className="flex justify-between"><Link className="underline" href={`/projects/${x.id}`}>{x.title}</Link><span className="text-ink-500">{d}/{x.milestones.length}</span></li>; })}</ul><p className="muted mt-2"><Link className="underline" href="/projects">All 20 projects</Link></p></section>
        <section className="card"><h2 className="h2 mb-2">Achievements</h2><ul className="grid gap-2 sm:grid-cols-2">{ach.map((a) => <li key={a.id} className={`rounded-xl border p-2 text-sm ${a.earned ? "border-gold-300 bg-gold-50" : "border-ink-100 opacity-60"}`}><strong>{a.earned ? "🏅" : "🔒"} {a.title}</strong><div className="text-xs text-ink-600">{a.desc}</div></li>)}</ul></section>
      </div>
      <section className="card mt-6"><h2 className="h2 mb-2">Revision history</h2>{state.mistakes.length ? <p className="text-sm">{state.mistakes.filter((m) => m.resolved).length} of {state.mistakes.length} mistakes resolved · {Object.values(state.cards).reduce((a, c) => a + c.seen, 0)} flashcard reviews.</p> : <p className="muted">No revision activity yet.</p>}</section>
    </div>
  );
}
