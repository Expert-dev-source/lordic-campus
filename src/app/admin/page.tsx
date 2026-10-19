"use client";
import Link from "next/link";
import { COURSES } from "@/data/courses";
import { LESSONS } from "@/data/lessons";
import { EXERCISES } from "@/data/exercises";
import { CLASSWORK } from "@/data/classwork";
import { ASSIGNMENTS } from "@/data/assignments";
import { EXAMS } from "@/data/exams-meta";
import { PROJECTS } from "@/data/projects";
import { PageHeader, Stat } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function Admin() {
  const { state } = useStore();
  const full = COURSES.filter((c) => c.hasContent).length;
  const byStatus = (s: string) => COURSES.filter((c) => c.status === s).length;
  return (
    <div>
      <PageHeader title="Content Administration" subtitle="Separate from the student experience. In this release content lives in the source data files (src/data); this dashboard is a read-only inventory." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total courses" value={COURSES.length} sub={`${full} with full content`} /><Stat label="Lessons" value={LESSONS.length} sub="0 drafts" /><Stat label="Coding exercises" value={EXERCISES.length} /><Stat label="Classwork sets" value={CLASSWORK.length} />
        <Stat label="Assignments" value={ASSIGNMENTS.length} /><Stat label="Examinations" value={EXAMS.length} /><Stat label="Projects" value={PROJECTS.length} /><Stat label="Reported errors" value={state.reports.length} sub="stored in this browser" />
      </div>
      <section className="card mt-6"><h2 className="h2 mb-2">Curriculum verification status</h2>
        <ul className="grid gap-2 text-sm sm:grid-cols-2"><li>Verified against a university: <strong>0</strong> (none yet)</li><li>Listed in an official reference: <strong>{byStatus("reference")}</strong></li><li>Provisional placement: <strong>{byStatus("provisional")}</strong></li><li>Supplementary: <strong>{byStatus("supplementary")}</strong></li><li>University confirmation required: <strong>{byStatus("confirm")}</strong></li><li>Courses with full teaching content: <strong>{full}</strong></li></ul></section>
      <section className="card mt-6"><h2 className="h2 mb-2">Assessment coverage (Computer Programming I)</h2><p className="text-sm">{LESSONS.filter((l) => l.independent.exerciseId).length} of {LESSONS.length} lessons have a linked coding exercise · every lesson has a knowledge check · {EXAMS.length} examinations drawing on a 39-question bank with explanations.</p></section>
      <div className="mt-6 flex flex-wrap gap-2"><Link className="btn" href="/admin/curriculum">Curriculum editor</Link><Link className="btn" href="/admin/lessons">Lesson inventory</Link><Link className="btn" href="/admin/assessments">Assessment inventory</Link></div>
      <section className="card mt-6"><h2 className="h2 mb-2">Reported content problems</h2>{state.reports.length ? <ul className="space-y-2 text-sm">{state.reports.map((r) => <li key={r.id} className="rounded-lg bg-ink-50 p-2"><strong>{r.where || "General"}</strong>: {r.text}<span className="ml-2 text-xs text-ink-400">{new Date(r.at).toLocaleDateString()}</span></li>)}</ul> : <p className="muted">No reports.</p>}</section>
    </div>
  );
}
