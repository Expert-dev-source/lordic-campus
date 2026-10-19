/* Module worker. Sandboxed Python runner for Lordic Campus.
 * Runs Pyodide (CPython compiled to WebAssembly) inside a Web Worker, so submitted code
 * never touches the server and never blocks the page. The main thread terminates this
 * worker if a run exceeds its time limit (infinite loops). */
import { loadPyodide } from "/pyodide/pyodide.mjs";

let pyReady = null;
function getPy() {
  if (!pyReady) pyReady = loadPyodide({ indexURL: "/pyodide/" });
  return pyReady;
}

function fmtErr(e) {
  const m = String((e && e.message) || e);
  // Keep only the useful tail of a Python traceback.
  const lines = m.trim().split("\n");
  return lines.slice(-6).join("\n");
}

self.onmessage = async (ev) => {
  const { id, code, stdin, tests } = ev.data;
  try {
    const py = await getPy();
    self.postMessage({ type: "started", id });
    let out = "";
    const add = (s) => { if (out.length < 20000) out += s + "\n"; };
    py.setStdout({ batched: add });
    py.setStderr({ batched: add });
    const lines = String(stdin || "").split("\n");
    let i = 0;
    py.setStdin({ stdin: () => (i < lines.length ? lines[i++] : undefined) });

    const dict = py.globals.get("dict");
    let error = null;
    const ns = dict();
    try {
      py.runPython(code, { globals: ns });
    } catch (e) {
      error = fmtErr(e);
    }
    ns.destroy();

    let results = null;
    if (Array.isArray(tests)) {
      results = [];
      for (const t of tests) {
        const r = { expr: t.expr, expected: t.expected, hidden: !!t.hidden, got: null, pass: false, error: null };
        const tns = dict();
        try {
          py.runPython(code, { globals: tns });
          if (t.setup) py.runPython(t.setup, { globals: tns });
          const got = py.runPython("repr(" + t.expr + ")", { globals: tns });
          r.got = String(got);
          r.pass = r.got === t.expected;
        } catch (e) {
          r.error = fmtErr(e);
        }
        tns.destroy();
        results.push(r);
      }
    }
    dict.destroy();
    self.postMessage({ type: "result", id, stdout: out, error, results });
  } catch (e) {
    self.postMessage({ type: "result", id, stdout: "", error: "Could not start Python: " + fmtErr(e), results: null });
  }
};
