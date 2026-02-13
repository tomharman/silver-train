"use client";

interface ColorPaletteProps {
  colours: number[][];
}

function rgbToHex(rgb: number[]): string {
  return '#' + rgb.map(c => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

export function ColorPalette({ colours }: ColorPaletteProps) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-3 text-muted-foreground">
        Extracted Colours
      </h3>
      <div className="flex gap-2">
        {colours.map((colour, i) => (
          <div
            key={i}
            className="w-14 h-14 rounded-lg transition-transform hover:scale-110"
            style={{ backgroundColor: rgbToHex(colour) }}
            title={rgbToHex(colour)}
          />
        ))}
      </div>
    </div>
  );
}
