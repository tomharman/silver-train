"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface ShaderControlsProps {
  speed: number;
  scale: number;
  complexity: number;
  onSpeedChange: (value: number) => void;
  onScaleChange: (value: number) => void;
  onComplexityChange: (value: number) => void;
}

export function ShaderControls({
  speed,
  scale,
  complexity,
  onSpeedChange,
  onScaleChange,
  onComplexityChange,
}: ShaderControlsProps) {
  return (
    <div className="space-y-6 p-4 border rounded-lg">
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Speed: {speed.toFixed(1)}x
        </Label>
        <Slider
          value={[speed]}
          min={0.1}
          max={3}
          step={0.1}
          onValueChange={([value]) => onSpeedChange(value)}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Scale: {scale.toFixed(1)}
        </Label>
        <Slider
          value={[scale]}
          min={0.5}
          max={5}
          step={0.1}
          onValueChange={([value]) => onScaleChange(value)}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">
          Complexity: {complexity}
        </Label>
        <Slider
          value={[complexity]}
          min={1}
          max={10}
          step={1}
          onValueChange={([value]) => onComplexityChange(value)}
        />
      </div>
    </div>
  );
}
