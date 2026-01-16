"use client";

import { Sun, Moon } from "lucide-react";
import type { DisplayEntry } from "../types";
import { formatDuration, formatTime } from "../utils/time";

interface SleepRowProps {
  entry: DisplayEntry;
  onEditTime: (entry: DisplayEntry) => void;
  showTimestamp?: boolean;
}

export function SleepRow({ entry, onEditTime, showTimestamp = true }: SleepRowProps) {
  const isAsleep = entry.state === "asleep";
  const duration = entry.duration ? formatDuration(entry.duration) : null;
  const time = formatTime(entry.timestamp);

  return (
    <div className="relative">
      {/* Timestamp separator line */}
      {showTimestamp && (
        <div className="flex items-center gap-3 px-6 pt-4 pb-1">
          <div className="flex-1 h-px bg-neutral-200/80" />
          <button
            onClick={() => onEditTime(entry)}
            className="text-xs font-medium tracking-wider text-neutral-400 uppercase hover:text-neutral-600 transition-colors"
            style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
          >
            {time}
          </button>
        </div>
      )}

      {/* Row content */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Duration */}
          <div className="flex items-baseline gap-0">
            {duration ? (
              <>
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
                <span
                  className="text-4xl font-bold tracking-tight text-neutral-900"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  {duration.minutes}
                </span>
                <span
                  className="text-sm font-medium text-neutral-900 ml-0.5"
                  style={{ fontFamily: "var(--font-inter)" }}
                >
                  M
                </span>
              </>
            ) : (
              <span className="text-4xl font-bold tracking-tight text-neutral-400">
                --
              </span>
            )}
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
      </div>
    </div>
  );
}
