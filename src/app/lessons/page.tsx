"use client";
import Link from "next/link";
import { LESSONS, PROG1_MODULES } from "@/data/lessons";
import { PageHeader, Badge } from "@/components/ui";
import { useStore } from "@/lib/store";
import { lessonMastery, MASTERY_LABEL } from "@/lib/mastery";

export default function LessonsIndex() {
  const { state } = useStore();
  return (
    <div>
      <PageHeader title="Lessons" subtitle="Computer Programming I (Introduction to Programming). Each lesson explains, demonstrates, lets you practise, and checks understanding." />
      <div className="space-y-6">
        {PROG1_MODULES.map((m, i) => {
          const ls = LESSONS.filter((l) => l.moduleNo === i + 1);
          return (
            <section key={m} className="card"><h2 className="h2">Module {i + 1}: {m}</h2>
              <ul className="mt-3 divide-y divide-ink-100">
                {ls.map((l) => (
                  <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <Link className="font-medium underline-offset-2 hover:underline" href={`/lessons/${l.id}`}>{l.title}</Link>
                    <span className="flex items-center gap-2 text-xs text-ink-500">{l.minutes} min · {l.difficulty}{state.done[l.id] && <Badge tone="green">Completed</Badge>}<Badge>{MASTERY_LABEL[lessonMastery(state, l.id)]}</Badge></span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
