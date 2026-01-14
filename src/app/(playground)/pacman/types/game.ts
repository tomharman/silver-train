// Core position and movement types
export interface Position {
  x: number; // Pixel coordinates
  y: number;
  tileX: number; // Grid coordinates
  tileY: number;
}

export interface Velocity {
  x: number;
  y: number;
}

export enum Direction {
  Up = 0,
  Down = 1,
  Left = 2,
  Right = 3,
  None = 4,
}

// Tile types for maze
export enum TileType {
  Empty = 0,
  Wall = 1,
  Dot = 2,
  PowerPellet = 3,
  GhostHouseGate = 4,
  Tunnel = 5,
  SpeedBoost = 6, // Enhanced feature
  BonusItem = 7, // Enhanced feature
}

// Maze configuration
export interface MazeConfig {
  width: number; // 28 tiles
  height: number; // 31 tiles
  tileSize: number; // 16 pixels
  layout: TileType[][];
}

// Game states
export enum GameState {
  Initializing = "initializing",
  Ready = "ready",
  Playing = "playing",
  Paused = "paused",
  LevelComplete = "level_complete",
  LifeLost = "life_lost",
  GameOver = "game_over",
}

// Ghost modes
export enum GhostMode {
  Chase = "chase",
  Scatter = "scatter",
  Frightened = "frightened",
  Eaten = "eaten",
}

// Ghost personalities
export enum GhostPersonality {
  Blinky = "blinky", // Red - direct chase
  Pinky = "pinky", // Pink - ambush
  Inky = "inky", // Cyan - flank
  Clyde = "clyde", // Orange - random/shy
}

// Pacman state
export interface PacmanState {
  position: Position;
  velocity: Velocity;
  currentDirection: Direction;
  nextDirection: Direction; // Input buffer
  speed: number;
  lives: number;
  isPoweredUp: boolean;
  powerUpTimer: number;
  animationFrame: number;
}

// Ghost state
export interface GhostState {
  position: Position;
  velocity: Velocity;
  currentDirection: Direction;
  speed: number;
  mode: GhostMode;
  personality: GhostPersonality;
  targetTile: Position;
  modeTimer: number;
}

// Game state
export interface Game {
  state: GameState;
  score: number;
  highScore: number;
  level: number;
  pacman: PacmanState;
  ghosts: GhostState[];
  maze: MazeConfig;
  dotsRemaining: number;
  ghostsEatenInSequence: number; // For 200/400/800/1600 scoring
  // Power-ups (enhanced features)
  activeSpeedBoost: boolean;
  speedBoostTimer: number;
  activeDoublePoints: boolean;
  doublePointsTimer: number;
}

// UI state (throttled updates to React)
export interface UIState {
  score: number;
  lives: number;
  level: number;
  state: GameState;
  fps: number;
}

// Debug info
export interface DebugInfo {
  fps: number;
  pacmanPos: Position;
  pacmanDir: Direction;
  ghostsInfo: Array<{
    personality: GhostPersonality;
    mode: GhostMode;
    position: Position;
    targetTile: Position;
  }>;
  activePowerUps: string[];
}
