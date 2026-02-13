import { boostColour, type RGB } from './color-utils';

/**
 * Extract dominant colours from an image using k-means clustering
 * @param imageData - ImageData from canvas
 * @param numColours - Number of dominant colours to extract (default: 5)
 * @param luminosityBoost - Multiplier for luminosity (1.0-2.0, default: 1.0)
 * @param saturationBoost - Multiplier for saturation (0.5-2.0, default: 1.0)
 */
export function extractColours(
  imageData: ImageData,
  numColours = 5,
  luminosityBoost = 1.0,
  saturationBoost = 1.0
): number[][] {
  const pixels: RGB[] = [];
  const data = imageData.data;

  // Sample pixels (every 10th pixel for performance)
  for (let i = 0; i < data.length; i += 40) {
    pixels.push([
      data[i] / 255,
      data[i + 1] / 255,
      data[i + 2] / 255
    ]);
  }

  // Simple k-means clustering
  let centroids: RGB[] = [];
  for (let i = 0; i < numColours; i++) {
    centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
  }

  // Iterate to find better centroids
  for (let iter = 0; iter < 10; iter++) {
    const clusters: RGB[][] = Array(numColours).fill(null).map(() => []);

    // Assign pixels to nearest centroid
    pixels.forEach(pixel => {
      let minDist = Infinity;
      let clusterIndex = 0;

      centroids.forEach((centroid, i) => {
        const dist = Math.sqrt(
          Math.pow(pixel[0] - centroid[0], 2) +
          Math.pow(pixel[1] - centroid[1], 2) +
          Math.pow(pixel[2] - centroid[2], 2)
        );
        if (dist < minDist) {
          minDist = dist;
          clusterIndex = i;
        }
      });

      clusters[clusterIndex].push(pixel);
    });

    // Update centroids
    centroids = clusters.map(cluster => {
      if (cluster.length === 0) return centroids[0];

      const sum = cluster.reduce((acc, pixel) => [
        acc[0] + pixel[0],
        acc[1] + pixel[1],
        acc[2] + pixel[2]
      ], [0, 0, 0] as RGB);

      return [
        sum[0] / cluster.length,
        sum[1] / cluster.length,
        sum[2] / cluster.length,
      ] as RGB;
    });
  }

  // Apply luminosity and saturation boosts if specified
  if (luminosityBoost !== 1.0 || saturationBoost !== 1.0) {
    centroids = centroids.map(colour =>
      boostColour(colour, luminosityBoost, saturationBoost)
    );
  }

  return centroids;
}
