"use client";
import { useMemo, useState } from "react";
import { PageHeader, Tabs } from "@/components/ui";
import { truthTable } from "@/lib/boolexpr";
import { derivative, derivativeSteps, fromBase, linearEquation, mean, median, modes, mulberry32, parseNumbers, polyEval, polyString, quartiles, toBase, variance } from "@/lib/mathtools";
import { actions, useStore } from "@/lib/store";

type Tab = "graphs" | "calculus" | "algebra" | "stats" | "bases" | "logic" | "formulas";

function GraphLab() {
  const [kind, setKind] = useState<"poly" | "sin">("poly");
  const [a, setA] = useState(1), [b, setB] = useState(0), [c, setC] = useState(-2), [showD, setShowD] = useState(true);
  const f = (x: number) => (kind === "poly" ? a * x * x + b * x + c : a * Math.sin(b * x + c));
  const df = (x: number) => (kind === "poly" ? 2 * a * x + b : a * b * Math.cos(b * x + c));
  const W = 600, H = 360, X = 10, Y = 8;
  const sx = (x: number) => W / 2 + (x / X) * (W / 2), sy = (y: number) => H / 2 - (y / Y) * (H / 2);
  const path = (fn: (x: number) => number) => { let d = ""; let pen = false; for (let i = 0; i <= 400; i++) { const x = -X + (2 * X * i) / 400; const y = fn(x); if (!Number.isFinite(y) || Math.abs(y) > 50) { pen = false; continue; } d += `${pen ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`; pen = true; } return d; };
  const slider = (label: string, v: number, set: (n: number) => void, min = -5, max = 5, step = 0.5) => (<label className="block text-sm"><span className="label">{label} = {v}</span><input type="range" className="w-full" min={min} max={max} step={step} value={v} onChange={(e) => set(Number(e.target.value))} /></label>);
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
      <div className="card !p-3"><svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Graph of the function">
        {Array.from({ length: 21 }, (_, i) => i - 10).map((i) => <line key={`v${i}`} x1={sx(i)} x2={sx(i)} y1={0} y2={H} stroke="#e3e8f5" strokeWidth={i === 0 ? 0 : 1} />)}
        {Array.from({ length: 17 }, (_, i) => i - 8).map((i) => <line key={`h${i}`} y1={sy(i)} y2={sy(i)} x1={0} x2={W} stroke="#e3e8f5" strokeWidth={i === 0 ? 0 : 1} />)}
        <line x1={0} x2={W} y1={H / 2} y2={H / 2} stroke="#46579a" /><line y1={0} y2={H} x1={W / 2} x2={W / 2} stroke="#46579a" />
        <path d={path(f)} fill="none" stroke="#0f1730" strokeWidth={2.5} />
        {showD && <path d={path(df)} fill="none" stroke="#b8902a" strokeWidth={2} strokeDasharray="6 4" />}
      </svg>
        <p className="mt-1 text-xs text-ink-500"><span className="font-semibold text-ink-900">━</span> f(x) {showD && <><span className="ml-3 font-semibold text-gold-600">╍</span> f′(x), the gradient of f at each x</>}</p></div>
      <div className="card space-y-3">
        <div className="flex gap-2"><button className={`btn btn-sm ${kind === "poly" ? "btn-primary" : ""}`} onClick={() => { setKind("poly"); setA(1); setB(0); setC(-2); }}>ax² + bx + c</button><button className={`btn btn-sm ${kind === "sin" ? "btn-primary" : ""}`} onClick={() => { setKind("sin"); setA(2); setB(1); setC(0); }}>a·sin(bx + c)</button></div>
        {slider("a", a, setA)}{slider("b", b, setB)}{slider("c", c, setC)}
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showD} onChange={(e) => setShowD(e.target.checked)} />Show derivative</label>
        <p className="rounded-lg bg-ink-50 p-2 text-sm">{kind === "poly" ? <>f(x) = {polyString([a, b, c])}<br />f′(x) = {polyString([2 * a, b])}</> : <>f(x) = {a}·sin({b}x + {c})<br />f′(x) = {a * b}·cos({b}x + {c})</>}</p>
        <p className="muted">Where f′(x) = 0 the graph of f has a turning point. Drag the sliders and watch it happen.</p>
      </div>
    </div>
  );
}

function CalculusLab() {
  const [coef, setCoef] = useState("1, 0, 0, 0");
  const parsed = useMemo(() => { try { const n = parseNumbers(coef); if (n.length > 8) throw new Error("Use at most 8 coefficients."); return { n }; } catch (e) { return { err: (e as Error).message }; } }, [coef]);
  const [xv, setXv] = useState(2);
  return (
    <div className="card max-w-3xl">
      <h2 className="h2">Power rule</h2>
      <p className="muted mb-3">Enter the coefficients from the highest power down to the constant. For x³ type 1, 0, 0, 0. For 2x² − 3x + 1 type 2, -3, 1.</p>
      <input className="input max-w-sm font-mono" aria-label="Coefficients" value={coef} onChange={(e) => setCoef(e.target.value)} />
      {parsed.err ? <p className="mt-2 text-sm text-red-700">{parsed.err}</p> : parsed.n && (
        <div className="mt-4 space-y-3">
          <p>f(x) = <strong>{polyString(parsed.n)}</strong></p>
          <div><p className="label">Step by step</p><p className="mb-1 text-sm">Rule: d/dx x<sup>n</sup> = n·x<sup>n−1</sup></p><ul className="list-disc space-y-1 pl-5 text-sm">{derivativeSteps(parsed.n).map((s, i) => <li key={i}>{s}</li>)}</ul></div>
          <p>f′(x) = <strong>{polyString(derivative(parsed.n))}</strong></p>
          <label className="flex items-center gap-2 text-sm">Evaluate at x = <input type="number" className="input w-24" value={xv} onChange={(e) => setXv(Number(e.target.value))} /></label>
          <p className="text-sm">f({xv}) = {polyEval(parsed.n, xv)} · f′({xv}) = {polyEval(derivative(parsed.n), xv)} (the gradient of the curve at that point)</p>
        </div>
      )}
      <p className="muted mt-4">Practise: differentiate 5x⁴ − x² + 7 by hand, then enter 5, 0, -1, 0, 7 to check each step. Showing the steps matters as much as the final answer.</p>
    </div>
  );
}

function AlgebraLab() {
  const [seed, setSeed] = useState(1);
  const q = useMemo(() => linearEquation(mulberry32(seed * 7919)), [seed]);
  const [ans, setAns] = useState(""); const [show, setShow] = useState(false); const [fb, setFb] = useState<"" | "ok" | "no">("");
  const next = () => { setSeed(seed + 1); setAns(""); setShow(false); setFb(""); };
  return (
    <div className="card max-w-2xl"><h2 className="h2">Solve for x</h2>
      <p className="my-3 font-serif text-3xl">{q.text}</p>
      <div className="flex flex-wrap items-center gap-2"><label className="sr-only" htmlFor="alg">Your value for x</label><span>x =</span><input id="alg" className="input w-28" inputMode="numeric" value={ans} onChange={(e) => setAns(e.target.value)} />
        <button className="btn btn-primary" onClick={() => setFb(Number(ans) === q.answer && ans.trim() !== "" ? "ok" : "no")}>Check</button><button className="btn" onClick={() => setShow(true)}>Show steps</button><button className="btn" onClick={next}>New question</button></div>
      {fb === "ok" && <p className="mt-3 rounded-lg bg-emerald-50 p-2 text-sm">✅ Correct. Now explain which operation you undid first, and why.</p>}
      {fb === "no" && <p className="mt-3 rounded-lg bg-amber-50 p-2 text-sm">Not yet. Undo the addition or subtraction first, then divide. Substitute your answer back into the equation to test it.</p>}
      {show && <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">{q.steps.map((s, i) => <li key={i}>{s}</li>)}</ol>}
    </div>
  );
}

function StatsLab() {
  const [txt, setTxt] = useState("45, 60, 72, 58, 91, 60, 49");
  const r = useMemo(() => { try { const n = parseNumbers(txt); const q = quartiles(n); return { n, mean: mean(n), median: median(n), modes: modes(n), range: Math.max(...n) - Math.min(...n), varP: variance(n), varS: n.length > 1 ? variance(n, true) : NaN, q }; } catch (e) { return { err: (e as Error).message } as const; } }, [txt]);
  const f = (x: number) => (Number.isFinite(x) ? String(Math.round(x * 10000) / 10000) : "n/a");
  return (
    <div className="card max-w-3xl"><h2 className="h2">Descriptive statistics</h2>
      <label className="label" htmlFor="data">Data (comma or space separated)</label><input id="data" className="input font-mono" value={txt} onChange={(e) => setTxt(e.target.value)} />
      {"err" in r ? <p className="mt-2 text-sm text-red-700">{r.err}</p> : (
        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          {[["Count", r.n.length], ["Mean", f(r.mean)], ["Median", f(r.median)], ["Mode", r.modes.length ? r.modes.join(", ") : "none"], ["Range", f(r.range)], ["Variance (population)", f(r.varP)], ["Std deviation (population)", f(Math.sqrt(r.varP))], ["Variance (sample)", f(r.varS)], ["Std deviation (sample)", f(Math.sqrt(r.varS))], ["Q1", f(r.q.q1)], ["Q3", f(r.q.q3)], ["IQR", f(r.q.q3 - r.q.q1)]].map(([k, v]) => <div key={String(k)} className="rounded-lg bg-ink-50 p-2"><dt className="text-xs text-ink-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
        </dl>
      )}
      <p className="muted mt-3">Quartiles use the median-of-halves method. Different textbooks use slightly different quartile methods, so check which one your course uses.</p>
    </div>
  );
}

function BaseLab() {
  const [dec, setDec] = useState("202"); const [bin, setBin] = useState(""); const [hex, setHex] = useState("");
  let out: { b: string; h: string; err?: string } = { b: "", h: "" };
  try { const n = Number(dec); out = { b: toBase(n, 2), h: toBase(n, 16) }; } catch (e) { out.err = (e as Error).message; }
  let bd = "", he = "";
  try { if (bin) bd = String(fromBase(bin, 2)); } catch (e) { bd = (e as Error).message; }
  try { if (hex) he = String(fromBase(hex, 16)); } catch (e) { he = (e as Error).message; }
  return (
    <div className="grid max-w-4xl gap-4 md:grid-cols-3">
      <div className="card"><h2 className="h3">Decimal →</h2><input className="input mt-2" aria-label="Decimal number" value={dec} onChange={(e) => setDec(e.target.value)} />{out.err ? <p className="mt-2 text-sm text-red-700">{out.err}</p> : <p className="mt-2 text-sm">Binary: <code className="font-mono">{out.b}</code><br />Hex: <code className="font-mono">{out.h}</code></p>}</div>
      <div className="card"><h2 className="h3">Binary → decimal</h2><input className="input mt-2 font-mono" aria-label="Binary number" value={bin} onChange={(e) => setBin(e.target.value)} placeholder="11001010" /><p className="mt-2 text-sm">{bd}</p></div>
      <div className="card"><h2 className="h3">Hex → decimal</h2><input className="input mt-2 font-mono" aria-label="Hexadecimal number" value={hex} onChange={(e) => setHex(e.target.value)} placeholder="CA" /><p className="mt-2 text-sm">{he}</p></div>
      <p className="muted md:col-span-3">Method for decimal to binary: divide by 2 repeatedly and read the remainders from the last to the first. Work one by hand, then check it here.</p>
    </div>
  );
}

function LogicLab() {
  const [expr, setExpr] = useState("A AND (B OR NOT C)");
  const r = useMemo(() => { try { return truthTable(expr); } catch (e) { return { err: (e as Error).message }; } }, [expr]);
  const [A, setA] = useState(true), [B, setB] = useState(false);
  const gates: [string, boolean][] = [["AND", A && B], ["OR", A || B], ["NAND", !(A && B)], ["NOR", !(A || B)], ["XOR", A !== B], ["XNOR", A === B]];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card"><h2 className="h2">Truth table generator</h2>
        <p className="muted mb-2">Use single-letter variables with AND, OR, NOT, XOR, NAND, NOR, XNOR (or &amp; | ^ !) and brackets.</p>
        <input className="input font-mono" aria-label="Boolean expression" value={expr} onChange={(e) => setExpr(e.target.value)} />
        {"err" in r ? <p className="mt-2 text-sm text-red-700">{r.err}</p> : (<><div className="mt-3 overflow-x-auto"><table className="w-full text-center font-mono text-sm"><thead><tr className="border-b border-ink-200">{r.vars.map((v) => <th key={v} className="p-1">{v}</th>)}<th className="p-1 text-gold-600">OUT</th></tr></thead><tbody>{r.rows.map((row, i) => <tr key={i} className="border-b border-ink-100">{row.inputs.map((x, j) => <td key={j} className="p-1">{x ? 1 : 0}</td>)}<td className={`p-1 font-semibold ${row.out ? "bg-emerald-50" : ""}`}>{row.out ? 1 : 0}</td></tr>)}</tbody></table></div><p className="mt-2 text-sm">This expression is a <strong>{r.kind}</strong>.</p></>)}
      </div>
      <div className="card"><h2 className="h2">Logic gate explorer</h2>
        <p className="muted mb-2">Toggle the inputs and observe every gate.</p>
        <div className="flex gap-3">{([["A", A, setA], ["B", B, setB]] as const).map(([n, v, set]) => <button key={n} aria-pressed={v} onClick={() => set(!v)} className={`btn ${v ? "btn-gold" : ""}`}>{n} = {v ? 1 : 0}</button>)}</div>
        <div className="mt-4 grid grid-cols-3 gap-2">{gates.map(([g, o]) => <div key={g} className={`rounded-xl border p-3 text-center ${o ? "border-emerald-300 bg-emerald-50" : "border-ink-100 bg-ink-50"}`}><div className="text-xs text-ink-500">{g}</div><div className="font-mono text-2xl font-semibold">{o ? 1 : 0}</div></div>)}</div>
      </div>
    </div>
  );
}

const FORMULAS: { subject: string; items: [string, string][] }[] = [
  { subject: "Algebra", items: [["Quadratic formula", "x = (−b ± √(b² − 4ac)) / 2a"], ["Difference of squares", "a² − b² = (a − b)(a + b)"], ["Indices", "aᵐ × aⁿ = aᵐ⁺ⁿ ; aᵐ ÷ aⁿ = aᵐ⁻ⁿ ; (aᵐ)ⁿ = aᵐⁿ"], ["Logarithms", "log(xy) = log x + log y ; log(xⁿ) = n log x"]] },
  { subject: "Trigonometry", items: [["Ratios", "sin θ = opp/hyp ; cos θ = adj/hyp ; tan θ = opp/adj"], ["Pythagorean identity", "sin²θ + cos²θ = 1"], ["Tan identity", "tan θ = sin θ / cos θ"]] },
  { subject: "Calculus", items: [["Power rule", "d/dx xⁿ = n xⁿ⁻¹"], ["Constant multiple", "d/dx (k f) = k f′"], ["Sum rule", "d/dx (f + g) = f′ + g′"], ["Integral power rule", "∫ xⁿ dx = xⁿ⁺¹/(n+1) + C (n ≠ −1)"]] },
  { subject: "Statistics and probability", items: [["Mean", "x̄ = Σx / n"], ["Population variance", "σ² = Σ(x − μ)² / n"], ["Sample variance", "s² = Σ(x − x̄)² / (n − 1)"], ["Probability", "P(A) = favourable outcomes / total outcomes"], ["Complement", "P(not A) = 1 − P(A)"]] },
  { subject: "Discrete maths and logic", items: [["De Morgan", "¬(A ∧ B) = ¬A ∨ ¬B ; ¬(A ∨ B) = ¬A ∧ ¬B"], ["Permutations", "P(n, r) = n! / (n − r)!"], ["Combinations", "C(n, r) = n! / (r!(n − r)!)"], ["Arithmetic series", "Sₙ = n(a + l)/2"]] },
];

function Formulas() {
  const { state, update } = useStore();
  return (
    <div className="grid gap-4 md:grid-cols-2">{FORMULAS.map((s) => (
      <section key={s.subject} className="card"><h2 className="h2">{s.subject}</h2>
        <ul className="mt-2 divide-y divide-ink-100">{s.items.map(([n, f]) => { const id = `bm-formula-${n}`; const on = state.bookmarks.some((b) => b.id === id); return <li key={n} className="flex items-start justify-between gap-2 py-2 text-sm"><span><strong>{n}</strong><br /><span className="font-mono text-[13px]">{f}</span></span><button aria-pressed={on} aria-label={`Save ${n}`} className="btn btn-sm" onClick={() => update(actions.toggleBookmark({ id, kind: "formula", ref: n, label: n, body: f }))}>{on ? "★" : "☆"}</button></li>; })}</ul>
      </section>))}</div>
  );
}

export default function MathLab() {
  const [tab, setTab] = useState<Tab>("graphs");
  return (
    <div>
      <PageHeader title="Mathematics Laboratory" subtitle="Explore, calculate and practise. Use these tools to check your own working, not to replace it." />
      <Tabs<Tab> value={tab} onChange={setTab} tabs={[{ id: "graphs", label: "Functions and graphs" }, { id: "calculus", label: "Calculus" }, { id: "algebra", label: "Algebra practice" }, { id: "stats", label: "Statistics" }, { id: "bases", label: "Number bases" }, { id: "logic", label: "Logic and Boolean algebra" }, { id: "formulas", label: "Formula sheets" }]} />
      {tab === "graphs" && <GraphLab />}{tab === "calculus" && <CalculusLab />}{tab === "algebra" && <AlgebraLab />}{tab === "stats" && <StatsLab />}{tab === "bases" && <BaseLab />}{tab === "logic" && <LogicLab />}{tab === "formulas" && <Formulas />}
    </div>
  );
}
