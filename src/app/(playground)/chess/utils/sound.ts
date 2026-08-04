let context: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!context) {
    try {
      context = new AudioContext();
    } catch {
      return null;
    }
  }
  if (context.state === "suspended") void context.resume();
  return context;
}

function blip(frequency: number, duration: number, type: OscillatorType, delay = 0, gain = 0.14) {
  const ctx = audio();
  if (!ctx) return;

  const start = ctx.currentTime + delay;
  const oscillator = ctx.createOscillator();
  const envelope = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);

  envelope.gain.setValueAtTime(0.0001, start);
  envelope.gain.exponentialRampToValueAtTime(gain, start + 0.01);
  envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.connect(envelope).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export const sounds = {
  pick: () => blip(660, 0.06, "sine", 0, 0.08),
  move: () => blip(440, 0.09, "triangle"),
  capture: () => {
    blip(180, 0.14, "square", 0, 0.1);
    blip(90, 0.18, "sine", 0.02, 0.12);
  },
  win: () => {
    [523, 659, 784, 1047].forEach((note, index) => blip(note, 0.18, "triangle", index * 0.1, 0.12));
  },
  draw: () => {
    blip(400, 0.16, "sine", 0, 0.1);
    blip(330, 0.22, "sine", 0.14, 0.1);
  },
};
