"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from "react";
import type { Product } from "@/lib/types";
import { MAX_COMPARE_ITEMS } from "@/lib/compare";

/** Snapshot taken at the moment a product is added to the compare list -
 * just enough to render the tray without a fetch. The /compare page itself
 * re-fetches every product fresh from the catalog, so a stale price here
 * (someone leaves the tab open while a price changes) never reaches the
 * actual comparison - this is only ever a "what have I picked" summary. */
export interface CompareEntry {
  id: string;
  slug: string;
  title: string;
  icon: Product["icon"];
  category: Product["category"];
  photos?: string[];
  price: number;
}

interface CompareState {
  entries: CompareEntry[];
}

type CompareAction =
  | { type: "TOGGLE"; entry: CompareEntry }
  | { type: "REMOVE"; id: string }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; entries: CompareEntry[] };

const STORAGE_KEY = "8x-amazon-rebuild:compare";

function reducer(state: CompareState, action: CompareAction): CompareState {
  switch (action.type) {
    case "TOGGLE": {
      const exists = state.entries.some((e) => e.id === action.entry.id);
      if (exists) return { entries: state.entries.filter((e) => e.id !== action.entry.id) };
      if (state.entries.length >= MAX_COMPARE_ITEMS) return state;
      return { entries: [...state.entries, action.entry] };
    }
    case "REMOVE":
      return { entries: state.entries.filter((e) => e.id !== action.id) };
    case "CLEAR":
      return { entries: [] };
    case "HYDRATE":
      return { entries: action.entries };
    default:
      return state;
  }
}

interface CompareContextValue {
  entries: CompareEntry[];
  count: number;
  isComparing: (id: string) => boolean;
  canAddMore: boolean;
  toggle: (entry: CompareEntry) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { entries: [] });
  // Same hydration-guard pattern as CartProvider: without it, the persist
  // effect fires once with the reducer's pre-hydration empty state and
  // overwrites real localStorage data with an empty list.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          dispatch({ type: "HYDRATE", entries: parsed.slice(0, MAX_COMPARE_ITEMS) });
        }
      }
    } catch {
      // localStorage unavailable - compare list just starts empty
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.entries));
    } catch {
      // ignore write failures (private browsing, storage full, etc.)
    }
  }, [state.entries, hydrated]);

  const value = useMemo<CompareContextValue>(
    () => ({
      entries: state.entries,
      count: state.entries.length,
      isComparing: (id) => state.entries.some((e) => e.id === id),
      canAddMore: state.entries.length < MAX_COMPARE_ITEMS,
      toggle: (entry) => dispatch({ type: "TOGGLE", entry }),
      remove: (id) => dispatch({ type: "REMOVE", id }),
      clear: () => dispatch({ type: "CLEAR" }),
    }),
    [state.entries]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within a CompareProvider");
  return ctx;
}
