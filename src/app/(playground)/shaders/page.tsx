'use client';

/**
 * Shader Playground - Main page component
 * Full-screen WebGL canvas with side drawer controls
 */

import { useState } from 'react';
import { ShaderCanvas } from './components/shader-canvas';
import { ControlsDrawer } from './components/controls-drawer';
import { DEFAULT_SHADER_CONFIG } from './types';
import type { ShaderConfig } from './types';

export default function ShadersPage() {
  const [config, setConfig] = useState<ShaderConfig>(DEFAULT_SHADER_CONFIG);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black">
      {/* Full-screen shader canvas */}
      <ShaderCanvas config={config} />

      {/* Controls drawer (floating button + slide-out panel) */}
      <ControlsDrawer config={config} onConfigChange={setConfig} />

      {/* Optional: Title overlay */}
      <div className="pointer-events-none absolute left-6 top-6 z-30">
        <h1 className="text-3xl font-bold text-white drop-shadow-lg">
          Shader Playground
        </h1>
        <p className="mt-1 text-sm text-white/60">
          WebGL Fragment Shader Effects
        </p>
      </div>
    </div>
  );
}
