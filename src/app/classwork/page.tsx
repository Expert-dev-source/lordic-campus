"use client";
import Link from "next/link";
import { CLASSWORK, classworkMarks } from "@/data/classwork";
import { PageHeader, Badge } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function ClassworkCentre() {
  const { state } = useStore();
  return (
    <div>
      <PageHeader title="Classwork Centre" subtitle="Short practice sets after each topic: concept questions, code tracing, debugging and programming tasks." />
      <div className="card overflow-x-auto !p-0">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500"><tr><th className="p-3">Title</th><th>Category</th><th>Difficulty</th><th>Time</th><th>Marks</th><th>Status</th></tr></thead>
          <tbody>
            {CLASSWORK.map((c) => {
              const st = state.classwork[c.id];
              const max = classworkMarks(c);
              return (
                <tr key={c.id} className="border-t border-ink-100">
                  <td className="p-3"><Link className="font-medium underline-offset-2 hover:underline" href={`/classwork/${c.id}`}>{c.title}</Link><div className="text-xs text-ink-500">Computer Programming I</div></td>
                  <td>{c.category}</td><td>{c.difficulty}</td><td>{c.minutes} min</td><td>{st ? `${st.score}/${max}` : `${max} available`}</td>
                  <td>{st ? <Badge tone={st.score / st.max >= 0.5 ? "green" : "amber"}>Submitted · {st.attempts} attempt{st.attempts > 1 ? "s" : ""}</Badge> : <Badge>Not submitted</Badge>}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
