"use client";
import { useRef, useState } from "react";
import { PageHeader } from "@/components/ui";
import { uid, useStore } from "@/lib/store";

export default function Settings() {
  const { state, update, reset, exportJson, importJson } = useStore();
  const [msg, setMsg] = useState<string | null>(null);
  const [rep, setRep] = useState({ where: "", text: "" });
  const file = useRef<HTMLInputElement>(null);
  const download = () => { const blob = new Blob([exportJson()], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `lordic-campus-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click(); URL.revokeObjectURL(a.href); };
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Settings" />
      <section className="card"><h2 className="h2 mb-3">Profile and study goals</h2>
        <div className="grid gap-3 sm:grid-cols-2"><div><label className="label" htmlFor="nm">Your name</label><input id="nm" className="input" value={state.profile.name} onChange={(e) => update((s) => ({ ...s, profile: { ...s.profile, name: e.target.value } }))} /></div><div><label className="label" htmlFor="in">Institution (optional)</label><input id="in" className="input" value={state.profile.institution} onChange={(e) => update((s) => ({ ...s, profile: { ...s.profile, institution: e.target.value } }))} placeholder="Used to remind you to verify the curriculum" /></div>
          <div><label className="label" htmlFor="dm">Available study minutes per day</label><input id="dm" type="number" min={10} max={600} className="input" value={state.profile.dailyMinutes} onChange={(e) => update((s) => ({ ...s, profile: { ...s.profile, dailyMinutes: Math.max(10, Math.min(600, Number(e.target.value) || 60)) } }))} /></div></div></section>
      <section className="card"><h2 className="h2 mb-2">Your data and privacy</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm"><li><strong>What is stored:</strong> your progress, answers, notes, bookmarks, plans and settings. Nothing else.</li><li><strong>Where:</strong> only in this browser (local storage). There is no account, no tracking, and nothing is sent to any server except exam answers, which are sent to this app&apos;s own server to be marked and are not saved there.</li><li><strong>Code you run</strong> executes inside your browser in an isolated worker. It is not uploaded.</li><li><strong>AI:</strong> no AI service is connected in this release, so no data is shared with AI services.</li><li><strong>Monitoring:</strong> there is no webcam, screen or keystroke monitoring.</li></ul>
        <div className="mt-4 flex flex-wrap gap-2"><button className="btn" onClick={download}>Export my data (JSON)</button><button className="btn" onClick={() => file.current?.click()}>Import a backup</button><input ref={file} type="file" accept="application/json,.json" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const err = importJson(await f.text()); setMsg(err ?? "Backup restored."); e.target.value = ""; }} />
          <button className="btn border-red-300 text-red-700" onClick={() => { if (confirm("Delete ALL your progress, notes and settings from this browser? This cannot be undone. Export a backup first if unsure.")) { reset(); setMsg("All data deleted."); } }}>Delete all my data</button></div>
        {msg && <p role="status" className="mt-2 rounded-lg bg-ink-50 p-2 text-sm">{msg}</p>}
        <p className="muted mt-3">Retention: data stays until you delete it or clear your browser&apos;s site data. Clearing browser data without exporting will erase your progress.</p></section>
      <section className="card"><h2 className="h2 mb-2">Report a content problem</h2>
        <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); if (!rep.text.trim()) return; update((s) => ({ ...s, reports: [{ id: uid("r"), at: Date.now(), where: rep.where, text: rep.text }, ...s.reports] })); setRep({ where: "", text: "" }); setMsg("Report saved to the content-reports list (see Admin)."); }}>
          <div><label className="label" htmlFor="rw">Where (lesson, exercise, link…)</label><input id="rw" className="input" value={rep.where} onChange={(e) => setRep({ ...rep, where: e.target.value })} /></div>
          <div><label className="label" htmlFor="rt">What is wrong?</label><textarea id="rt" className="input" rows={3} value={rep.text} onChange={(e) => setRep({ ...rep, text: e.target.value })} /></div>
          <button className="btn" type="submit">Save report</button></form></section>
    </div>
  );
}
