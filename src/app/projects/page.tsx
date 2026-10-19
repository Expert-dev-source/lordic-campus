"use client";
import Link from "next/link";
import { PROJECTS } from "@/data/projects";
import { PageHeader, Badge, ProgressBar } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function Projects() {
  const { state } = useStore();
  return (
    <div>
      <PageHeader title="Project Workshop" subtitle="Apply what you learn. Projects teach engineering decisions: you plan, build, test, secure, document and reflect, rather than copy finished code." />
      {(["Beginner", "Intermediate", "Advanced"] as const).map((tier) => (
        <section key={tier} className="mb-8"><h2 className="h2 mb-3">{tier} projects</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PROJECTS.filter((p) => p.tier === tier).map((p) => {
              const done = p.milestones.filter((m) => state.projects[p.id]?.[m]).length;
              return (<Link key={p.id} href={`/projects/${p.id}`} className="card block transition hover:border-gold-400"><div className="flex justify-between"><Badge tone="gold">#{p.n}</Badge><span className="text-xs text-ink-500">{done}/{p.milestones.length} milestones</span></div><h3 className="mt-2 font-semibold">{p.title}</h3><p className="muted mt-1 line-clamp-3">{p.problem}</p><div className="mt-3"><ProgressBar value={(done / p.milestones.length) * 100} /></div></Link>);
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
