import type { Game, UIState, MazeConfig } from "../types/game";
import { GameState, TileType, GhostMode, GhostPersonality } from "../types/game";
import { Renderer } from "../rendering/renderer";
import { Pacman } from "../entities/pacman";
import { Ghost } from "../entities/ghost";
import { InputManager } from "../input/input-manager";
import { checkPacmanGhostCollision } from "../systems/collision";
import { CLASSIC_MAZE, MAZE_WIDTH, MAZE_HEIGHT, countDots } from "../data/maze-layouts";
import { TILE_SIZE, TARGET_FPS, POWER_PELLET_DURATION, GHOST_MODE_TIMERS } from "../data/game-constants";

/**
 * Main game engine
 * Handles game loop, state management, and coordination
 */
export class GameEngine {
  private game: Game;
  private renderer: Renderer;
  private pacman: Pacman;
  private ghosts: Ghost[];
  private inputManager: InputManager;

  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private fps: number = 0;
  private frameCount: number = 0;
  private fpsUpdateTime: number = 0;

  private ghostModeTimer: number = 0;
  private ghostModeIndex: number = 0;
  private currentGhostMode: GhostMode = GhostMode.Scatter;

  private uiUpdateCallback: ((uiState: UIState) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new Renderer(canvas);
    this.pacman = new Pacman();
    this.inputManager = new InputManager();

    // Create ghosts
    this.ghosts = [
      new Ghost(GhostPersonality.Blinky),
      new Ghost(GhostPersonality.Pinky),
      new Ghost(GhostPersonality.Inky),
      new Ghost(GhostPersonality.Clyde),
    ];

    // Initialize game state
    this.game = this.getInitialGameState();

    // Pre-render maze
    this.renderer.renderMazeToCache(this.game.maze.layout);
  }

  private getInitialGameState(): Game {
    return {
      state: GameState.Ready,
      score: 0,
      highScore: this.loadHighScore(),
      level: 1,
      pacman: this.pacman.state,
      ghosts: this.ghosts.map(g => g.state),
      maze: {
        width: MAZE_WIDTH,
        height: MAZE_HEIGHT,
        tileSize: TILE_SIZE,
        layout: JSON.parse(JSON.stringify(CLASSIC_MAZE)), // Deep copy
      },
      dotsRemaining: countDots(CLASSIC_MAZE),
      ghostsEatenInSequence: 0,
      activeSpeedBoost: false,
      speedBoostTimer: 0,
      activeDoublePoints: false,
      doublePointsTimer: 0,
    };
  }

  /**
   * Start the game loop
   */
  public start(): void {
    if (this.animationFrameId !== null) return;

    this.game.state = GameState.Playing;
    this.lastFrameTime = performance.now();
    this.gameLoop(this.lastFrameTime);
  }

  /**
   * Pause the game
   */
  public pause(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.game.state = GameState.Paused;
  }

  /**
   * Resume the game
   */
  public resume(): void {
    if (this.game.state === GameState.Paused) {
      this.start();
    }
  }

  /**
   * Reset the game
   */
  public reset(): void {
    this.pause();
    this.game = this.getInitialGameState();
    this.pacman.reset();
    for (const ghost of this.ghosts) {
      ghost.reset();
    }
    this.ghostModeTimer = 0;
    this.ghostModeIndex = 0;
    this.currentGhostMode = GhostMode.Scatter;
    this.renderer.renderMazeToCache(this.game.maze.layout);
    this.renderer.render(this.game);
  }

  /**
   * Main game loop
   */
  private gameLoop(currentTime: number): void {
    if (this.game.state !== GameState.Playing) return;

    // Calculate delta time
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Update FPS counter
    this.updateFPS(currentTime);

    // Update game state
    this.update(deltaTime);

    // Render
    this.renderer.render(this.game);

    // Update UI (throttled)
    if (currentTime - this.fpsUpdateTime > 100) { // Update UI every 100ms
      this.updateUI();
    }

    // Request next frame
    this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Update game state
   */
  private update(deltaTime: number): void {
    // Get input
    const inputDirection = this.inputManager.getDirection();
    if (inputDirection !== 4) { // Not None
      this.pacman.setNextDirection(inputDirection);
    }

    // Update Pacman
    this.pacman.update(deltaTime, this.game.maze);

    // Check dot collection
    this.checkDotCollection();

    // Update ghost modes (scatter/chase pattern)
    this.updateGhostModes(deltaTime);

    // Update ghosts (pass Pacman direction and Blinky position for AI)
    const blinkyPos = this.ghosts[0].state.position; // Blinky is first ghost
    for (const ghost of this.ghosts) {
      ghost.update(
        deltaTime,
        this.game.maze,
        this.pacman.state.position,
        this.pacman.state.currentDirection,
        blinkyPos
      );
    }

    // Sync ghost states to game
    this.game.ghosts = this.ghosts.map(g => g.state);

    // Check ghost collisions
    this.checkGhostCollisions();

    // Check win condition
    if (this.game.dotsRemaining === 0) {
      this.game.state = GameState.LevelComplete;
    }

    // Check game over
    if (this.pacman.state.lives <= 0) {
      this.game.state = GameState.GameOver;
      this.saveHighScore();
    }
  }

  /**
   * Update ghost mode timing (scatter/chase waves)
   */
  private updateGhostModes(deltaTime: number): void {
    // Don't update modes during frightened (handled separately)
    const frightenedGhosts = this.ghosts.filter(g => g.state.mode === GhostMode.Frightened);
    if (frightenedGhosts.length > 0) return;

    this.ghostModeTimer += deltaTime;

    const currentModeConfig = GHOST_MODE_TIMERS[this.ghostModeIndex];
    const modeDuration =
      this.currentGhostMode === GhostMode.Scatter
        ? currentModeConfig.scatter
        : currentModeConfig.chase;

    if (this.ghostModeTimer >= modeDuration) {
      // Switch modes
      this.currentGhostMode =
        this.currentGhostMode === GhostMode.Scatter ? GhostMode.Chase : GhostMode.Scatter;

      // Move to next wave if transitioning from chase to scatter
      if (this.currentGhostMode === GhostMode.Scatter) {
        this.ghostModeIndex = Math.min(this.ghostModeIndex + 1, GHOST_MODE_TIMERS.length - 1);
      }

      // Update all ghosts
      for (const ghost of this.ghosts) {
        if (ghost.state.mode !== GhostMode.Frightened && ghost.state.mode !== GhostMode.Eaten) {
          ghost.setMode(this.currentGhostMode);
        }
      }

      this.ghostModeTimer = 0;
    }
  }

  /**
   * Check collisions between Pacman and ghosts
   */
  private checkGhostCollisions(): void {
    for (const ghost of this.ghosts) {
      if (checkPacmanGhostCollision(this.pacman.state.position, ghost.state.position)) {
        if (ghost.state.mode === GhostMode.Frightened) {
          // Pacman eats ghost
          this.eatGhost(ghost);
        } else if (ghost.state.mode !== GhostMode.Eaten) {
          // Ghost catches Pacman
          this.pacmanCaught();
        }
      }
    }
  }

  /**
   * Handle Pacman eating a ghost
   */
  private eatGhost(ghost: Ghost): void {
    // Calculate points (200, 400, 800, 1600)
    const points = 200 * Math.pow(2, this.game.ghostsEatenInSequence);
    this.game.score += points;
    this.game.ghostsEatenInSequence++;

    // Set ghost to eaten mode
    ghost.setMode(GhostMode.Eaten);
  }

  /**
   * Handle Pacman being caught by a ghost
   */
  private pacmanCaught(): void {
    this.pacman.loseLife();

    if (this.pacman.state.lives > 0) {
      // Reset positions but keep score
      this.resetPositions();
      this.game.state = GameState.LifeLost;

      // Return to playing after a delay
      setTimeout(() => {
        if (this.game.state === GameState.LifeLost) {
          this.game.state = GameState.Playing;
        }
      }, 2000);
    }
  }

  /**
   * Reset Pacman and ghost positions
   */
  private resetPositions(): void {
    this.pacman.reset();
    for (const ghost of this.ghosts) {
      ghost.reset();
    }
    this.ghostModeTimer = 0;
    this.ghostModeIndex = 0;
    this.currentGhostMode = GhostMode.Scatter;
  }

  /**
   * Check if Pacman collected a dot or power pellet
   */
  private checkDotCollection(): void {
    const tileX = this.pacman.state.position.tileX;
    const tileY = this.pacman.state.position.tileY;

    if (tileY < 0 || tileY >= this.game.maze.layout.length) return;
    if (tileX < 0 || tileX >= this.game.maze.layout[0].length) return;

    const tile = this.game.maze.layout[tileY][tileX];

    if (tile === TileType.Dot) {
      this.game.maze.layout[tileY][tileX] = TileType.Empty;
      this.game.score += 10;
      this.game.dotsRemaining--;
    } else if (tile === TileType.PowerPellet) {
      this.game.maze.layout[tileY][tileX] = TileType.Empty;
      this.game.score += 50;
      this.game.dotsRemaining--;
      this.pacman.activatePowerUp(POWER_PELLET_DURATION);

      // Trigger pixel art flash effect
      this.renderer.triggerFlashEffect();

      // Frighten all ghosts
      this.game.ghostsEatenInSequence = 0; // Reset sequence counter
      for (const ghost of this.ghosts) {
        if (ghost.state.mode !== GhostMode.Eaten) {
          ghost.setMode(GhostMode.Frightened);
        }
      }

      // Return ghosts to normal after power pellet duration
      setTimeout(() => {
        for (const ghost of this.ghosts) {
          if (ghost.state.mode === GhostMode.Frightened) {
            ghost.setMode(this.currentGhostMode);
          }
        }
      }, POWER_PELLET_DURATION);
    }
  }

  /**
   * Update FPS counter
   */
  private updateFPS(currentTime: number): void {
    this.frameCount++;

    if (currentTime - this.fpsUpdateTime > 1000) {
      this.fps = Math.round(this.frameCount * 1000 / (currentTime - this.fpsUpdateTime));
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
    }
  }

  /**
   * Update UI state (throttled callback to React)
   */
  private updateUI(): void {
    if (this.uiUpdateCallback) {
      const uiState: UIState = {
        score: this.game.score,
        lives: this.pacman.state.lives,
        level: this.game.level,
        state: this.game.state,
        fps: this.fps,
      };
      this.uiUpdateCallback(uiState);
    }
  }

  /**
   * Set UI update callback
   */
  public onUIUpdate(callback: (uiState: UIState) => void): void {
    this.uiUpdateCallback = callback;
  }

  /**
   * Load high score from localStorage
   */
  private loadHighScore(): number {
    try {
      const saved = localStorage.getItem("pacman-high-score");
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  }

  /**
   * Save high score to localStorage
   */
  private saveHighScore(): void {
    try {
      if (this.game.score > this.game.highScore) {
        this.game.highScore = this.game.score;
        localStorage.setItem("pacman-high-score", this.game.score.toString());
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  /**
   * Get current game state
   */
  public getGameState(): Game {
    return this.game;
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.inputManager.destroy();
  }
}
