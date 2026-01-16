"use client";

import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";
import { formatTime } from "../utils/time";
import type { DisplayEntry } from "../types";

interface ActiveRowProps {
  state: "asleep" | "awake";
  startTimestamp: number;
  now: number;
  estimatedEndTime: number | null;
  flash?: boolean;
  activeEntryId?: string;
  onEditTime?: (entry: DisplayEntry) => void;
}

// Format duration with seconds for active row
function formatDurationWithSeconds(ms: number): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  // Ensure we never show negative values
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

export function ActiveRow({
  state,
  startTimestamp,
  now,
  estimatedEndTime,
  flash = false,
  activeEntryId,
  onEditTime,
}: ActiveRowProps) {
  const isAsleep = state === "asleep";
  const elapsed = now - startTimestamp;
  const duration = formatDurationWithSeconds(elapsed);
  const startTime = formatTime(startTimestamp);

  const handleTimeClick = () => {
    if (activeEntryId && onEditTime) {
      // Create a minimal DisplayEntry for the active row
      onEditTime({
        id: activeEntryId,
        timestamp: startTimestamp,
        state,
        duration: null,
        endTimestamp: null,
      });
    }
  };

  return (
    <div
      className={cn(
        "relative z-20 transition-opacity duration-300",
        flash && "animate-pulse"
      )}
    >
      {/* Timestamp line above active row */}
      <div className="flex items-center gap-3 px-6 pt-4 pb-1">
        <div className="flex-1 h-px bg-neutral-300/50" />
        {activeEntryId && onEditTime ? (
          <button
            onClick={handleTimeClick}
            className="text-xs font-medium tracking-wider text-neutral-500 uppercase hover:text-neutral-700 transition-colors"
            style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
          >
            {startTime}
          </button>
        ) : (
          <span
            className="text-xs font-medium tracking-wider text-neutral-500 uppercase"
            style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
          >
            {startTime}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between">
          {/* Duration with H M S */}
          <div className="flex items-baseline gap-0">
            {duration.hours > 0 && (
              <>
                <span
                  className="text-4xl font-bold tracking-tight text-neutral-900"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {duration.hours}
                </span>
                <span
                  className="text-sm font-medium text-neutral-900 ml-0.5 mr-2"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  H
                </span>
              </>
            )}
            {(duration.hours > 0 || duration.minutes > 0) && (
              <>
                <span
                  className="text-4xl font-bold tracking-tight text-neutral-900"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {duration.minutes}
                </span>
                <span
                  className="text-sm font-medium text-neutral-900 ml-0.5 mr-2"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  M
                </span>
              </>
            )}
            <span
              className="text-4xl font-bold tracking-tight text-neutral-900"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {duration.seconds}
            </span>
            <span
              className="text-sm font-medium text-neutral-900 ml-0.5"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              S
            </span>
          </div>

          {/* State label with icon */}
          <div className="flex items-center gap-2">
            {isAsleep ? (
              <Moon className="w-4 h-4 text-neutral-900" />
            ) : (
              <Sun className="w-4 h-4 text-neutral-900" />
            )}
            <span
              className="text-base font-medium text-neutral-900"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {isAsleep ? "Asleep" : "Awake"}
            </span>
          </div>
        </div>

        {/* Estimated time */}
        {estimatedEndTime && (
          <p
            className="mt-3 text-xs text-neutral-900 text-center italic"
            style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
          >
            Estimated {isAsleep ? "wake" : "sleep"} time{" "}
            {formatTime(estimatedEndTime)}
          </p>
        )}
      </div>
    </div>
  );
}
