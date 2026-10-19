"use client";
import Link from "next/link";
import { EXAMS } from "@/data/exams-meta";
import { PageHeader, Badge } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function ExamCentre() {
  const { state } = useStore();
  return (
    <div>
      <PageHeader title="Examination Centre" subtitle="University-style timed assessments. Answers are marked on the server and never reach your browser before you submit." />
      <div className="card mb-6 border-amber-200 bg-amber-50 text-sm" role="note">All questions are <strong>practice questions written for Lordic Campus</strong>. They are not official university past questions. No webcam or screen monitoring is used.</div>
      <div className="grid gap-4 md:grid-cols-2">
        {EXAMS.map((e) => {
          const attempts = state.exams.filter((a) => a.examId === e.id);
          const best = attempts.reduce((m, a) => Math.max(m, a.percent), 0);
          return (
            <section key={e.id} className="card">
              <div className="flex flex-wrap gap-2"><Badge tone="gold">{e.kind}</Badge>{e.generated && <Badge>Practice</Badge>}</div>
              <h2 className="h2 mt-2">{e.title}</h2>
              <p className="muted mt-1">{e.description}</p>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm"><dt className="text-ink-500">Duration</dt><dd>{e.durationMin} minutes</dd><dt className="text-ink-500">Questions</dt><dd>{e.questionIds.length}</dd><dt className="text-ink-500">Pass mark</dt><dd>{e.passPercent}%</dd><dt className="text-ink-500">Retakes</dt><dd>{e.retake}</dd><dt className="text-ink-500">Resources</dt><dd>{e.resources}</dd></dl>
              <div className="mt-4 flex flex-wrap items-center gap-3"><Link className="btn btn-primary" href={`/exams/${e.id}/attempt`}>{attempts.length ? "Retake" : "Start"} examination</Link>{attempts.length > 0 && <span className="text-sm text-ink-600">Best {best}% · {attempts.length} attempt(s) · <Link className="underline" href={`/exams/${e.id}/results/${attempts[0].id}`}>latest result</Link></span>}</div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
