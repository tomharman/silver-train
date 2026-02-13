'use client';

/**
 * Full-featured gradient editor component
 * Allows adding, removing, repositioning, and editing gradient stops
 */

import { useState, useRef, useCallback } from 'react';
import { ColorPickerPopover } from './color-picker-popover';
import { rgbToHex, type RGB } from '../utils/color-utils';
import type { GradientStop } from '../types';

export interface GradientEditorProps {
  /** Current gradient stops */
  stops: GradientStop[];
  /** Callback when stops change */
  onStopsChange: (stops: GradientStop[]) => void;
  /** Optional label */
  label?: string;
}

export function GradientEditor({ stops, onStopsChange, label }: GradientEditorProps) {
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [draggingStopId, setDraggingStopId] = useState<string | null>(null);
  const gradientBarRef = useRef<HTMLDivElement>(null);

  // Generate CSS gradient string for preview
  const generateGradientCSS = useCallback(() => {
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    const colorStops = sortedStops.map((stop) => {
      const hex = rgbToHex(stop.color);
      const pos = `${(stop.position * 100).toFixed(1)}%`;
      if (stop.hardEdge) {
        // For hard edges, create two stops at nearly the same position
        const nextStop = sortedStops[sortedStops.indexOf(stop) + 1];
        if (nextStop) {
          return `${hex} ${pos}, ${hex} ${pos}`;
        }
      }
      return `${hex} ${pos}`;
    });
    return `linear-gradient(to right, ${colorStops.join(', ')})`;
  }, [stops]);

  // Add a new stop at clicked position
  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gradientBarRef.current) return;
    const rect = gradientBarRef.current.getBoundingClientRect();
    const position = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

    // Interpolate colour from existing gradient
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);
    let color: RGB = [0.5, 0.5, 0.5]; // default grey

    // Find surrounding stops
    for (let i = 0; i < sortedStops.length - 1; i++) {
      if (position >= sortedStops[i].position && position <= sortedStops[i + 1].position) {
        const t =
          (position - sortedStops[i].position) /
          (sortedStops[i + 1].position - sortedStops[i].position);
        color = [
          sortedStops[i].color[0] + (sortedStops[i + 1].color[0] - sortedStops[i].color[0]) * t,
          sortedStops[i].color[1] + (sortedStops[i + 1].color[1] - sortedStops[i].color[1]) * t,
          sortedStops[i].color[2] + (sortedStops[i + 1].color[2] - sortedStops[i].color[2]) * t,
        ];
        break;
      }
    }

    const newStop: GradientStop = {
      id: `stop-${Date.now()}`,
      position,
      color,
      hardEdge: false,
    };

    onStopsChange([...stops, newStop]);
    setSelectedStopId(newStop.id);
  };

  // Start dragging a stop
  const handleStopMouseDown = (stopId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDraggingStopId(stopId);
    setSelectedStopId(stopId);
  };

  // Handle mouse move during drag
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingStopId || !gradientBarRef.current) return;

      const rect = gradientBarRef.current.getBoundingClientRect();
      const position = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));

      onStopsChange(
        stops.map((stop) =>
          stop.id === draggingStopId ? { ...stop, position } : stop
        )
      );
    },
    [draggingStopId, stops, onStopsChange]
  );

  // Stop dragging
  const handleMouseUp = useCallback(() => {
    setDraggingStopId(null);
  }, []);

  // Set up drag listeners
  useState(() => {
    if (draggingStopId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  });

  // Delete a stop (minimum 2 required)
  const handleDeleteStop = (stopId: string) => {
    if (stops.length <= 2) return;
    onStopsChange(stops.filter((stop) => stop.id !== stopId));
    if (selectedStopId === stopId) {
      setSelectedStopId(null);
    }
  };

  // Update stop colour
  const handleColorChange = (stopId: string, color: RGB) => {
    onStopsChange(
      stops.map((stop) => (stop.id === stopId ? { ...stop, color } : stop))
    );
  };

  // Toggle hard edge
  const handleToggleHardEdge = (stopId: string) => {
    onStopsChange(
      stops.map((stop) =>
        stop.id === stopId ? { ...stop, hardEdge: !stop.hardEdge } : stop
      )
    );
  };

  // Update position via input
  const handlePositionChange = (stopId: string, position: number) => {
    onStopsChange(
      stops.map((stop) =>
        stop.id === stopId ? { ...stop, position: Math.max(0, Math.min(1, position / 100)) } : stop
      )
    );
  };

  // Export gradient as JSON
  const handleExport = () => {
    const json = JSON.stringify(stops, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gradient.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import gradient from JSON
  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedStops = JSON.parse(event.target?.result as string);
          if (Array.isArray(importedStops) && importedStops.length >= 2) {
            onStopsChange(importedStops);
          }
        } catch (error) {
          console.error('Failed to import gradient:', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const sortedStops = [...stops].sort((a, b) => a.position - b.position);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      {label && <h3 className="text-sm font-medium text-white">{label}</h3>}

      {/* Gradient bar with stops */}
      <div className="relative">
        <div
          ref={gradientBarRef}
          className="relative h-12 cursor-crosshair rounded-lg border border-white/10 shadow-inner"
          style={{ background: generateGradientCSS() }}
          onClick={handleBarClick}
        >
          {/* Stop markers */}
          {stops.map((stop) => (
            <div
              key={stop.id}
              className={`absolute top-0 h-full w-1 -translate-x-1/2 cursor-ew-resize transition-opacity ${
                selectedStopId === stop.id ? 'opacity-100' : 'opacity-70 hover:opacity-100'
              }`}
              style={{ left: `${stop.position * 100}%` }}
              onMouseDown={(e) => handleStopMouseDown(stop.id, e)}
            >
              <div className="absolute top-full mt-1 flex flex-col items-center gap-1">
                <div
                  className={`h-4 w-4 rounded-full border-2 shadow-lg ${
                    selectedStopId === stop.id
                      ? 'border-white ring-2 ring-white/50'
                      : 'border-white/60'
                  }`}
                  style={{ backgroundColor: rgbToHex(stop.color) }}
                />
                {stop.hardEdge && (
                  <div className="h-1 w-1 rounded-full bg-yellow-400" title="Hard edge" />
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-2 text-xs text-white/50">
          Click the gradient bar to add a stop, drag stops to reposition
        </p>
      </div>

      {/* Stops list */}
      <div className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-3">
        {sortedStops.map((stop) => (
          <div
            key={stop.id}
            className={`flex items-center gap-3 rounded-lg border p-2 transition-colors ${
              selectedStopId === stop.id
                ? 'border-white/30 bg-white/10'
                : 'border-white/10 bg-white/5'
            }`}
            onClick={() => setSelectedStopId(stop.id)}
          >
            {/* Colour picker */}
            <ColorPickerPopover
              color={stop.color}
              onColorChange={(color) => handleColorChange(stop.id, color)}
            />

            {/* Position input */}
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={Math.round(stop.position * 100)}
                  onChange={(e) => handlePositionChange(stop.id, parseFloat(e.target.value))}
                  className="w-16 rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:border-white/20 focus:outline-none"
                  min="0"
                  max="100"
                  step="1"
                />
                <span className="text-xs text-white/60">%</span>
              </div>

              {/* Hard edge toggle */}
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={stop.hardEdge}
                  onChange={() => handleToggleHardEdge(stop.id)}
                  className="h-3 w-3 rounded border-white/20 bg-white/10"
                />
                <span className="text-xs text-white/60">Hard edge</span>
              </label>
            </div>

            {/* Delete button */}
            <button
              onClick={() => handleDeleteStop(stop.id)}
              disabled={stops.length <= 2}
              className="rounded p-1 text-white/40 transition-colors hover:bg-red-500/20 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
              title={stops.length <= 2 ? 'Minimum 2 stops required' : 'Delete stop'}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4H3.5C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Import/Export buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleImport}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
        >
          Import JSON
        </button>
        <button
          onClick={handleExport}
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
        >
          Export JSON
        </button>
      </div>
    </div>
  );
}
