"use client";
import Link from "next/link";
import { EXERCISES } from "@/data/exercises";
import { PageHeader, Badge, ProgressBar } from "@/components/ui";
import CodeRunner from "@/components/CodeRunner";
import { useStore } from "@/lib/store";

export default function CodingLab() {
  const { state } = useStore();
  const passed = EXERCISES.filter((e) => state.exercises[e.id]?.passed).length;
  return (
    <div>
      <PageHeader title="Coding Laboratory" subtitle="Write Python, run it safely in your browser, and get automated test feedback." />
      <section className="card mb-6">
        <h2 className="h2 mb-1">Playground</h2>
        <p className="muted mb-3">Experiment freely. Code runs inside an isolated Web Worker with a time limit, never on a server.</p>
        <CodeRunner initial={'# Try anything here\nname = input("Your name: ")\nprint("Hello,", name)\nfor i in range(3):\n    print(i * i)\n'} stdin="Ada" rows={9} />
      </section>
      <section className="card">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3"><h2 className="h2">Exercises</h2><div className="w-64"><div className="mb-1 flex justify-between text-xs text-ink-500"><span>Passed</span><span>{passed}/{EXERCISES.length}</span></div><ProgressBar value={(passed / EXERCISES.length) * 100} /></div></div>
        <ul className="divide-y divide-ink-100">
          {EXERCISES.map((e) => {
            const st = state.exercises[e.id];
            return (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div><Link className="font-medium underline-offset-2 hover:underline" href={`/coding-lab/${e.id}`}>{e.title}</Link><p className="text-xs text-ink-500">{e.difficulty} · {e.tests.length} tests</p></div>
                {st?.passed ? <Badge tone="green">Passed</Badge> : st?.attempts ? <Badge tone="amber">{st.bestPassed}/{st.total} tests</Badge> : <Badge>Not attempted</Badge>}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
