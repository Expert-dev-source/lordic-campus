"use client";
import Link from "next/link";
import { ASSIGNMENTS } from "@/data/assignments";
import { COURSE_BY_ID } from "@/data/courses";
import { PageHeader, Badge } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function AssignmentCentre() {
  const { state } = useStore();
  return (
    <div>
      <PageHeader title="Assignment Centre" subtitle="Substantial pieces of work: programs, reports and design documents, marked against a rubric." />
      <div className="grid gap-4 md:grid-cols-2">
        {ASSIGNMENTS.map((a) => {
          const subs = state.assignments[a.id]?.submissions ?? [];
          const last = subs[subs.length - 1];
          return (
            <Link key={a.id} href={`/assignments/${a.id}`} className="card block transition hover:border-gold-400">
              <div className="flex flex-wrap gap-2"><Badge tone="gold">{a.type}</Badge><Badge>{COURSE_BY_ID[a.courseId]?.title.split(" (")[0]}</Badge></div>
              <h2 className="h2 mt-2">{a.title}</h2>
              <p className="muted mt-1 line-clamp-3">{a.background}</p>
              <p className="mt-3 text-sm">{last ? <Badge tone={last.total >= 50 ? "green" : "amber"}>Latest: {last.total}% · {subs.length} submission(s)</Badge> : <Badge>Not submitted</Badge>}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
