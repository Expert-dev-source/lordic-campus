"use client";
import { EXERCISES } from "@/data/exercises";
import { CLASSWORK, classworkMarks } from "@/data/classwork";
import { ASSIGNMENTS } from "@/data/assignments";
import { EXAMS } from "@/data/exams-meta";
import { PageHeader } from "@/components/ui";

export default function AdminAssessments() {
  return (
    <div className="space-y-6">
      <PageHeader title="Assessments" subtitle="Exam answer keys live in src/server/exam-bank.ts and are only imported by server code. Generated practice questions are labelled as practice and never presented as official past questions." />
      <section className="card"><h2 className="h2 mb-2">Examinations</h2><table className="w-full text-sm"><tbody>{EXAMS.map((e) => <tr key={e.id} className="border-t border-ink-100"><td className="py-2">{e.title}</td><td>{e.questionIds.length} questions</td><td>{e.durationMin} min</td><td>pass {e.passPercent}%</td><td>{e.retake}</td><td>{e.generated ? "Generated practice" : "Verified"}</td></tr>)}</tbody></table></section>
      <section className="card"><h2 className="h2 mb-2">Classwork</h2><table className="w-full text-sm"><tbody>{CLASSWORK.map((c) => <tr key={c.id} className="border-t border-ink-100"><td className="py-2">{c.title}</td><td>{c.tasks.length} tasks</td><td>{classworkMarks(c)} marks</td></tr>)}</tbody></table></section>
      <section className="card"><h2 className="h2 mb-2">Assignments and rubrics</h2><table className="w-full text-sm"><tbody>{ASSIGNMENTS.map((a) => <tr key={a.id} className="border-t border-ink-100"><td className="py-2">{a.title}</td><td>{a.rubric.length} criteria</td><td>{a.rubric.reduce((s, r) => s + r.marks, 0)} marks</td><td>{a.tests ? `${a.tests.length} auto tests` : "self-assessed"}</td></tr>)}</tbody></table></section>
      <section className="card"><h2 className="h2 mb-2">Coding exercises</h2><table className="w-full text-sm"><tbody>{EXERCISES.map((e) => <tr key={e.id} className="border-t border-ink-100"><td className="py-2">{e.title}</td><td>{e.tests.length} tests ({e.tests.filter((t) => t.hidden).length} hidden)</td><td>{e.difficulty}</td></tr>)}</tbody></table></section>
    </div>
  );
}
