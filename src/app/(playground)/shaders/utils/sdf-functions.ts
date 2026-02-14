/**
 * Signed Distance Field (SDF) GLSL functions for shape rendering
 * These functions return the distance from a point to the nearest surface of a shape
 * Used for efficient infinity mirror effect rendering
 */

/**
 * Common GLSL constants and utilities for SDF functions
 */
export const SDF_COMMON = /* glsl */ `
// Mathematical constants
#define PI 3.14159265359
#define TWO_PI 6.28318530718

// 2D rotation matrix
mat2 rotate2D(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

// Smooth minimum function for blending shapes
float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}
`;

/**
 * Rectangle SDF with rounded corners
 * @param p - Point position
 * @param b - Box half-size (width/2, height/2)
 * @param r - Corner radius (0 = sharp corners)
 */
export const SDF_BOX = /* glsl */ `
float sdBox(vec2 p, vec2 b, float r) {
  vec2 d = abs(p) - b + r;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}
`;

/**
 * Circle SDF
 * @param p - Point position
 * @param r - Circle radius
 */
export const SDF_CIRCLE = /* glsl */ `
float sdCircle(vec2 p, float r) {
  return length(p) - r;
}
`;

/**
 * Regular polygon SDF (triangle, hexagon, octagon, etc.)
 * @param p - Point position
 * @param n - Number of sides (3 = triangle, 6 = hexagon, etc.)
 * @param r - Radius
 */
export const SDF_POLYGON = /* glsl */ `
float sdPolygon(vec2 p, int n, float r) {
  float a = atan(p.y, p.x) + PI;
  float segment = TWO_PI / float(n);
  float halfSegment = segment / 2.0;

  // Find nearest segment
  float segmentIndex = floor(a / segment);
  float segmentAngle = segmentIndex * segment + halfSegment;

  // Project point onto segment edge
  vec2 segmentDir = vec2(cos(segmentAngle), sin(segmentAngle));
  float dist = dot(p, segmentDir);

  // Distance to polygon edge
  return dist - r * cos(halfSegment);
}
`;

/**
 * Equilateral triangle SDF (optimized)
 * @param p - Point position
 * @param r - Radius (circumradius)
 */
export const SDF_TRIANGLE = /* glsl */ `
float sdTriangle(vec2 p, float r) {
  const float k = sqrt(3.0);
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) {
    p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  }
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}
`;

/**
 * Regular hexagon SDF (optimized)
 * @param p - Point position
 * @param r - Radius (circumradius)
 */
export const SDF_HEXAGON = /* glsl */ `
float sdHexagon(vec2 p, float r) {
  const vec3 k = vec3(-0.866025404, 0.5, 0.577350269);
  p = abs(p);
  p -= 2.0 * min(dot(k.xy, p), 0.0) * k.xy;
  p -= vec2(clamp(p.x, -k.z * r, k.z * r), r);
  return length(p) * sign(p.y);
}
`;

/**
 * Star SDF (5-pointed star)
 * @param p - Point position
 * @param r - Outer radius
 * @param n - Number of points (typically 5)
 * @param m - Inner radius factor (0.0-1.0, default ~0.4)
 */
export const SDF_STAR = /* glsl */ `
float sdStar(vec2 p, float r, int n, float m) {
  float an = PI / float(n);
  float en = PI / 2.0;
  vec2 acs = vec2(cos(an), sin(an));
  vec2 ecs = vec2(cos(en), sin(en));

  float bn = mod(atan(p.y, p.x), 2.0 * an) - an;
  p = length(p) * vec2(cos(bn), abs(sin(bn)));
  p -= r * acs;
  p += ecs * clamp(-dot(p, ecs), 0.0, r * acs.y / ecs.y);

  return length(p) * sign(p.x);
}
`;

/**
 * Rounded X (cross) SDF
 * @param p - Point position
 * @param w - Width of each arm
 * @param r - Corner radius
 */
export const SDF_CROSS = /* glsl */ `
float sdCross(vec2 p, float w, float r) {
  p = abs(p);
  p = (p.y > p.x) ? p.yx : p.xy;

  vec2 q = p - w;
  float k = max(q.y, q.x);
  vec2 w2 = (k > 0.0) ? q : vec2(w - p.x, -k);

  return sign(k) * length(max(w2, 0.0)) + r;
}
`;

/**
 * Vesica (lens/eye shape formed by two circles)
 * @param p - Point position
 * @param r - Radius of circles
 * @param d - Distance between circle centres
 */
export const SDF_VESICA = /* glsl */ `
float sdVesica(vec2 p, float r, float d) {
  p = abs(p);
  float b = sqrt(r * r - d * d);
  return ((p.y - b) * d > p.x * b)
    ? length(p - vec2(0.0, b))
    : length(p - vec2(-d, 0.0)) - r;
}
`;

/**
 * Helper function to get anti-aliased alpha from SDF distance
 * @param dist - SDF distance value
 * @param width - Anti-aliasing width in pixels (typically 1-2)
 */
export const SDF_TO_ALPHA = /* glsl */ `
float sdfToAlpha(float dist, float width) {
  return 1.0 - smoothstep(-width, width, dist);
}
`;

/**
 * Combined SDF library export
 * Includes all SDF functions ready to use in shaders
 */
export const SDF_LIBRARY = /* glsl */ `
${SDF_COMMON}
${SDF_BOX}
${SDF_CIRCLE}
${SDF_POLYGON}
${SDF_TRIANGLE}
${SDF_HEXAGON}
${SDF_STAR}
${SDF_CROSS}
${SDF_VESICA}
${SDF_TO_ALPHA}
`;

/**
 * Get SDF function call for a specific shape type
 * Returns the GLSL function call string with parameters
 */
export function getShapeSDF(shapeType: string): string {
  switch (shapeType) {
    case 'rectangle':
      return 'sdBox(p, vec2(size), cornerRadius * size)';
    case 'circle':
      return 'sdCircle(p, size)';
    case 'triangle':
      return 'sdTriangle(p, size)';
    case 'hexagon':
      return 'sdHexagon(p, size)';
    case 'star':
      return 'sdStar(p, size, 5, 0.4)';
    case 'cross':
      return 'sdCross(p, size * 0.3, size * 0.1)';
    default:
      return 'sdCircle(p, size)';
  }
}

/**
 * Infinity mirror layer rendering template
 * Generates GLSL code for rendering concentric layered shapes
 */
export function generateLayerCode(shapeType: string): string {
  const shapeSDF = getShapeSDF(shapeType);

  return /* glsl */ `
  // Infinity mirror layer rendering
  vec3 finalColor = vec3(0.0);
  float finalAlpha = 0.0;

  for (int i = 0; i < layerCount; i++) {
    if (finalAlpha >= 0.99) break; // Early exit optimization

    float layerIndex = float(i);
    float layerT = layerIndex / float(layerCount - 1);

    // Calculate layer transform
    float layerScale = pow(sizeScale, layerIndex);
    float layerRotation = rotation + rotationPerLayer * layerIndex;

    // Transform point for this layer
    vec2 p = uv;
    p *= rotate2D(layerRotation);
    p /= layerScale;

    // Calculate SDF distance
    float size = layerScale * spacing;
    float dist = ${shapeSDF};

    // Anti-aliased alpha
    float aa = 2.0 / resolution.y;
    float alpha = sdfToAlpha(dist, aa);

    // Skip if outside shape
    if (alpha < 0.01) continue;

    // Sample gradient colour for this layer
    float gradientT = mod(layerT * float(gradientStopCount), 1.0);
    vec3 layerColor = sampleGradient(gradientT);

    // Apply depth fade
    float depthFade = mix(1.0, 0.3, layerT);
    layerColor *= depthFade;

    // Blend with existing colour
    finalColor = mix(finalColor, layerColor, alpha * (1.0 - finalAlpha));
    finalAlpha = finalAlpha + alpha * (1.0 - finalAlpha);
  }
  `;
}
