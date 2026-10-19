"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PROJECT_BY_ID, PROJECT_COMMON } from "@/data/projects";
import { Badge, Empty, Loading, PageHeader, ProgressBar } from "@/components/ui";
import { actions, useStore } from "@/lib/store";

const L = ({ items }: { items: string[] }) => <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{items.map((x) => <li key={x}>{x}</li>)}</ul>;

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { state, ready, update } = useStore();
  const p = PROJECT_BY_ID[id];
  if (!p) return <Empty title="Project not found" href="/projects" cta="All projects" />;
  if (!ready) return <Loading />;
  const prog = state.projects[p.id] ?? {};
  const done = p.milestones.filter((m) => prog[m]).length;
  return (
    <div>
      <p className="mb-2 text-sm"><Link className="underline" href="/projects">Projects</Link> / {p.title}</p>
      <PageHeader title={`${p.n}. ${p.title}`} subtitle={<Badge tone="gold">{p.tier}</Badge>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <section className="card"><h2 className="h3">Problem statement</h2><p className="mt-2">{p.problem}</p><h3 className="h3 mt-4">Intended users</h3><p className="mt-1 text-sm">{p.users}</p><h3 className="h3 mt-4">Learning outcomes</h3><L items={p.outcomes} /><h3 className="h3 mt-4">Prerequisites</h3><L items={p.prerequisites} /></section>
          <section className="card"><h2 className="h3">Requirements</h2><L items={p.requirements} /><h3 className="h3 mt-4">Acceptance criteria</h3><L items={p.acceptance} /></section>
          <section className="card"><h2 className="h3">Architecture tasks</h2><L items={p.architecture} /></section>
          <section className="card"><h2 className="h3">Testing checklist</h2><L items={PROJECT_COMMON.testing} /><h3 className="h3 mt-4">Security checklist</h3><L items={PROJECT_COMMON.security} /><h3 className="h3 mt-4">Documentation requirements</h3><L items={PROJECT_COMMON.documentation} /></section>
          <section className="card"><h2 className="h3">Submission instructions</h2><L items={PROJECT_COMMON.submission} /><h3 className="h3 mt-4">Marking rubric (100)</h3><table className="mt-2 w-full text-sm"><tbody>{PROJECT_COMMON.rubric.map((r) => <tr key={r.criterion} className="border-t border-ink-100"><td className="py-1.5">{r.criterion}</td><td className="text-right">{r.marks}</td></tr>)}</tbody></table></section>
          <section className="card"><h2 className="h3">Reflection questions</h2><L items={p.reflection} /><textarea className="input mt-3" rows={4} aria-label="Reflection notes" placeholder="Write your reflection here (saved as a note)…" defaultValue={state.notes.find((n) => n.id === `proj-note-${p.id}`)?.body ?? ""} onBlur={(e) => e.target.value.trim() && update(actions.saveNote({ id: `proj-note-${p.id}`, title: `Reflection: ${p.title}`, body: e.target.value, at: Date.now() }))} /></section>
        </div>
        <aside><section className="card sticky top-4"><h2 className="h3">Milestones</h2><div className="mt-2"><ProgressBar value={(done / p.milestones.length) * 100} /><p className="muted mt-1">{done} of {p.milestones.length} complete</p></div>
          <ul className="mt-3 space-y-2">{p.milestones.map((m) => <li key={m}><label className="flex cursor-pointer items-start gap-2 text-sm"><input type="checkbox" className="mt-1" checked={!!prog[m]} onChange={() => update(actions.toggleProjectStep(p.id, m))} />{m}</label></li>)}</ul></section></aside>
      </div>
    </div>
  );
}
