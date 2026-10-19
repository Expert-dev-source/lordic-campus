import type { PyTest } from "./types";

export type TestResult = { expr: string; expected: string; hidden: boolean; got: string | null; pass: boolean; error: string | null };
export type RunResult = { stdout: string; error: string | null; results: TestResult[] | null; timedOut?: boolean };

const RUN_LIMIT_MS = 10000;
let worker: Worker | null = null;
let counter = 0;

function getWorker(): Worker {
  if (!worker) worker = new Worker("/pyodide-worker.mjs", { type: "module" });
  return worker;
}

/** Runs Python in an isolated Web Worker. The run is aborted after RUN_LIMIT_MS of actual execution. */
export function runPython(code: string, opts: { stdin?: string; tests?: PyTest[] } = {}): Promise<RunResult> {
  return new Promise((resolve) => {
    const w = getWorker();
    const id = ++counter;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const cleanup = () => {
      if (timer) clearTimeout(timer);
      w.removeEventListener("message", onMsg);
      w.removeEventListener("error", onErr);
    };
    const onMsg = (ev: MessageEvent) => {
      const d = ev.data;
      if (d.id !== id) return;
      if (d.type === "started") {
        timer = setTimeout(() => {
          cleanup();
          w.terminate();
          worker = null; // a fresh worker is created on the next run
          resolve({ stdout: "", error: `Stopped: your program ran for more than ${RUN_LIMIT_MS / 1000} seconds. Check for an infinite loop (a while loop whose condition never becomes False).`, results: null, timedOut: true });
        }, RUN_LIMIT_MS);
      } else if (d.type === "result") {
        cleanup();
        resolve({ stdout: d.stdout, error: d.error, results: d.results });
      }
    };
    const onErr = () => {
      cleanup();
      worker = null;
      resolve({ stdout: "", error: "The Python runtime could not be loaded. Make sure the app is served over http(s) and reload the page.", results: null });
    };
    w.addEventListener("message", onMsg);
    w.addEventListener("error", onErr);
    w.postMessage({ id, code, stdin: opts.stdin ?? "", tests: opts.tests });
  });
}
