import type { SleepEntry } from "../types";
import { isSameDay } from "./time";

// Calculate estimated wake/sleep time based on previous day's patterns
export function getEstimatedEndTime(
  entries: SleepEntry[],
  currentState: "asleep" | "awake",
  startTimestamp: number
): number | null {
  if (entries.length < 4) return null;

  const startDate = new Date(startTimestamp);
  const startHour = startDate.getHours();
  const startMinutes = startDate.getMinutes();

  // Find entries from previous days at similar times
  const similarEntries: { duration: number }[] = [];

  for (let i = 0; i < entries.length - 1; i++) {
    const entry = entries[i];
    const nextEntry = entries[i + 1];

    // Skip if not the same state
    if (entry.state !== currentState) continue;

    // Skip if same day as current
    if (isSameDay(new Date(entry.timestamp), startDate)) continue;

    const entryDate = new Date(entry.timestamp);
    const entryHour = entryDate.getHours();
    const entryMinutes = entryDate.getMinutes();

    // Check if within 2 hours of current time of day
    const currentMinutesOfDay = startHour * 60 + startMinutes;
    const entryMinutesOfDay = entryHour * 60 + entryMinutes;
    const timeDiff = Math.abs(currentMinutesOfDay - entryMinutesOfDay);

    if (timeDiff <= 120) {
      const duration = nextEntry.timestamp - entry.timestamp;
      similarEntries.push({ duration });
    }
  }

  if (similarEntries.length === 0) return null;

  // Calculate average duration
  const avgDuration =
    similarEntries.reduce((sum, e) => sum + e.duration, 0) /
    similarEntries.length;

  return startTimestamp + avgDuration;
}
