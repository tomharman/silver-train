import type { ParticleData } from "../types/particle";

export class ImageProcessor {
  /**
   * Convert image to particle positions using density-based sampling
   * (matching reference image aesthetic)
   * @param imageFile - Uploaded image file
   * @param targetParticleCount - Desired number of particles (8000-12000)
   * @param useImageColors - If true, extract RGB colors; if false, returns white
   * @returns Array of particle data
   */
  async processImage(
    imageFile: File,
    targetParticleCount: number = 10000,
    useImageColors: boolean = false
  ): Promise<ParticleData[]> {
    // 1. Load image
    const img = await this.loadImage(imageFile);

    // 2. Draw to canvas and get pixel data
    const { imageData, width, height } = this.getImageData(img);

    // 3. Extract particles using density-based sampling
    const particles = this.extractParticlesWithDensity(
      imageData,
      width,
      height,
      targetParticleCount,
      useImageColors
    );

    // 4. Center and scale particles
    return this.normalizeParticles(particles, width, height);
  }

  /**
   * Load image from file
   */
  private async loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url); // Free memory
        resolve(img);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to load image"));
      };

      img.src = url;
    });
  }

  /**
   * Draw image to canvas and extract pixel data
   */
  private getImageData(
    img: HTMLImageElement
  ): { imageData: ImageData; width: number; height: number } {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    canvas.width = img.width;
    canvas.height = img.height;

    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, img.width, img.height);

    return {
      imageData,
      width: img.width,
      height: img.height,
    };
  }

  /**
   * Extract particles using density-based sampling
   * This creates the stippling effect from the reference image:
   * - Dark areas get more particles
   * - Light areas get fewer particles
   */
  private extractParticlesWithDensity(
    imageData: ImageData,
    width: number,
    height: number,
    targetCount: number,
    useImageColors: boolean
  ): ParticleData[] {
    const particles: ParticleData[] = [];
    const data = imageData.data; // RGBA array

    // Calculate sampling interval for grid
    const totalPixels = width * height;
    const samplingInterval = Math.max(
      1,
      Math.floor(Math.sqrt(totalPixels / (targetCount * 1.5)))
    );

    // Sample pixels on a grid
    for (let y = 0; y < height; y += samplingInterval) {
      for (let x = 0; x < width; x += samplingInterval) {
        const index = (y * width + x) * 4;
        const alpha = data[index + 3];

        // Skip transparent pixels
        if (alpha < 128) continue;

        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        // Calculate brightness (0-255)
        const brightness = (r + g + b) / 3;

        // Density-based sampling: darker pixels have higher probability
        // This creates the stippling effect
        const samplingProbability = 1 - brightness / 255;

        // Use random sampling based on darkness
        if (Math.random() < samplingProbability) {
          const color = useImageColors
            ? (r << 16) | (g << 8) | b // Convert to PIXI color
            : 0xffffff; // White (will be overridden by palette)

          particles.push({
            x,
            y,
            color,
            brightness, // Store brightness for color palette assignment
          });
        }
      }
    }

    // If we don't have enough particles, add more from brightest areas
    if (particles.length < targetCount * 0.5) {
      // Second pass with lighter threshold
      for (let y = 0; y < height; y += samplingInterval) {
        for (let x = 0; x < width; x += samplingInterval) {
          const index = (y * width + x) * 4;
          const alpha = data[index + 3];

          if (alpha < 128) continue;

          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          const brightness = (r + g + b) / 3;

          // More lenient sampling
          if (Math.random() < 0.3 && particles.length < targetCount) {
            const color = useImageColors
              ? (r << 16) | (g << 8) | b
              : 0xffffff;

            particles.push({
              x,
              y,
              color,
              brightness,
            });
          }
        }
      }
    }

    return particles;
  }

  /**
   * Normalize particles (center at 0,0 and scale to fit)
   */
  private normalizeParticles(
    particles: ParticleData[],
    originalWidth: number,
    originalHeight: number
  ): ParticleData[] {
    // Center particles at (0, 0)
    const centerX = originalWidth / 2;
    const centerY = originalHeight / 2;

    // Scale to fit canvas (e.g., 600px max dimension)
    const maxDimension = Math.max(originalWidth, originalHeight);
    const scale = 600 / maxDimension; // Target 600px max

    return particles.map((p) => ({
      ...p,
      x: (p.x - centerX) * scale,
      y: (p.y - centerY) * scale,
    }));
  }

  /**
   * Estimate optimal particle count based on image characteristics
   */
  public static estimateOptimalParticleCount(
    imageWidth: number,
    imageHeight: number,
    visiblePixelCount: number
  ): number {
    const imageArea = imageWidth * imageHeight;
    const visibilityRatio = visiblePixelCount / imageArea;

    // For dense images (>70% visible), use fewer particles
    if (visibilityRatio > 0.7) {
      return Math.min(visiblePixelCount, 10000);
    }

    // For sparse images (<30% visible), use more to maintain detail
    if (visibilityRatio < 0.3) {
      return Math.min(visiblePixelCount * 2, 12000);
    }

    // For medium images, target 10000
    return 10000;
  }
}
