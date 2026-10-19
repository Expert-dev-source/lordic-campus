"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_STATE, merge, type State } from "./state";

export * from "./state";

const KEY = "lordic-campus-v1";

type Ctx = { state: State; ready: boolean; update: (fn: (s: State) => State) => void; reset: () => void; importJson: (json: string) => string | null; exportJson: () => string };
const StoreCtx = createContext<Ctx | null>(null);
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState(merge(JSON.parse(raw)));
    } catch {
      /* corrupted or unavailable storage: start fresh */
    }
    loaded.current = true;
    setReady(true);
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked */
    }
  }, [state]);

  const update = useCallback((fn: (s: State) => State) => setState((s) => fn(s)), []);
  const reset = useCallback(() => setState(DEFAULT_STATE), []);
  const exportJson = useCallback(() => JSON.stringify(state, null, 2), [state]);
  const importJson = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json);
      if (!parsed || typeof parsed !== "object" || parsed.version !== 1) return "This file is not a Lordic Campus export.";
      setState(merge(parsed));
      return null;
    } catch {
      return "The file could not be read.";
    }
  }, []);

  const value = useMemo(() => ({ state, ready, update, reset, importJson, exportJson }), [state, ready, update, reset, importJson, exportJson]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}

