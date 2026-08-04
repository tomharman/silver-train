"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

type Listener = () => void;

/**
 * localStorage is an external store, so it is read through
 * `useSyncExternalStore` rather than an effect. That keeps the server-rendered
 * HTML on the default value and lets React swap in the saved one after
 * hydration, with no mismatch and no cascading render.
 */
const snapshots = new Map<string, unknown>();
const listeners = new Map<string, Set<Listener>>();

function read<T>(key: string, fallback: T): T {
  if (!snapshots.has(key)) {
    let value = fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) value = JSON.parse(raw) as T;
    } catch {
      // Unreadable or corrupt: the default is a perfectly good answer.
    }
    snapshots.set(key, value);
  }
  return snapshots.get(key) as T;
}

function write<T>(key: string, value: T): void {
  snapshots.set(key, value);
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing or a full quota — not worth interrupting a game for.
  }
  listeners.get(key)?.forEach((listener) => listener());
}

export function useStoredState<T>(key: string, initialValue: T) {
  // Frozen on first render so the server snapshot keeps a stable identity.
  const fallback = useRef(initialValue);

  const subscribe = useCallback(
    (listener: Listener) => {
      let set = listeners.get(key);
      if (!set) {
        set = new Set();
        listeners.set(key, set);
      }
      set.add(listener);
      return () => {
        set.delete(listener);
      };
    },
    [key],
  );

  const value = useSyncExternalStore(
    subscribe,
    () => read(key, fallback.current),
    () => fallback.current,
  );

  const setValue = useCallback(
    (next: T | ((current: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (current: T) => T)(read(key, fallback.current))
          : next;
      write(key, resolved);
    },
    [key],
  );

  return [value, setValue] as const;
}
