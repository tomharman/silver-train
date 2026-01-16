"use client";

import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";

interface SleepToggleProps {
  currentState: "asleep" | "awake";
  onToggle: () => void;
  onDragProgress?: (progress: number) => void; // 0 = awake, 1 = asleep
}

// Orange gradient colors
const AWAKE_COLORS = {
  start: { r: 234, g: 88, b: 12 },
  mid: { r: 249, g: 115, b: 22 },
  end: { r: 251, g: 146, b: 60 },
};

// Purple gradient colors
const ASLEEP_COLORS = {
  start: { r: 124, g: 34, b: 206 },
  mid: { r: 147, g: 51, b: 234 },
  end: { r: 168, g: 85, b: 247 },
};

function lerp(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

function getInterpolatedGradient(progress: number) {
  const start = {
    r: lerp(AWAKE_COLORS.start.r, ASLEEP_COLORS.start.r, progress),
    g: lerp(AWAKE_COLORS.start.g, ASLEEP_COLORS.start.g, progress),
    b: lerp(AWAKE_COLORS.start.b, ASLEEP_COLORS.start.b, progress),
  };
  const mid = {
    r: lerp(AWAKE_COLORS.mid.r, ASLEEP_COLORS.mid.r, progress),
    g: lerp(AWAKE_COLORS.mid.g, ASLEEP_COLORS.mid.g, progress),
    b: lerp(AWAKE_COLORS.mid.b, ASLEEP_COLORS.mid.b, progress),
  };
  const end = {
    r: lerp(AWAKE_COLORS.end.r, ASLEEP_COLORS.end.r, progress),
    g: lerp(AWAKE_COLORS.end.g, ASLEEP_COLORS.end.g, progress),
    b: lerp(AWAKE_COLORS.end.b, ASLEEP_COLORS.end.b, progress),
  };

  return `linear-gradient(135deg, rgb(${start.r}, ${start.g}, ${start.b}) 0%, rgb(${mid.r}, ${mid.g}, ${mid.b}) 50%, rgb(${end.r}, ${end.g}, ${end.b}) 100%)`;
}

export function SleepToggle({ currentState, onToggle, onDragProgress }: SleepToggleProps) {
  const isAsleep = currentState === "asleep";
  const [progress, setProgress] = useState(isAsleep ? 1 : 0);

  // Animate progress when state changes
  useEffect(() => {
    const targetProgress = isAsleep ? 1 : 0;
    setProgress(targetProgress);
  }, [isAsleep]);

  // Notify parent of progress for gradient preview
  useEffect(() => {
    onDragProgress?.(progress);
  }, [progress, onDragProgress]);

  const handleClick = () => {
    onToggle();
  };

  // Calculate knob position
  const knobLeft = 6 + progress * 80; // 6px to 86px

  // Calculate icon interpolation
  const showMoon = progress > 0.5;

  return (
    <div className="sticky bottom-0 z-20 flex flex-col items-center gap-4 pb-8 pt-4 bg-white">
      <p
        className="text-xs text-neutral-900 italic"
        style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
      >
        My baby is now...
      </p>

      <div className="flex items-center gap-6">
        <span
          className={cn(
            "text-lg font-semibold transition-opacity duration-500 text-neutral-900",
            progress < 0.5 ? "opacity-100" : "opacity-40"
          )}
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Awake
        </span>

        <button
          className="relative w-[140px] h-[60px] rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-neutral-400 cursor-pointer touch-none"
          aria-label={`Toggle to ${isAsleep ? "awake" : "asleep"}`}
          onMouseDown={(e) => {
            e.preventDefault();
            handleClick();
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            handleClick();
          }}
        >
          {/* Gradient background - interpolated based on progress */}
          <div
            className="absolute inset-0 transition-all duration-500 ease-in-out"
            style={{ background: getInterpolatedGradient(progress) }}
          />

          {/* Noise texture overlay */}
          <svg className="absolute inset-0 w-full h-full opacity-50 mix-blend-overlay pointer-events-none">
            <filter id="toggle-noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.8"
                numOctaves="4"
                stitchTiles="stitch"
              />
            </filter>
            <rect width="100%" height="100%" filter="url(#toggle-noise)" />
          </svg>

          {/* Toggle knob */}
          <div
            className="absolute top-[6px] w-[48px] h-[48px] bg-white rounded-full shadow-lg flex items-center justify-center transition-all duration-500 ease-in-out"
            style={{ left: `${knobLeft}px` }}
          >
            {showMoon ? (
              <Moon
                className="w-5 h-5 text-purple-600 transition-opacity duration-300"
                style={{ opacity: Math.min(1, (progress - 0.5) * 2) }}
              />
            ) : (
              <Sun
                className="w-5 h-5 text-orange-500 transition-opacity duration-300"
                style={{ opacity: Math.min(1, (0.5 - progress) * 2) }}
              />
            )}
          </div>
        </button>

        <span
          className={cn(
            "text-lg font-semibold transition-opacity duration-500 text-neutral-900",
            progress >= 0.5 ? "opacity-100" : "opacity-40"
          )}
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Asleep
        </span>
      </div>
    </div>
  );
}
