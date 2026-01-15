export interface Particle {
  // Current position
  x: number;
  y: number;

  // Home position (where particle should return to)
  homeX: number;
  homeY: number;

  // Velocity for smooth movement
  vx: number;
  vy: number;

  // Visual properties
  color: number; // PIXI color (0xRRGGBB)
  colorIndex: number; // Which color palette entry (0-4)
  alpha: number; // 0-1
  scale: number; // Subtle size variation

  // Noise offset for unique movement
  noiseOffsetX: number;
  noiseOffsetY: number;

  // Interaction state
  isRepelled: boolean; // Currently being repelled by mouse
  isDispersed: boolean; // Scattered from click

  // Animation state
  isForming: boolean; // Initial formation animation
  formProgress: number; // 0-1, progress of formation animation
  randomStartX: number; // Random starting position for formation
  randomStartY: number; // Random starting position for formation
}

export interface ParticleData {
  x: number;
  y: number;
  color: number; // PIXI color format (0xRRGGBB)
  brightness: number; // 0-255, used for color palette assignment
}

export interface ParticleSystemConfig {
  // Movement parameters
  driftSpeed: number; // Base drift speed
  driftFrequency: number; // Noise frequency
  driftAmplitude: number; // Noise amplitude
  returnSpeed: number; // Speed returning to home position

  // Interaction parameters
  repulsionRadius: number; // Mouse repulsion distance
  repulsionStrength: number; // Force strength
  disperseRadius: number; // Click scatter distance
  disperseSpeed: number; // Scatter velocity
  reformDelay: number; // Delay before returning (ms)

  // Visual parameters
  particleSize: number; // Base particle radius
  colorPalette: number[]; // Array of colors (1-5 colors)
  useImageColors: boolean; // If false, use colorPalette instead
}

export interface EngineState {
  particles: Particle[];
  mouseX: number;
  mouseY: number;
  isMouseDown: boolean;
  disperseTime: number;
  fps: number;
}

export interface UIState {
  particleCount: number;
  fps: number;
  isAnimating: boolean;
}
