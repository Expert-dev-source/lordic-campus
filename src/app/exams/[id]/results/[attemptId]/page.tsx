"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { EXAM_BY_ID } from "@/data/exams-meta";
import { LESSON_BY_ID } from "@/data/lessons";
import { Badge, Empty, Loading, PageHeader, ProgressBar } from "@/components/ui";
import { useStore } from "@/lib/store";
import { letterGrade } from "@/lib/grading";

export default function ResultsPage() {
  const { id, attemptId } = useParams<{ id: string; attemptId: string }>();
  const { state, ready } = useStore();
  const exam = EXAM_BY_ID[id];
  if (!ready) return <Loading />;
  const a = state.exams.find((x) => x.id === attemptId);
  if (!exam || !a) return <Empty title="Result not found" href="/exams" cta="Back to examinations" />;
  const topics = Object.entries(a.byTopic).map(([t, v]) => ({ t, p: v.max ? (v.score / v.max) * 100 : 0, ...v })).sort((x, y) => y.p - x.p);
  const strongest = topics[0], weakest = topics[topics.length - 1];
  const weakTopics = topics.filter((t) => t.p < 60);
  const weakLessons = [...new Set(a.results.filter((r) => !r.correct).map((r) => r.lessonId))].slice(0, 5);

  return (
    <div>
      <p className="mb-2 text-sm"><Link className="underline" href="/exams">Examinations</Link> / {exam.title} / Results</p>
      <PageHeader title={exam.title} subtitle={`Attempt on ${new Date(a.at).toLocaleString()}`} />
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card lg:col-span-1"><h2 className="h3">Total score</h2><p className="mt-2 font-serif text-5xl font-semibold">{a.percent}%</p><p className="muted">{a.score} of {a.max} marks · grade {letterGrade(a.percent)}</p><div className="mt-3"><Badge tone={a.passed ? "green" : "amber"}>{a.passed ? `Passed (pass mark ${exam.passPercent}%)` : `Below the ${exam.passPercent}% pass mark`}</Badge></div>
          <dl className="mt-4 grid grid-cols-2 gap-y-1 text-sm"><dt className="text-ink-500">Correct</dt><dd>{a.results.filter((r) => r.correct).length}</dd><dt className="text-ink-500">Incorrect</dt><dd>{a.results.filter((r) => !r.correct).length}</dd><dt className="text-ink-500">Time spent</dt><dd>{Math.floor(a.durationSec / 60)}m {a.durationSec % 60}s</dd><dt className="text-ink-500">Retake</dt><dd>{exam.retake}</dd></dl>
          <Link href={`/exams/${id}/attempt`} className="btn btn-primary mt-4">Retake examination</Link>
        </section>
        <section className="card lg:col-span-2"><h2 className="h3">Performance by topic</h2>
          <ul className="mt-3 space-y-3">{topics.map((t) => <li key={t.t}><div className="mb-1 flex justify-between text-sm"><span>{t.t}</span><span>{t.score}/{t.max} ({Math.round(t.p)}%)</span></div><ProgressBar value={t.p} label={t.t} /></li>)}</ul>
          <div className="mt-4 rounded-xl bg-gold-50 p-3 text-sm"><strong>Recommended revision.</strong> {weakTopics.length ? <>You scored {a.percent}%. Your strongest area was <strong>{strongest.t}</strong>. Review <strong>{weakTopics.map((t) => t.t).join(", ")}</strong> and complete the linked exercises before the next attempt.</> : <>You scored {a.percent}%. Your strongest area was <strong>{strongest.t}</strong>{weakest.t !== strongest.t ? <>; the one to polish next is <strong>{weakest.t}</strong></> : null}. Keep practising with cumulative quizzes.</>}
            {weakLessons.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{weakLessons.map((l) => <Link key={l} className="btn btn-sm" href={`/lessons/${l}`}>{LESSON_BY_ID[l]?.title}</Link>)}</div>}</div>
        </section>
      </div>
      <section className="mt-6"><h2 className="h2 mb-3">Question review</h2>
        <ol className="space-y-3">{a.results.map((r, i) => (
          <li key={r.id} className={`card ${r.correct ? "border-emerald-200" : "border-red-200"}`}>
            <div className="flex justify-between text-xs text-ink-500"><span>Question {i + 1} · {r.topic}</span><span>{r.marksAwarded}/{r.marks}</span></div>
            <p className="mt-1 font-medium">{r.prompt}</p>{r.code && <pre className="code">{r.code}</pre>}
            <p className="mt-2 text-sm"><strong>Your answer:</strong> {r.submitted}</p>
            {!r.correct && <p className="text-sm"><strong>Correct answer:</strong> {r.correctAnswer}</p>}
            <p className="mt-2 rounded-lg bg-ink-50 p-2 text-sm"><strong>Explanation:</strong> {r.explanation}</p>
            {!r.correct && <p className="mt-1 text-xs"><Link className="underline" href={`/lessons/${r.lessonId}`}>Review: {LESSON_BY_ID[r.lessonId]?.title}</Link></p>}
          </li>))}</ol>
      </section>
    </div>
  );
}
