"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { COURSE_BY_ID } from "@/data/courses";
import { LESSONS } from "@/data/lessons";
import { EXERCISES } from "@/data/exercises";
import { CLASSWORK, classworkMarks } from "@/data/classwork";
import { ASSIGNMENTS } from "@/data/assignments";
import { EXAMS } from "@/data/exams-meta";
import { PageHeader, Badge, ProgressBar, Empty } from "@/components/ui";
import { VerificationBadge } from "@/components/VerificationBadge";
import { useStore } from "@/lib/store";
import { courseProgress, lessonMastery, MASTERY_LABEL } from "@/lib/mastery";
import { PROG1_MODULES } from "@/data/lessons";

export default function CoursePage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useStore();
  const course = COURSE_BY_ID[id];
  if (!course) return <Empty title="Course not found" href="/curriculum" cta="Back to curriculum" />;
  const p = courseProgress(state, course.id);
  const lessons = LESSONS.filter((l) => l.courseId === course.id);
  const outcomes = course.modules.slice(0, 6).map((m) => `Explain and apply: ${m.toLowerCase()}`);

  return (
    <div>
      <p className="mb-2 text-sm"><Link className="underline" href="/curriculum">Curriculum</Link> / Level {course.level}</p>
      <PageHeader title={course.title} subtitle={course.purpose} />
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-tight"><p className="label">Official course code</p><p className="text-sm">{course.code ?? "Not verified: confirm with your university"}</p></div>
        <div className="card-tight"><p className="label">Academic level</p><p className="text-sm">{course.level}</p></div>
        <div className="card-tight"><p className="label">Semester</p><p className="text-sm">{course.semester ?? "To be confirmed"}</p></div>
        <div className="card-tight"><p className="label">Verification</p><VerificationBadge v={course.status} /></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="card"><h2 className="h3">Description</h2><p className="mt-2">{course.purpose}</p>
            <h3 className="h3 mt-5">Learning outcomes</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{(course.hasContent ? ["Write, run, test and debug Python programs", "Use variables, operators, conditions, loops and functions", "Work with strings, lists and dictionaries", "Read and write files and handle errors", "Implement and compare basic search and sort algorithms", "Model data and behaviour with classes", "Plan, test and document a small software project"] : outcomes).map((o) => <li key={o}>{o}</li>)}</ul>
            <h3 className="h3 mt-5">Prerequisites</h3><p className="mt-1 text-sm">{course.prerequisites.length ? course.prerequisites.join("; ") : "To be confirmed."}</p>
            <h3 className="h3 mt-5">Practical requirements</h3><p className="mt-1 text-sm">{course.practical}</p>
            <h3 className="h3 mt-5">Assessment structure</h3><p className="mt-1 text-sm">{course.assessment}</p>
          </section>

          <section className="card"><h2 className="h3">Modules and lessons</h2>
            <ol className="mt-3 space-y-3">
              {course.modules.map((m, i) => {
                const mls = lessons.filter((l) => l.moduleNo === i + 1);
                return (
                  <li key={m} className="rounded-xl border border-ink-100 p-3">
                    <p className="font-semibold">Module {i + 1}: {course.hasContent ? PROG1_MODULES[i] ?? m : m}</p>
                    {mls.length ? (
                      <ul className="mt-2 space-y-1">{mls.map((l) => (<li key={l.id} className="flex flex-wrap items-center justify-between gap-2 text-sm"><Link className="underline" href={`/lessons/${l.id}`}>{l.title}</Link><span className="flex items-center gap-2">{state.done[l.id] && <Badge tone="green">Completed</Badge>}<Badge>{MASTERY_LABEL[lessonMastery(state, l.id)]}</Badge></span></li>))}</ul>
                    ) : (<p className="mt-1 text-sm text-ink-500">{course.hasContent ? "" : "Lessons for this module will be added when the course content is developed."}</p>)}
                  </li>
                );
              })}
            </ol>
          </section>
        </div>

        <aside className="space-y-6">
          {course.hasContent && (
            <>
              <section className="card"><h2 className="h3">Progress</h2><p className="mt-2 font-serif text-3xl font-semibold">{p.percent}%</p><ProgressBar value={p.percent} /><p className="muted mt-1">{p.done} of {p.total} lessons completed</p></section>
              <section className="card"><h2 className="h3">What is in this course</h2>
                <ul className="mt-2 space-y-1.5 text-sm">
                  <li><Link className="underline" href="/lessons">{lessons.length} lessons</Link></li>
                  <li><Link className="underline" href="/coding-lab">{EXERCISES.length} coding exercises</Link></li>
                  <li><Link className="underline" href="/classwork">{CLASSWORK.length} classwork sets ({CLASSWORK.reduce((a, c) => a + classworkMarks(c), 0)} marks)</Link></li>
                  <li><Link className="underline" href="/assignments">{ASSIGNMENTS.filter((a) => a.courseId === "prog1").length} assignments</Link></li>
                  <li><Link className="underline" href="/exams">{EXAMS.length} examinations</Link></li>
                  <li><Link className="underline" href="/projects">Guided projects</Link></li>
                </ul>
              </section>
              <section className="card"><h2 className="h3">Completion criteria</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-sm"><li>Complete every lesson</li><li>Pass every coding exercise</li><li>Submit all assignments</li><li>Score at least 50% on the Full Mock Examination</li></ul></section>
            </>
          )}
          {!course.hasContent && <section className="card border-dashed"><h2 className="h3">Status</h2><p className="mt-2 text-sm">This course is outlined but its lessons, classwork and assessments have not been written yet. Outline pages are shown so the whole programme is visible; a course is only counted as complete when it has real teaching content.</p></section>}
        </aside>
      </div>
    </div>
  );
}
