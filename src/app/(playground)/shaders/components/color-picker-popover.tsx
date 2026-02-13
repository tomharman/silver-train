'use client';

/**
 * Colour picker popover component for editing gradient stop colours
 * Uses native HTML5 colour input with RGB slider controls for fine-tuning
 */

import { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { rgbToHex, hexToRgb, type RGB } from '../utils/color-utils';

export interface ColorPickerPopoverProps {
  /** Current colour in RGB (0-1 range) */
  color: RGB;
  /** Callback when colour changes */
  onColorChange: (color: RGB) => void;
  /** Optional label for the trigger button */
  label?: string;
  /** Custom trigger element (if not provided, uses colour swatch) */
  children?: React.ReactNode;
}

export function ColorPickerPopover({
  color,
  onColorChange,
  label,
  children,
}: ColorPickerPopoverProps) {
  const [localColor, setLocalColor] = useState<RGB>(color);
  const [hexValue, setHexValue] = useState(rgbToHex(color));

  // Update local state when prop changes
  useEffect(() => {
    setLocalColor(color);
    setHexValue(rgbToHex(color));
  }, [color]);

  const handleHexChange = (hex: string) => {
    setHexValue(hex);
    try {
      const rgb = hexToRgb(hex);
      setLocalColor(rgb);
      onColorChange(rgb);
    } catch (error) {
      // Invalid hex, ignore
    }
  };

  const handleRgbChange = (channel: 0 | 1 | 2, value: number) => {
    const newColor: RGB = [...localColor] as RGB;
    newColor[channel] = value;
    setLocalColor(newColor);
    setHexValue(rgbToHex(newColor));
    onColorChange(newColor);
  };

  const channelLabels = ['R', 'G', 'B'];
  const channelColors = ['#ef4444', '#10b981', '#3b82f6']; // red, green, blue

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        {children || (
          <button
            className="relative h-10 w-10 rounded-lg border-2 border-white/20 shadow-lg transition-all hover:scale-105 hover:border-white/40 focus:outline-none focus:ring-2 focus:ring-white/50"
            style={{ backgroundColor: rgbToHex(color) }}
            aria-label={label || 'Pick colour'}
          >
            {label && (
              <span className="sr-only">{label}</span>
            )}
          </button>
        )}
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-72 rounded-xl border border-white/10 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-sm"
          sideOffset={8}
        >
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">
                {label || 'Colour Picker'}
              </h3>
              <Popover.Close className="rounded p-1 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  />
                </svg>
              </Popover.Close>
            </div>

            {/* Colour preview */}
            <div
              className="h-20 rounded-lg border border-white/10 shadow-inner"
              style={{ backgroundColor: hexValue }}
            />

            {/* Hex input with native colour picker */}
            <div className="flex gap-2">
              <input
                type="color"
                value={hexValue}
                onChange={(e) => handleHexChange(e.target.value)}
                className="h-10 w-10 cursor-pointer rounded border border-white/10 bg-transparent"
              />
              <input
                type="text"
                value={hexValue}
                onChange={(e) => handleHexChange(e.target.value)}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 focus:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
                placeholder="#000000"
                maxLength={7}
              />
            </div>

            {/* RGB sliders */}
            <div className="flex flex-col gap-3">
              {channelLabels.map((label, index) => (
                <div key={label} className="flex items-center gap-3">
                  <span
                    className="w-4 text-xs font-bold"
                    style={{ color: channelColors[index] }}
                  >
                    {label}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={localColor[index]}
                    onChange={(e) =>
                      handleRgbChange(index as 0 | 1 | 2, parseFloat(e.target.value))
                    }
                    className="flex-1"
                    style={{
                      accentColor: channelColors[index],
                    }}
                  />
                  <span className="w-12 text-right text-xs text-white/60">
                    {Math.round(localColor[index] * 255)}
                  </span>
                </div>
              ))}
            </div>

            {/* RGB values display */}
            <div className="flex justify-between rounded-lg bg-white/5 px-3 py-2 text-xs text-white/60">
              <span>
                RGB({Math.round(localColor[0] * 255)}, {Math.round(localColor[1] * 255)},{' '}
                {Math.round(localColor[2] * 255)})
              </span>
            </div>
          </div>

          <Popover.Arrow className="fill-gray-900/95" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
