/**
 * Game constants for Pacman
 * Based on classic arcade game mechanics
 */

// Rendering
export const TARGET_FPS = 60;
export const TILE_SIZE = 24; // Increased from 16 to fill viewport better

// Movement speeds (pixels per frame at 60 FPS) - reduced by 50%
export const PACMAN_NORMAL_SPEED = 1.25;
export const PACMAN_POWERED_SPEED = 1.25;
export const PACMAN_SPEED_BOOST = 1.75; // Enhanced feature

export const GHOST_NORMAL_SPEED = 1.15;
export const GHOST_FRIGHTENED_SPEED = 0.75;
export const GHOST_TUNNEL_SPEED = 0.65;
export const GHOST_EATEN_SPEED = 2.0;

// Timers (in milliseconds)
export const POWER_PELLET_DURATION = 6000; // 6 seconds
export const SPEED_BOOST_DURATION = 5000; // 5 seconds (enhanced)
export const DOUBLE_POINTS_DURATION = 10000; // 10 seconds (enhanced)

// Ghost mode timers (classic arcade pattern)
export const GHOST_MODE_TIMERS = [
  { chase: 7000, scatter: 20000 },  // Wave 1
  { chase: 7000, scatter: 20000 },  // Wave 2
  { chase: 5000, scatter: 20000 },  // Wave 3
  { chase: 5000, scatter: 999999 }, // Wave 4 - infinite chase
];

// Scoring
export const POINTS_DOT = 10;
export const POINTS_POWER_PELLET = 50;
export const POINTS_GHOST_BASE = 200; // 200, 400, 800, 1600 for consecutive eats
export const POINTS_BONUS_ITEM = [100, 300, 500, 700, 1000, 2000, 3000, 5000]; // By level
export const POINTS_EXTRA_LIFE = 0; // Just awards a life
export const POINTS_SPEED_BOOST = 0; // No points, just effect

// Lives
export const STARTING_LIVES = 3;
export const MAX_LIVES = 5;
export const EXTRA_LIFE_SCORE = 10000; // Award extra life at this score

// Power-up spawn chances (enhanced features)
export const SPEED_BOOST_SPAWN_CHANCE = 0.05; // 5% per dot collected
export const BONUS_ITEM_DOTS_THRESHOLD = [70, 170]; // Appear after these dot counts
export const EXTRA_LIFE_SPAWN_CHANCE = 0.02; // 2% (rare)

// Animation
export const PACMAN_MOUTH_ANIMATION_SPEED = 6; // Frames per animation frame
export const GHOST_ANIMATION_SPEED = 10;

// Collision detection radii (in pixels) - scaled for 24px tiles
export const PACMAN_RADIUS = 10;
export const GHOST_RADIUS = 10;
export const DOT_RADIUS = 3;
export const POWER_PELLET_RADIUS = 6;

// Colors
export const COLORS = {
  wall: "#2121ff",
  dot: "#ffb8ae",
  powerPellet: "#ffb8ae",
  pacman: "#ffff00",
  blinky: "#ff0000",    // Red
  pinky: "#ffb8ff",     // Pink
  inky: "#00ffff",      // Cyan
  clyde: "#ffb851",     // Orange
  frightened: "#2121de", // Blue when frightened
  eaten: "#ffffff",      // White eyes
  background: "#000000",
  text: "#ffffff",
};

// Debug
export const DEBUG_SHOW_HITBOXES = false;
export const DEBUG_SHOW_TARGET_TILES = false;
export const DEBUG_SHOW_GRID = false;
