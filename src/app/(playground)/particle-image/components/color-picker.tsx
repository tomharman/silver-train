"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ColorPickerProps {
  colorPalette: string[]; // Hex values (e.g., ["#E8E8E8"])
  useImageColors: boolean;
  onColorChange: (palette: string[]) => void;
  onUseImageColorsChange: (useImageColors: boolean) => void;
}

export function ColorPicker({
  colorPalette,
  useImageColors,
  onColorChange,
  onUseImageColorsChange,
}: ColorPickerProps) {
  const [numColors, setNumColors] = useState(colorPalette.length);
  const [localPalette, setLocalPalette] = useState(colorPalette);

  // Sync local palette with props
  useEffect(() => {
    setLocalPalette(colorPalette);
    setNumColors(colorPalette.length);
  }, [colorPalette]);

  const handleNumColorsChange = (value: string) => {
    const newNum = parseInt(value, 10);
    setNumColors(newNum);

    // Adjust palette size
    const newPalette = [...localPalette];
    if (newNum > newPalette.length) {
      // Add more colors (use white as default)
      while (newPalette.length < newNum) {
        newPalette.push("#FFFFFF");
      }
    } else {
      // Remove colors
      newPalette.splice(newNum);
    }

    setLocalPalette(newPalette);
    onColorChange(newPalette);
  };

  const handleColorChange = (index: number, value: string) => {
    // Validate hex format
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;

    // Update local state immediately for responsive typing
    const newPalette = [...localPalette];
    newPalette[index] = value;
    setLocalPalette(newPalette);

    // Only call parent if valid hex
    if (hexPattern.test(value)) {
      onColorChange(newPalette);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Color Settings</h3>
      </div>

      {/* Number of colors selector */}
      <div className="flex items-center gap-3">
        <Label htmlFor="num-colors" className="text-sm">
          Colors:
        </Label>
        <Select
          value={numColors.toString()}
          onValueChange={handleNumColorsChange}
          disabled={useImageColors}
        >
          <SelectTrigger id="num-colors" className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5].map((n) => (
              <SelectItem key={n} value={n.toString()}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Hex input for each color */}
      <div className="flex flex-wrap gap-3">
        {localPalette.map((color, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              type="text"
              value={color}
              onChange={(e) => handleColorChange(i, e.target.value)}
              className="w-24 font-mono text-sm"
              placeholder="#FFFFFF"
              disabled={useImageColors}
            />
            {/* Color preview swatch */}
            <div
              className="w-8 h-8 rounded border border-muted"
              style={{
                backgroundColor: color.match(/^#[0-9A-Fa-f]{6}$/)
                  ? color
                  : "#000000",
              }}
            />
          </div>
        ))}
      </div>

      {/* Toggle for image colors vs palette */}
      <div className="flex items-center gap-2 pt-2 border-t">
        <Checkbox
          id="use-image-colors"
          checked={useImageColors}
          onCheckedChange={(checked) =>
            onUseImageColorsChange(checked === true)
          }
        />
        <Label htmlFor="use-image-colors" className="text-sm cursor-pointer">
          Use original image colors
        </Label>
      </div>
    </div>
  );
}
