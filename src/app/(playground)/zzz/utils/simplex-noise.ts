/**
 * Simplex Noise implementation for smooth, organic animations
 * Based on Stefan Gustavson's implementation
 */

// Permutation table
const perm = new Uint8Array(512);
const gradP = new Array(512);

// Gradient vectors for 3D
const grad3 = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1],
];

// Seeding function
function seed(seedValue: number) {
  if (seedValue > 0 && seedValue < 1) {
    seedValue *= 65536;
  }

  seedValue = Math.floor(seedValue);
  if (seedValue < 256) {
    seedValue |= seedValue << 8;
  }

  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) {
    let v: number;
    if (i & 1) {
      v = p[i] ^ (seedValue & 255);
    } else {
      v = p[i] ^ ((seedValue >> 8) & 255);
    }
    // Simple PRNG
    v = ((seedValue * 16807) % 2147483647) & 255;
    seedValue = (seedValue * 16807) % 2147483647;
    p[i] = v;
  }

  for (let i = 0; i < 256; i++) {
    perm[i] = perm[i + 256] = p[i];
    gradP[i] = gradP[i + 256] = grad3[p[i] % 12];
  }
}

// Initialize with a default seed
seed(Math.random() * 65536);

function dot2(g: number[], x: number, y: number): number {
  return g[0] * x + g[1] * y;
}

// Skewing factors for 2D simplex
const F2 = 0.5 * (Math.sqrt(3) - 1);
const G2 = (3 - Math.sqrt(3)) / 6;

/**
 * 2D Simplex Noise
 * Returns value between -1 and 1
 */
export function noise2D(xin: number, yin: number): number {
  let n0: number, n1: number, n2: number;

  // Skew the input space to determine which simplex cell we're in
  const s = (xin + yin) * F2;
  const i = Math.floor(xin + s);
  const j = Math.floor(yin + s);

  const t = (i + j) * G2;
  const X0 = i - t;
  const Y0 = j - t;
  const x0 = xin - X0;
  const y0 = yin - Y0;

  // Determine which simplex we're in
  let i1: number, j1: number;
  if (x0 > y0) {
    i1 = 1;
    j1 = 0;
  } else {
    i1 = 0;
    j1 = 1;
  }

  const x1 = x0 - i1 + G2;
  const y1 = y0 - j1 + G2;
  const x2 = x0 - 1 + 2 * G2;
  const y2 = y0 - 1 + 2 * G2;

  // Get gradient indices
  const ii = i & 255;
  const jj = j & 255;

  // Calculate contribution from three corners
  let t0 = 0.5 - x0 * x0 - y0 * y0;
  if (t0 < 0) {
    n0 = 0;
  } else {
    t0 *= t0;
    const gi0 = gradP[ii + perm[jj]];
    n0 = t0 * t0 * dot2(gi0, x0, y0);
  }

  let t1 = 0.5 - x1 * x1 - y1 * y1;
  if (t1 < 0) {
    n1 = 0;
  } else {
    t1 *= t1;
    const gi1 = gradP[ii + i1 + perm[jj + j1]];
    n1 = t1 * t1 * dot2(gi1, x1, y1);
  }

  let t2 = 0.5 - x2 * x2 - y2 * y2;
  if (t2 < 0) {
    n2 = 0;
  } else {
    t2 *= t2;
    const gi2 = gradP[ii + 1 + perm[jj + 1]];
    n2 = t2 * t2 * dot2(gi2, x2, y2);
  }

  // Return value scaled to [-1, 1]
  return 70 * (n0 + n1 + n2);
}

/**
 * Fractal/Octave noise for more organic movement
 */
export function fractalNoise2D(
  x: number,
  y: number,
  octaves: number = 4,
  persistence: number = 0.5
): number {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    total += noise2D(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= 2;
  }

  return total / maxValue;
}
