import { ParticleRenderer } from "./particle-renderer";
import { NoiseField } from "../utils/noise";
import type {
  Particle,
  ParticleData,
  ParticleSystemConfig,
  EngineState,
  UIState,
} from "../types/particle";
import { DEFAULT_PARTICLE_CONFIG } from "../data/constants";

export class ParticleEngine {
  private renderer: ParticleRenderer;
  private noise: NoiseField;

  private state: EngineState;
  private config: ParticleSystemConfig;

  private animationFrameId: number | null = null;
  private lastFrameTime: number = 0;
  private time: number = 0; // Global time for noise

  private uiUpdateCallback: ((state: UIState) => void) | null = null;
  private frameCount: number = 0;
  private fpsUpdateTime: number = 0;

  constructor() {
    this.renderer = new ParticleRenderer();
    this.noise = new NoiseField();

    // Initialize state
    this.state = {
      particles: [],
      mouseX: 99999, // Start far away to avoid initial repulsion at center (0,0)
      mouseY: 99999,
      isMouseDown: false,
      disperseTime: 0,
      fps: 0,
    };

    // Default config
    this.config = { ...DEFAULT_PARTICLE_CONFIG };
  }

  /**
   * Initialize renderer
   */
  public async init(container: HTMLDivElement): Promise<void> {
    await this.renderer.init(container);
  }

  /**
   * Load particles from processed image data
   */
  public loadParticles(particleData: ParticleData[]): void {
    console.log("Creating particle objects from", particleData.length, "data points");

    // Get canvas dimensions for random starting positions
    const canvas = this.renderer.getCanvas();
    const canvasWidth = canvas?.width || 800;
    const canvasHeight = canvas?.height || 600;

    this.state.particles = particleData.map((p, i) => {
      // Random starting position within canvas bounds (centered coordinate system)
      const randomStartX = (Math.random() - 0.5) * canvasWidth;
      const randomStartY = (Math.random() - 0.5) * canvasHeight;

      // Normalize brightness (0-255) to scale (1.0-1.2) for storage
      const brightnessNormalized = p.brightness / 255; // 0 (dark) to 1 (light)

      return {
        x: randomStartX,
        y: randomStartY,
        homeX: p.x,
        homeY: p.y,
        vx: 0,
        vy: 0,
        color: p.color,
        colorIndex: i % this.config.colorPalette.length,
        alpha: 1,
        scale: 1 + brightnessNormalized * 0.2, // Store brightness as scale (1.0-1.2)
        noiseOffsetX: Math.random() * 1000,
        noiseOffsetY: Math.random() * 1000,
        isRepelled: false,
        isDispersed: false,
        isForming: true,
        formProgress: 0,
        randomStartX,
        randomStartY,
      };
    });

    console.log("Initializing renderer with", this.state.particles.length, "particles");
    // Initialize renderer sprites
    this.renderer.initializeParticles(this.state.particles.length);

    console.log("Starting animation loop");
    // Start rendering
    this.start();
  }

  /**
   * Apply custom color palette to particles based on brightness
   * Darker particles get colors from start of palette (shadows)
   * Lighter particles get colors from end of palette (highlights)
   */
  public applyColorPalette(colors: number[]): void {
    this.config.colorPalette = colors;

    // Only reassign if we have brightness data
    this.state.particles.forEach((p) => {
      // Use stored brightness to determine which color to use
      // Brightness is 0-255, map to palette index
      const brightnessNormalized = (p.scale - 1) / 0.2; // Use scale as proxy for brightness (stored during load)

      // Map brightness to palette: 0 (dark) -> first color, 1 (light) -> last color
      const paletteIndex = Math.floor(brightnessNormalized * (colors.length - 1));
      const clampedIndex = Math.max(0, Math.min(colors.length - 1, paletteIndex));

      p.colorIndex = clampedIndex;
      p.color = colors[clampedIndex];
    });
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<ParticleSystemConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Set background color (for theme support)
   */
  public setBackgroundColor(color: number): void {
    this.renderer.setBackgroundColor(color);
  }

  /**
   * Get canvas for interaction setup
   */
  public getCanvas(): HTMLCanvasElement | null {
    return this.renderer.getCanvas();
  }

  /**
   * Start animation loop
   */
  public start(): void {
    if (this.animationFrameId !== null) return;

    this.lastFrameTime = performance.now();
    this.fpsUpdateTime = this.lastFrameTime;
    this.animationLoop(this.lastFrameTime);
  }

  /**
   * Stop animation loop
   */
  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Main animation loop
   */
  private animationLoop(currentTime: number): void {
    // Calculate delta time
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;

    // Update time for noise
    this.time += deltaTime * 0.001; // Convert to seconds

    // Update FPS
    this.updateFPS(currentTime);

    // Update particles
    this.updateParticles(deltaTime);

    // Render
    this.renderer.render(this.state.particles);

    // Update UI periodically (every 60 frames)
    if (this.frameCount % 60 === 0) {
      this.updateUI();
    }

    // Continue loop
    this.animationFrameId = requestAnimationFrame(
      this.animationLoop.bind(this)
    );
  }

  /**
   * Update all particle positions and states
   */
  private updateParticles(deltaTime: number): void {
    const dt = deltaTime / 1000; // Convert to seconds

    for (const particle of this.state.particles) {
      // Handle initial formation animation (1 second)
      if (particle.isForming) {
        particle.formProgress += dt; // 1 second = 1.0 progress

        if (particle.formProgress >= 1.0) {
          particle.isForming = false;
          particle.formProgress = 1.0;
          // Set position to home
          particle.x = particle.homeX;
          particle.y = particle.homeY;
        } else {
          // Ease-out interpolation for smooth arrival
          const t = this.easeOutCubic(particle.formProgress);
          particle.x =
            particle.randomStartX +
            (particle.homeX - particle.randomStartX) * t;
          particle.y =
            particle.randomStartY +
            (particle.homeY - particle.randomStartY) * t;
        }
        continue;
      }

      // Check if dispersed (from click)
      if (particle.isDispersed) {
        this.updateDispersedParticle(particle, dt);
        continue;
      }

      // Check mouse repulsion
      const dx = particle.x - this.state.mouseX;
      const dy = particle.y - this.state.mouseY;
      const distanceSq = dx * dx + dy * dy;
      const repulsionRadiusSq =
        this.config.repulsionRadius * this.config.repulsionRadius;

      if (distanceSq < repulsionRadiusSq && distanceSq > 0) {
        const distance = Math.sqrt(distanceSq);
        this.applyRepulsion(particle, dx, dy, distance);
        particle.isRepelled = true;
      } else {
        // If particle was repelled and is now outside radius, apply springy return
        if (particle.isRepelled) {
          // Stronger return force for springy effect (1-2 seconds)
          this.applySpringyReturn(particle, dt);
        } else {
          // Normal gentle drift with simplex noise
          this.applyDrift(particle, dt);
          // Gentle spring back to home position
          this.applyReturn(particle, dt);
        }
      }

      // Update position based on velocity
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      // Apply damping - less damping for repelled particles so they snap back faster
      if (particle.isRepelled) {
        particle.vx *= 0.98; // Much less damping for fast return
        particle.vy *= 0.98;
      } else {
        particle.vx *= 0.95; // Normal damping for drift
        particle.vy *= 0.95;
      }

      // Check if particle has returned close to home (within 2px)
      const distToHome = Math.sqrt(
        Math.pow(particle.x - particle.homeX, 2) +
          Math.pow(particle.y - particle.homeY, 2)
      );
      if (distToHome < 2 && particle.isRepelled) {
        particle.isRepelled = false;
      }
    }
  }

  /**
   * Ease-out cubic function for smooth animation
   */
  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }

  /**
   * Apply drift using simplex noise
   */
  private applyDrift(particle: Particle, deltaTime: number): void {
    const freq = this.config.driftFrequency;
    const amp = this.config.driftAmplitude;
    const speed = this.config.driftSpeed;

    // Use particle's unique noise offset for variation
    const noiseX = this.noise.getValue(
      (particle.homeX + particle.noiseOffsetX) * freq,
      0,
      this.time * speed
    );

    const noiseY = this.noise.getValue(
      (particle.homeY + particle.noiseOffsetY) * freq,
      0,
      this.time * speed + 100 // Offset Y noise
    );

    // Apply as gentle force
    particle.vx += noiseX * amp * deltaTime;
    particle.vy += noiseY * amp * deltaTime;
  }

  /**
   * Apply spring force to return to home position
   */
  private applyReturn(particle: Particle, deltaTime: number): void {
    // Calculate distance from home
    const dx = particle.homeX - particle.x;
    const dy = particle.homeY - particle.y;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq < 0.01) return; // Already at home

    const distance = Math.sqrt(distanceSq);

    // Apply spring force (stronger when farther from home)
    const returnForce = this.config.returnSpeed;

    particle.vx += (dx / distance) * returnForce * distance * deltaTime;
    particle.vy += (dy / distance) * returnForce * distance * deltaTime;
  }

  /**
   * Apply stronger spring force for springy return after mouse repulsion (0.5-1 seconds)
   * Force increases exponentially with distance for uniform return speed
   */
  private applySpringyReturn(particle: Particle, deltaTime: number): void {
    const dx = particle.homeX - particle.x;
    const dy = particle.homeY - particle.y;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq < 0.01) {
      particle.isRepelled = false;
      return;
    }

    const distance = Math.sqrt(distanceSq);

    // Distance-based acceleration: farther particles get exponentially stronger force
    // This ensures all particles return at similar speed regardless of distance
    const distanceMultiplier = 1 + (distance / 50); // Accelerate based on distance
    const springForce = this.config.returnSpeed * 5 * distanceMultiplier;

    particle.vx += (dx / distance) * springForce * distance * deltaTime;
    particle.vy += (dy / distance) * springForce * distance * deltaTime;
  }

  /**
   * Apply repulsion force from mouse
   */
  private applyRepulsion(
    particle: Particle,
    dx: number,
    dy: number,
    distance: number
  ): void {
    // Normalize direction
    const dirX = dx / distance;
    const dirY = dy / distance;

    // Calculate force (inverse square falloff for natural feel)
    const falloff = 1 - distance / this.config.repulsionRadius;
    const force = this.config.repulsionStrength * falloff * falloff;

    // Apply force away from mouse
    particle.vx += dirX * force;
    particle.vy += dirY * force;

    particle.isRepelled = true;
  }

  /**
   * Handle dispersed particle (from click)
   */
  private updateDispersedParticle(particle: Particle, deltaTime: number): void {
    // Update position
    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;

    // Apply friction to slow down
    particle.vx *= 0.92;
    particle.vy *= 0.92;

    // When reformed, smoothly return to home
    if (!particle.isDispersed) {
      this.applyReturn(particle, deltaTime);
    }
  }

  /**
   * Handle mouse movement
   */
  public onMouseMove(x: number, y: number): void {
    // Convert to particle coordinate system (centered at 0,0)
    const canvas = this.renderer.getCanvas();
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    this.state.mouseX = x - centerX;
    this.state.mouseY = y - centerY;
  }

  /**
   * Handle mouse down (disperse particles)
   */
  public onMouseDown(x: number, y: number): void {
    this.state.isMouseDown = true;

    // Convert to particle coordinate system
    const canvas = this.renderer.getCanvas();
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const clickX = x - centerX;
    const clickY = y - centerY;

    // Find particles within disperse radius
    for (const particle of this.state.particles) {
      const dx = particle.x - clickX;
      const dy = particle.y - clickY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < this.config.disperseRadius) {
        this.disperseParticle(particle, dx, dy, distance);
      }
    }

    this.state.disperseTime = performance.now();
  }

  /**
   * Handle mouse up
   */
  public onMouseUp(): void {
    this.state.isMouseDown = false;
  }

  /**
   * Handle double-click - reset all particles to home with smooth 0.5s animation
   */
  public onDoubleClick(): void {
    // Set all particles to returning state with animation
    for (const particle of this.state.particles) {
      particle.isRepelled = true; // Use repelled state for fast return
      particle.isDispersed = false; // Cancel any disperse state
    }
  }

  /**
   * Disperse a single particle
   */
  private disperseParticle(
    particle: Particle,
    dx: number,
    dy: number,
    distance: number
  ): void {
    particle.isDispersed = true;

    // Random scatter direction with some bias away from click
    const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * Math.PI * 0.5;
    const speed = this.config.disperseSpeed * (1 + Math.random() * 0.5);

    particle.vx = Math.cos(angle) * speed;
    particle.vy = Math.sin(angle) * speed;

    // Schedule return to home
    setTimeout(() => {
      particle.isDispersed = false;
    }, this.config.reformDelay);
  }

  /**
   * Update FPS counter
   */
  private updateFPS(currentTime: number): void {
    this.frameCount++;

    if (currentTime - this.fpsUpdateTime > 1000) {
      this.state.fps = Math.round(
        (this.frameCount * 1000) / (currentTime - this.fpsUpdateTime)
      );
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;

      // Warning if performance degrades
      if (this.state.fps < 50) {
        console.warn(`Low FPS detected: ${this.state.fps}`);
        this.monitorPerformance();
      }
    }
  }

  /**
   * Monitor performance and adjust if needed
   */
  private monitorPerformance(): void {
    if (this.state.fps < 50 && this.state.particles.length > 5000) {
      // Performance is struggling, reduce particle count
      const reduceBy = 500;
      this.state.particles = this.state.particles.slice(0, -reduceBy);
      this.renderer.removeParticles(reduceBy);

      console.warn(`Reduced particle count to ${this.state.particles.length}`);
    }
  }

  /**
   * Set UI update callback
   */
  public onUIUpdate(callback: (state: UIState) => void): void {
    this.uiUpdateCallback = callback;
  }

  /**
   * Update UI state
   */
  private updateUI(): void {
    if (this.uiUpdateCallback) {
      this.uiUpdateCallback({
        particleCount: this.state.particles.length,
        fps: this.state.fps,
        isAnimating: this.animationFrameId !== null,
      });
    }
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    // Stop animation loop
    this.stop();

    // Destroy renderer
    this.renderer.destroy();

    // Clear particle array
    this.state.particles = [];
  }
}
