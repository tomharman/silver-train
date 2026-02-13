/**
 * Colour utility functions for shader playground
 * Handles RGB/HSL conversion, luminosity/saturation boosting, and interpolation
 */

export type RGB = [number, number, number];  // 0-1 range
export type HSL = [number, number, number];  // H: 0-360, S: 0-1, L: 0-1

/**
 * Convert RGB (0-1) to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const [r, g, b] = rgb;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / delta + 2) / 6;
        break;
      case b:
        h = ((r - g) / delta + 4) / 6;
        break;
    }
  }

  return [h * 360, s, l];
}

/**
 * Convert HSL to RGB (0-1)
 */
export function hslToRgb(hsl: HSL): RGB {
  const [h, s, l] = [hsl[0] / 360, hsl[1], hsl[2]];

  if (s === 0) {
    return [l, l, l];  // Achromatic
  }

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = hue2rgb(p, q, h + 1/3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1/3);

  return [r, g, b];
}

/**
 * Boost luminosity of an RGB colour
 * @param rgb - Input colour in 0-1 range
 * @param boost - Multiplier for luminosity (1.0 = no change, >1.0 = brighter)
 * @returns Boosted RGB colour
 */
export function boostLuminosity(rgb: RGB, boost: number): RGB {
  if (boost === 1.0) return rgb;

  const hsl = rgbToHsl(rgb);
  hsl[2] = Math.min(1.0, hsl[2] * boost);  // Clamp at 1.0
  return hslToRgb(hsl);
}

/**
 * Boost saturation of an RGB colour
 * @param rgb - Input colour in 0-1 range
 * @param boost - Multiplier for saturation (1.0 = no change, >1.0 = more saturated)
 * @returns Boosted RGB colour
 */
export function boostSaturation(rgb: RGB, boost: number): RGB {
  if (boost === 1.0) return rgb;

  const hsl = rgbToHsl(rgb);
  hsl[1] = Math.min(1.0, hsl[1] * boost);  // Clamp at 1.0
  return hslToRgb(hsl);
}

/**
 * Apply both luminosity and saturation boosts
 */
export function boostColour(
  rgb: RGB,
  luminosityBoost: number,
  saturationBoost: number
): RGB {
  let result = rgb;

  if (luminosityBoost !== 1.0) {
    result = boostLuminosity(result, luminosityBoost);
  }

  if (saturationBoost !== 1.0) {
    result = boostSaturation(result, saturationBoost);
  }

  return result;
}

/**
 * Convert RGB (0-1) to hex string
 */
export function rgbToHex(rgb: RGB): string {
  return '#' + rgb.map(c => {
    const hex = Math.round(c * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Convert hex string to RGB (0-1)
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex colour: ${hex}`);
  }
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
}

/**
 * Linear interpolation between two colours
 */
export function lerpColour(a: RGB, b: RGB, t: number): RGB {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

/**
 * Get luminance of an RGB colour (perceived brightness)
 * Using relative luminance formula from WCAG
 */
export function getLuminance(rgb: RGB): number {
  const [r, g, b] = rgb.map(c => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Check if a colour is "dark" (luminance below threshold)
 */
export function isDarkColour(rgb: RGB, threshold = 0.5): boolean {
  return getLuminance(rgb) < threshold;
}
