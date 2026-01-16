"use client";

import { useEffect, useState } from "react";

interface GradientOverlayProps {
  currentState: "asleep" | "awake";
}

export function GradientOverlay({ currentState }: GradientOverlayProps) {
  const isAsleep = currentState === "asleep";
  const [animationPhase, setAnimationPhase] = useState(0);

  // Subtle animation for gradient
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationPhase((prev) => (prev + 1) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Calculate subtle offset for animation
  const offset = Math.sin((animationPhase * Math.PI) / 180) * 3;

  const gradientStyle = isAsleep
    ? {
        background: `linear-gradient(
          to top,
          rgba(126, 34, 206, 1) 0%,
          rgba(147, 51, 234, 0.98) ${10 + offset}%,
          rgba(168, 85, 247, 0.9) ${25 + offset}%,
          rgba(192, 132, 252, 0.6) ${50 + offset}%,
          rgba(255, 248, 240, 0) 100%
        )`,
      }
    : {
        background: `linear-gradient(
          to top,
          rgba(234, 88, 12, 1) 0%,
          rgba(249, 115, 22, 0.98) ${10 + offset}%,
          rgba(251, 146, 60, 0.9) ${25 + offset}%,
          rgba(253, 186, 116, 0.6) ${50 + offset}%,
          rgba(255, 248, 240, 0) 100%
        )`,
      };

  return (
    <div
      className="absolute bottom-0 left-0 right-0 h-[45%] pointer-events-none z-10 transition-colors duration-700"
      style={gradientStyle}
    >
      {/* Noise texture overlay using CSS */}
      <div
        className="absolute inset-0 opacity-30 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />
    </div>
  );
}
