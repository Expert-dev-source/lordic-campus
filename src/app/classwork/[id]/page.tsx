"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CLASSWORK_BY_ID, classworkMarks } from "@/data/classwork";
import { EXERCISE_BY_ID } from "@/data/exercises";
import { LESSON_BY_ID } from "@/data/lessons";
import { Badge, Empty, Loading, PageHeader } from "@/components/ui";
import { actions, useStore } from "@/lib/store";
import { markTask } from "@/lib/classworkmark";

export default function ClassworkDetail() {
  const { id } = useParams<{ id: string }>();
  const { state, ready, update } = useStore();
  const cw = CLASSWORK_BY_ID[id];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [marks, setMarks] = useState<boolean[]>([]);
  useEffect(() => { setAnswers({}); setSubmitted(false); }, [id]);
  if (!cw) return <Empty title="Classwork not found" href="/classwork" cta="Back to classwork" />;
  if (!ready) return <Loading />;
  const lesson = LESSON_BY_ID[cw.lessonId];
  const max = classworkMarks(cw);
  const prev = state.classwork[cw.id];

  const submit = () => {
    const results = cw.tasks.map((t, i) => markTask(t, answers[i], t.type === "code" && !!state.exercises[t.exerciseId]?.passed));
    const score = cw.tasks.reduce((s, t, i) => s + (results[i] ? t.marks : 0), 0);
    cw.tasks.forEach((t, i) => {
      if (!results[i] && t.type !== "code") update(actions.addMistake({ kind: "classwork", question: `${cw.title}: ${t.q}${t.type === "trace" ? "\n" + t.code : ""}`, code: t.type === "trace" ? t.code : undefined, submitted: answers[i] ?? "(no answer)", correct: t.type === "mc" ? t.options[t.answer] : t.accept[0], explanation: t.explain, lessonId: cw.lessonId }));
    });
    update(actions.recordClasswork(cw.id, score, max, answers));
    setMarks(results);
    setSubmitted(true);
  };

  return (
    <div>
      <p className="mb-2 text-sm"><Link className="underline" href="/classwork">Classwork</Link> / {cw.title}</p>
      <PageHeader title={cw.title} subtitle={<span className="flex flex-wrap items-center gap-2"><Badge>{cw.category}</Badge><Badge>{cw.difficulty}</Badge><span>{cw.minutes} min · {max} marks</span>{lesson && <Link className="underline" href={`/lessons/${lesson.id}`}>Lesson: {lesson.title}</Link>}</span>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="card"><h2 className="h3">Instructions</h2><p className="mt-2 text-sm">{cw.instructions}</p><h3 className="h3 mt-4">Learning objectives</h3><ul className="mt-1 list-disc pl-5 text-sm">{cw.objectives.map((o) => <li key={o}>{o}</li>)}</ul></section>
          {cw.tasks.map((t, i) => {
            const ok = submitted ? marks[i] : undefined;
            return (
              <section key={i} className={`card ${ok === true ? "border-emerald-300" : ok === false ? "border-red-300" : ""}`}>
                <div className="flex justify-between"><h2 className="font-semibold">Question {i + 1}</h2><span className="text-xs text-ink-500">{t.marks} mark{t.marks > 1 ? "s" : ""}</span></div>
                <p className="mt-1 text-sm">{t.q}</p>
                {t.type === "trace" && <pre className="code">{t.code}</pre>}
                {t.type === "mc" && (<div className="mt-2 grid gap-1.5">{t.options.map((o, j) => <label key={j} className="flex cursor-pointer items-center gap-2 rounded-lg border border-ink-100 p-2 text-sm hover:bg-ink-50"><input type="radio" name={`t${i}`} checked={answers[i] === String(j)} disabled={submitted} onChange={() => setAnswers({ ...answers, [i]: String(j) })} />{o}</label>)}</div>)}
                {(t.type === "trace" || t.type === "short") && <input className="input mt-2" aria-label={`Answer to question ${i + 1}`} value={answers[i] ?? ""} disabled={submitted} onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })} placeholder="Your answer" />}
                {t.type === "code" && (<div className="mt-2 flex flex-wrap items-center gap-3"><Link className="btn btn-sm btn-primary" href={`/coding-lab/${t.exerciseId}`}>Open {EXERCISE_BY_ID[t.exerciseId].title}</Link>{state.exercises[t.exerciseId]?.passed ? <Badge tone="green">Exercise passed</Badge> : <Badge tone="amber">Exercise not yet passed</Badge>}</div>)}
                {submitted && <p className={`mt-3 rounded-lg p-2 text-sm ${ok ? "bg-emerald-50" : "bg-red-50"}`}><strong>{ok ? `Correct (+${t.marks}).` : "Not yet."}</strong> {t.explain}{!ok && t.type !== "code" && <> Expected: <code>{t.type === "mc" ? t.options[t.answer] : t.accept[0]}</code>.</>}</p>}
              </section>
            );
          })}
          <div className="flex items-center gap-3">{!submitted ? <button className="btn btn-primary" onClick={submit}>Submit classwork</button> : <button className="btn" onClick={() => { setSubmitted(false); setAnswers({}); }}>Try again</button>}{submitted && <span className="font-semibold">Score: {state.classwork[cw.id]?.score}/{max}</span>}</div>
        </div>
        <aside className="space-y-4">
          <section className="card"><h2 className="h3">Marking criteria</h2><p className="mt-2 text-sm">Multiple-choice, tracing and short answers are marked automatically. Programming tasks earn their marks when the linked exercise passes every test in the Coding Laboratory.</p></section>
          <section className="card"><h2 className="h3">Attempt history</h2>{prev ? <p className="mt-2 text-sm">{prev.attempts} attempt(s). Latest: {prev.score}/{prev.max} on {new Date(prev.at).toLocaleDateString()}.</p> : <p className="mt-2 text-sm text-ink-500">No attempts yet.</p>}</section>
          <section className="card"><h2 className="h3">Relevant material</h2><ul className="mt-2 list-disc pl-5 text-sm">{lesson && <li><Link className="underline" href={`/lessons/${lesson.id}`}>{lesson.title}</Link></li>}<li><Link className="underline" href="/coding-lab">Coding Laboratory</Link></li></ul></section>
        </aside>
      </div>
    </div>
  );
}
