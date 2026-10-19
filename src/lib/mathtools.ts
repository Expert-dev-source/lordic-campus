export function mean(xs: number[]) { return xs.reduce((a, b) => a + b, 0) / xs.length; }
export function median(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
export function modes(xs: number[]): number[] {
  const c = new Map<number, number>();
  xs.forEach((x) => c.set(x, (c.get(x) ?? 0) + 1));
  const max = Math.max(...c.values());
  if (max === 1) return [];
  return [...c.entries()].filter(([, n]) => n === max).map(([x]) => x).sort((a, b) => a - b);
}
/** Population or sample variance. */
export function variance(xs: number[], sample = false) {
  const m = mean(xs);
  const ss = xs.reduce((a, x) => a + (x - m) ** 2, 0);
  return ss / (xs.length - (sample ? 1 : 0));
}
export function quartiles(xs: number[]) {
  const s = [...xs].sort((a, b) => a - b);
  const half = Math.floor(s.length / 2);
  const lower = s.slice(0, half);
  const upper = s.slice(s.length % 2 ? half + 1 : half);
  return { q1: median(lower.length ? lower : s), q2: median(s), q3: median(upper.length ? upper : s) };
}
export function parseNumbers(text: string): number[] {
  const parts = text.split(/[\s,;]+/).filter(Boolean);
  const nums = parts.map(Number);
  if (!nums.length || nums.some((n) => !Number.isFinite(n))) throw new Error("Enter numbers separated by commas or spaces.");
  return nums;
}

export function toBase(n: number, base: number): string {
  if (!Number.isInteger(n) || n < 0) throw new Error("Enter a non-negative whole number.");
  return n.toString(base).toUpperCase();
}
export function fromBase(s: string, base: number): number {
  const valid = base === 2 ? /^[01]+$/ : base === 16 ? /^[0-9a-fA-F]+$/ : /^[0-9]+$/;
  if (!valid.test(s.trim())) throw new Error(`"${s}" is not a valid base-${base} number.`);
  return parseInt(s.trim(), base);
}

/** Polynomial derivative by the power rule. Input: coefficients from highest degree to constant. */
export function polyString(c: number[]): string {
  const deg = c.length - 1;
  const terms: string[] = [];
  c.forEach((a, i) => {
    const p = deg - i;
    if (a === 0) return;
    const sign = a < 0 ? "-" : "+";
    const abs = Math.abs(a);
    const coef = abs === 1 && p !== 0 ? "" : String(abs);
    const body = p === 0 ? coef || "1" : p === 1 ? `${coef}x` : `${coef}x^${p}`;
    terms.push(`${terms.length ? ` ${sign} ` : sign === "-" ? "-" : ""}${body}`);
  });
  return terms.length ? terms.join("") : "0";
}
export function derivative(c: number[]): number[] {
  const deg = c.length - 1;
  if (deg <= 0) return [0];
  return c.slice(0, -1).map((a, i) => a * (deg - i));
}
export function polyEval(c: number[], x: number) {
  return c.reduce((acc, a) => acc * x + a, 0);
}
export function derivativeSteps(c: number[]): string[] {
  const deg = c.length - 1;
  const steps: string[] = [];
  c.forEach((a, i) => {
    const p = deg - i;
    if (a === 0) return;
    if (p === 0) steps.push(`d/dx(${a}) = 0 because the derivative of a constant is 0.`);
    else steps.push(`d/dx(${polyString([...Array(1).fill(a), ...Array(p).fill(0)])}) = ${a} x ${p} x^${p - 1} = ${a * p}${p - 1 === 0 ? "" : p - 1 === 1 ? "x" : `x^${p - 1}`} (power rule: d/dx x^n = n x^(n-1)).`);
  });
  return steps;
}

// Simple seeded generator so practice questions are reproducible within a session.
export function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/** Linear equation a x + b = c with an integer solution. */
export function linearEquation(rand: () => number) {
  const a = Math.floor(rand() * 8) + 2;
  const x = Math.floor(rand() * 19) - 9;
  const b = Math.floor(rand() * 21) - 10;
  const c = a * x + b;
  const text = `${a}x ${b < 0 ? "-" : "+"} ${Math.abs(b)} = ${c}`;
  const steps = [
    `Start with ${text}.`,
    `Subtract (${b}) from both sides: ${a}x = ${c} - (${b}) = ${c - b}.`,
    `Divide both sides by ${a}: x = ${c - b} / ${a} = ${x}.`,
    `Check: ${a}(${x}) ${b < 0 ? "-" : "+"} ${Math.abs(b)} = ${a * x + b}. ✓`,
  ];
  return { text, answer: x, steps };
}
