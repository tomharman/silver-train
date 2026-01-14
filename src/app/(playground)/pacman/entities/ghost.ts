import type { GhostState, Direction, MazeConfig, Position } from "../types/game";
import { GhostMode, GhostPersonality, TileType } from "../types/game";
import { TILE_SIZE, GHOST_NORMAL_SPEED, GHOST_FRIGHTENED_SPEED, GHOST_EATEN_SPEED } from "../data/game-constants";
import { GHOST_START_TILES, SCATTER_TARGETS } from "../data/maze-layouts";

/**
 * Ghost entity implementation
 * Handles movement, AI, and state for individual ghosts
 */
export class Ghost {
  public state: GhostState;

  constructor(personality: GhostPersonality) {
    this.state = this.getInitialState(personality);
  }

  private getInitialState(personality: GhostPersonality): GhostState {
    const startTile = GHOST_START_TILES[personality];

    return {
      position: {
        x: startTile.x * TILE_SIZE + TILE_SIZE / 2,
        y: startTile.y * TILE_SIZE + TILE_SIZE / 2,
        tileX: startTile.x,
        tileY: startTile.y,
      },
      velocity: { x: 0, y: 0 },
      currentDirection: 2, // Start facing left
      speed: GHOST_NORMAL_SPEED,
      mode: GhostMode.Scatter,
      personality,
      targetTile: { x: 0, y: 0, tileX: 0, tileY: 0 },
      modeTimer: 0,
    };
  }

  /**
   * Update ghost state
   */
  public update(deltaTime: number, maze: MazeConfig, pacmanPos: Position, pacmanDir: number, blinkyPos?: Position): void {
    // Update speed based on mode
    this.updateSpeed();

    // Update target tile based on AI personality and mode
    this.updateTargetTile(pacmanPos, pacmanDir, blinkyPos, maze);

    // Calculate next direction based on target
    this.updateDirection(maze);

    // Update velocity
    this.updateVelocity();

    // Move
    this.move(maze);

    // Update mode timer
    this.state.modeTimer += deltaTime;
  }

  /**
   * Update speed based on current mode
   */
  private updateSpeed(): void {
    switch (this.state.mode) {
      case GhostMode.Chase:
      case GhostMode.Scatter:
        this.state.speed = GHOST_NORMAL_SPEED;
        break;
      case GhostMode.Frightened:
        this.state.speed = GHOST_FRIGHTENED_SPEED;
        break;
      case GhostMode.Eaten:
        this.state.speed = GHOST_EATEN_SPEED;
        break;
    }
  }

  /**
   * Update target tile based on personality and mode
   */
  private updateTargetTile(pacmanPos: Position, pacmanDir: number, blinkyPos: Position | undefined, maze: MazeConfig): void {
    if (this.state.mode === GhostMode.Scatter) {
      // In scatter mode, ghosts go to their corner
      const corner = SCATTER_TARGETS[this.state.personality];
      this.state.targetTile = {
        x: corner.x * TILE_SIZE + TILE_SIZE / 2,
        y: corner.y * TILE_SIZE + TILE_SIZE / 2,
        tileX: corner.x,
        tileY: corner.y,
      };
    } else if (this.state.mode === GhostMode.Frightened) {
      // In frightened mode, move randomly (handled in updateDirection)
      this.state.targetTile = this.state.position;
    } else if (this.state.mode === GhostMode.Eaten) {
      // Return to ghost house
      this.state.targetTile = {
        x: 14 * TILE_SIZE + TILE_SIZE / 2,
        y: 14 * TILE_SIZE + TILE_SIZE / 2,
        tileX: 14,
        tileY: 14,
      };
    } else {
      // Chase mode - use personality-specific AI
      this.updateChaseTarget(pacmanPos, pacmanDir, blinkyPos, maze);
    }
  }

  /**
   * Update chase target based on ghost personality
   */
  private updateChaseTarget(pacmanPos: Position, pacmanDir: number, blinkyPos: Position | undefined, maze: MazeConfig): void {
    switch (this.state.personality) {
      case GhostPersonality.Blinky:
        // Direct chase - target Pacman's current position
        this.state.targetTile = { ...pacmanPos };
        break;

      case GhostPersonality.Pinky:
        // Ambush - target 4 tiles ahead of Pacman
        this.state.targetTile = this.getPinkyTarget(pacmanPos, pacmanDir);
        break;

      case GhostPersonality.Inky:
        // Flanking - complex calculation involving Blinky
        this.state.targetTile = this.getInkyTarget(pacmanPos, pacmanDir, blinkyPos);
        break;

      case GhostPersonality.Clyde:
        // Shy - chase when far, scatter when close
        const distance = this.getDistance(this.state.position, pacmanPos);
        if (distance > 8 * TILE_SIZE) {
          // Far away - chase
          this.state.targetTile = { ...pacmanPos };
        } else {
          // Close - go to corner
          const corner = SCATTER_TARGETS[this.state.personality];
          this.state.targetTile = {
            x: corner.x * TILE_SIZE + TILE_SIZE / 2,
            y: corner.y * TILE_SIZE + TILE_SIZE / 2,
            tileX: corner.x,
            tileY: corner.y,
          };
        }
        break;
    }
  }

  /**
   * Get Pinky's target (4 tiles ahead of Pacman)
   */
  private getPinkyTarget(pacmanPos: Position, pacmanDir: number): Position {
    // Target 4 tiles ahead of Pacman in his current direction
    const ahead = 4;
    let targetX = pacmanPos.tileX;
    let targetY = pacmanPos.tileY;

    switch (pacmanDir) {
      case 0: // Up
        targetY -= ahead;
        break;
      case 1: // Down
        targetY += ahead;
        break;
      case 2: // Left
        targetX -= ahead;
        break;
      case 3: // Right
        targetX += ahead;
        break;
    }

    return {
      x: targetX * TILE_SIZE + TILE_SIZE / 2,
      y: targetY * TILE_SIZE + TILE_SIZE / 2,
      tileX: targetX,
      tileY: targetY,
    };
  }

  /**
   * Get Inky's target (flanking behavior with Blinky)
   */
  private getInkyTarget(pacmanPos: Position, pacmanDir: number, blinkyPos: Position | undefined): Position {
    // Get point 2 tiles ahead of Pacman
    let pivotX = pacmanPos.tileX;
    let pivotY = pacmanPos.tileY;

    switch (pacmanDir) {
      case 0: // Up
        pivotY -= 2;
        break;
      case 1: // Down
        pivotY += 2;
        break;
      case 2: // Left
        pivotX -= 2;
        break;
      case 3: // Right
        pivotX += 2;
        break;
    }

    // If we have Blinky's position, use vector from Blinky to pivot point and double it
    if (blinkyPos) {
      const vectorX = pivotX - blinkyPos.tileX;
      const vectorY = pivotY - blinkyPos.tileY;

      const targetX = blinkyPos.tileX + vectorX * 2;
      const targetY = blinkyPos.tileY + vectorY * 2;

      return {
        x: targetX * TILE_SIZE + TILE_SIZE / 2,
        y: targetY * TILE_SIZE + TILE_SIZE / 2,
        tileX: Math.floor(targetX),
        tileY: Math.floor(targetY),
      };
    }

    // Fallback: just target 2 tiles ahead
    return {
      x: pivotX * TILE_SIZE + TILE_SIZE / 2,
      y: pivotY * TILE_SIZE + TILE_SIZE / 2,
      tileX: pivotX,
      tileY: pivotY,
    };
  }

  /**
   * Calculate distance between two positions
   */
  private getDistance(pos1: Position, pos2: Position): number {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Update direction based on target tile
   * Uses simple pathfinding to move toward target
   */
  private updateDirection(maze: MazeConfig): void {
    // Only make decisions at tile centers
    const centerX = this.state.position.tileX * TILE_SIZE + TILE_SIZE / 2;
    const centerY = this.state.position.tileY * TILE_SIZE + TILE_SIZE / 2;

    const distanceX = Math.abs(this.state.position.x - centerX);
    const distanceY = Math.abs(this.state.position.y - centerY);

    // Only change direction when close to center of a tile
    if (distanceX < 2 && distanceY < 2) {
      if (this.state.mode === GhostMode.Frightened) {
        // Random movement when frightened
        this.chooseRandomDirection(maze);
      } else {
        // Move toward target
        this.chooseDirectionTowardTarget(maze);
      }
    }
  }

  /**
   * Choose direction that moves toward target
   */
  private chooseDirectionTowardTarget(maze: MazeConfig): void {
    const currentTileX = this.state.position.tileX;
    const currentTileY = this.state.position.tileY;

    // Get possible directions (not walls, not reverse)
    const possibleDirections = this.getPossibleDirections(maze);

    if (possibleDirections.length === 0) return;

    // Choose direction that minimizes distance to target
    let bestDirection = this.state.currentDirection;
    let bestDistance = Infinity;

    for (const direction of possibleDirections) {
      const { tileX, tileY } = this.getNextTile(currentTileX, currentTileY, direction);
      const distance = this.getTileDistance(tileX, tileY, this.state.targetTile.tileX, this.state.targetTile.tileY);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestDirection = direction;
      }
    }

    this.state.currentDirection = bestDirection;
  }

  /**
   * Choose random valid direction (for frightened mode)
   */
  private chooseRandomDirection(maze: MazeConfig): void {
    const possibleDirections = this.getPossibleDirections(maze);

    if (possibleDirections.length > 0) {
      const randomIndex = Math.floor(Math.random() * possibleDirections.length);
      this.state.currentDirection = possibleDirections[randomIndex];
    }
  }

  /**
   * Get possible directions (not walls, not reverse)
   */
  private getPossibleDirections(maze: MazeConfig): Direction[] {
    const directions: Direction[] = [];
    const reverseDirection = this.getReverseDirection(this.state.currentDirection);

    // Check all four directions
    for (let dir = 0; dir < 4; dir++) {
      // Don't go backward (unless it's the only option)
      if (dir === reverseDirection) continue;

      const { tileX, tileY } = this.getNextTile(
        this.state.position.tileX,
        this.state.position.tileY,
        dir
      );

      if (!this.isTileWall(tileX, tileY, maze)) {
        directions.push(dir);
      }
    }

    // If no valid directions (dead end), allow reverse
    if (directions.length === 0) {
      const { tileX, tileY } = this.getNextTile(
        this.state.position.tileX,
        this.state.position.tileY,
        reverseDirection
      );

      if (!this.isTileWall(tileX, tileY, maze)) {
        directions.push(reverseDirection);
      }
    }

    return directions;
  }

  /**
   * Get reverse of a direction
   */
  private getReverseDirection(direction: Direction): Direction {
    switch (direction) {
      case 0: return 1; // Up -> Down
      case 1: return 0; // Down -> Up
      case 2: return 3; // Left -> Right
      case 3: return 2; // Right -> Left
      default: return 4; // None
    }
  }

  /**
   * Get next tile in a direction
   */
  private getNextTile(tileX: number, tileY: number, direction: Direction): { tileX: number; tileY: number } {
    switch (direction) {
      case 0: return { tileX, tileY: tileY - 1 }; // Up
      case 1: return { tileX, tileY: tileY + 1 }; // Down
      case 2: return { tileX: tileX - 1, tileY }; // Left
      case 3: return { tileX: tileX + 1, tileY }; // Right
      default: return { tileX, tileY };
    }
  }

  /**
   * Calculate tile distance (Manhattan distance)
   */
  private getTileDistance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
  }

  /**
   * Check if a tile is a wall
   */
  private isTileWall(tileX: number, tileY: number, maze: MazeConfig): boolean {
    if (tileY < 0 || tileY >= maze.layout.length) return true;
    if (tileX < 0 || tileX >= maze.layout[0].length) return true;

    const tile = maze.layout[tileY][tileX];
    return tile === TileType.Wall;
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
      default:
        this.state.velocity.x = 0;
        this.state.velocity.y = 0;
    }
  }

  /**
   * Move ghost
   */
  private move(maze: MazeConfig): void {
    // Update position
    this.state.position.x += this.state.velocity.x;
    this.state.position.y += this.state.velocity.y;

    // Update tile coordinates
    this.state.position.tileX = Math.floor(this.state.position.x / TILE_SIZE);
    this.state.position.tileY = Math.floor(this.state.position.y / TILE_SIZE);

    // Handle tunnel wrapping
    if (this.state.position.x < 0) {
      this.state.position.x = maze.width * TILE_SIZE;
    } else if (this.state.position.x > maze.width * TILE_SIZE) {
      this.state.position.x = 0;
    }
  }

  /**
   * Set ghost mode
   */
  public setMode(mode: GhostMode): void {
    if (this.state.mode !== mode) {
      this.state.mode = mode;
      this.state.modeTimer = 0;

      // Reverse direction when mode changes (except eaten)
      if (mode !== GhostMode.Eaten) {
        this.state.currentDirection = this.getReverseDirection(this.state.currentDirection);
      }
    }
  }

  /**
   * Reset ghost to starting position
   */
  public reset(): void {
    const startTile = GHOST_START_TILES[this.state.personality];
    this.state.position.x = startTile.x * TILE_SIZE + TILE_SIZE / 2;
    this.state.position.y = startTile.y * TILE_SIZE + TILE_SIZE / 2;
    this.state.position.tileX = startTile.x;
    this.state.position.tileY = startTile.y;
    this.state.currentDirection = 2; // Face left
    this.state.mode = GhostMode.Scatter;
    this.state.modeTimer = 0;
    this.state.speed = GHOST_NORMAL_SPEED;
  }
}
