let context: AudioContext | null = null;
let unlocked = false;

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

function create(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (context) return context;

  const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!Ctor) return null;

  try {
    context = new Ctor();
  } catch {
    return null;
  }
  return context;
}

/**
 * iOS will not let a page make a sound until an AudioContext has been created
 * *and* resumed inside a real user gesture, and it silently suspends the
 * context again whenever the page goes to the background. Without this, the
 * first noise the game tries to make is the computer's reply — which happens on
 * a timer, not a tap — and audio stays dead for the whole session.
 *
 * So: unlock on the first touch anywhere, and top the context up on every
 * later interaction, which is cheap when it is already running.
 */
export function unlockAudio(): void {
  const ctx = create();
  if (!ctx) return;

  if (ctx.state === "suspended") void ctx.resume();

  if (!unlocked) {
    // A single silent sample. Some iOS versions need one to consider the
    // context genuinely started.
    try {
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      unlocked = true;
    } catch {
      // If it fails we simply try again on the next interaction.
    }
  }
}

function blip(frequency: number, duration: number, type: OscillatorType, delay = 0, gain = 0.14) {
  const ctx = context;
  // Deliberately does not create the context: if we have not been unlocked by a
  // real gesture yet there is nothing useful to play into.
  if (!ctx || ctx.state !== "running") return;

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
  /** A rising run — a pawn just became something much better. */
  promote: () => {
    [523, 659, 784, 988, 1319].forEach((note, index) =>
      blip(note, 0.16, "triangle", index * 0.07, 0.11),
    );
  },
  /** Two low knocks. Meant to prickle slightly: your king is in trouble. */
  check: () => {
    blip(300, 0.12, "square", 0, 0.09);
    blip(240, 0.16, "square", 0.14, 0.09);
  },
  /** Sparkle for a new sticker. */
  sticker: () => {
    [1047, 1319, 1568].forEach((note, index) => blip(note, 0.12, "sine", index * 0.06, 0.09));
  },
  win: () => {
    // A proper little fanfare, because winning should sound like winning.
    const fanfare: [number, number][] = [
      [523, 0],
      [659, 0.1],
      [784, 0.2],
      [1047, 0.3],
      [784, 0.45],
      [1047, 0.55],
      [1319, 0.68],
    ];
    fanfare.forEach(([note, at]) => blip(note, 0.22, "triangle", at, 0.12));
  },
  draw: () => {
    blip(400, 0.16, "sine", 0, 0.1);
    blip(330, 0.22, "sine", 0.14, 0.1);
  },
};
