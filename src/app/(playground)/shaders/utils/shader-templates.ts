/**
 * Shader template generators for different effect modes
 * Generates GLSL code for Gradient Flow, Infinity Mirror, Kaleidoscope, and Combined effects
 */

import { SDF_LIBRARY, generateLayerCode } from './sdf-functions';
import type { ShaderConfig, EffectMode } from '../types';

/**
 * Common vertex shader (used for all effects)
 */
export const VERTEX_SHADER = /* glsl */ `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

/**
 * Common GLSL utilities used across all shaders
 */
const COMMON_UTILS = /* glsl */ `
precision highp float;

uniform vec2 resolution;
uniform float time;

// Noise function
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);

  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

float fbm(vec2 st) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for (int i = 0; i < 6; i++) {
    value += amplitude * noise(st * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}
`;

/**
 * Generate gradient sampling function based on stop count
 * Uses manual unrolling to avoid dynamic array indexing issues in WebGL
 */
function generateGradientSampler(maxStops: number): string {
  // Generate unrolled if-else chain for gradient sampling
  const segments = [];
  for (let i = 0; i < maxStops - 1; i++) {
    segments.push(`
  if (gradientStopCount > ${i + 1} && t >= gradientPositions[${i}] && t <= gradientPositions[${i + 1}]) {
    float segT = (t - gradientPositions[${i}]) / (gradientPositions[${i + 1}] - gradientPositions[${i}]);
    return mix(gradientColors[${i}], gradientColors[${i + 1}], segT);
  }`);
  }

  // Generate fallback for last color (must use constant indices)
  const fallbacks = [];
  for (let i = maxStops - 1; i >= 0; i--) {
    fallbacks.push(`
  if (gradientStopCount == ${i + 1}) return gradientColors[${i}];`);
  }

  return /* glsl */ `
uniform vec3 gradientColors[${maxStops}];
uniform float gradientPositions[${maxStops}];
uniform int gradientStopCount;

vec3 sampleGradient(float t) {
  // Clamp to valid range
  t = clamp(t, 0.0, 1.0);

  // Handle edge cases
  if (t <= gradientPositions[0]) {
    return gradientColors[0];
  }

  // Unrolled gradient segment checks (avoids dynamic array indexing)
  ${segments.join('\n  ')}

  // Fallback to last color based on stop count (using constant indices)
  ${fallbacks.join('\n  ')}

  return gradientColors[0]; // Final fallback
}
`;
}

/**
 * Generate Gradient Flow shader (FBM noise-based gradient blending)
 */
export function generateGradientFlowShader(config: ShaderConfig): string {
  const maxStops = 10;

  return /* glsl */ `
${COMMON_UTILS}
${generateGradientSampler(maxStops)}

uniform float scale;
uniform float complexity;
uniform float speed;
uniform float pulseIntensity;
uniform bool reverse;
uniform float timeOffset;
uniform bool scaleAnimation;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec2 st = uv * scale;

  // Apply time with speed and offset
  float t = (time * speed + timeOffset) * (reverse ? -1.0 : 1.0);

  // Animated noise with multiple octaves
  float n = fbm(st + t * 0.1);
  n += fbm(st * 2.0 - t * 0.15) * 0.5;
  n += fbm(st * 4.0 + t * 0.2) * 0.25;
  n /= (1.0 + 0.5 + 0.25);

  // Apply complexity modulation
  n = pow(n, 1.0 / (complexity * 0.2));

  // Apply pulse effect
  if (pulseIntensity > 0.0) {
    float pulse = sin(t * 2.0) * 0.5 + 0.5;
    n = mix(n, n * pulse, pulseIntensity);
  }

  // Sample gradient
  vec3 colour = sampleGradient(n);

  // Apply scale animation (breathing effect)
  if (scaleAnimation) {
    float breathe = sin(t * 0.5) * 0.1 + 1.0;
    colour *= breathe;
  }

  // Add subtle shimmer
  float shimmer = sin(t * 2.0 + uv.x * 10.0 + uv.y * 10.0) * 0.05 + 1.0;
  colour *= shimmer;

  gl_FragColor = vec4(colour, 1.0);
}
`;
}

/**
 * Generate Infinity Mirror shader (SDF-based layered shapes)
 */
export function generateInfinityMirrorShader(config: ShaderConfig): string {
  const maxStops = 10;
  const shapeType = config.shape.type;

  return /* glsl */ `
${COMMON_UTILS}
${SDF_LIBRARY}
${generateGradientSampler(maxStops)}

uniform int layerCount;
uniform float spacing;
uniform float sizeScale;
uniform float cornerRadius;
uniform float rotation;
uniform float rotationPerLayer;
uniform float speed;
uniform bool reverse;
uniform float timeOffset;

void main() {
  vec2 uv = (gl_FragCoord.xy / resolution.xy) * 2.0 - 1.0;
  uv.x *= resolution.x / resolution.y; // Aspect ratio correction

  // Apply time with speed and offset
  float t = (time * speed + timeOffset) * (reverse ? -1.0 : 1.0);

  // Animate rotation
  float animatedRotation = rotation + t * 0.5;

  ${generateLayerCode(shapeType)}

  gl_FragColor = vec4(finalColor, finalAlpha);
}
`;
}

/**
 * Generate Kaleidoscope UV transformation
 */
const KALEIDOSCOPE_TRANSFORM = /* glsl */ `
vec2 kaleidoscope(vec2 uv, int segments, bool mirrorX, bool mirrorY, float rotation, vec2 centerOffset) {
  // Apply center offset
  uv -= centerOffset;

  // Convert to polar coordinates
  float angle = atan(uv.y, uv.x);
  float radius = length(uv);

  // Apply rotation
  angle += rotation;

  // Segment angle
  float segAngle = TWO_PI / float(segments);

  // Fold into single segment
  angle = mod(angle, segAngle);

  // Mirror within segment
  if (mirrorX) {
    float halfSeg = segAngle * 0.5;
    if (angle > halfSeg) {
      angle = segAngle - angle;
    }
  }

  if (mirrorY) {
    // Flip radius direction every other segment
    int segIndex = int(mod(angle / segAngle, 2.0));
    if (segIndex == 1) {
      angle = segAngle - angle;
    }
  }

  // Convert back to Cartesian
  return vec2(cos(angle), sin(angle)) * radius + centerOffset;
}
`;

/**
 * Generate Kaleidoscope shader (radial symmetry applied to gradient flow)
 */
export function generateKaleidoscopeShader(config: ShaderConfig): string {
  const maxStops = 10;

  return /* glsl */ `
${COMMON_UTILS}
${SDF_LIBRARY}
${generateGradientSampler(maxStops)}
${KALEIDOSCOPE_TRANSFORM}

uniform float scale;
uniform float complexity;
uniform float speed;
uniform bool reverse;
uniform float timeOffset;
uniform int segments;
uniform bool mirrorX;
uniform bool mirrorY;
uniform float segmentRotation;
uniform float centerOffsetX;
uniform float centerOffsetY;

void main() {
  vec2 uv = (gl_FragCoord.xy / resolution.xy) * 2.0 - 1.0;
  uv.x *= resolution.x / resolution.y;

  // Apply kaleidoscope transformation
  vec2 kUV = kaleidoscope(uv, segments, mirrorX, mirrorY, segmentRotation, vec2(centerOffsetX, centerOffsetY));

  // Apply gradient flow effect to transformed UVs
  vec2 st = kUV * scale;
  float t = (time * speed + timeOffset) * (reverse ? -1.0 : 1.0);

  float n = fbm(st + t * 0.1);
  n += fbm(st * 2.0 - t * 0.15) * 0.5;
  n += fbm(st * 4.0 + t * 0.2) * 0.25;
  n /= (1.0 + 0.5 + 0.25);

  n = pow(n, 1.0 / (complexity * 0.2));

  vec3 colour = sampleGradient(n);

  float shimmer = sin(t * 2.0 + kUV.x * 10.0 + kUV.y * 10.0) * 0.05 + 1.0;
  colour *= shimmer;

  gl_FragColor = vec4(colour, 1.0);
}
`;
}

/**
 * Generate Combined shader (Kaleidoscope + Infinity Mirror)
 */
export function generateCombinedShader(config: ShaderConfig): string {
  const maxStops = 10;
  const shapeType = config.shape.type;

  return /* glsl */ `
${COMMON_UTILS}
${SDF_LIBRARY}
${generateGradientSampler(maxStops)}
${KALEIDOSCOPE_TRANSFORM}

uniform int layerCount;
uniform float spacing;
uniform float sizeScale;
uniform float cornerRadius;
uniform float rotation;
uniform float rotationPerLayer;
uniform float speed;
uniform bool reverse;
uniform float timeOffset;
uniform int segments;
uniform bool mirrorX;
uniform bool mirrorY;
uniform float segmentRotation;
uniform float centerOffsetX;
uniform float centerOffsetY;

void main() {
  vec2 uv = (gl_FragCoord.xy / resolution.xy) * 2.0 - 1.0;
  uv.x *= resolution.x / resolution.y;

  // Apply kaleidoscope transformation
  vec2 kUV = kaleidoscope(uv, segments, mirrorX, mirrorY, segmentRotation, vec2(centerOffsetX, centerOffsetY));

  // Apply infinity mirror effect to kaleidoscoped UVs
  float t = (time * speed + timeOffset) * (reverse ? -1.0 : 1.0);
  float animatedRotation = rotation + t * 0.5;

  ${generateLayerCode(shapeType)}

  gl_FragColor = vec4(finalColor, finalAlpha);
}
`;
}

/**
 * Get the appropriate shader for the given effect mode
 */
export function getShaderForMode(mode: EffectMode, config: ShaderConfig): string {
  switch (mode) {
    case 'gradient':
      return generateGradientFlowShader(config);
    case 'mirror':
      return generateInfinityMirrorShader(config);
    case 'kaleidoscope':
      return generateKaleidoscopeShader(config);
    case 'combined':
      return generateCombinedShader(config);
    default:
      return generateGradientFlowShader(config);
  }
}

/**
 * Get list of uniform names for a given effect mode
 * Used to set uniform values in WebGL
 */
export function getUniformsForMode(mode: EffectMode): string[] {
  const commonUniforms = [
    'resolution',
    'time',
    'gradientColors',
    'gradientPositions',
    'gradientStopCount',
    'speed',
    'reverse',
    'timeOffset',
  ];

  const gradientFlowUniforms = [...commonUniforms, 'scale', 'complexity', 'pulseIntensity', 'scaleAnimation'];

  const mirrorUniforms = [
    ...commonUniforms,
    'layerCount',
    'spacing',
    'sizeScale',
    'cornerRadius',
    'rotation',
    'rotationPerLayer',
  ];

  const kaleidoscopeUniforms = [
    ...commonUniforms,
    'scale',
    'complexity',
    'segments',
    'mirrorX',
    'mirrorY',
    'segmentRotation',
    'centerOffsetX',
    'centerOffsetY',
  ];

  const combinedUniforms = [
    ...commonUniforms,
    'layerCount',
    'spacing',
    'sizeScale',
    'cornerRadius',
    'rotation',
    'rotationPerLayer',
    'segments',
    'mirrorX',
    'mirrorY',
    'segmentRotation',
    'centerOffsetX',
    'centerOffsetY',
  ];

  switch (mode) {
    case 'gradient':
      return gradientFlowUniforms;
    case 'mirror':
      return mirrorUniforms;
    case 'kaleidoscope':
      return kaleidoscopeUniforms;
    case 'combined':
      return combinedUniforms;
    default:
      return gradientFlowUniforms;
  }
}
