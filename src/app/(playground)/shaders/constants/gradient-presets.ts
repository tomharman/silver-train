/**
 * Predefined gradient presets for the shader playground
 */

import type { GradientStop } from '../types';

export interface GradientPreset {
  id: string;
  name: string;
  description: string;
  stops: Omit<GradientStop, 'id'>[];  // ID will be generated when applied
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: 'vibrant-sunset',
    name: 'Vibrant Sunset',
    description: 'Warm oranges, pinks, and purples',
    stops: [
      { position: 0.0, color: [1.0, 0.4, 0.0], hardEdge: false },  // Orange
      { position: 0.3, color: [1.0, 0.2, 0.4], hardEdge: false },  // Hot pink
      { position: 0.6, color: [0.8, 0.2, 0.6], hardEdge: false },  // Purple
      { position: 1.0, color: [0.3, 0.1, 0.5], hardEdge: false },  // Deep purple
    ],
  },
  {
    id: 'ocean-depths',
    name: 'Ocean Depths',
    description: 'Cool blues and teals',
    stops: [
      { position: 0.0, color: [0.0, 0.8, 0.9], hardEdge: false },  // Cyan
      { position: 0.4, color: [0.0, 0.5, 0.8], hardEdge: false },  // Blue
      { position: 0.7, color: [0.1, 0.3, 0.6], hardEdge: false },  // Deep blue
      { position: 1.0, color: [0.0, 0.1, 0.3], hardEdge: false },  // Navy
    ],
  },
  {
    id: 'neon-city',
    name: 'Neon City',
    description: 'Electric pinks, blues, and purples',
    stops: [
      { position: 0.0, color: [1.0, 0.0, 1.0], hardEdge: false },  // Magenta
      { position: 0.25, color: [0.5, 0.0, 1.0], hardEdge: false }, // Purple
      { position: 0.5, color: [0.0, 0.5, 1.0], hardEdge: false },  // Blue
      { position: 0.75, color: [0.0, 1.0, 1.0], hardEdge: false }, // Cyan
      { position: 1.0, color: [1.0, 0.0, 0.5], hardEdge: false },  // Hot pink
    ],
  },
  {
    id: 'fire-blaze',
    name: 'Fire Blaze',
    description: 'Intense reds, oranges, and yellows',
    stops: [
      { position: 0.0, color: [1.0, 1.0, 0.0], hardEdge: false },  // Yellow
      { position: 0.3, color: [1.0, 0.6, 0.0], hardEdge: false },  // Orange
      { position: 0.6, color: [1.0, 0.2, 0.0], hardEdge: false },  // Red-orange
      { position: 0.85, color: [0.8, 0.0, 0.0], hardEdge: false }, // Red
      { position: 1.0, color: [0.3, 0.0, 0.0], hardEdge: false },  // Dark red
    ],
  },
  {
    id: 'aurora-borealis',
    name: 'Aurora Borealis',
    description: 'Ethereal greens, blues, and purples',
    stops: [
      { position: 0.0, color: [0.0, 1.0, 0.5], hardEdge: false },  // Bright green
      { position: 0.3, color: [0.0, 0.8, 0.8], hardEdge: false },  // Teal
      { position: 0.6, color: [0.3, 0.5, 1.0], hardEdge: false },  // Light blue
      { position: 0.85, color: [0.6, 0.3, 0.9], hardEdge: false }, // Lavender
      { position: 1.0, color: [0.2, 0.1, 0.4], hardEdge: false },  // Deep purple
    ],
  },
  {
    id: 'pastel-dream',
    name: 'Pastel Dream',
    description: 'Soft pinks, purples, and blues',
    stops: [
      { position: 0.0, color: [1.0, 0.8, 0.9], hardEdge: false },  // Light pink
      { position: 0.35, color: [0.9, 0.7, 1.0], hardEdge: false }, // Lavender
      { position: 0.65, color: [0.7, 0.8, 1.0], hardEdge: false }, // Light blue
      { position: 1.0, color: [0.8, 0.95, 1.0], hardEdge: false }, // Pale cyan
    ],
  },
  {
    id: 'toxic-green',
    name: 'Toxic Green',
    description: 'Radioactive greens and yellows',
    stops: [
      { position: 0.0, color: [0.8, 1.0, 0.0], hardEdge: false },  // Lime
      { position: 0.4, color: [0.0, 1.0, 0.0], hardEdge: false },  // Pure green
      { position: 0.7, color: [0.0, 0.8, 0.3], hardEdge: false },  // Green
      { position: 1.0, color: [0.0, 0.4, 0.2], hardEdge: false },  // Dark green
    ],
  },
  {
    id: 'monochrome-fade',
    name: 'Monochrome Fade',
    description: 'Black to white gradient',
    stops: [
      { position: 0.0, color: [0.0, 0.0, 0.0], hardEdge: false },  // Black
      { position: 0.5, color: [0.5, 0.5, 0.5], hardEdge: false },  // Grey
      { position: 1.0, color: [1.0, 1.0, 1.0], hardEdge: false },  // White
    ],
  },
  {
    id: 'candy-pop',
    name: 'Candy Pop',
    description: 'Sweet pinks, blues, and yellows',
    stops: [
      { position: 0.0, color: [1.0, 0.4, 0.7], hardEdge: false },  // Bubblegum pink
      { position: 0.25, color: [0.9, 0.6, 0.9], hardEdge: false }, // Pink-purple
      { position: 0.5, color: [0.5, 0.7, 1.0], hardEdge: false },  // Baby blue
      { position: 0.75, color: [0.7, 0.9, 1.0], hardEdge: false }, // Light cyan
      { position: 1.0, color: [1.0, 0.9, 0.5], hardEdge: false },  // Lemon
    ],
  },
  {
    id: 'forest-canopy',
    name: 'Forest Canopy',
    description: 'Natural greens and browns',
    stops: [
      { position: 0.0, color: [0.6, 0.9, 0.3], hardEdge: false },  // Light green
      { position: 0.3, color: [0.2, 0.7, 0.2], hardEdge: false },  // Forest green
      { position: 0.6, color: [0.1, 0.5, 0.1], hardEdge: false },  // Dark green
      { position: 0.85, color: [0.3, 0.3, 0.1], hardEdge: false }, // Olive
      { position: 1.0, color: [0.3, 0.2, 0.1], hardEdge: false },  // Brown
    ],
  },
  {
    id: 'retro-wave',
    name: 'Retro Wave',
    description: 'Synthwave purples and magentas',
    stops: [
      { position: 0.0, color: [1.0, 0.0, 0.5], hardEdge: false },  // Hot pink
      { position: 0.35, color: [0.8, 0.0, 0.8], hardEdge: false }, // Magenta
      { position: 0.65, color: [0.4, 0.0, 0.8], hardEdge: false }, // Purple
      { position: 1.0, color: [0.1, 0.0, 0.3], hardEdge: false },  // Deep purple
    ],
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    description: 'Warm golds and ambers',
    stops: [
      { position: 0.0, color: [1.0, 0.95, 0.7], hardEdge: false }, // Pale yellow
      { position: 0.3, color: [1.0, 0.8, 0.3], hardEdge: false },  // Gold
      { position: 0.6, color: [1.0, 0.6, 0.2], hardEdge: false },  // Amber
      { position: 0.85, color: [0.9, 0.4, 0.1], hardEdge: false }, // Orange
      { position: 1.0, color: [0.6, 0.2, 0.0], hardEdge: false },  // Dark orange
    ],
  },
  {
    id: 'cosmic-nebula',
    name: 'Cosmic Nebula',
    description: 'Deep space purples and pinks',
    stops: [
      { position: 0.0, color: [0.1, 0.0, 0.2], hardEdge: false },  // Deep purple
      { position: 0.25, color: [0.4, 0.0, 0.5], hardEdge: false }, // Purple
      { position: 0.5, color: [0.8, 0.1, 0.6], hardEdge: false },  // Magenta
      { position: 0.75, color: [1.0, 0.4, 0.7], hardEdge: false }, // Pink
      { position: 1.0, color: [0.3, 0.5, 0.8], hardEdge: false },  // Blue
    ],
  },
  {
    id: 'lava-flow',
    name: 'Lava Flow',
    description: 'Molten reds and blacks',
    stops: [
      { position: 0.0, color: [1.0, 0.9, 0.0], hardEdge: false },  // Bright yellow
      { position: 0.2, color: [1.0, 0.5, 0.0], hardEdge: false },  // Orange
      { position: 0.5, color: [0.8, 0.0, 0.0], hardEdge: false },  // Red
      { position: 0.75, color: [0.3, 0.0, 0.0], hardEdge: false }, // Dark red
      { position: 1.0, color: [0.05, 0.0, 0.0], hardEdge: false }, // Almost black
    ],
  },
  {
    id: 'ice-crystal',
    name: 'Ice Crystal',
    description: 'Frosty blues and whites',
    stops: [
      { position: 0.0, color: [0.9, 0.95, 1.0], hardEdge: false }, // Ice white
      { position: 0.3, color: [0.7, 0.85, 0.95], hardEdge: false }, // Light blue
      { position: 0.6, color: [0.4, 0.7, 0.9], hardEdge: false },  // Blue
      { position: 0.85, color: [0.2, 0.5, 0.8], hardEdge: false }, // Deep blue
      { position: 1.0, color: [0.1, 0.3, 0.5], hardEdge: false },  // Dark blue
    ],
  },
];

/**
 * Get a preset by ID
 */
export function getPresetById(id: string): GradientPreset | undefined {
  return GRADIENT_PRESETS.find(preset => preset.id === id);
}

/**
 * Convert preset stops to GradientStop objects with unique IDs
 */
export function presetsToGradientStops(preset: GradientPreset): GradientStop[] {
  return preset.stops.map((stop, index) => ({
    ...stop,
    id: `${preset.id}-stop-${index}`,
  }));
}
