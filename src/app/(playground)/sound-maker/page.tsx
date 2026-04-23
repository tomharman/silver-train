"use client";

import { useState } from "react";
import { useAudioContext } from "./hooks/useAudioContext";
import { useDroneEngine } from "./components/DroneEngine";
import { ControlKnob } from "./components/ControlKnob";

export default function SoundMakerPage() {
  const { audioContext, initializeAudioContext } = useAudioContext();
  const [isPlaying, setIsPlaying] = useState(false);

  // Synth parameters
  const [waveform, setWaveform] = useState<OscillatorType>("sine");
  const [detune, setDetune] = useState(7);
  const [filterCutoff, setFilterCutoff] = useState(2000);
  const [resonance, setResonance] = useState(1);
  const [lfoRate, setLfoRate] = useState(0.5);
  const [lfoDepth, setLfoDepth] = useState(300);
  const [volume, setVolume] = useState(0.3);

  useDroneEngine({
    audioContext,
    isPlaying,
    waveform,
    detune,
    filterCutoff,
    resonance,
    lfoRate,
    lfoDepth,
    volume,
  });

  const handlePowerToggle = () => {
    if (!audioContext) {
      initializeAudioContext();
    }
    setIsPlaying(!isPlaying);
  };

  const waveforms: OscillatorType[] = ["sine", "triangle", "sawtooth", "square"];
  const waveformIndex = waveforms.indexOf(waveform);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Drone Synthesizer</h1>
        <p className="text-sm text-muted-foreground">
          OP-1-inspired ambient sound generator
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-4xl rounded-lg border bg-card p-8 shadow-sm">
          {/* Power Button */}
          <div className="mb-8 flex justify-center">
            <button
              onClick={handlePowerToggle}
              className={`rounded-full px-8 py-3 text-sm font-medium transition-all ${
                isPlaying
                  ? "bg-foreground text-background shadow-lg"
                  : "border-2 border-muted-foreground/25 bg-background text-foreground hover:border-foreground/50"
              }`}
            >
              {isPlaying ? "■ Stop" : "▶ Start"}
            </button>
          </div>

          {/* Controls Grid */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {/* Waveform Selector */}
            <div className="flex flex-col items-center gap-3">
              <div
                className="relative cursor-pointer select-none"
                onClick={() => {
                  const nextIndex = (waveformIndex + 1) % waveforms.length;
                  setWaveform(waveforms[nextIndex]);
                }}
                style={{ width: 80, height: 80 }}
              >
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="30"
                    fill="currentColor"
                    className="text-background"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <text
                    x="40"
                    y="48"
                    textAnchor="middle"
                    fontSize="12"
                    fill="currentColor"
                    className="text-foreground font-mono"
                  >
                    {waveform.slice(0, 3).toUpperCase()}
                  </text>
                </svg>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm font-medium text-foreground">Wave</div>
                <div className="text-xs text-muted-foreground">
                  {waveform}
                </div>
              </div>
            </div>

            {/* Detune */}
            <ControlKnob
              label="Detune"
              value={detune}
              min={-50}
              max={50}
              onChange={setDetune}
              step={0.1}
              unit=" cents"
            />

            {/* Filter Cutoff */}
            <ControlKnob
              label="Filter"
              value={filterCutoff}
              min={100}
              max={8000}
              onChange={setFilterCutoff}
              step={1}
              unit=" Hz"
              exponential
            />

            {/* Resonance */}
            <ControlKnob
              label="Resonance"
              value={resonance}
              min={0.1}
              max={20}
              onChange={setResonance}
              step={0.1}
              unit=""
            />

            {/* LFO Rate */}
            <ControlKnob
              label="LFO Rate"
              value={lfoRate}
              min={0.1}
              max={10}
              onChange={setLfoRate}
              step={0.1}
              unit=" Hz"
            />

            {/* LFO Depth */}
            <ControlKnob
              label="LFO Depth"
              value={lfoDepth}
              min={0}
              max={1000}
              onChange={setLfoDepth}
              step={1}
              unit=" Hz"
            />

            {/* Volume */}
            <ControlKnob
              label="Volume"
              value={volume}
              min={0}
              max={1}
              onChange={setVolume}
              step={0.01}
              unit=""
            />
          </div>

          {/* Info Text */}
          {!isPlaying && (
            <div className="mt-8 text-center">
              <p className="text-xs text-muted-foreground">
                Click Start to begin • Drag knobs vertically to adjust
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
