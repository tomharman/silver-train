import type { ParticleSystemConfig } from "../types/particle";

// Based on reference image: subtle shimmer effect, not large flowing movements
export const DEFAULT_PARTICLE_CONFIG: ParticleSystemConfig = {
  // Movement - balanced for visible drift while maintaining recognizable form
  driftSpeed: 0.8, // Increased from 0.3 for more movement
  driftFrequency: 0.008, // Higher frequency = finer grain noise (shimmer, not flow)
  driftAmplitude: 10, // Reduced from 20 to keep particles closer to home for clearer image
  returnSpeed: 0.6, // Stronger pull to maintain recognizable form

  // Interaction
  repulsionRadius: 120, // Medium-range repulsion
  repulsionStrength: 100, // Reduced by half for subtler interaction
  disperseRadius: 300, // Wide scatter area
  disperseSpeed: 400, // Fast scatter (feels dynamic)
  reformDelay: 800, // Brief pause before returning (ms)

  // Visual - doubled resolution for clearer detail
  particleSize: 0.5, // Back to 0.5 for better visibility
  colorPalette: [0xe8e8e8], // Light gray (will be theme-aware)
  useImageColors: false, // Default to custom palette
};

export const getDefaultColorPalette = (
  theme: "light" | "dark"
): string[] => {
  return theme === "dark" ? ["#E8E8E8"] : ["#1a1a1a"];
};

export const hexToPixiColor = (hex: string): number => {
  // Remove # if present
  const cleanHex = hex.replace("#", "");
  return parseInt(cleanHex, 16);
};

export const pixiColorToHex = (color: number): string => {
  return `#${color.toString(16).padStart(6, "0").toUpperCase()}`;
};
