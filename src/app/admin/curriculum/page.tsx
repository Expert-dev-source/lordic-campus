"use client";
import { COURSES } from "@/data/courses";
import { PageHeader } from "@/components/ui";
import { VerificationBadge } from "@/components/VerificationBadge";

export default function AdminCurriculum() {
  return (
    <div>
      <PageHeader title="Curriculum" subtitle="Programme, level, course, verification status and source. Course codes, credit units and semesters stay blank until verified against the institution's official structure. To change content, edit src/data/courses.ts." />
      <div className="card overflow-x-auto !p-0"><table className="w-full min-w-[800px] text-sm"><thead className="bg-ink-50 text-left text-xs uppercase text-ink-500"><tr><th className="p-3">#</th><th>Level</th><th>Course</th><th>Code</th><th>Credits</th><th>Semester</th><th>Modules</th><th>Status</th><th>Content</th></tr></thead>
        <tbody>{COURSES.map((c) => <tr key={c.id} className="border-t border-ink-100 align-top"><td className="p-3">{c.number}</td><td>{c.level}</td><td className="font-medium">{c.title}</td><td>{c.code ?? "–"}</td><td>–</td><td>{c.semester ?? "–"}</td><td>{c.modules.length}</td><td><VerificationBadge v={c.status} /></td><td>{c.hasContent ? "Full" : "Outline"}</td></tr>)}</tbody></table></div>
    </div>
  );
}
