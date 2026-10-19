"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/curriculum", label: "My Curriculum" },
  { href: "/courses", label: "My Courses" },
  { href: "/lessons", label: "Lessons" },
  { href: "/coding-lab", label: "Coding Laboratory" },
  { href: "/math-lab", label: "Mathematics Laboratory" },
  { href: "/classwork", label: "Classwork" },
  { href: "/assignments", label: "Assignments" },
  { href: "/exams", label: "Examinations" },
  { href: "/projects", label: "Projects" },
  { href: "/revision", label: "Revision Centre" },
  { href: "/schedule", label: "Study Planner" },
  { href: "/progress", label: "Progress and Grades" },
  { href: "/tutor", label: "Academic Tutor" },
  { href: "/resources", label: "Resources" },
  { href: "/settings", label: "Settings" },
];

function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <svg width="32" height="32" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="14" fill="#d1aa3a" /><path d="M20 14v30h24" fill="none" stroke="#0f1730" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" /><circle cx="44" cy="20" r="4" fill="#0f1730" /></svg>
      <span className="font-serif text-lg font-semibold tracking-tight text-white">Lordic Campus</span>
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const active = (href: string) => path === href || path.startsWith(href + "/") || (href === "/progress" && path.startsWith("/grades"));
  return (
    <nav aria-label="Primary" className="flex flex-col gap-0.5">
      {NAV.map((n) => (
        <Link key={n.href} href={n.href} onClick={onNavigate} aria-current={active(n.href) ? "page" : undefined}
          className={`rounded-lg px-3 py-2 text-sm transition ${active(n.href) ? "bg-gold-400 font-semibold text-ink-950" : "text-ink-100 hover:bg-ink-800"}`}>
          {n.label}
        </Link>
      ))}
      <div className="my-3 border-t border-ink-700" />
      <Link href="/admin" onClick={onNavigate} className={`rounded-lg px-3 py-2 text-xs uppercase tracking-wide ${path.startsWith("/admin") ? "bg-ink-700 text-white" : "text-ink-300 hover:bg-ink-800"}`}>Content administration</Link>
    </nav>
  );
}

export default function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="no-print sticky top-0 hidden h-screen overflow-y-auto bg-ink-900 p-4 lg:block">
        <div className="mb-6 mt-1"><Logo /></div>
        <NavList />
      </aside>
      <div className="no-print sticky top-0 z-30 flex items-center justify-between bg-ink-900 px-4 py-3 lg:hidden">
        <Logo />
        <button aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)} className="rounded-lg border border-ink-600 px-3 py-1.5 text-sm text-white">Menu</button>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-ink-900 p-4">
            <div className="mb-4 flex items-center justify-between"><Logo /><button onClick={() => setOpen(false)} className="text-sm text-ink-200">Close</button></div>
            <NavList onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
      <main id="main" className="min-w-0 px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
