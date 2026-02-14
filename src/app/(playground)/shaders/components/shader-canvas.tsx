'use client';

/**
 * ShaderCanvas - Full-screen WebGL canvas component
 * Renders shader effects based on ShaderConfig
 */

import { useEffect, useRef } from 'react';
import { createShaderProgramFromConfig, updateShaderUniforms } from '../utils/webgl-utils';
import type { ShaderConfig } from '../types';

export interface ShaderCanvasProps {
  config: ShaderConfig;
}

export function ShaderCanvas({ config }: ShaderCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Initialize WebGL context
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    glRef.current = gl;

    // Set canvas size to match viewport
    const resizeCanvas = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Create/rebuild shader program when effect mode or config changes
  useEffect(() => {
    const gl = glRef.current;
    if (!gl) return;

    // Create new shader program
    const program = createShaderProgramFromConfig(gl, config);
    if (!program) {
      console.error('Failed to create shader program');
      return;
    }

    // Clean up old program
    if (programRef.current) {
      gl.deleteProgram(programRef.current);
    }

    programRef.current = program;
    gl.useProgram(program);

    // Create fullscreen quad
    const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // Reset start time when mode changes
    startTimeRef.current = Date.now();
  }, [config.effectMode, config.shape.type]); // Rebuild on mode or shape change

  // Animation loop
  useEffect(() => {
    const gl = glRef.current;
    const canvas = canvasRef.current;
    const program = programRef.current;
    if (!gl || !canvas || !program) return;

    const animate = () => {
      const time = (Date.now() - startTimeRef.current) / 1000;

      // Update all uniforms
      updateShaderUniforms(gl, program, config, time, {
        width: canvas.width,
        height: canvas.height,
      });

      // Draw fullscreen quad
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [config]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ display: 'block' }}
    />
  );
}
