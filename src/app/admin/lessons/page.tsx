"use client";
import Link from "next/link";
import { LESSONS } from "@/data/lessons";
import { PageHeader } from "@/components/ui";

export default function AdminLessons() {
  return (
    <div>
      <PageHeader title="Lessons" subtitle="Each lesson contains explanation blocks, worked examples, a demonstration, guided and independent practice, a knowledge check, a summary and key terms. Edit src/data/lessons-a.ts and lessons-b.ts; the automated tests execute every code sample." />
      <div className="card overflow-x-auto !p-0"><table className="w-full min-w-[720px] text-sm"><thead className="bg-ink-50 text-left text-xs uppercase text-ink-500"><tr><th className="p-3">Lesson</th><th>Module</th><th>Blocks</th><th>Worked</th><th>Check Qs</th><th>Exercise</th><th>Minutes</th></tr></thead>
        <tbody>{LESSONS.map((l) => <tr key={l.id} className="border-t border-ink-100"><td className="p-3"><Link className="underline" href={`/lessons/${l.id}`}>{l.title}</Link></td><td>{l.moduleNo}</td><td>{l.blocks.length}</td><td>{l.worked.length}</td><td>{l.check.length}</td><td>{l.independent.exerciseId ?? "–"}</td><td>{l.minutes}</td></tr>)}</tbody></table></div>
    </div>
  );
}
