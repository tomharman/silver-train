"use client";

import { useEffect, useRef } from "react";
import { fractalNoise2D } from "../utils/simplex-noise";

interface MeshGradientProps {
  currentState: "asleep" | "awake";
  dragProgress?: number; // 0 = awake, 1 = asleep, for live preview during drag
  scrollProgress?: number; // 0 = at bottom, 1 = scrolled up
}

// Color palettes for each state
const COLORS = {
  awake: [
    { r: 234, g: 88, b: 12 },   // orange-600
    { r: 249, g: 115, b: 22 },  // orange-500
    { r: 251, g: 146, b: 60 },  // orange-400
    { r: 253, g: 186, b: 116 }, // orange-300
  ],
  asleep: [
    { r: 126, g: 34, b: 206 },  // purple-700
    { r: 147, g: 51, b: 234 },  // purple-600
    { r: 168, g: 85, b: 247 },  // purple-500
    { r: 192, g: 132, b: 252 }, // purple-400
  ],
};

interface Blob {
  x: number;
  y: number;
  radius: number;
  color: { r: number; g: number; b: number };
  noiseOffsetX: number;
  noiseOffsetY: number;
  speed: number;
}

export function MeshGradient({ currentState, dragProgress, scrollProgress }: MeshGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const blobsRef = useRef<Blob[]>([]);
  const timeRef = useRef(0);
  const targetColorsRef = useRef(COLORS[currentState]);
  const dragProgressRef = useRef(dragProgress);
  const scrollProgressRef = useRef(scrollProgress ?? 0);
  const bounceRef = useRef(0); // For liquid bounce effect
  const prevStateRef = useRef(currentState);

  // Update drag progress ref
  useEffect(() => {
    dragProgressRef.current = dragProgress;
  }, [dragProgress]);

  // Update scroll progress ref
  useEffect(() => {
    scrollProgressRef.current = scrollProgress ?? 0;
  }, [scrollProgress]);

  // Initialize blobs
  useEffect(() => {
    const colors = COLORS[currentState];
    blobsRef.current = [
      {
        x: 0.3,
        y: 0.7,
        radius: 0.8, // Increased from 0.6
        color: { ...colors[0] },
        noiseOffsetX: Math.random() * 1000,
        noiseOffsetY: Math.random() * 1000,
        speed: 0.00006,
      },
      {
        x: 0.7,
        y: 0.8,
        radius: 0.7, // Increased from 0.5
        color: { ...colors[1] },
        noiseOffsetX: Math.random() * 1000,
        noiseOffsetY: Math.random() * 1000,
        speed: 0.00008,
      },
      {
        x: 0.5,
        y: 0.9,
        radius: 0.75, // Increased from 0.55
        color: { ...colors[2] },
        noiseOffsetX: Math.random() * 1000,
        noiseOffsetY: Math.random() * 1000,
        speed: 0.00007,
      },
      {
        x: 0.2,
        y: 0.95,
        radius: 0.65, // Increased from 0.45
        color: { ...colors[3] },
        noiseOffsetX: Math.random() * 1000,
        noiseOffsetY: Math.random() * 1000,
        speed: 0.00009,
      },
    ];
  }, []);

  // Update target colors and trigger bounce when state changes
  useEffect(() => {
    targetColorsRef.current = COLORS[currentState];
    if (prevStateRef.current !== currentState) {
      bounceRef.current = 1; // Trigger bounce
      prevStateRef.current = currentState;
    }
  }, [currentState]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    // Set canvas size
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    // Easing function for bounce
    const easeOutElastic = (t: number): number => {
      if (t === 0 || t === 1) return t;
      const p = 0.4;
      return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      timeRef.current += 16; // ~60fps

      // Decay bounce effect
      if (bounceRef.current > 0) {
        bounceRef.current = Math.max(0, bounceRef.current - 0.008);
      }

      // Calculate bounce offset
      const bounceAmount = easeOutElastic(1 - bounceRef.current) - 1;
      const bounceOffset = bounceAmount * 0.15; // Max 15% vertical offset

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Calculate target colors based on drag progress or state
      const progress = dragProgressRef.current;
      blobsRef.current.forEach((blob, i) => {
        let targetColor: { r: number; g: number; b: number };

        if (progress !== undefined) {
          // During drag, interpolate between awake and asleep colors
          const awakeColor = COLORS.awake[i];
          const asleepColor = COLORS.asleep[i];
          targetColor = {
            r: lerp(awakeColor.r, asleepColor.r, progress),
            g: lerp(awakeColor.g, asleepColor.g, progress),
            b: lerp(awakeColor.b, asleepColor.b, progress),
          };
          // Faster lerp during drag for responsiveness
          const colorLerpSpeed = 0.08;
          blob.color.r = lerp(blob.color.r, targetColor.r, colorLerpSpeed);
          blob.color.g = lerp(blob.color.g, targetColor.g, colorLerpSpeed);
          blob.color.b = lerp(blob.color.b, targetColor.b, colorLerpSpeed);
        } else {
          // Normal state-based animation
          targetColor = targetColorsRef.current[i];
          const colorLerpSpeed = 0.015;
          blob.color.r = lerp(blob.color.r, targetColor.r, colorLerpSpeed);
          blob.color.g = lerp(blob.color.g, targetColor.g, colorLerpSpeed);
          blob.color.b = lerp(blob.color.b, targetColor.b, colorLerpSpeed);
        }
      });

      // Update blob positions using noise - bigger movements for more impact
      blobsRef.current.forEach((blob) => {
        const time = timeRef.current * blob.speed;
        blob.x = 0.5 + fractalNoise2D(blob.noiseOffsetX + time, 0, 2, 0.5) * 0.45; // Increased from 0.3
        blob.y = 0.75 + fractalNoise2D(0, blob.noiseOffsetY + time, 2, 0.5) * 0.25 + bounceOffset; // Increased from 0.15
      });

      // Draw blobs with radial gradients
      blobsRef.current.forEach((blob) => {
        const x = blob.x * width;
        const y = blob.y * height;
        const radius = blob.radius * Math.max(width, height);

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const { r, g, b } = blob.color;

        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.85)`);
        gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, 0.6)`);
        gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, 0.3)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      });

      // Apply vertical fade using background color for seamless blend
      // Use #FFF8F0 (rgb(255, 248, 240)) for awake background
      const fadeGradient = ctx.createLinearGradient(0, 0, 0, height);
      fadeGradient.addColorStop(0, `rgba(255, 248, 240, 1)`); // Background color at top
      fadeGradient.addColorStop(0.3, `rgba(255, 248, 240, 0.7)`);
      fadeGradient.addColorStop(0.6, `rgba(255, 248, 240, 0)`);
      fadeGradient.addColorStop(1, `rgba(255, 248, 240, 0)`);

      ctx.fillStyle = fadeGradient;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Calculate gradient container height based on scroll progress
  // At bottom (scrollProgress = 0): 50% height (largest/most vibrant)
  // Scrolled to top (scrollProgress = 1): 20% height
  const minHeight = 20; // Height when scrolled to top
  const maxHeight = 50; // Height when at bottom
  const heightPercent = maxHeight - (scrollProgress ?? 0) * (maxHeight - minHeight);

  return (
    <div
      className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
      style={{ height: `${heightPercent}%` }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ filter: "blur(5px)" }}
      />
      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-0 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />
    </div>
  );
}
