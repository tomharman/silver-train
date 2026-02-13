'use client';

/**
 * Controls drawer component - side panel with all shader controls
 * Slides out from right side, contains collapsible sections for all parameters
 */

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Accordion from '@radix-ui/react-accordion';
import { GradientEditor } from './gradient-editor';
import { GradientPresets } from './gradient-presets';
import { EffectMode, ShapeType, type ShaderConfig } from '../types';

export interface ControlsDrawerProps {
  config: ShaderConfig;
  onConfigChange: (config: ShaderConfig) => void;
}

export function ControlsDrawer({ config, onConfigChange }: ControlsDrawerProps) {
  const [open, setOpen] = useState(false);

  const updateConfig = (updates: Partial<ShaderConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const updateShape = (updates: Partial<ShaderConfig['shape']>) => {
    updateConfig({ shape: { ...config.shape, ...updates } });
  };

  const updateKaleidoscope = (updates: Partial<ShaderConfig['kaleidoscope']>) => {
    updateConfig({ kaleidoscope: { ...config.kaleidoscope, ...updates } });
  };

  const updateAnimation = (updates: Partial<ShaderConfig['animation']>) => {
    updateConfig({ animation: { ...config.animation, ...updates } });
  };

  const updateEnhancement = (updates: Partial<ShaderConfig['enhancement']>) => {
    updateConfig({ enhancement: { ...config.enhancement, ...updates } });
  };

  const showShapeControls = config.effectMode === EffectMode.InfinityMirror || config.effectMode === EffectMode.Combined;
  const showKaleidoscopeControls = config.effectMode === EffectMode.Kaleidoscope || config.effectMode === EffectMode.Combined;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* Floating toggle button */}
      <Dialog.Trigger asChild>
        <button
          className="fixed right-6 top-6 z-40 rounded-full bg-white/10 p-3 backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110"
          aria-label="Open controls"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M5.5 3C4.67157 3 4 3.67157 4 4.5C4 5.32843 4.67157 6 5.5 6C6.32843 6 7 5.32843 7 4.5C7 3.67157 6.32843 3 5.5 3ZM3 5C3.01671 5 3.03323 4.99918 3.04952 4.99758C3.28022 6.1399 4.28967 7 5.5 7C6.71033 7 7.71978 6.1399 7.95048 4.99758C7.96677 4.99918 7.98329 5 8 5H13.5C13.7761 5 14 4.77614 14 4.5C14 4.22386 13.7761 4 13.5 4H8C7.98329 4 7.96677 4.00082 7.95048 4.00242C7.71978 2.86009 6.71033 2 5.5 2C4.28967 2 3.28022 2.86009 3.04952 4.00242C3.03323 4.00082 3.01671 4 3 4H1.5C1.22386 4 1 4.22386 1 4.5C1 4.77614 1.22386 5 1.5 5H3ZM11.9505 10.9976C11.7198 12.1399 10.7103 13 9.5 13C8.28967 13 7.28022 12.1399 7.04952 10.9976C7.03323 10.9992 7.01671 11 7 11H1.5C1.22386 11 1 10.7761 1 10.5C1 10.2239 1.22386 10 1.5 10H7C7.01671 10 7.03323 10.0008 7.04952 10.0024C7.28022 8.8601 8.28967 8 9.5 8C10.7103 8 11.7198 8.8601 11.9505 10.0024C11.9668 10.0008 11.9833 10 12 10H13.5C13.7761 10 14 10.2239 14 10.5C14 10.7761 13.7761 11 13.5 11H12C11.9833 11 11.9668 10.9992 11.9505 10.9976ZM8 10.5C8 9.67157 8.67157 9 9.5 9C10.3284 9 11 9.67157 11 10.5C11 11.3284 10.3284 12 9.5 12C8.67157 12 8 11.3284 8 10.5Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Drawer */}
        <Dialog.Content className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-gray-900/95 p-6 shadow-2xl backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-md">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-white">
              Shader Controls
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white">
              <svg
                width="20"
                height="20"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
            </Dialog.Close>
          </div>

          {/* Collapsible sections */}
          <Accordion.Root type="multiple" defaultValue={['effect-mode', 'gradient', 'animation']} className="flex flex-col gap-2">
            {/* Effect Mode Section */}
            <AccordionItem value="effect-mode">
              <AccordionTrigger>Effect Mode</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-2">
                  {[
                    EffectMode.GradientFlow,
                    EffectMode.InfinityMirror,
                    EffectMode.Kaleidoscope,
                    EffectMode.Combined,
                  ].map((mode) => (
                    <label
                      key={mode}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
                    >
                      <input
                        type="radio"
                        name="effectMode"
                        value={mode}
                        checked={config.effectMode === mode}
                        onChange={() => updateConfig({ effectMode: mode })}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-white">
                        {mode === EffectMode.GradientFlow && 'Gradient Flow'}
                        {mode === EffectMode.InfinityMirror && 'Infinity Mirror'}
                        {mode === EffectMode.Kaleidoscope && 'Kaleidoscope'}
                        {mode === EffectMode.Combined && 'Combined (Mirror + Kaleidoscope)'}
                      </span>
                    </label>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Shape Controls (conditional) */}
            {showShapeControls && (
              <AccordionItem value="shape">
                <AccordionTrigger>Shape Controls</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-4">
                    {/* Shape Type */}
                    <div>
                      <label className="mb-2 block text-xs text-white/60">Shape Type</label>
                      <select
                        value={config.shape.type}
                        onChange={(e) => updateShape({ type: e.target.value as ShapeType })}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-white/20 focus:outline-none"
                      >
                        <option value="rectangle">Rectangle</option>
                        <option value="circle">Circle</option>
                        <option value="triangle">Triangle</option>
                        <option value="hexagon">Hexagon</option>
                      </select>
                    </div>

                    {/* Layer Count */}
                    <SliderControl
                      label="Layer Count"
                      value={config.shape.layerCount}
                      onChange={(v) => updateShape({ layerCount: v })}
                      min={5}
                      max={50}
                      step={1}
                    />

                    {/* Spacing */}
                    <SliderControl
                      label="Layer Spacing"
                      value={config.shape.spacing}
                      onChange={(v) => updateShape({ spacing: v })}
                      min={0.5}
                      max={5}
                      step={0.1}
                    />

                    {/* Size Scale */}
                    <SliderControl
                      label="Size Scale"
                      value={config.shape.sizeScale}
                      onChange={(v) => updateShape({ sizeScale: v })}
                      min={0.8}
                      max={0.98}
                      step={0.01}
                    />

                    {/* Corner Radius (for rectangles) */}
                    {config.shape.type === 'rectangle' && (
                      <SliderControl
                        label="Corner Radius"
                        value={config.shape.cornerRadius}
                        onChange={(v) => updateShape({ cornerRadius: v })}
                        min={0}
                        max={0.5}
                        step={0.01}
                      />
                    )}

                    {/* Rotation */}
                    <SliderControl
                      label="Rotation"
                      value={config.shape.rotation}
                      onChange={(v) => updateShape({ rotation: v })}
                      min={-180}
                      max={180}
                      step={1}
                      suffix="°"
                    />

                    {/* Rotation Per Layer */}
                    <SliderControl
                      label="Rotation Per Layer"
                      value={config.shape.rotationPerLayer}
                      onChange={(v) => updateShape({ rotationPerLayer: v })}
                      min={0}
                      max={45}
                      step={1}
                      suffix="°"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Kaleidoscope Controls (conditional) */}
            {showKaleidoscopeControls && (
              <AccordionItem value="kaleidoscope">
                <AccordionTrigger>Kaleidoscope Controls</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-4">
                    {/* Segments */}
                    <SliderControl
                      label="Segments"
                      value={config.kaleidoscope.segments}
                      onChange={(v) => updateKaleidoscope({ segments: v })}
                      min={3}
                      max={24}
                      step={1}
                    />

                    {/* Mirror Toggles */}
                    <div className="flex gap-4">
                      <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
                        <input
                          type="checkbox"
                          checked={config.kaleidoscope.mirrorX}
                          onChange={(e) => updateKaleidoscope({ mirrorX: e.target.checked })}
                          className="h-4 w-4"
                        />
                        <span className="text-sm text-white">Mirror X</span>
                      </label>
                      <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
                        <input
                          type="checkbox"
                          checked={config.kaleidoscope.mirrorY}
                          onChange={(e) => updateKaleidoscope({ mirrorY: e.target.checked })}
                          className="h-4 w-4"
                        />
                        <span className="text-sm text-white">Mirror Y</span>
                      </label>
                    </div>

                    {/* Segment Rotation */}
                    <SliderControl
                      label="Segment Rotation"
                      value={config.kaleidoscope.rotation}
                      onChange={(v) => updateKaleidoscope({ rotation: v })}
                      min={-180}
                      max={180}
                      step={1}
                      suffix="°"
                    />

                    {/* Center Offset X */}
                    <SliderControl
                      label="Center Offset X"
                      value={config.kaleidoscope.centerOffsetX}
                      onChange={(v) => updateKaleidoscope({ centerOffsetX: v })}
                      min={-1}
                      max={1}
                      step={0.01}
                    />

                    {/* Center Offset Y */}
                    <SliderControl
                      label="Center Offset Y"
                      value={config.kaleidoscope.centerOffsetY}
                      onChange={(v) => updateKaleidoscope({ centerOffsetY: v })}
                      min={-1}
                      max={1}
                      step={0.01}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Gradient Editor */}
            <AccordionItem value="gradient">
              <AccordionTrigger>Gradient</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4">
                  <GradientPresets
                    onApplyPreset={(stops) => updateConfig({ gradient: { stops } })}
                  >
                    <button className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition-colors hover:bg-white/10">
                      Browse Presets
                    </button>
                  </GradientPresets>

                  <GradientEditor
                    stops={config.gradient.stops}
                    onStopsChange={(stops) => updateConfig({ gradient: { stops } })}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Colour Enhancement */}
            <AccordionItem value="enhancement">
              <AccordionTrigger>Colour Enhancement</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4">
                  <SliderControl
                    label="Luminosity Boost"
                    value={config.enhancement.luminosity}
                    onChange={(v) => updateEnhancement({ luminosity: v })}
                    min={1}
                    max={2}
                    step={0.1}
                  />

                  <SliderControl
                    label="Saturation"
                    value={config.enhancement.saturation}
                    onChange={(v) => updateEnhancement({ saturation: v })}
                    min={0.5}
                    max={2}
                    step={0.1}
                  />

                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
                    <input
                      type="checkbox"
                      checked={config.enhancement.autoExtract}
                      onChange={(e) => updateEnhancement({ autoExtract: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-white">Auto-Extract from Image</span>
                  </label>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Animation */}
            <AccordionItem value="animation">
              <AccordionTrigger>Animation</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-4">
                  <SliderControl
                    label="Speed"
                    value={config.animation.speed}
                    onChange={(v) => updateAnimation({ speed: v })}
                    min={0.1}
                    max={3}
                    step={0.1}
                    suffix="×"
                  />

                  <SliderControl
                    label="Pulse Intensity"
                    value={config.animation.pulseIntensity}
                    onChange={(v) => updateAnimation({ pulseIntensity: v })}
                    min={0}
                    max={1}
                    step={0.1}
                  />

                  <SliderControl
                    label="Time Offset"
                    value={config.animation.timeOffset}
                    onChange={(v) => updateAnimation({ timeOffset: v })}
                    min={0}
                    max={10}
                    step={0.1}
                  />

                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
                    <input
                      type="checkbox"
                      checked={config.animation.reverse}
                      onChange={(e) => updateAnimation({ reverse: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-white">Reverse Direction</span>
                  </label>

                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
                    <input
                      type="checkbox"
                      checked={config.animation.scaleAnimation}
                      onChange={(e) => updateAnimation({ scaleAnimation: e.target.checked })}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-white">Scale Animation (Breathe)</span>
                  </label>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Accordion Item component
function AccordionItem({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <Accordion.Item
      value={value}
      className="overflow-hidden rounded-lg border border-white/10 bg-white/5"
    >
      {children}
    </Accordion.Item>
  );
}

// Accordion Trigger component
function AccordionTrigger({ children }: { children: React.ReactNode }) {
  return (
    <Accordion.Header>
      <Accordion.Trigger className="flex w-full items-center justify-between p-4 text-left text-sm font-medium text-white transition-colors hover:bg-white/5">
        {children}
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-200 group-data-[state=open]:rotate-180"
        >
          <path
            d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      </Accordion.Trigger>
    </Accordion.Header>
  );
}

// Accordion Content component
function AccordionContent({ children }: { children: React.ReactNode }) {
  return (
    <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
      <div className="p-4 pt-0">{children}</div>
    </Accordion.Content>
  );
}

// Slider Control component
interface SliderControlProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}

function SliderControl({ label, value, onChange, min, max, step, suffix = '' }: SliderControlProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-xs text-white/60">{label}</label>
        <span className="text-xs text-white">
          {value.toFixed(step < 1 ? 2 : 0)}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full accent-white"
      />
    </div>
  );
}
