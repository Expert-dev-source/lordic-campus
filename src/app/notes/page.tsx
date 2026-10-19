"use client";
import Link from "next/link";
import { useState } from "react";
import { PageHeader, Empty } from "@/components/ui";
import { actions, uid, useStore, type Note } from "@/lib/store";

export default function Notes() {
  const { state, update } = useStore();
  const [q, setQ] = useState("");
  const [edit, setEdit] = useState<Note | null>(null);
  const list = state.notes.filter((n) => (n.title + " " + n.body).toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Notes" subtitle="Personal notes linked to your courses and lessons." actions={<button className="btn btn-primary" onClick={() => setEdit({ id: uid("n"), title: "", body: "", at: Date.now() })}>New note</button>} />
      <div className="mb-4 flex flex-wrap items-center gap-3"><input className="input max-w-sm" aria-label="Search notes" placeholder="Search notes…" value={q} onChange={(e) => setQ(e.target.value)} /><button className="btn" onClick={() => { const blob = new Blob([state.notes.map((n) => `# ${n.title}\n\n${n.body}\n`).join("\n---\n\n")], { type: "text/markdown" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "lordic-campus-notes.md"; a.click(); URL.revokeObjectURL(a.href); }} disabled={!state.notes.length}>Export all (Markdown)</button></div>
      {edit && (
        <div className="card mb-4"><label className="label" htmlFor="nt">Title</label><input id="nt" className="input" value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /><label className="label mt-3" htmlFor="nb">Note</label><textarea id="nb" className="input" rows={8} value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} />
          <div className="mt-3 flex gap-2"><button className="btn btn-primary" disabled={!edit.title.trim() && !edit.body.trim()} onClick={() => { update(actions.saveNote({ ...edit, title: edit.title.trim() || "Untitled", at: Date.now() })); setEdit(null); }}>Save</button><button className="btn" onClick={() => setEdit(null)}>Cancel</button></div></div>
      )}
      {!list.length && !edit && <Empty title="No notes found">Write notes here, or from the bottom of any lesson.</Empty>}
      <ul className="grid gap-3 md:grid-cols-2">{list.map((n) => (
        <li key={n.id} className="card"><div className="flex items-start justify-between gap-2"><h2 className="font-semibold">{n.title}</h2><span className="text-xs text-ink-400">{new Date(n.at).toLocaleDateString()}</span></div><p className="mt-1 whitespace-pre-wrap text-sm text-ink-700">{n.body}</p>
          <div className="mt-3 flex flex-wrap gap-2">{n.lessonId && <Link className="btn btn-sm" href={`/lessons/${n.lessonId}`}>Open lesson</Link>}<button className="btn btn-sm" onClick={() => setEdit(n)}>Edit</button><button className="btn btn-sm" onClick={() => confirm("Delete this note?") && update(actions.deleteNote(n.id))}>Delete</button></div></li>))}</ul>
    </div>
  );
}
