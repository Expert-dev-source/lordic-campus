"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LESSON_BY_ID, nextLesson, PROG1_MODULES } from "@/data/lessons";
import { EXERCISE_BY_ID } from "@/data/exercises";
import { COURSE_BY_ID } from "@/data/courses";
import { Badge, CodeBlock, Empty, Loading, PageHeader } from "@/components/ui";
import CodeRunner from "@/components/CodeRunner";
import { actions, uid, useStore } from "@/lib/store";
import { lessonMastery, MASTERY_LABEL } from "@/lib/mastery";
import type { Block } from "@/lib/types";

function renderBlock(b: Block, i: number) {
  switch (b.t) {
    case "p": return <p key={i}>{b.text}</p>;
    case "h": return <h3 key={i}>{b.text}</h3>;
    case "code": return <CodeBlock key={i} code={b.code} out={b.out} />;
    case "list": return <ul key={i}>{b.items.map((x, j) => <li key={j}>{x}</li>)}</ul>;
    case "callout": {
      const m = { misconception: ["⚠️ Common misconception", "border-amber-200 bg-amber-50"], tip: ["💡 Tip", "border-sky-200 bg-sky-50"], why: ["🎯 Why it matters", "border-gold-200 bg-gold-50"] }[b.kind];
      return <div key={i} className={`my-4 rounded-xl border p-3 text-sm ${m[1]}`}><strong>{m[0]}.</strong> {b.text}</div>;
    }
  }
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (<section className="card" aria-labelledby={`s${n}`}><h2 id={`s${n}`} className="h2 mb-3"><span className="mr-2 text-gold-500">{n}.</span>{title}</h2>{children}</section>);
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const { state, ready, update } = useStore();
  const lesson = LESSON_BY_ID[id];
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const [hintN, setHintN] = useState(0);
  const [showGuided, setShowGuided] = useState(false);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  const noteId = `lesson-note-${id}`;
  useEffect(() => { if (ready && lesson) update(actions.openLesson(id)); }, [ready, id, lesson, update]);
  useEffect(() => { if (ready) setNote(state.notes.find((n) => n.id === noteId)?.body ?? ""); }, [ready, noteId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setAnswers({}); setChecked(false); setHintN(0); setShowGuided(false); }, [id]);

  const next = useMemo(() => (lesson ? nextLesson(lesson.id) : undefined), [lesson]);
  if (!lesson) return <Empty title="Lesson not found" href="/lessons" cta="All lessons" />;
  if (!ready) return <Loading />;
  const course = COURSE_BY_ID[lesson.courseId];
  const ex = lesson.independent.exerciseId ? EXERCISE_BY_ID[lesson.independent.exerciseId] : undefined;
  const exState = ex ? state.exercises[ex.id] : undefined;
  const done = !!state.done[lesson.id];
  const bookmarked = state.bookmarks.some((b) => b.id === `bm-${lesson.id}`);

  const submitCheck = () => {
    let correct = 0;
    lesson.check.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
      else update(actions.addMistake({ kind: "check", question: q.q, submitted: answers[i] !== undefined ? q.options[answers[i]] : "(no answer)", correct: q.options[q.answer], explanation: q.explain, lessonId: lesson.id }));
    });
    update(actions.recordCheck(lesson.id, correct, lesson.check.length));
    setChecked(true);
  };
  const result = state.checks[lesson.id];
  const mastery = lessonMastery(state, lesson.id);

  return (
    <div className="space-y-6">
      <p className="text-sm"><Link className="underline" href="/lessons">Lessons</Link> / {course.title} / Module {lesson.moduleNo}</p>
      <PageHeader title={lesson.title} subtitle={`Module ${lesson.moduleNo}: ${PROG1_MODULES[lesson.moduleNo - 1]}`}
        actions={<button className="btn btn-sm" onClick={() => update(actions.toggleBookmark({ id: `bm-${lesson.id}`, kind: "lesson", ref: lesson.id, label: lesson.title }))}>{bookmarked ? "★ Bookmarked" : "☆ Bookmark"}</button>} />

      <Section n={1} title="Lesson overview">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><p className="label">Course</p><p className="text-sm">{course.title}</p><p className="label mt-3">Estimated duration</p><p className="text-sm">{lesson.minutes} minutes</p><p className="label mt-3">Difficulty</p><p className="text-sm">{lesson.difficulty}</p><p className="label mt-3">Prerequisites</p><p className="text-sm">{lesson.prerequisites.join(", ")}</p></div>
          <div><p className="label">Learning objectives</p><ul className="list-disc space-y-1 pl-5 text-sm">{lesson.objectives.map((o) => <li key={o}>{o}</li>)}</ul><div className="mt-3 flex flex-wrap gap-2"><Badge>{MASTERY_LABEL[mastery]}</Badge>{done && <Badge tone="green">Completed</Badge>}</div></div>
        </div>
      </Section>

      <Section n={2} title="Explanation"><div className="prose-lc">{lesson.blocks.map(renderBlock)}</div></Section>

      <Section n={3} title="Worked examples">
        {lesson.worked.map((w, i) => (
          <div key={i} className="space-y-3">
            <div><p className="label">The problem</p><pre className="whitespace-pre-wrap rounded-xl bg-ink-50 p-3 font-mono text-[13px]">{w.problem}</pre></div>
            <div><p className="label">The approach</p><p className="text-sm">{w.approach}</p></div>
            <div><p className="label">Step-by-step reasoning</p><ol className="list-decimal space-y-1 pl-5 text-sm">{w.steps.map((s, j) => <li key={j}>{s}</li>)}</ol></div>
            <div><p className="label">Complete solution</p><CodeBlock code={w.solution} out={w.output} /></div>
            <div><p className="label">Common mistakes</p><ul className="list-disc space-y-1 pl-5 text-sm">{w.mistakes.map((s) => <li key={s}>{s}</li>)}</ul></div>
          </div>
        ))}
      </Section>

      <Section n={4} title="Interactive demonstration">
        <p className="mb-1 font-semibold">{lesson.demo.title}</p><p className="muted mb-3">{lesson.demo.instruction}</p>
        <CodeRunner key={lesson.id} initial={lesson.demo.code} stdin={lesson.demo.stdin} rows={Math.min(16, lesson.demo.code.split("\n").length + 2)} />
      </Section>

      <Section n={5} title="Guided practice">
        <pre className="whitespace-pre-wrap rounded-xl bg-ink-50 p-3 font-mono text-[13px]">{lesson.guided.q}</pre>
        <div className="mt-3 space-y-2">
          {lesson.guided.hints.slice(0, hintN).map((h, i) => <p key={i} className="rounded-lg bg-gold-50 p-2 text-sm">💡 Hint {i + 1}: {h}</p>)}
          <div className="flex flex-wrap gap-2">
            {hintN < lesson.guided.hints.length && <button className="btn btn-sm" onClick={() => setHintN(hintN + 1)}>Show hint {hintN + 1}</button>}
            <button className="btn btn-sm" onClick={() => setShowGuided(true)} disabled={showGuided}>Reveal answer</button>
          </div>
          {showGuided && <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm"><strong>Answer:</strong> {lesson.guided.answer}</p>}
          <p className="muted">Try it yourself first: the answer is most useful after an honest attempt.</p>
        </div>
      </Section>

      <Section n={6} title="Independent practice">
        <p className="mb-3 text-sm">{lesson.independent.q}</p>
        {ex ? (
          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/coding-lab/${ex.id}`} className="btn btn-primary">Open in Coding Laboratory: {ex.title}</Link>
            {exState?.passed ? <Badge tone="green">Passed</Badge> : exState?.attempts ? <Badge tone="amber">{exState.bestPassed}/{exState.total} tests passed</Badge> : <Badge>Not attempted</Badge>}
          </div>
        ) : <p className="muted">This is a written task. Use the note box below to record your answer.</p>}
      </Section>

      <Section n={7} title="Knowledge check">
        <ol className="space-y-5">
          {lesson.check.map((q, i) => (
            <li key={i}>
              <p className="font-medium">{i + 1}. {q.q}</p>
              <div className="mt-2 grid gap-1.5" role="radiogroup" aria-label={q.q}>
                {q.options.map((o, j) => {
                  const sel = answers[i] === j;
                  const show = checked;
                  const tone = show ? (j === q.answer ? "border-emerald-400 bg-emerald-50" : sel ? "border-red-300 bg-red-50" : "border-ink-100") : sel ? "border-ink-700 bg-ink-50" : "border-ink-100 hover:bg-ink-50";
                  return (<label key={j} className={`flex cursor-pointer items-start gap-2 rounded-lg border p-2 text-sm ${tone}`}><input type="radio" name={`q${i}`} className="mt-1" checked={sel} disabled={checked} onChange={() => setAnswers({ ...answers, [i]: j })} /><span>{o}</span></label>);
                })}
              </div>
              {checked && <p className={`mt-2 rounded-lg p-2 text-sm ${answers[i] === q.answer ? "bg-emerald-50" : "bg-red-50"}`}><strong>{answers[i] === q.answer ? "Correct." : "Not quite."}</strong> {q.explain}</p>}
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {!checked ? <button className="btn btn-primary" onClick={submitCheck} disabled={Object.keys(answers).length < lesson.check.length}>Check answers</button> : <button className="btn" onClick={() => { setAnswers({}); setChecked(false); }}>Try again</button>}
          {result && <span className="text-sm text-ink-600">Latest score: {result.correct}/{result.total}</span>}
        </div>
        {checked && result && result.correct < result.total && <p className="mt-2 text-sm">Wrong answers were saved to your <Link className="underline" href="/revision">mistake notebook</Link> with explanations.</p>}
      </Section>

      <Section n={8} title="Summary">
        <ul className="list-disc space-y-1 pl-5 text-sm">{lesson.summary.map((s) => <li key={s}>{s}</li>)}</ul>
        <h3 className="label mt-4">Key terminology</h3>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">{lesson.terms.map((t) => <div key={t.term} className="rounded-lg bg-ink-50 p-2"><dt className="font-semibold">{t.term}</dt><dd>{t.def}</dd></div>)}</dl>
      </Section>

      <Section n={9} title="Personal notes">
        <label htmlFor="note" className="sr-only">Your notes for this lesson</label>
        <textarea id="note" className="input" rows={5} value={note} onChange={(e) => { setNote(e.target.value); setNoteSaved(false); }} placeholder="Write what you understood, questions to revisit, formulas…" />
        <div className="mt-2 flex items-center gap-3"><button className="btn btn-sm" onClick={() => { update(actions.saveNote({ id: noteId, title: `Notes: ${lesson.title}`, body: note, courseId: lesson.courseId, lessonId: lesson.id, at: Date.now() })); setNoteSaved(true); }}>Save note</button>{noteSaved && <span className="text-sm text-emerald-700">Saved</span>}</div>
      </Section>

      <Section n={10} title="Completion and next steps">
        {done ? <p className="text-sm">✅ You marked this lesson complete.</p> : (
          <>
            <p className="text-sm">Mark the lesson complete when you have read the explanation and attempted the practice. Mastery is judged from your quiz, exercise, classwork and exam results, not from completion alone.</p>
            <button className="btn btn-gold mt-3" onClick={() => update(actions.completeLesson(lesson.id))}>Mark lesson complete</button>
          </>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {next && <Link href={`/lessons/${next.id}`} className="btn btn-primary">Next: {next.title}</Link>}
          {ex && <Link href={`/coding-lab/${ex.id}`} className="btn">Practise in the lab</Link>}
          <Link href="/classwork" className="btn">Classwork</Link>
          <Link href="/revision" className="btn">Revision</Link>
        </div>
      </Section>
    </div>
  );
}
