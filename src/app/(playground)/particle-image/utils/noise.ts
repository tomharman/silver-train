import { createNoise2D, type NoiseFunction2D } from "simplex-noise";

export class NoiseField {
  private noise: NoiseFunction2D;

  constructor() {
    this.noise = createNoise2D();
  }

  /**
   * Get noise value at position and time
   * Returns value between -1 and 1
   */
  public getValue(x: number, y: number, time: number): number {
    return this.noise(x, y + time);
  }

  /**
   * Get 2D noise vector for organic movement
   */
  public getVector(
    x: number,
    y: number,
    time: number,
    frequency: number
  ): { x: number; y: number } {
    const noiseX = this.getValue(x * frequency, y * frequency, time);
    const noiseY = this.getValue(
      x * frequency + 1000, // Offset to get different noise
      y * frequency + 1000,
      time
    );

    return { x: noiseX, y: noiseY };
  }
}
