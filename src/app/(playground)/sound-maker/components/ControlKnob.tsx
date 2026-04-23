"use client";

import { useEffect, useRef, useState } from "react";

interface ControlKnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  step?: number;
  unit?: string;
  exponential?: boolean;
}

export function ControlKnob({
  label,
  value,
  min,
  max,
  onChange,
  step = 0.01,
  unit = "",
  exponential = false,
}: ControlKnobProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ y: 0, value: 0 });

  const normalizedValue = exponential
    ? (Math.log(value) - Math.log(min)) / (Math.log(max) - Math.log(min))
    : (value - min) / (max - min);

  const angle = normalizedValue * 270 - 135; // -135° to 135°

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { y: e.clientY, value };
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const deltaY = dragStartRef.current.y - e.clientY;
    const sensitivity = (max - min) / 200;

    let newValue = dragStartRef.current.value + deltaY * sensitivity;
    newValue = Math.max(min, Math.min(max, newValue));

    onChange(newValue);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  const displayValue = exponential
    ? Math.round(value)
    : step >= 1
    ? Math.round(value)
    : value.toFixed(2);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative cursor-ns-resize select-none"
        onMouseDown={handleMouseDown}
        style={{ width: 80, height: 80 }}
      >
        {/* Knob background */}
        <svg width="80" height="80" viewBox="0 0 80 80">
          {/* Background arc */}
          <path
            d="M 20 67 A 30 30 0 1 1 60 67"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            className="text-muted opacity-20"
          />
          {/* Value arc */}
          <path
            d="M 20 67 A 30 30 0 1 1 60 67"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${normalizedValue * 94.2} 94.2`}
            className="text-foreground transition-all"
          />
          {/* Center circle */}
          <circle
            cx="40"
            cy="40"
            r="24"
            fill="currentColor"
            className="text-background"
            stroke="currentColor"
            strokeWidth="2"
          />
          {/* Indicator line */}
          <line
            x1="40"
            y1="40"
            x2="40"
            y2="20"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-foreground"
            transform={`rotate(${angle} 40 40)`}
          />
        </svg>
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="text-xs text-muted-foreground">
          {displayValue}
          {unit}
        </div>
      </div>
    </div>
  );
}
