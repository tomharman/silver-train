"use client";

import { useRef, useEffect, useState } from "react";
import type { DisplayEntry } from "../types";
import { SleepRow } from "./sleep-row";
import { DaySeparator } from "./day-separator";
import { ActiveRow } from "./active-row";
import { getStartOfDay } from "../utils/time";

interface SleepFeedProps {
  entries: DisplayEntry[];
  currentState: "asleep" | "awake";
  activeStartTimestamp: number | null;
  activeEntryId: string | null;
  now: number;
  estimatedEndTime: number | null;
  onEditTime: (entry: DisplayEntry) => void;
  onScrollProgress?: (progress: number) => void; // 0 = at bottom, 1 = scrolled up
}

export function SleepFeed({
  entries,
  currentState,
  activeStartTimestamp,
  activeEntryId,
  now,
  estimatedEndTime,
  onEditTime,
  onScrollProgress,
}: SleepFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [flashActive, setFlashActive] = useState(false);
  const prevEntriesLength = useRef(entries.length);

  // Track scroll position and calculate scroll progress
  useEffect(() => {
    const element = scrollRef.current;
    if (!element || !onScrollProgress) return;

    const handleScroll = () => {
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;
      const maxScroll = scrollHeight - clientHeight;

      if (maxScroll <= 0) {
        onScrollProgress(0); // No scroll possible, at bottom
        return;
      }

      // Calculate scroll progress: 0 = at bottom (scrollTop = maxScroll), 1 = at top (scrollTop = 0)
      const progress = Math.max(0, Math.min(1, (maxScroll - scrollTop) / maxScroll));
      onScrollProgress(progress);
    };

    element.addEventListener("scroll", handleScroll);
    // Initial check
    handleScroll();

    return () => element.removeEventListener("scroll", handleScroll);
  }, [onScrollProgress]);

  // Scroll to bottom on mount
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  // Scroll to bottom and flash when entries change (toggle happened)
  useEffect(() => {
    if (entries.length !== prevEntriesLength.current) {
      prevEntriesLength.current = entries.length;

      // Scroll to bottom
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }

      // Flash the active row
      setFlashActive(true);
      const timer = setTimeout(() => setFlashActive(false), 600);
      return () => clearTimeout(timer);
    }
  }, [entries.length]);

  // Also scroll to bottom when current state changes (ensures scroll after any toggle)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentState]);

  // Group entries by day (oldest first for rendering)
  const entriesByDay = groupEntriesByDay(entries);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto"
    >
      <div className="flex flex-col">
        {entriesByDay.map(({ dayTimestamp, dayEntries }) => (
          <div key={dayTimestamp} className="relative">
            {/* Sticky day header */}
            <DaySeparator
              timestamp={dayTimestamp}
              entryId={dayEntries[0]?.id}
              onEditTime={(entryId) => {
                const entry = dayEntries.find((e) => e.id === entryId);
                if (entry) onEditTime(entry);
              }}
              currentState={currentState}
            />

            {/* Entries for this day */}
            {dayEntries.map((entry, index) => (
              <SleepRow
                key={entry.id}
                entry={entry}
                onEditTime={onEditTime}
                showTimestamp={index > 0} // First entry timestamp shown in day header
              />
            ))}
          </div>
        ))}

        {/* Active row at the bottom */}
        {activeStartTimestamp && (
          <ActiveRow
            state={currentState}
            startTimestamp={activeStartTimestamp}
            now={now}
            estimatedEndTime={estimatedEndTime}
            flash={flashActive}
            activeEntryId={activeEntryId || undefined}
            onEditTime={onEditTime}
          />
        )}
      </div>
    </div>
  );
}

// Helper to group entries by day
function groupEntriesByDay(entries: DisplayEntry[]): {
  dayTimestamp: number;
  dayEntries: DisplayEntry[];
}[] {
  const groups: Map<number, DisplayEntry[]> = new Map();

  for (const entry of entries) {
    const dayStart = getStartOfDay(entry.timestamp);
    const existing = groups.get(dayStart) || [];
    existing.push(entry);
    groups.set(dayStart, existing);
  }

  // Sort by day (oldest first) and entries within day by timestamp
  return Array.from(groups.entries())
    .sort(([a], [b]) => a - b)
    .map(([dayTimestamp, dayEntries]) => ({
      dayTimestamp: dayEntries[0].timestamp, // Use first entry's timestamp for header
      dayEntries: dayEntries.sort((a, b) => a.timestamp - b.timestamp),
    }));
}
