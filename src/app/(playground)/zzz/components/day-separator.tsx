"use client";

import { formatTime, getDayLabel } from "../utils/time";

interface DaySeparatorProps {
  timestamp: number;
  entryId?: string;
  onEditTime?: (entryId: string) => void;
  currentState?: "asleep" | "awake";
}

export function DaySeparator({
  timestamp,
  entryId,
  onEditTime,
  currentState = "awake",
}: DaySeparatorProps) {
  const dayLabel = getDayLabel(timestamp);
  const time = formatTime(timestamp);

  const handleTimeClick = () => {
    if (entryId && onEditTime) {
      onEditTime(entryId);
    }
  };

  // Background colors for each state - match phone frame background
  const bgColor = currentState === "asleep" ? "bg-[#FFF5F8]" : "bg-[#FFF8F0]";

  return (
    <div className={`sticky top-0 z-10 px-6 py-2 transition-colors duration-500 ${bgColor}`}>
      <div className="flex items-center gap-3">
        <span
          className="text-xs font-medium tracking-wider text-neutral-500 uppercase whitespace-nowrap"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {dayLabel}
        </span>

        {/* Zigzag line */}
        <div className="flex-1 h-3 overflow-hidden">
          <svg
            className="w-full h-full"
            viewBox="0 0 200 12"
            preserveAspectRatio="none"
          >
            <path
              d="M0 6 L4 2 L8 10 L12 2 L16 10 L20 2 L24 10 L28 2 L32 10 L36 2 L40 10 L44 2 L48 10 L52 2 L56 10 L60 2 L64 10 L68 2 L72 10 L76 2 L80 10 L84 2 L88 10 L92 2 L96 10 L100 2 L104 10 L108 2 L112 10 L116 2 L120 10 L124 2 L128 10 L132 2 L136 10 L140 2 L144 10 L148 2 L152 10 L156 2 L160 10 L164 2 L168 10 L172 2 L176 10 L180 2 L184 10 L188 2 L192 10 L196 2 L200 6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-neutral-300"
            />
          </svg>
        </div>

        {entryId && onEditTime ? (
          <button
            onClick={handleTimeClick}
            className="text-xs font-medium tracking-wider text-neutral-400 uppercase whitespace-nowrap hover:text-neutral-600 transition-colors"
            style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
          >
            {time}
          </button>
        ) : (
          <span
            className="text-xs font-medium tracking-wider text-neutral-400 uppercase whitespace-nowrap"
            style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
          >
            {time}
          </span>
        )}
      </div>
    </div>
  );
}
