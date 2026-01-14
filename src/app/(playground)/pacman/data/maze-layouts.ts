import { TileType } from "../types/game";

// Maze layout constants
export const MAZE_WIDTH = 28;
export const MAZE_HEIGHT = 31;
export const TILE_SIZE = 16;

// Shorthand for tile types
const E = TileType.Empty;
const W = TileType.Wall;
const D = TileType.Dot;
const P = TileType.PowerPellet;
const G = TileType.GhostHouseGate;
const T = TileType.Tunnel;

/**
 * Classic Pacman maze layout (28×31 tiles)
 * This is a simplified version based on the original arcade game
 */
export const CLASSIC_MAZE: TileType[][] = [
  // Row 0
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
  // Row 1
  [W, D, D, D, D, D, D, D, D, D, D, D, D, W, W, D, D, D, D, D, D, D, D, D, D, D, D, W],
  // Row 2
  [W, D, W, W, W, W, D, W, W, W, W, W, D, W, W, D, W, W, W, W, W, D, W, W, W, W, D, W],
  // Row 3
  [W, P, W, W, W, W, D, W, W, W, W, W, D, W, W, D, W, W, W, W, W, D, W, W, W, W, P, W],
  // Row 4
  [W, D, W, W, W, W, D, W, W, W, W, W, D, W, W, D, W, W, W, W, W, D, W, W, W, W, D, W],
  // Row 5
  [W, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, W],
  // Row 6
  [W, D, W, W, W, W, D, W, W, D, W, W, W, W, W, W, W, W, D, W, W, D, W, W, W, W, D, W],
  // Row 7
  [W, D, W, W, W, W, D, W, W, D, W, W, W, W, W, W, W, W, D, W, W, D, W, W, W, W, D, W],
  // Row 8
  [W, D, D, D, D, D, D, W, W, D, D, D, D, W, W, D, D, D, D, W, W, D, D, D, D, D, D, W],
  // Row 9
  [W, W, W, W, W, W, D, W, W, W, W, W, E, W, W, E, W, W, W, W, W, D, W, W, W, W, W, W],
  // Row 10
  [W, W, W, W, W, W, D, W, W, W, W, W, E, W, W, E, W, W, W, W, W, D, W, W, W, W, W, W],
  // Row 11
  [W, W, W, W, W, W, D, W, W, E, E, E, E, E, E, E, E, E, E, W, W, D, W, W, W, W, W, W],
  // Row 12
  [W, W, W, W, W, W, D, W, W, E, W, W, W, G, G, W, W, W, E, W, W, D, W, W, W, W, W, W],
  // Row 13 - Ghost house
  [W, W, W, W, W, W, D, W, W, E, W, E, E, E, E, E, E, W, E, W, W, D, W, W, W, W, W, W],
  // Row 14
  [T, E, E, E, E, E, D, E, E, E, W, E, E, E, E, E, E, W, E, E, E, D, E, E, E, E, E, T],
  // Row 15 - Ghost house
  [W, W, W, W, W, W, D, W, W, E, W, E, E, E, E, E, E, W, E, W, W, D, W, W, W, W, W, W],
  // Row 16
  [W, W, W, W, W, W, D, W, W, E, W, W, W, W, W, W, W, W, E, W, W, D, W, W, W, W, W, W],
  // Row 17
  [W, W, W, W, W, W, D, W, W, E, E, E, E, E, E, E, E, E, E, W, W, D, W, W, W, W, W, W],
  // Row 18
  [W, W, W, W, W, W, D, W, W, E, W, W, W, W, W, W, W, W, E, W, W, D, W, W, W, W, W, W],
  // Row 19
  [W, W, W, W, W, W, D, W, W, E, W, W, W, W, W, W, W, W, E, W, W, D, W, W, W, W, W, W],
  // Row 20
  [W, D, D, D, D, D, D, D, D, D, D, D, D, W, W, D, D, D, D, D, D, D, D, D, D, D, D, W],
  // Row 21
  [W, D, W, W, W, W, D, W, W, W, W, W, D, W, W, D, W, W, W, W, W, D, W, W, W, W, D, W],
  // Row 22
  [W, D, W, W, W, W, D, W, W, W, W, W, D, W, W, D, W, W, W, W, W, D, W, W, W, W, D, W],
  // Row 23
  [W, P, D, D, W, W, D, D, D, D, D, D, D, E, E, D, D, D, D, D, D, D, W, W, D, D, P, W],
  // Row 24
  [W, W, W, D, W, W, D, W, W, D, W, W, W, W, W, W, W, W, D, W, W, D, W, W, D, W, W, W],
  // Row 25
  [W, W, W, D, W, W, D, W, W, D, W, W, W, W, W, W, W, W, D, W, W, D, W, W, D, W, W, W],
  // Row 26
  [W, D, D, D, D, D, D, W, W, D, D, D, D, W, W, D, D, D, D, W, W, D, D, D, D, D, D, W],
  // Row 27
  [W, D, W, W, W, W, W, W, W, W, W, W, D, W, W, D, W, W, W, W, W, W, W, W, W, W, D, W],
  // Row 28
  [W, D, W, W, W, W, W, W, W, W, W, W, D, W, W, D, W, W, W, W, W, W, W, W, W, W, D, W],
  // Row 29
  [W, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, W],
  // Row 30
  [W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W, W],
];

// Pacman starting position (tile coordinates)
export const PACMAN_START_TILE = { x: 14, y: 23 };

// Ghost starting positions (tile coordinates)
export const GHOST_START_TILES = {
  blinky: { x: 14, y: 11 },
  pinky: { x: 14, y: 14 },
  inky: { x: 12, y: 14 },
  clyde: { x: 16, y: 14 },
};

// Scatter target corners for ghosts
export const SCATTER_TARGETS = {
  blinky: { x: 25, y: 0 },  // Top-right
  pinky: { x: 2, y: 0 },   // Top-left
  inky: { x: 27, y: 30 },  // Bottom-right
  clyde: { x: 0, y: 30 },  // Bottom-left
};

/**
 * Count total dots in maze for win condition
 */
export function countDots(maze: TileType[][]): number {
  let count = 0;
  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === TileType.Dot || maze[y][x] === TileType.PowerPellet) {
        count++;
      }
    }
  }
  return count;
}
