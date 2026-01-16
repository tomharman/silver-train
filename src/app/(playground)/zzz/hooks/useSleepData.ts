"use client";

import { useState, useEffect, useCallback } from "react";
import type { SleepData, SleepEntry, DisplayEntry } from "../types";
import { generateId } from "../utils/time";
import { getEstimatedEndTime } from "../utils/estimates";
import seedData from "../data/seed-data.json";

const STORAGE_KEY = "zzz-sleep-data";

export function useSleepData() {
  const [data, setData] = useState<SleepData | null>(null);
  const [now, setNow] = useState(Date.now());

  // Load data from localStorage or seed data
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setData(JSON.parse(stored));
      } else {
        // Use seed data for first-time users
        setData(seedData as SleepData);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
      }
    } catch (error) {
      console.error("Error loading sleep data:", error);
      setData(seedData as SleepData);
    }
  }, []);

  // Update "now" every second for live duration
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (data && typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data]);

  // Check if last toggle was within a minute
  const isQuickToggle = useCallback(() => {
    if (!data || data.entries.length === 0) return false;
    const lastEntry = data.entries[data.entries.length - 1];
    const timeSinceLastToggle = Date.now() - lastEntry.timestamp;
    return timeSinceLastToggle < 60 * 1000; // 1 minute
  }, [data]);

  // Toggle state (awake <-> asleep)
  const toggle = useCallback(() => {
    if (!data) return;

    const newState = data.currentState === "awake" ? "asleep" : "awake";
    const newEntry: SleepEntry = {
      id: generateId(),
      timestamp: Date.now(),
      state: newState,
    };

    setData({
      entries: [...data.entries, newEntry],
      currentState: newState,
    });
  }, [data]);

  // Resolve quick toggle by setting to a specific state and removing short entries
  const resolveQuickToggle = useCallback(
    (targetState: "asleep" | "awake") => {
      if (!data) return;

      const twoMinutesAgo = Date.now() - 2 * 60 * 1000;

      // Filter out entries from the last 2 minutes
      const filteredEntries = data.entries.filter(
        (entry) => entry.timestamp < twoMinutesAgo
      );

      // Add a new entry with the target state if needed
      const lastFilteredEntry = filteredEntries[filteredEntries.length - 1];
      if (!lastFilteredEntry || lastFilteredEntry.state !== targetState) {
        filteredEntries.push({
          id: generateId(),
          timestamp: Date.now(),
          state: targetState,
        });
      }

      setData({
        entries: filteredEntries,
        currentState: targetState,
      });
    },
    [data]
  );

  // Update a specific entry's timestamp
  const updateEntryTime = useCallback(
    (entryId: string, newTimestamp: number) => {
      if (!data) return;

      setData({
        ...data,
        entries: data.entries.map((entry) =>
          entry.id === entryId ? { ...entry, timestamp: newTimestamp } : entry
        ),
      });
    },
    [data]
  );

  // Update a specific entry (timestamp and state)
  const updateEntry = useCallback(
    (entryId: string, newTimestamp: number, newState: "asleep" | "awake") => {
      if (!data) return;

      const updatedEntries = data.entries.map((entry) =>
        entry.id === entryId
          ? { ...entry, timestamp: newTimestamp, state: newState }
          : entry
      );

      // Update currentState to match the last entry's state
      const newCurrentState =
        updatedEntries.length > 0
          ? updatedEntries[updatedEntries.length - 1].state
          : "awake";

      setData({
        entries: updatedEntries,
        currentState: newCurrentState,
      });
    },
    [data]
  );

  // Delete an entry and its corresponding pair
  const deleteEntry = useCallback(
    (entryId: string) => {
      if (!data) return;

      const entryIndex = data.entries.findIndex((e) => e.id === entryId);
      if (entryIndex === -1) return;

      // Remove the entry
      const newEntries = data.entries.filter((e) => e.id !== entryId);

      // If we deleted the last entry, update currentState to match the new last entry
      const newCurrentState =
        newEntries.length > 0
          ? newEntries[newEntries.length - 1].state
          : "awake";

      setData({
        entries: newEntries,
        currentState: newCurrentState,
      });
    },
    [data]
  );

  // Compute display entries with durations
  const displayEntries: DisplayEntry[] = data
    ? data.entries.slice(0, -1).map((entry, index) => {
        const nextEntry = data.entries[index + 1];
        return {
          ...entry,
          duration: nextEntry ? nextEntry.timestamp - entry.timestamp : null,
          endTimestamp: nextEntry ? nextEntry.timestamp : null,
        };
      })
    : [];

  // Get the active entry (last one)
  const activeEntry = data?.entries[data.entries.length - 1] || null;

  // Calculate estimated end time
  const estimatedEndTime =
    data && activeEntry
      ? getEstimatedEndTime(
          data.entries,
          data.currentState,
          activeEntry.timestamp
        )
      : null;

  return {
    data,
    displayEntries,
    activeEntry,
    currentState: data?.currentState || "awake",
    now,
    estimatedEndTime,
    toggle,
    updateEntryTime,
    updateEntry,
    deleteEntry,
    isQuickToggle,
    resolveQuickToggle,
  };
}
