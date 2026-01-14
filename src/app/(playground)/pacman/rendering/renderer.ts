import type { Game } from "../types/game";
import { TileType } from "../types/game";
import { TILE_SIZE, COLORS, PACMAN_RADIUS, GHOST_RADIUS } from "../data/game-constants";
import { MAZE_WIDTH, MAZE_HEIGHT } from "../data/maze-layouts";

/**
 * Main rendering engine for Pacman
 * Handles all canvas drawing operations
 */
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  private mazeCanvas: HTMLCanvasElement | null = null;
  private mazeCtx: CanvasRenderingContext2D | null = null;
  private pixelArtImage: HTMLImageElement | null = null;
  private flashEffect: { active: boolean; startTime: number; duration: number } = {
    active: false,
    startTime: 0,
    duration: 1000, // 1000ms flash
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get 2D context");
    this.ctx = ctx;

    // Set canvas size
    this.canvas.width = MAZE_WIDTH * TILE_SIZE;
    this.canvas.height = MAZE_HEIGHT * TILE_SIZE;

    // Pre-render maze to off-screen canvas for performance
    this.preRenderMaze();

    // Load pixel art image
    this.loadPixelArtImage();
  }

  /**
   * Load the pixel art image for flash effect
   */
  private loadPixelArtImage(): void {
    this.pixelArtImage = new Image();
    this.pixelArtImage.src = "/pacman/Gemini_Generated_Image_4a0w274a0w274a0w.png";
  }

  /**
   * Pre-render the static maze to an off-screen canvas
   * This is a major performance optimization
   */
  private preRenderMaze(): void {
    this.mazeCanvas = document.createElement("canvas");
    this.mazeCanvas.width = this.canvas.width;
    this.mazeCanvas.height = this.canvas.height;

    const ctx = this.mazeCanvas.getContext("2d");
    if (!ctx) return;
    this.mazeCtx = ctx;

    // Will be called when game initializes with actual maze
  }

  /**
   * Render the maze walls (called once during initialization)
   */
  public renderMazeToCache(maze: TileType[][]): void {
    if (!this.mazeCtx || !this.mazeCanvas) return;

    const ctx = this.mazeCtx;

    // Clear
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, this.mazeCanvas.width, this.mazeCanvas.height);

    // Draw walls
    ctx.fillStyle = COLORS.wall;
    ctx.strokeStyle = COLORS.wall;
    ctx.lineWidth = 2;

    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        const tile = maze[y][x];

        if (tile === TileType.Wall) {
          this.drawWallTile(ctx, x, y);
        }
      }
    }
  }

  /**
   * Draw a wall tile with classic Pacman styling
   */
  private drawWallTile(ctx: CanvasRenderingContext2D, x: number, y: number): void {
    const px = x * TILE_SIZE;
    const py = y * TILE_SIZE;

    // Simple filled rectangle for now
    ctx.fillStyle = COLORS.wall;
    ctx.fillRect(px, py, TILE_SIZE, TILE_SIZE);

    // Add subtle border for better visibility
    ctx.strokeStyle = "#4141ff";
    ctx.strokeRect(px, py, TILE_SIZE, TILE_SIZE);
  }

  /**
   * Main render function called every frame
   */
  public render(game: Game): void {
    // Clear canvas
    this.ctx.fillStyle = COLORS.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw pre-rendered maze
    if (this.mazeCanvas) {
      this.ctx.drawImage(this.mazeCanvas, 0, 0);
    }

    // Draw dots and power pellets
    this.renderDots(game.maze.layout);

    // Draw Pacman
    this.renderPacman(game.pacman);

    // Draw ghosts
    for (const ghost of game.ghosts) {
      this.renderGhost(ghost);
    }

    // Draw flash effect if active
    if (this.flashEffect.active) {
      this.renderFlashEffect();
    }
  }

  /**
   * Trigger the pixel art flash effect
   */
  public triggerFlashEffect(): void {
    this.flashEffect.active = true;
    this.flashEffect.startTime = Date.now();
  }

  /**
   * Render the flash effect overlay
   */
  private renderFlashEffect(): void {
    const elapsed = Date.now() - this.flashEffect.startTime;

    // Deactivate after duration
    if (elapsed > this.flashEffect.duration) {
      this.flashEffect.active = false;
      return;
    }

    // Calculate fade in/out
    const progress = elapsed / this.flashEffect.duration;
    let opacity: number;

    if (progress < 0.2) {
      // Quick fade in (first 20%)
      opacity = progress / 0.2;
    } else {
      // Slower fade out (remaining 80%)
      opacity = 1 - ((progress - 0.2) / 0.8);
    }

    // Draw pixel art image if loaded
    if (this.pixelArtImage && this.pixelArtImage.complete) {
      this.ctx.save();
      this.ctx.globalAlpha = opacity * 0.7; // Max 70% opacity for blend effect
      this.ctx.globalCompositeOperation = "lighten"; // Blend mode for colorful effect

      // Draw image scaled to fill canvas
      this.ctx.drawImage(
        this.pixelArtImage,
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );

      this.ctx.restore();
    }
  }

  /**
   * Render dots and power pellets
   */
  private renderDots(maze: TileType[][]): void {
    for (let y = 0; y < maze.length; y++) {
      for (let x = 0; x < maze[y].length; x++) {
        const tile = maze[y][x];
        const px = x * TILE_SIZE + TILE_SIZE / 2;
        const py = y * TILE_SIZE + TILE_SIZE / 2;

        if (tile === TileType.Dot) {
          this.ctx.fillStyle = COLORS.dot;
          this.ctx.beginPath();
          this.ctx.arc(px, py, 3, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (tile === TileType.PowerPellet) {
          // Pulsing power pellet animation
          const pulseSize = 6 + Math.sin(Date.now() / 200) * 1.5;
          this.ctx.fillStyle = COLORS.powerPellet;
          this.ctx.beginPath();
          this.ctx.arc(px, py, pulseSize, 0, Math.PI * 2);
          this.ctx.fill();
        } else if (tile === TileType.SpeedBoost) {
          // Speed boost (lightning bolt icon - simplified as star)
          this.ctx.fillStyle = "#ffff00";
          this.ctx.font = "16px Arial";
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.fillText("⚡", px, py);
        } else if (tile === TileType.BonusItem) {
          // Bonus item (fruit/cherry)
          this.ctx.fillStyle = "#ff0000";
          this.ctx.font = "16px Arial";
          this.ctx.textAlign = "center";
          this.ctx.textBaseline = "middle";
          this.ctx.fillText("🍒", px, py);
        }
      }
    }
  }

  /**
   * Render Pacman with mouth animation
   */
  private renderPacman(pacman: any): void {
    const px = pacman.position.x;
    const py = pacman.position.y;

    this.ctx.fillStyle = COLORS.pacman;
    this.ctx.beginPath();

    // Calculate mouth angle based on animation frame
    const mouthAngle = Math.PI / 6; // 30 degrees max
    const mouthOpen = Math.abs(Math.sin(pacman.animationFrame * 0.2)) * mouthAngle;

    // Determine rotation based on direction
    let startAngle = mouthOpen;
    let endAngle = Math.PI * 2 - mouthOpen;

    switch (pacman.currentDirection) {
      case 0: // Up
        startAngle += Math.PI * 1.5;
        endAngle += Math.PI * 1.5;
        break;
      case 1: // Down
        startAngle += Math.PI * 0.5;
        endAngle += Math.PI * 0.5;
        break;
      case 2: // Left
        startAngle += Math.PI;
        endAngle += Math.PI;
        break;
      case 3: // Right
        // Default facing right
        break;
    }

    this.ctx.arc(px, py, PACMAN_RADIUS, startAngle, endAngle);
    this.ctx.lineTo(px, py);
    this.ctx.fill();
  }

  /**
   * Render a ghost
   */
  private renderGhost(ghost: any): void {
    const px = ghost.position.x;
    const py = ghost.position.y;

    // Determine color based on mode and personality
    let color = COLORS.blinky;
    switch (ghost.personality) {
      case "blinky":
        color = ghost.mode === "frightened" ? COLORS.frightened : COLORS.blinky;
        break;
      case "pinky":
        color = ghost.mode === "frightened" ? COLORS.frightened : COLORS.pinky;
        break;
      case "inky":
        color = ghost.mode === "frightened" ? COLORS.frightened : COLORS.inky;
        break;
      case "clyde":
        color = ghost.mode === "frightened" ? COLORS.frightened : COLORS.clyde;
        break;
    }

    // Simple ghost shape for now (will enhance later)
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(px, py, GHOST_RADIUS, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw eyes (always white)
    this.ctx.fillStyle = "#ffffff";
    this.ctx.beginPath();
    this.ctx.arc(px - 3, py - 2, 2, 0, Math.PI * 2);
    this.ctx.arc(px + 3, py - 2, 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw pupils
    this.ctx.fillStyle = "#000000";
    this.ctx.beginPath();
    this.ctx.arc(px - 3, py - 2, 1, 0, Math.PI * 2);
    this.ctx.arc(px + 3, py - 2, 1, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Resize canvas (for responsive design)
   */
  public resize(): void {
    // Canvas size is fixed based on maze dimensions
    // Container can scale this if needed
  }
}
