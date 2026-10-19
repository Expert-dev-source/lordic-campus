"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { LESSONS } from "@/data/lessons";
import { EXERCISE_BY_ID } from "@/data/exercises";
import { PageHeader, Tabs, Badge } from "@/components/ui";
import type { Lesson } from "@/lib/types";

type Mode = "teach" | "hint" | "practice" | "socratic" | "errors";
const STOP = new Set(["the", "a", "an", "is", "are", "to", "of", "in", "and", "do", "i", "dont", "don't", "understand", "what", "how", "why", "does", "my", "me", "explain", "about", "work", "works"]);

function search(q: string): Lesson[] {
  const words = q.toLowerCase().replace(/[^a-z0-9_ ]/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w));
  if (!words.length) return [];
  return LESSONS.map((l) => {
    const hay = (l.title + " " + l.terms.map((t) => t.term + " " + t.def).join(" ") + " " + l.objectives.join(" ") + " " + l.blocks.map((b) => (b.t === "p" || b.t === "h" ? b.text : b.t === "callout" ? b.text : b.t === "list" ? b.items.join(" ") : b.code)).join(" ")).toLowerCase();
    const titleHit = words.filter((w) => l.title.toLowerCase().includes(w)).length * 5;
    const score = titleHit + words.reduce((a, w) => a + (hay.split(w).length - 1), 0);
    return { l, score };
  }).filter((x) => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 3).map((x) => x.l);
}

const ERRORS: [RegExp, string][] = [
  [/syntaxerror/i, "A SyntaxError means Python could not understand the code's grammar. Look at the line named and the one above it: check for a missing colon after if/for/while/def, unclosed brackets or quotes, or a stray character."],
  [/indentationerror/i, "IndentationError: lines in the same block must start with the same number of spaces. Use four spaces consistently and never mix tabs and spaces."],
  [/nameerror/i, "NameError: you used a name Python does not know. Check spelling and capital letters, and that you created the variable or function before using it."],
  [/typeerror/i, "TypeError: an operation was used on the wrong type, e.g. adding text to a number. Print the types with type(x). Convert with int(), float() or str()."],
  [/valueerror/i, "ValueError: the type is right but the content is not, e.g. int('abc'). Validate input or catch it with try/except ValueError."],
  [/zerodivisionerror/i, "ZeroDivisionError: you divided by zero. Check the divisor before dividing (e.g. an empty list's length)."],
  [/indexerror/i, "IndexError: the index is outside the sequence. Valid indexes are 0 to len(x) - 1."],
  [/keyerror/i, "KeyError: the dictionary has no such key. Use .get(key, default) or check with 'key in d'."],
  [/recursionerror|maximum recursion/i, "RecursionError: a recursive function never reached its base case. Check the base case and that each call makes the problem smaller."],
];

export default function Tutor() {
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<Mode>("teach");
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [hintN, setHintN] = useState(0);
  const [pick, setPick] = useState(0);
  const results = useMemo(() => search(q), [q]);
  const lesson = results[Math.min(pick, results.length - 1)];
  const ex = lesson?.independent.exerciseId ? EXERCISE_BY_ID[lesson.independent.exerciseId] : undefined;
  const errHit = ERRORS.find(([re]) => re.test(q));

  return (
    <div>
      <PageHeader title="Academic Tutor" subtitle="Ask about a concept from the course. Modes: teaching, hint, practice, Socratic and error explanation." />
      <div className="card mb-6 border-sky-200 bg-sky-50 text-sm" role="note"><strong>Offline study helper.</strong> The AI-powered tutor is a later phase and is not connected in this release. This helper only uses the verified Lordic Campus lessons, hints and quizzes, so it never invents syllabus content. Core lessons and exercises do not depend on it.</div>
      <Tabs<Mode> value={mode} onChange={(m) => { setMode(m); setHintN(0); }} tabs={[{ id: "teach", label: "Teaching" }, { id: "hint", label: "Hint" }, { id: "practice", label: "Practice" }, { id: "socratic", label: "Socratic" }, { id: "errors", label: "Error explanation" }]} />
      <label className="label" htmlFor="tq">{mode === "errors" ? "Paste your error message" : "What would you like help with?"}</label>
      <input id="tq" className="input max-w-2xl" value={q} onChange={(e) => { setQ(e.target.value); setPick(0); setHintN(0); }} placeholder={mode === "errors" ? "ZeroDivisionError: division by zero" : "e.g. I don't understand recursion"} />
      {mode === "errors" && (errHit ? <div className="card mt-4 max-w-2xl"><p className="text-sm">{errHit[1]}</p><p className="muted mt-2">Debugging workflow: reproduce with a small input → read the error from the bottom → form a hypothesis → test → fix one thing → re-run.</p></div> : q && <p className="muted mt-3">I do not recognise that error. Read the last line of the traceback: it names the error type and the line to inspect.</p>)}
      {mode !== "errors" && q && !lesson && <p className="muted mt-4">I could not find a lesson matching that. Try a keyword such as &ldquo;loops&rdquo;, &ldquo;functions&rdquo; or &ldquo;dictionary&rdquo;. Concepts without lessons yet are not answered here.</p>}
      {mode !== "errors" && lesson && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm">Matched lessons: {results.map((l, i) => <button key={l.id} className={`btn btn-sm ${i === pick ? "btn-primary" : ""}`} onClick={() => { setPick(i); setHintN(0); }}>{l.title}</button>)}</div>
          {mode === "teach" && (
            <section className="card max-w-3xl"><div className="flex items-center gap-2"><Badge tone="gold">Teaching mode</Badge><span className="text-xs text-ink-500">from the lesson: {lesson.title}</span></div>
              <div className="prose-lc">{lesson.blocks.filter((b) => b.t === "p" || b.t === "callout").slice(0, 3).map((b, i) => <p key={i}>{b.t === "p" || b.t === "callout" ? b.text : ""}</p>)}</div>
              <h3 className="label mt-3">A worked example</h3><pre className="code">{lesson.worked[0].solution}</pre>
              <h3 className="label">Check yourself</h3><p className="text-sm">{lesson.check[0].q}</p>
              <div className="mt-3"><Link href={`/lessons/${lesson.id}`} className="btn btn-primary btn-sm">Open the full lesson</Link></div></section>
          )}
          {mode === "hint" && (
            <section className="card max-w-3xl"><Badge tone="gold">Hint mode</Badge><p className="mt-2 text-sm">{ex ? <>Working on <strong>{ex.title}</strong>? Hints reveal gradually and never give the answer immediately.</> : "This lesson has a guided practice question with hints."}</p>
              <div className="mt-3 space-y-2">{(ex ? ex.hints.slice(0, 4) : lesson.guided.hints).slice(0, hintN).map((h, i) => <p key={i} className="rounded-lg bg-gold-50 p-2 text-sm">💡 Hint {i + 1}: {h}</p>)}</div>
              {hintN < (ex ? 4 : lesson.guided.hints.length) ? <button className="btn btn-sm mt-3" onClick={() => setHintN(hintN + 1)}>Show hint {hintN + 1}</button> : <p className="muted mt-3">That is all the hints. Try the problem again, then compare with the worked example in the lesson.</p>}
              {ex && <div className="mt-3"><Link className="btn btn-sm btn-primary" href={`/coding-lab/${ex.id}`}>Open the exercise</Link></div>}</section>
          )}
          {mode === "practice" && (
            <section className="card max-w-3xl"><Badge tone="gold">Practice mode</Badge><p className="muted mt-1">Generated practice from the lesson&apos;s own questions (practice material, not official syllabus questions).</p>
              <ol className="mt-3 space-y-4">{lesson.check.map((c, i) => <li key={i}><p className="font-medium">{i + 1}. {c.q}</p><ul className="mt-1 list-disc pl-5 text-sm">{c.options.map((o) => <li key={o}>{o}</li>)}</ul><button className="btn btn-sm mt-2" onClick={() => setReveal({ ...reveal, [`${lesson.id}${i}`]: !reveal[`${lesson.id}${i}`] })}>{reveal[`${lesson.id}${i}`] ? "Hide answer" : "Reveal answer"}</button>{reveal[`${lesson.id}${i}`] && <p className="mt-2 rounded-lg bg-emerald-50 p-2 text-sm"><strong>{c.options[c.answer]}.</strong> {c.explain}</p>}</li>)}</ol></section>
          )}
          {mode === "socratic" && (
            <section className="card max-w-3xl"><Badge tone="gold">Socratic mode</Badge><p className="muted mt-1">Answer each question in your own words (on paper or in a lesson note) before opening the lesson.</p>
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm"><li>What do you already know about <strong>{lesson.title.toLowerCase()}</strong>, and where have you seen it?</li>{lesson.objectives.map((o) => <li key={o}>In your own words, what does it mean to: {o.toLowerCase()}?</li>)}{lesson.blocks.filter((b) => b.t === "callout" && b.kind === "misconception").map((b, i) => <li key={i}>Someone says: &ldquo;{b.t === "callout" ? b.text.replace(/^Misconception: /, "") : ""}&rdquo; Is that right? How would you test it?</li>)}<li>Invent a small example of your own and predict its result before running it.</li></ol>
              <div className="mt-3"><Link href={`/lessons/${lesson.id}`} className="btn btn-sm btn-primary">Check against the lesson</Link></div></section>
          )}
        </div>
      )}
    </div>
  );
}
