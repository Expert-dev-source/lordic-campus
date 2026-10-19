import type { Metadata } from "next";
import { RESOURCES, RESOURCE_NOTE } from "@/data/resources";
import { PageHeader, Badge } from "@/components/ui";

export const metadata: Metadata = { title: "Resources" };

export default function Resources() {
  const kinds = [...new Set(RESOURCES.map((r) => r.kind))];
  return (
    <div>
      <PageHeader title="Resources" subtitle="Official curriculum documents, documentation and references. External links open in a new tab." />
      <div className="card mb-6 border-amber-200 bg-amber-50 text-sm" role="note">{RESOURCE_NOTE}</div>
      {kinds.map((k) => (
        <section key={k} className="mb-6"><h2 className="h2 mb-3">{k}</h2>
          <ul className="grid gap-3 md:grid-cols-2">{RESOURCES.filter((r) => r.kind === k).map((r) => (<li key={r.url} className="card-tight"><a className="font-semibold underline" href={r.url} target="_blank" rel="noopener noreferrer">{r.title} ↗</a><p className="muted mt-1">{r.note}</p><p className="mt-1 break-all text-xs text-ink-400">{r.url}</p></li>))}</ul>
        </section>
      ))}
      <Badge>Resource list reviewed at build time; links are not verified automatically</Badge>
    </div>
  );
}
