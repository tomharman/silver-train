import { useEffect, useRef } from "react";

interface DroneEngineProps {
  audioContext: AudioContext | null;
  isPlaying: boolean;
  waveform: OscillatorType;
  detune: number;
  filterCutoff: number;
  resonance: number;
  lfoRate: number;
  lfoDepth: number;
  volume: number;
}

export function useDroneEngine({
  audioContext,
  isPlaying,
  waveform,
  detune,
  filterCutoff,
  resonance,
  lfoRate,
  lfoDepth,
  volume,
}: DroneEngineProps) {
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!audioContext) return;

    if (isPlaying && !osc1Ref.current) {
      // Create audio nodes
      osc1Ref.current = audioContext.createOscillator();
      osc2Ref.current = audioContext.createOscillator();
      lfoRef.current = audioContext.createOscillator();
      filterRef.current = audioContext.createBiquadFilter();
      lfoGainRef.current = audioContext.createGain();
      masterGainRef.current = audioContext.createGain();

      // Configure oscillators
      osc1Ref.current.type = waveform;
      osc1Ref.current.frequency.setValueAtTime(110, audioContext.currentTime); // A2

      osc2Ref.current.type = waveform;
      osc2Ref.current.frequency.setValueAtTime(110, audioContext.currentTime);
      osc2Ref.current.detune.setValueAtTime(detune, audioContext.currentTime);

      // Configure filter
      filterRef.current.type = "lowpass";
      filterRef.current.frequency.setValueAtTime(
        filterCutoff,
        audioContext.currentTime
      );
      filterRef.current.Q.setValueAtTime(resonance, audioContext.currentTime);

      // Configure LFO
      lfoRef.current.type = "sine";
      lfoRef.current.frequency.setValueAtTime(lfoRate, audioContext.currentTime);
      lfoGainRef.current.gain.setValueAtTime(lfoDepth, audioContext.currentTime);

      // Configure master gain
      masterGainRef.current.gain.setValueAtTime(volume, audioContext.currentTime);

      // Connect the audio graph
      osc1Ref.current.connect(filterRef.current);
      osc2Ref.current.connect(filterRef.current);
      filterRef.current.connect(masterGainRef.current);
      masterGainRef.current.connect(audioContext.destination);

      // Connect LFO to filter frequency
      lfoRef.current.connect(lfoGainRef.current);
      lfoGainRef.current.connect(filterRef.current.frequency);

      // Start oscillators
      osc1Ref.current.start();
      osc2Ref.current.start();
      lfoRef.current.start();
    } else if (!isPlaying && osc1Ref.current) {
      // Stop and disconnect
      osc1Ref.current.stop();
      osc2Ref.current?.stop();
      lfoRef.current?.stop();

      osc1Ref.current.disconnect();
      osc2Ref.current?.disconnect();
      lfoRef.current?.disconnect();
      filterRef.current?.disconnect();
      lfoGainRef.current?.disconnect();
      masterGainRef.current?.disconnect();

      osc1Ref.current = null;
      osc2Ref.current = null;
      lfoRef.current = null;
      filterRef.current = null;
      lfoGainRef.current = null;
      masterGainRef.current = null;
    }

    return () => {
      if (osc1Ref.current) {
        try {
          osc1Ref.current.stop();
          osc2Ref.current?.stop();
          lfoRef.current?.stop();
        } catch (e) {
          // Oscillators may already be stopped
        }
      }
    };
  }, [audioContext, isPlaying]);

  // Update parameters in real-time
  useEffect(() => {
    if (!audioContext || !osc1Ref.current) return;

    const now = audioContext.currentTime;
    osc1Ref.current.type = waveform;
    osc2Ref.current!.type = waveform;
  }, [audioContext, waveform]);

  useEffect(() => {
    if (!audioContext || !osc2Ref.current) return;

    osc2Ref.current.detune.exponentialRampToValueAtTime(
      detune,
      audioContext.currentTime + 0.05
    );
  }, [audioContext, detune]);

  useEffect(() => {
    if (!audioContext || !filterRef.current) return;

    filterRef.current.frequency.exponentialRampToValueAtTime(
      Math.max(20, filterCutoff),
      audioContext.currentTime + 0.05
    );
  }, [audioContext, filterCutoff]);

  useEffect(() => {
    if (!audioContext || !filterRef.current) return;

    filterRef.current.Q.linearRampToValueAtTime(
      resonance,
      audioContext.currentTime + 0.05
    );
  }, [audioContext, resonance]);

  useEffect(() => {
    if (!audioContext || !lfoRef.current) return;

    lfoRef.current.frequency.exponentialRampToValueAtTime(
      Math.max(0.01, lfoRate),
      audioContext.currentTime + 0.05
    );
  }, [audioContext, lfoRate]);

  useEffect(() => {
    if (!audioContext || !lfoGainRef.current) return;

    lfoGainRef.current.gain.linearRampToValueAtTime(
      lfoDepth,
      audioContext.currentTime + 0.05
    );
  }, [audioContext, lfoDepth]);

  useEffect(() => {
    if (!audioContext || !masterGainRef.current) return;

    masterGainRef.current.gain.linearRampToValueAtTime(
      volume,
      audioContext.currentTime + 0.05
    );
  }, [audioContext, volume]);
}
