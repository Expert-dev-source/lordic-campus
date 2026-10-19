"use client";
import Link from "next/link";
import { PageHeader, Empty } from "@/components/ui";
import { useStore } from "@/lib/store";
import { gradebook, WEIGHTS } from "@/lib/gradebook";
import { GRADE_POLICY, round1, letterGrade } from "@/lib/grading";
import { ASSIGNMENTS } from "@/data/assignments";
import { CLASSWORK, classworkMarks } from "@/data/classwork";
import { EXAM_BY_ID } from "@/data/exams-meta";

export default function Grades() {
  const { state } = useStore();
  const g = gradebook(state);
  return (
    <div>
      <PageHeader title="Grades" subtitle="Every calculation is shown. Nothing is hidden." actions={<Link href="/progress" className="btn">Progress</Link>} />
      <section className="card mb-6"><h2 className="h3">Computer Programming I: overall</h2>
        {g.overall === null ? <Empty title="No graded work yet" href="/lessons/prog1-1-1" cta="Start learning">Complete a lesson quiz, classwork or an examination to see your grade.</Empty> : <p className="mt-2 font-serif text-5xl font-semibold">{g.overall}% <span className="text-gold-600">({g.letter})</span></p>}
        <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[560px] text-sm"><thead className="text-left text-xs uppercase text-ink-500"><tr><th className="py-2">Category</th><th>Weight</th><th>Your result</th><th>Weighted contribution</th><th>How it is calculated</th></tr></thead>
          <tbody>{g.cats.map((c) => <tr key={c.key} className="border-t border-ink-100 align-top"><td className="py-2 font-medium">{c.label}</td><td>{c.weight}%</td><td>{c.percent === null ? "no data" : `${round1(c.percent)}%`}</td><td>{c.percent === null ? "excluded" : `${round1((c.percent * c.weight) / g.weightUsed)} of ${round1((100 * c.weight) / g.weightUsed)}`}</td><td className="text-xs text-ink-600">{c.detail}</td></tr>)}</tbody></table></div>
        <p className="muted mt-3">Overall = Σ(category % × weight) ÷ Σ(weights of categories that have results). Standard weights: quizzes {WEIGHTS.quizzes}, classwork {WEIGHTS.classwork}, assignments {WEIGHTS.assignments}, examinations {WEIGHTS.exams}. Categories with no results yet are left out rather than counted as zero{g.weightUsed ? ` (currently using ${g.weightUsed} of 100 weight points)` : ""}. Illustrative weighting: confirm the weighting your university uses.</p>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card"><h2 className="h3">Assignment results</h2><ul className="mt-2 space-y-2 text-sm">{ASSIGNMENTS.map((a) => { const s = state.assignments[a.id]?.submissions ?? []; const l = s[s.length - 1]; return <li key={a.id} className="flex justify-between gap-2"><Link className="underline" href={`/assignments/${a.id}`}>{a.title}</Link><span>{l ? `${l.total}% (${letterGrade(l.total)})` : "not submitted"}</span></li>; })}</ul></section>
        <section className="card"><h2 className="h3">Classwork results</h2><ul className="mt-2 space-y-2 text-sm">{CLASSWORK.map((c) => { const s = state.classwork[c.id]; return <li key={c.id} className="flex justify-between gap-2"><Link className="underline" href={`/classwork/${c.id}`}>{c.title}</Link><span>{s ? `${s.score}/${classworkMarks(c)}` : "–"}</span></li>; })}</ul></section>
        <section className="card"><h2 className="h3">Examination results</h2>{state.exams.length ? <ul className="mt-2 space-y-2 text-sm">{state.exams.map((a) => <li key={a.id} className="flex justify-between gap-2"><Link className="underline" href={`/exams/${a.examId}/results/${a.id}`}>{EXAM_BY_ID[a.examId]?.title} · {new Date(a.at).toLocaleDateString()}</Link><span>{a.percent}% ({letterGrade(a.percent)})</span></li>)}</ul> : <p className="muted mt-2">No examinations taken yet.</p>}</section>
        <section className="card"><h2 className="h3">Grading policy</h2><table className="mt-2 w-full text-sm"><tbody>{GRADE_POLICY.map((r) => <tr key={r.letter} className="border-t border-ink-100"><td className="py-1 font-semibold">{r.letter}</td><td>{r.min} to {r.max}</td></tr>)}</tbody></table><p className="muted mt-2">Documented platform policy. Your university&apos;s scale may differ.</p></section>
      </div>
    </div>
  );
}
