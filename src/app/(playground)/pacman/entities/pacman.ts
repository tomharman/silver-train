import type { PacmanState, Direction, MazeConfig } from "../types/game";
import { TileType } from "../types/game";
import { TILE_SIZE, PACMAN_NORMAL_SPEED, STARTING_LIVES } from "../data/game-constants";
import { PACMAN_START_TILE } from "../data/maze-layouts";

/**
 * Pacman entity implementation
 * Handles movement, collision, and state
 */
export class Pacman {
  public state: PacmanState;

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): PacmanState {
    return {
      position: {
        x: PACMAN_START_TILE.x * TILE_SIZE + TILE_SIZE / 2,
        y: PACMAN_START_TILE.y * TILE_SIZE + TILE_SIZE / 2,
        tileX: PACMAN_START_TILE.x,
        tileY: PACMAN_START_TILE.y,
      },
      velocity: { x: 0, y: 0 },
      currentDirection: 4, // None
      nextDirection: 4, // None
      speed: PACMAN_NORMAL_SPEED,
      lives: STARTING_LIVES,
      isPoweredUp: false,
      powerUpTimer: 0,
      animationFrame: 0,
    };
  }

  /**
   * Update Pacman state
   */
  public update(deltaTime: number, maze: MazeConfig): void {
    // Update animation frame
    this.state.animationFrame++;

    // Try to change direction if queued
    if (this.state.nextDirection !== 4) {
      if (this.canChangeDirection(this.state.nextDirection, maze)) {
        // Auto-center when changing perpendicular direction
        this.autoCenterForDirection(this.state.nextDirection);
        this.state.currentDirection = this.state.nextDirection;
        this.state.nextDirection = 4;
      }
    }

    // Update velocity based on current direction (only if we have a direction)
    if (this.state.currentDirection !== 4) {
      this.updateVelocity();
    }

    // Only move if we have velocity
    if (this.state.velocity.x !== 0 || this.state.velocity.y !== 0) {
      // Calculate new position
      const newX = this.state.position.x + this.state.velocity.x;
      const newY = this.state.position.y + this.state.velocity.y;

      // Check if new position is valid (no wall collision)
      if (this.isValidPosition(newX, newY, maze)) {
        this.state.position.x = newX;
        this.state.position.y = newY;

        // Update tile coordinates
        this.state.position.tileX = Math.floor(this.state.position.x / TILE_SIZE);
        this.state.position.tileY = Math.floor(this.state.position.y / TILE_SIZE);
      }
      // If we hit a wall, we just don't move but keep the current direction
      // This allows the input buffer to work
    }

    // Handle tunnel wrapping
    if (this.state.position.x < 0) {
      this.state.position.x = maze.width * TILE_SIZE;
    } else if (this.state.position.x > maze.width * TILE_SIZE) {
      this.state.position.x = 0;
    }

    // Update power-up timer
    if (this.state.isPoweredUp) {
      this.state.powerUpTimer -= deltaTime;
      if (this.state.powerUpTimer <= 0) {
        this.state.isPoweredUp = false;
        this.state.powerUpTimer = 0;
      }
    }
  }

  /**
   * Update velocity based on current direction
   */
  private updateVelocity(): void {
    switch (this.state.currentDirection) {
      case 0: // Up
        this.state.velocity.x = 0;
        this.state.velocity.y = -this.state.speed;
        break;
      case 1: // Down
        this.state.velocity.x = 0;
        this.state.velocity.y = this.state.speed;
        break;
      case 2: // Left
        this.state.velocity.x = -this.state.speed;
        this.state.velocity.y = 0;
        break;
      case 3: // Right
        this.state.velocity.x = this.state.speed;
        this.state.velocity.y = 0;
        break;
      default: // None
        this.state.velocity.x = 0;
        this.state.velocity.y = 0;
    }
  }

  /**
   * Auto-center Pacman in the appropriate axis when changing direction
   */
  private autoCenterForDirection(newDirection: Direction): void {
    const centerX = this.state.position.tileX * TILE_SIZE + TILE_SIZE / 2;
    const centerY = this.state.position.tileY * TILE_SIZE + TILE_SIZE / 2;

    switch (newDirection) {
      case 0: // Up
      case 1: // Down
        // Center horizontally for vertical movement
        this.state.position.x = centerX;
        break;
      case 2: // Left
      case 3: // Right
        // Center vertically for horizontal movement
        this.state.position.y = centerY;
        break;
    }
  }

  /**
   * Check if Pacman can change to a new direction
   * More lenient checking to allow smoother turns
   */
  private canChangeDirection(newDirection: Direction, maze: MazeConfig): boolean {
    // For perpendicular direction changes, check if we're aligned enough in that axis
    const centerX = this.state.position.tileX * TILE_SIZE + TILE_SIZE / 2;
    const centerY = this.state.position.tileY * TILE_SIZE + TILE_SIZE / 2;

    const distanceX = Math.abs(this.state.position.x - centerX);
    const distanceY = Math.abs(this.state.position.y - centerY);

    // More lenient threshold - half the tile size
    const threshold = TILE_SIZE / 2;

    // Check alignment based on the direction we want to go
    switch (newDirection) {
      case 0: // Up
      case 1: // Down
        // For vertical movement, we need to be horizontally aligned
        if (distanceX > threshold) return false;
        break;
      case 2: // Left
      case 3: // Right
        // For horizontal movement, we need to be vertically aligned
        if (distanceY > threshold) return false;
        break;
    }

    // Check if the new direction leads to a valid tile
    let testTileX = this.state.position.tileX;
    let testTileY = this.state.position.tileY;

    switch (newDirection) {
      case 0: // Up
        testTileY--;
        break;
      case 1: // Down
        testTileY++;
        break;
      case 2: // Left
        testTileX--;
        break;
      case 3: // Right
        testTileX++;
        break;
    }

    return !this.isTileWall(testTileX, testTileY, maze);
  }

  /**
   * Check if position is valid (no wall collision)
   */
  private isValidPosition(x: number, y: number, maze: MazeConfig): boolean {
    const tileX = Math.floor(x / TILE_SIZE);
    const tileY = Math.floor(y / TILE_SIZE);

    // Check bounds
    if (tileX < 0 || tileX >= maze.width || tileY < 0 || tileY >= maze.height) {
      return true; // Allow for tunnel wrapping
    }

    return !this.isTileWall(tileX, tileY, maze);
  }

  /**
   * Check if a tile is a wall
   */
  private isTileWall(tileX: number, tileY: number, maze: MazeConfig): boolean {
    if (tileY < 0 || tileY >= maze.layout.length) return false;
    if (tileX < 0 || tileX >= maze.layout[0].length) return false;

    return maze.layout[tileY][tileX] === TileType.Wall;
  }

  /**
   * Set next direction (input buffering)
   */
  public setNextDirection(direction: Direction): void {
    this.state.nextDirection = direction;
  }

  /**
   * Activate power-up
   */
  public activatePowerUp(duration: number): void {
    this.state.isPoweredUp = true;
    this.state.powerUpTimer = duration;
  }

  /**
   * Reset to starting position
   */
  public reset(): void {
    this.state = this.getInitialState();
  }

  /**
   * Lose a life
   */
  public loseLife(): void {
    this.state.lives--;
    // Reset position
    this.state.position.x = PACMAN_START_TILE.x * TILE_SIZE + TILE_SIZE / 2;
    this.state.position.y = PACMAN_START_TILE.y * TILE_SIZE + TILE_SIZE / 2;
    this.state.position.tileX = PACMAN_START_TILE.x;
    this.state.position.tileY = PACMAN_START_TILE.y;
    this.state.currentDirection = 4;
    this.state.nextDirection = 4;
    this.state.velocity.x = 0;
    this.state.velocity.y = 0;
  }

  /**
   * Gain a life
   */
  public gainLife(): void {
    this.state.lives = Math.min(this.state.lives + 1, 5);
  }
}
