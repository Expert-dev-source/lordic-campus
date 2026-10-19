import Link from "next/link";
import React from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="h1">{title}</h1>
        {subtitle && <p className="mt-1 max-w-3xl text-ink-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? "Progress"} className="h-2 w-full overflow-hidden rounded-full bg-ink-100">
      <div className="h-full rounded-full bg-gold-400 transition-all" style={{ width: `${v}%` }} />
    </div>
  );
}

const TONES: Record<string, string> = {
  neutral: "border-ink-200 bg-ink-50 text-ink-700",
  gold: "border-gold-300 bg-gold-50 text-gold-700",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  red: "border-red-200 bg-red-50 text-red-800",
  blue: "border-sky-200 bg-sky-50 text-sky-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
};
export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: keyof typeof TONES }) {
  return <span className={`badge ${TONES[tone]}`}>{children}</span>;
}

export function Empty({ title, children, href, cta }: { title: string; children?: React.ReactNode; href?: string; cta?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-ink-200 bg-white/60 p-8 text-center">
      <p className="font-serif text-lg font-semibold">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-md text-sm text-ink-500">{children}</p>}
      {href && cta && <Link href={href} className="btn btn-primary mt-4">{cta}</Link>}
    </div>
  );
}

export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="card-tight">
      <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</div>
      <div className="mt-1 font-serif text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs text-ink-500">{sub}</div>}
    </div>
  );
}

export function Loading() {
  return <div className="p-8 text-center text-ink-500">Loading your workspace…</div>;
}

export function CodeBlock({ code, out }: { code: string; out?: string }) {
  return (
    <div className="my-3">
      <pre className={`code ${out ? "!mb-0 !rounded-b-none" : ""}`}><code>{code}</code></pre>
      {out && (
        <>
          <div className="rounded-none bg-ink-800 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-200">Output</div>
          <pre className="out !rounded-t-none">{out}</pre>
        </>
      )}
    </div>
  );
}

export function Tabs<T extends string>({ tabs, value, onChange }: { tabs: { id: T; label: string }[]; value: T; onChange: (t: T) => void }) {
  return (
    <div role="tablist" className="mb-4 flex flex-wrap gap-1">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} className={`tab ${value === t.id ? "tab-active" : ""}`} onClick={() => onChange(t.id)}>{t.label}</button>
      ))}
    </div>
  );
}
