"use client";
import Link from "next/link";
import { useState } from "react";
import { PageHeader, Empty } from "@/components/ui";
import { uid, useStore } from "@/lib/store";
import { addDays, isoDate, reschedule, suggestPlan } from "@/lib/planner";
import { EXAMS } from "@/data/exams-meta";

export default function Schedule() {
  const { state, update } = useStore();
  const today = isoDate(new Date());
  const [title, setTitle] = useState(""); const [date, setDate] = useState(today); const [minutes, setMinutes] = useState(30); const [subject, setSubject] = useState("Programming");
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i));
  const missed = state.plan.filter((p) => !p.done && p.date < today);
  const weekMinutes = state.plan.filter((p) => days.includes(p.date)).reduce((a, p) => a + p.minutes, 0);
  const weekDone = state.plan.filter((p) => days.includes(p.date) && p.done).reduce((a, p) => a + p.minutes, 0);
  return (
    <div>
      <PageHeader title="Study Planner" subtitle="You control the schedule. Plans adapt to the time you actually have, and missed sessions are rescheduled, not punished." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {missed.length > 0 && (<div className="card border-amber-200 bg-amber-50"><p className="text-sm"><strong>{missed.length} session(s) were not completed.</strong> That is fine. Move them forward and carry on.</p><button className="btn btn-sm mt-2" onClick={() => update((s) => ({ ...s, plan: reschedule(s, today) }))}>Reschedule missed sessions</button></div>)}
          <div className="flex flex-wrap gap-2"><button className="btn btn-gold" onClick={() => update((s) => ({ ...s, plan: [...s.plan, ...suggestPlan(s, today)] }))}>Build today&apos;s plan ({state.profile.dailyMinutes} min)</button></div>
          {days.map((d) => {
            const items = state.plan.filter((p) => p.date === d);
            return (
              <section key={d} className="card"><h2 className="font-semibold">{d === today ? "Today" : new Date(d + "T12:00:00").toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}<span className="ml-2 text-xs font-normal text-ink-500">{items.reduce((a, p) => a + p.minutes, 0)} min planned</span></h2>
                {!items.length ? <p className="muted mt-1">Nothing planned.</p> : (
                  <ul className="mt-2 divide-y divide-ink-100">{items.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                      <label className="flex items-center gap-2"><input type="checkbox" checked={p.done} onChange={() => update((s) => ({ ...s, plan: s.plan.map((x) => (x.id === p.id ? { ...x, done: !x.done } : x)) }))} /><span className={p.done ? "text-ink-400 line-through" : ""}>{p.link ? <Link className="underline" href={p.link}>{p.title}</Link> : p.title}</span></label>
                      <span className="flex items-center gap-2 text-xs text-ink-500">{p.subject} · {p.minutes} min<button className="btn btn-sm" aria-label={`Delete ${p.title}`} onClick={() => update((s) => ({ ...s, plan: s.plan.filter((x) => x.id !== p.id) }))}>✕</button></span>
                    </li>))}</ul>)}
              </section>
            );
          })}
        </div>
        <aside className="space-y-4">
          <section className="card"><h2 className="h3">Add a study session</h2>
            <form className="mt-2 space-y-2" onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; update((s) => ({ ...s, plan: [...s.plan, { id: uid("p"), title: title.trim(), subject, minutes, date, done: false }] })); setTitle(""); }}>
              <div><label className="label" htmlFor="pt">Activity</label><input id="pt" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Revise loops" /></div>
              <div className="grid grid-cols-2 gap-2"><div><label className="label" htmlFor="pd">Date</label><input id="pd" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div><div><label className="label" htmlFor="pm">Minutes</label><input id="pm" type="number" min={5} max={480} className="input" value={minutes} onChange={(e) => setMinutes(Number(e.target.value) || 5)} /></div></div>
              <div><label className="label" htmlFor="ps">Subject</label><select id="ps" className="input" value={subject} onChange={(e) => setSubject(e.target.value)}>{["Programming", "Mathematics", "Revision", "Examination", "Assignment", "Project", "Other"].map((x) => <option key={x}>{x}</option>)}</select></div>
              <button className="btn btn-primary" type="submit">Add</button></form></section>
          <section className="card"><h2 className="h3">This week</h2><p className="mt-2 text-sm">Planned: <strong>{weekMinutes}</strong> min · Completed: <strong>{weekDone}</strong> min</p><p className="muted mt-1">Daily goal: {state.profile.dailyMinutes} min (change in Settings).</p></section>
          <section className="card"><h2 className="h3">Upcoming examinations</h2><ul className="mt-2 space-y-1 text-sm">{EXAMS.map((e) => <li key={e.id}><Link className="underline" href={`/exams/${e.id}/attempt`}>{e.title}</Link></li>)}</ul><p className="muted mt-2">Add a session above to schedule a mock exam on a date you choose.</p></section>
        </aside>
      </div>
      {!state.plan.length && <div className="mt-6"><Empty title="No sessions yet">Press &ldquo;Build today&apos;s plan&rdquo; for suggestions that fit your available time, or add your own.</Empty></div>}
    </div>
  );
}
