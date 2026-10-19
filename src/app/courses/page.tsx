"use client";
import Link from "next/link";
import { COURSES } from "@/data/courses";
import { PageHeader, ProgressBar, Badge, Empty } from "@/components/ui";
import { useStore } from "@/lib/store";
import { courseProgress } from "@/lib/mastery";
import { lessonsForCourse } from "@/data/lessons";

export default function MyCourses() {
  const { state } = useStore();
  const mine = COURSES.filter((c) => c.hasContent || state.enrolled[c.id]);
  return (
    <div>
      <PageHeader title="My Courses" subtitle="Courses with complete teaching content in this release. Every other course in the curriculum is listed with its modules and is added progressively." />
      {!mine.length && <Empty title="No courses yet" href="/curriculum" cta="Browse the curriculum" />}
      <div className="grid gap-4 md:grid-cols-2">
        {mine.map((c) => {
          const p = courseProgress(state, c.id);
          return (
            <Link key={c.id} href={`/courses/${c.id}`} className="card block transition hover:border-gold-400">
              <div className="flex items-center gap-2"><Badge tone="gold">Level {c.level}</Badge>{c.hasContent ? <Badge tone="green">Full course</Badge> : <Badge>Outline only</Badge>}</div>
              <h2 className="h2 mt-2">{c.title}</h2>
              <p className="muted mt-1">{c.purpose}</p>
              {c.hasContent && <div className="mt-4"><ProgressBar value={p.percent} /><p className="mt-1 text-xs text-ink-500">{p.done} of {lessonsForCourse(c.id).length} lessons complete</p></div>}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
