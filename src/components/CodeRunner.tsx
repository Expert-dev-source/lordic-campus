"use client";
import { useState } from "react";
import { runPython, type RunResult } from "@/lib/pyrunner";

export function Editor({ value, onChange, rows = 12, label = "Code editor", readOnly = false }: { value: string; onChange: (v: string) => void; rows?: number; label?: string; readOnly?: boolean }) {
  return (
    <textarea
      className="editor rounded-t-xl"
      aria-label={label}
      value={value}
      rows={rows}
      readOnly={readOnly}
      spellCheck={false}
      autoCapitalize="off"
      autoCorrect="off"
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Tab") {
          e.preventDefault();
          const t = e.currentTarget;
          const { selectionStart: s, selectionEnd: en } = t;
          onChange(value.slice(0, s) + "    " + value.slice(en));
          requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = s + 4; });
        }
      }}
    />
  );
}

export function OutputPanel({ res, running }: { res: RunResult | null; running: boolean }) {
  if (running) return <pre className="out" aria-live="polite">Running… (the first run loads the Python runtime and can take a few seconds)</pre>;
  if (!res) return <pre className="out text-ink-300">Output appears here. Press Run.</pre>;
  return (
    <pre className="out" aria-live="polite">
      {res.stdout}
      {res.error && <span className="text-red-300">{res.stdout ? "\n" : ""}{res.error}</span>}
      {!res.stdout && !res.error && <span className="text-ink-300">(The program ran and printed nothing.)</span>}
    </pre>
  );
}

/** A self-contained "write, run, see output" panel used in lessons and the playground. */
export default function CodeRunner({ initial, stdin: stdin0, rows = 10 }: { initial: string; stdin?: string; rows?: number }) {
  const [code, setCode] = useState(initial);
  const [stdin, setStdin] = useState(stdin0 ?? "");
  const [res, setRes] = useState<RunResult | null>(null);
  const [running, setRunning] = useState(false);
  const run = async () => {
    setRunning(true);
    setRes(await runPython(code, { stdin }));
    setRunning(false);
  };
  return (
    <div>
      <div className="overflow-hidden rounded-xl border border-ink-800">
        <Editor value={code} onChange={setCode} rows={rows} />
        <OutputPanel res={res} running={running} />
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto]">
        <div>
          <label className="label" htmlFor="stdin">Input (one line per input() call)</label>
          <textarea id="stdin" className="input font-mono" rows={2} value={stdin} onChange={(e) => setStdin(e.target.value)} />
        </div>
        <div className="flex items-end gap-2">
          <button className="btn btn-primary" onClick={run} disabled={running}>▶ Run</button>
          <button className="btn" onClick={() => { setCode(initial); setRes(null); }}>Reset</button>
        </div>
      </div>
    </div>
  );
}
