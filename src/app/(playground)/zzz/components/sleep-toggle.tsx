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
  const buttonRef = useRef<HTMLButtonElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(isAsleep ? 1 : 0);
  const startXRef = useRef(0);
  const startProgressRef = useRef(0);

  // Sync with external state changes
  useEffect(() => {
    if (!isDragging) {
      setDragProgress(isAsleep ? 1 : 0);
    }
  }, [isAsleep, isDragging]);

  // Notify parent of drag progress
  useEffect(() => {
    onDragProgress?.(dragProgress);
  }, [dragProgress, onDragProgress]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startProgressRef.current = dragProgress;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !buttonRef.current) return;

    const buttonWidth = buttonRef.current.offsetWidth;
    const knobWidth = 48;
    const maxTravel = buttonWidth - knobWidth - 12; // 6px padding on each side

    const deltaX = e.clientX - startXRef.current;
    const deltaProgress = deltaX / maxTravel;

    let newProgress = startProgressRef.current + deltaProgress;
    newProgress = Math.max(0, Math.min(1, newProgress));

    setDragProgress(newProgress);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    // Determine if we should toggle based on final position
    const threshold = 0.5;
    const shouldBeAsleep = dragProgress >= threshold;

    if (shouldBeAsleep !== isAsleep) {
      onToggle();
    } else {
      // Snap back to original position
      setDragProgress(isAsleep ? 1 : 0);
    }
  };

  // Calculate knob position
  const knobLeft = 6 + dragProgress * 80; // 6px to 86px

  // Calculate icon interpolation
  const showMoon = dragProgress > 0.5;

  return (
    <div className="relative z-20 flex flex-col items-center gap-4 pb-8 pt-4 bg-white">
      <p
        className="text-xs text-neutral-900 italic"
        style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
      >
        My baby is now...
      </p>

      <div className="flex items-center gap-6">
        <span
          className={cn(
            "text-lg font-semibold transition-opacity duration-300 text-neutral-900",
            dragProgress < 0.5 ? "opacity-100" : "opacity-40"
          )}
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Awake
        </span>

        <button
          ref={buttonRef}
          className="relative w-[140px] h-[60px] rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-neutral-400 touch-none"
          aria-label={`Toggle to ${isAsleep ? "awake" : "asleep"}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {/* Gradient background - interpolated based on drag */}
          <div
            className="absolute inset-0"
            style={{ background: getInterpolatedGradient(dragProgress) }}
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
            ref={knobRef}
            className="absolute top-[6px] w-[48px] h-[48px] bg-white rounded-full shadow-lg flex items-center justify-center"
            style={{
              left: `${knobLeft}px`,
              transition: isDragging ? 'none' : 'left 0.3s ease-out'
            }}
          >
            {showMoon ? (
              <Moon
                className="w-5 h-5 text-purple-600 transition-opacity duration-150"
                style={{ opacity: Math.min(1, (dragProgress - 0.5) * 2) }}
              />
            ) : (
              <Sun
                className="w-5 h-5 text-orange-500 transition-opacity duration-150"
                style={{ opacity: Math.min(1, (0.5 - dragProgress) * 2) }}
              />
            )}
          </div>
        </button>

        <span
          className={cn(
            "text-lg font-semibold transition-opacity duration-300 text-neutral-900",
            dragProgress >= 0.5 ? "opacity-100" : "opacity-40"
          )}
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Asleep
        </span>
      </div>
    </div>
  );
}
