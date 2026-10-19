"use client";
import Link from "next/link";
import { useState } from "react";
import { COURSES, LEVELS, REFERENCE_SOURCES } from "@/data/courses";
import { VerificationBadge } from "@/components/VerificationBadge";
import { PageHeader, Badge, ProgressBar } from "@/components/ui";
import { useStore } from "@/lib/store";
import { courseProgress } from "@/lib/mastery";

export default function CurriculumPage() {
  const { state } = useStore();
  const [openLevel, setOpenLevel] = useState<number>(200);
  return (
    <div>
      <PageHeader title="My Curriculum" subtitle="The complete Software Engineering programme, organised by academic level. Programme → Level → Semester → Course → Module → Lesson → Classwork → Assessment." />
      <div className="card mb-6 border-amber-200 bg-amber-50" role="note">
        <p className="text-sm"><strong>Important:</strong> this course map is a proposed learning framework, not a verified transcript of your degree. Course codes, credit units, semester placements and compulsory/elective status must be confirmed against your own university before you rely on them. Lordic Campus is a learning platform, not an accredited university.</p>
        <p className="mt-2 text-sm">Reference sources: {REFERENCE_SOURCES.map((s, i) => (<span key={s.url}>{i > 0 && " · "}<a className="underline" href={s.url} target="_blank" rel="noopener noreferrer">{s.title}</a></span>))}</p>
      </div>
      <div className="space-y-3">
        {LEVELS.map((lv) => {
          const courses = COURSES.filter((c) => c.level === lv.level);
          const open = openLevel === lv.level;
          return (
            <section key={lv.level} className="card !p-0 overflow-hidden">
              <button className="flex w-full items-center justify-between gap-3 p-5 text-left" aria-expanded={open} onClick={() => setOpenLevel(open ? 0 : lv.level)}>
                <span><span className="font-serif text-xl font-semibold">Level {lv.level}</span> <span className="text-ink-500">· {lv.name}</span></span>
                <span className="flex items-center gap-3 text-sm text-ink-500">{courses.length} courses <span aria-hidden>{open ? "▾" : "▸"}</span></span>
              </button>
              {open && (
                <div className="border-t border-ink-100 p-5">
                  <p className="muted mb-3">Semester placement: <strong>to be confirmed with your institution</strong>. Courses are listed by level only.</p>
                  <ul className="grid gap-3 md:grid-cols-2">
                    {courses.map((c) => {
                      const p = courseProgress(state, c.id);
                      return (
                        <li key={c.id}>
                          <Link href={`/courses/${c.id}`} className="card-tight block h-full transition hover:border-gold-400 hover:shadow">
                            <div className="flex items-start justify-between gap-2"><p className="font-semibold">{c.number}. {c.title}</p>{c.hasContent && <Badge tone="gold">Full course</Badge>}</div>
                            <p className="mt-1 text-sm text-ink-600">{c.purpose}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2"><VerificationBadge v={c.status} /><span className="text-xs text-ink-400">{c.modules.length} modules</span></div>
                            {c.hasContent && <div className="mt-3"><ProgressBar value={p.percent} label={`${c.title} progress`} /><p className="mt-1 text-xs text-ink-500">{p.done}/{p.total} lessons</p></div>}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
