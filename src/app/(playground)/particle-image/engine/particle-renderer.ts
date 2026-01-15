import * as PIXI from "pixi.js";
import type { Particle } from "../types/particle";

export class ParticleRenderer {
  private app: PIXI.Application | null = null;
  private particleContainer: PIXI.Container | null = null;
  private particleTexture: PIXI.Texture | null = null;
  private sprites: PIXI.Sprite[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private centerX: number = 0;
  private centerY: number = 0;
  private containerElement: HTMLDivElement | null = null;

  async init(containerElement: HTMLDivElement): Promise<void> {
    this.containerElement = containerElement;

    // Create PIXI application
    this.app = new PIXI.Application();
    await this.app.init({
      resizeTo: containerElement,
      backgroundColor: 0x0a0a0a, // Will be theme-aware
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    containerElement.appendChild(this.app.canvas);

    // Use regular Container for particle rendering
    // (ParticleContainer in v8 has different API requirements)
    this.particleContainer = new PIXI.Container();

    this.app.stage.addChild(this.particleContainer);

    // Set initial center
    this.centerX = this.app.screen.width / 2;
    this.centerY = this.app.screen.height / 2;

    // Setup resize observer
    this.setupResizeObserver();
  }

  private setupResizeObserver(): void {
    if (!this.containerElement) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });

    this.resizeObserver.observe(this.containerElement);
  }

  private handleResize(): void {
    if (!this.app) return;

    const canvasWidth = this.app.screen.width;
    const canvasHeight = this.app.screen.height;

    // Update cached center coordinates
    this.centerX = canvasWidth / 2;
    this.centerY = canvasHeight / 2;
  }

  /**
   * Create particle texture (small circle)
   */
  private createParticleTexture(radius: number = 0.5): PIXI.Texture {
    if (!this.app) throw new Error("App not initialized");

    const graphics = new PIXI.Graphics();
    graphics.circle(radius, radius, radius);
    graphics.fill({ color: 0xffffff });

    return this.app.renderer.generateTexture(graphics);
  }

  /**
   * Initialize particle sprites
   */
  public initializeParticles(count: number): void {
    if (!this.app || !this.particleContainer) {
      throw new Error("Renderer not initialized");
    }

    // Create texture if not exists
    if (!this.particleTexture) {
      this.particleTexture = this.createParticleTexture();
    }

    // Clear existing sprites
    this.particleContainer.removeChildren();
    this.sprites = [];

    // Create new sprites
    for (let i = 0; i < count; i++) {
      const sprite = new PIXI.Sprite(this.particleTexture);
      sprite.anchor.set(0.5);
      this.sprites.push(sprite);
      this.particleContainer.addChild(sprite);
    }
  }

  /**
   * Render particle state (called every frame)
   */
  public render(particles: Particle[]): void {
    if (!this.app) return;

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      const sprite = this.sprites[i];

      if (!sprite) continue;

      // Position (particle coords are centered at 0,0)
      sprite.x = this.centerX + particle.x;
      sprite.y = this.centerY + particle.y;

      // Visual properties
      sprite.tint = particle.color;
      sprite.alpha = particle.alpha;
      sprite.scale.set(particle.scale);
      sprite.visible = true; // Ensure visibility
    }
  }

  /**
   * Set background color (for theme support)
   */
  public setBackgroundColor(color: number): void {
    if (this.app) {
      this.app.renderer.background.color = color;
    }
  }

  /**
   * Get canvas element for interaction manager
   */
  public getCanvas(): HTMLCanvasElement | null {
    return this.app?.canvas || null;
  }

  /**
   * Remove sprites
   */
  public removeParticles(count: number): void {
    if (!this.particleContainer) return;

    const spritesToRemove = this.sprites.splice(-count, count);
    spritesToRemove.forEach((sprite) => {
      this.particleContainer!.removeChild(sprite);
    });
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.app) {
      this.app.destroy(true, { children: true });
      this.app = null;
    }

    this.sprites = [];
    this.particleContainer = null;
    this.particleTexture = null;
  }
}
