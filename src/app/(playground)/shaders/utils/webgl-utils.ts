/**
 * WebGL utilities for shader compilation and program management
 * Refactored to support multiple effect modes and dynamic gradient stops
 */

import { VERTEX_SHADER, getShaderForMode, getUniformsForMode } from './shader-templates';
import type { ShaderConfig, EffectMode } from '../types';

/**
 * Create and compile a WebGL shader
 */
function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    console.error('Shader source:', source);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

/**
 * Create vertex shader
 */
export function createVertexShader(gl: WebGLRenderingContext): WebGLShader | null {
  return createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
}

/**
 * Create fragment shader based on shader configuration
 */
export function createFragmentShader(
  gl: WebGLRenderingContext,
  config: ShaderConfig
): WebGLShader | null {
  const source = getShaderForMode(config.effectMode, config);
  return createShader(gl, gl.FRAGMENT_SHADER, source);
}

/**
 * Create and link a shader program
 */
export function createShaderProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

/**
 * Create a complete shader program from config
 */
export function createShaderProgramFromConfig(
  gl: WebGLRenderingContext,
  config: ShaderConfig
): WebGLProgram | null {
  const vertexShader = createVertexShader(gl);
  const fragmentShader = createFragmentShader(gl, config);

  if (!vertexShader || !fragmentShader) {
    console.error('Failed to create shaders');
    return null;
  }

  const program = createShaderProgram(gl, vertexShader, fragmentShader);

  // Clean up shaders (they're compiled into the program now)
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  return program;
}

/**
 * Get uniform locations for a shader program
 */
export function getUniformLocations(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  mode: EffectMode
): Record<string, WebGLUniformLocation | null> {
  const uniformNames = getUniformsForMode(mode);
  const locations: Record<string, WebGLUniformLocation | null> = {};

  for (const name of uniformNames) {
    locations[name] = gl.getUniformLocation(program, name);
  }

  return locations;
}

/**
 * Update shader uniforms from config
 */
export function updateShaderUniforms(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  config: ShaderConfig,
  time: number,
  resolution: { width: number; height: number }
): void {
  gl.useProgram(program);

  const locations = getUniformLocations(gl, program, config.effectMode);

  // Common uniforms
  if (locations.resolution) {
    gl.uniform2f(locations.resolution, resolution.width, resolution.height);
  }
  if (locations.time) {
    gl.uniform1f(locations.time, time);
  }

  // Gradient uniforms
  if (locations.gradientStopCount) {
    gl.uniform1i(locations.gradientStopCount, config.gradient.stops.length);
  }

  if (locations.gradientColors) {
    const colors = config.gradient.stops.flatMap((stop) => stop.color);
    gl.uniform3fv(locations.gradientColors, colors);
  }

  if (locations.gradientPositions) {
    const positions = config.gradient.stops.map((stop) => stop.position);
    gl.uniform1fv(locations.gradientPositions, positions);
  }

  // Animation uniforms
  if (locations.speed) {
    gl.uniform1f(locations.speed, config.animation.speed);
  }
  if (locations.reverse) {
    gl.uniform1i(locations.reverse, config.animation.reverse ? 1 : 0);
  }
  if (locations.timeOffset) {
    gl.uniform1f(locations.timeOffset, config.animation.timeOffset);
  }

  // Mode-specific uniforms
  switch (config.effectMode) {
    case 'gradient':
      if (locations.scale) gl.uniform1f(locations.scale, 3.0); // Default scale
      if (locations.complexity) gl.uniform1f(locations.complexity, 5.0); // Default complexity
      if (locations.pulseIntensity) gl.uniform1f(locations.pulseIntensity, config.animation.pulseIntensity);
      if (locations.scaleAnimation) gl.uniform1i(locations.scaleAnimation, config.animation.scaleAnimation ? 1 : 0);
      break;

    case 'mirror':
      if (locations.layerCount) gl.uniform1i(locations.layerCount, config.shape.layerCount);
      if (locations.spacing) gl.uniform1f(locations.spacing, config.shape.spacing);
      if (locations.sizeScale) gl.uniform1f(locations.sizeScale, config.shape.sizeScale);
      if (locations.cornerRadius) gl.uniform1f(locations.cornerRadius, config.shape.cornerRadius);
      if (locations.rotation) gl.uniform1f(locations.rotation, (config.shape.rotation * Math.PI) / 180);
      if (locations.rotationPerLayer) gl.uniform1f(locations.rotationPerLayer, (config.shape.rotationPerLayer * Math.PI) / 180);
      break;

    case 'kaleidoscope':
      if (locations.scale) gl.uniform1f(locations.scale, 3.0);
      if (locations.complexity) gl.uniform1f(locations.complexity, 5.0);
      if (locations.segments) gl.uniform1i(locations.segments, config.kaleidoscope.segments);
      if (locations.mirrorX) gl.uniform1i(locations.mirrorX, config.kaleidoscope.mirrorX ? 1 : 0);
      if (locations.mirrorY) gl.uniform1i(locations.mirrorY, config.kaleidoscope.mirrorY ? 1 : 0);
      if (locations.segmentRotation) gl.uniform1f(locations.segmentRotation, (config.kaleidoscope.rotation * Math.PI) / 180);
      if (locations.centerOffsetX) gl.uniform1f(locations.centerOffsetX, config.kaleidoscope.centerOffsetX);
      if (locations.centerOffsetY) gl.uniform1f(locations.centerOffsetY, config.kaleidoscope.centerOffsetY);
      break;

    case 'combined':
      if (locations.layerCount) gl.uniform1i(locations.layerCount, config.shape.layerCount);
      if (locations.spacing) gl.uniform1f(locations.spacing, config.shape.spacing);
      if (locations.sizeScale) gl.uniform1f(locations.sizeScale, config.shape.sizeScale);
      if (locations.cornerRadius) gl.uniform1f(locations.cornerRadius, config.shape.cornerRadius);
      if (locations.rotation) gl.uniform1f(locations.rotation, (config.shape.rotation * Math.PI) / 180);
      if (locations.rotationPerLayer) gl.uniform1f(locations.rotationPerLayer, (config.shape.rotationPerLayer * Math.PI) / 180);
      if (locations.segments) gl.uniform1i(locations.segments, config.kaleidoscope.segments);
      if (locations.mirrorX) gl.uniform1i(locations.mirrorX, config.kaleidoscope.mirrorX ? 1 : 0);
      if (locations.mirrorY) gl.uniform1i(locations.mirrorY, config.kaleidoscope.mirrorY ? 1 : 0);
      if (locations.segmentRotation) gl.uniform1f(locations.segmentRotation, (config.kaleidoscope.rotation * Math.PI) / 180);
      if (locations.centerOffsetX) gl.uniform1f(locations.centerOffsetX, config.kaleidoscope.centerOffsetX);
      if (locations.centerOffsetY) gl.uniform1f(locations.centerOffsetY, config.kaleidoscope.centerOffsetY);
      break;
  }
}
