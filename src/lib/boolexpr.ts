// A small, safe boolean-expression parser (no eval). Supports: variables A-Z, 0, 1, NOT/!/~, AND/&, OR/|, XOR/^, NAND, NOR, XNOR, parentheses.
type Tok = { t: "var" | "const" | "op" | "lp" | "rp"; v: string };
export type Node = { k: "var"; n: string } | { k: "const"; v: boolean } | { k: "not"; a: Node } | { k: "bin"; op: string; a: Node; b: Node };

const WORDS: Record<string, string> = { NOT: "NOT", AND: "AND", OR: "OR", XOR: "XOR", NAND: "NAND", NOR: "NOR", XNOR: "XNOR" };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === "(") { out.push({ t: "lp", v: c }); i++; continue; }
    if (c === ")") { out.push({ t: "rp", v: c }); i++; continue; }
    if (c === "!" || c === "~") { out.push({ t: "op", v: "NOT" }); i++; continue; }
    if (c === "&") { out.push({ t: "op", v: "AND" }); i++; continue; }
    if (c === "|" || c === "+") { out.push({ t: "op", v: "OR" }); i++; continue; }
    if (c === "^") { out.push({ t: "op", v: "XOR" }); i++; continue; }
    if (c === "0" || c === "1") { out.push({ t: "const", v: c }); i++; continue; }
    if (/[A-Za-z]/.test(c)) {
      let j = i;
      while (j < src.length && /[A-Za-z]/.test(src[j])) j++;
      const w = src.slice(i, j);
      const up = w.toUpperCase();
      if (WORDS[up]) out.push({ t: "op", v: up });
      else if (w.length === 1) out.push({ t: "var", v: up });
      else throw new Error(`Unknown word "${w}". Use single letters for variables.`);
      i = j; continue;
    }
    throw new Error(`Unexpected character "${c}".`);
  }
  return out;
}

export function parse(src: string): Node {
  const toks = tokenize(src);
  if (!toks.length) throw new Error("Type an expression such as A AND (B OR NOT C).");
  let p = 0;
  const peek = () => toks[p];
  // precedence (low to high): OR/NOR/XOR/XNOR < AND/NAND < NOT
  function parseOr(): Node {
    let l = parseAnd();
    while (peek() && peek().t === "op" && ["OR", "NOR", "XOR", "XNOR"].includes(peek().v)) {
      const op = toks[p++].v;
      l = { k: "bin", op, a: l, b: parseAnd() };
    }
    return l;
  }
  function parseAnd(): Node {
    let l = parseNot();
    while (peek() && peek().t === "op" && ["AND", "NAND"].includes(peek().v)) {
      const op = toks[p++].v;
      l = { k: "bin", op, a: l, b: parseNot() };
    }
    return l;
  }
  function parseNot(): Node {
    if (peek() && peek().t === "op" && peek().v === "NOT") { p++; return { k: "not", a: parseNot() }; }
    return parseAtom();
  }
  function parseAtom(): Node {
    const t = toks[p++];
    if (!t) throw new Error("The expression ended unexpectedly.");
    if (t.t === "var") return { k: "var", n: t.v };
    if (t.t === "const") return { k: "const", v: t.v === "1" };
    if (t.t === "lp") {
      const n = parseOr();
      if (!peek() || peek().t !== "rp") throw new Error("Missing closing bracket.");
      p++;
      return n;
    }
    throw new Error(`Unexpected "${t.v}".`);
  }
  const n = parseOr();
  if (p < toks.length) throw new Error(`Unexpected "${toks[p].v}".`);
  return n;
}

export function variables(n: Node, acc = new Set<string>()): string[] {
  if (n.k === "var") acc.add(n.n);
  else if (n.k === "not") variables(n.a, acc);
  else if (n.k === "bin") { variables(n.a, acc); variables(n.b, acc); }
  return [...acc].sort();
}

export function evaluate(n: Node, env: Record<string, boolean>): boolean {
  switch (n.k) {
    case "var": return !!env[n.n];
    case "const": return n.v;
    case "not": return !evaluate(n.a, env);
    case "bin": {
      const a = evaluate(n.a, env), b = evaluate(n.b, env);
      switch (n.op) {
        case "AND": return a && b;
        case "OR": return a || b;
        case "XOR": return a !== b;
        case "NAND": return !(a && b);
        case "NOR": return !(a || b);
        case "XNOR": return a === b;
      }
    }
  }
  return false;
}

export function truthTable(src: string) {
  const node = parse(src);
  const vars = variables(node);
  if (vars.length > 6) throw new Error("Use at most 6 variables.");
  const rows: { inputs: boolean[]; out: boolean }[] = [];
  for (let i = 0; i < 1 << vars.length; i++) {
    const env: Record<string, boolean> = {};
    const inputs = vars.map((v, idx) => { const val = !!((i >> (vars.length - 1 - idx)) & 1); env[v] = val; return val; });
    rows.push({ inputs, out: evaluate(node, env) });
  }
  const outs = rows.map((r) => r.out);
  const kind = outs.every(Boolean) ? "tautology (always true)" : outs.every((o) => !o) ? "contradiction (always false)" : "contingency (sometimes true, sometimes false)";
  return { vars, rows, kind };
}
