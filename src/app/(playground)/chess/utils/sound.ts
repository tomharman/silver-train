/**
 * Sound, and the several separate reasons it doesn't happen on an iPhone.
 *
 * 1. The context must be created and resumed inside a real user gesture. That
 *    part was already handled, and wasn't the whole story.
 * 2. `resume()` is asynchronous. Anything scheduled in the same tap used to be
 *    dropped, because the old code refused to schedule while the context was
 *    still "suspended". Now we schedule regardless — the note is queued and
 *    plays the moment the context starts.
 * 3. **The ringer switch.** This is the one that actually kept Reef Quest
 *    silent. By default Safari puts Web Audio in the "ambient" session, which
 *    the hardware mute switch silences — so the game was correctly making
 *    sounds that the phone was throwing away. Asking for the "playback" session
 *    tells iOS this is content the user came for, and it plays with the ringer
 *    off, like a video would.
 * 4. iOS suspends the context whenever the page goes to the background, and
 *    does not always resume it on return, so we re-resume on visibility change.
 */

let context: AudioContext | null = null;
let master: GainNode | null = null;
let primed = false;

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };
type SessionNavigator = Navigator & { audioSession?: { type: string } };

function claimPlaybackSession(): void {
  try {
    const session = (navigator as SessionNavigator).audioSession;
    // Safari 16.4+. Everywhere else this is simply absent.
    if (session) session.type = "playback";
  } catch {
    // Never worth breaking the game over.
  }
}

function create(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (context) return context;

  const Ctor = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
  if (!Ctor) return null;

  try {
    claimPlaybackSession();
    context = new Ctor();
    master = context.createGain();
    master.gain.value = 0.9;
    master.connect(context.destination);
  } catch {
    return null;
  }
  return context;
}

/** Call from any real user gesture. Cheap once it has taken. */
export function unlockAudio(): void {
  const ctx = create();
  if (!ctx) return;

  claimPlaybackSession();
  if (ctx.state !== "running") void ctx.resume();

  if (!primed) {
    try {
      // A single silent sample. Some iOS versions want one before they treat
      // the context as genuinely started.
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      primed = true;
    } catch {
      // Try again on the next interaction.
    }
  }
}

/** Wires the unlock to everything iOS might accept as a gesture. */
export function listenForUnlock(): () => void {
  if (typeof window === "undefined") return () => {};

  const wake = () => unlockAudio();
  const events: (keyof WindowEventMap)[] = ["pointerdown", "touchend", "click", "keydown"];
  events.forEach((event) => window.addEventListener(event, wake, { capture: true, passive: true }));

  const onVisible = () => {
    if (document.visibilityState === "visible" && context && context.state !== "running") {
      void context.resume();
    }
  };
  document.addEventListener("visibilitychange", onVisible);

  return () => {
    events.forEach((event) => window.removeEventListener(event, wake, { capture: true }));
    document.removeEventListener("visibilitychange", onVisible);
  };
}

export interface Note {
  /** Starting frequency in Hz. */
  freq: number;
  /** Optional glide to a second frequency — this is what makes a swoop. */
  to?: number;
  duration: number;
  type?: OscillatorType;
  /** Seconds from now. */
  at?: number;
  gain?: number;
}

/**
 * Plays a note. Schedules even when the context is still starting up, because
 * on iOS the first tap resumes and plays in the same breath.
 */
export function play(note: Note): void {
  const ctx = context ?? create();
  if (!ctx || !master) return;

  if (ctx.state !== "running") void ctx.resume();

  const { freq, to, duration, type = "sine", at = 0, gain = 0.14 } = note;
  const start = ctx.currentTime + at;

  try {
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, start);
    if (to !== undefined) oscillator.frequency.linearRampToValueAtTime(to, start + duration);

    envelope.gain.setValueAtTime(0.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain, start + Math.min(0.012, duration * 0.3));
    envelope.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(envelope).connect(master);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.03);
  } catch {
    // A browser that has run out of oscillators is not a reason to stop play.
  }
}

/** Plays a short sequence. */
export function playAll(notes: Note[]): void {
  notes.forEach(play);
}

export const sounds = {
  pick: () => play({ freq: 660, duration: 0.06, type: "sine", gain: 0.08 }),
  move: () => play({ freq: 440, duration: 0.09, type: "triangle" }),
  capture: () =>
    playAll([
      { freq: 180, duration: 0.14, type: "square", gain: 0.1 },
      { freq: 90, duration: 0.18, type: "sine", at: 0.02, gain: 0.12 },
    ]),
  /** A rising run — a pawn just became something much better. */
  promote: () =>
    playAll(
      [523, 659, 784, 988, 1319].map((freq, i) => ({
        freq,
        duration: 0.16,
        type: "triangle" as OscillatorType,
        at: i * 0.07,
        gain: 0.11,
      })),
    ),
  /** Two low knocks. Meant to prickle slightly: your king is in trouble. */
  check: () =>
    playAll([
      { freq: 300, duration: 0.12, type: "square", gain: 0.09 },
      { freq: 240, duration: 0.16, type: "square", at: 0.14, gain: 0.09 },
    ]),
  sticker: () =>
    playAll(
      [1047, 1319, 1568].map((freq, i) => ({
        freq,
        duration: 0.12,
        type: "sine" as OscillatorType,
        at: i * 0.06,
        gain: 0.09,
      })),
    ),
  win: () =>
    playAll(
      (
        [
          [523, 0],
          [659, 0.1],
          [784, 0.2],
          [1047, 0.3],
          [784, 0.45],
          [1047, 0.55],
          [1319, 0.68],
        ] as [number, number][]
      ).map(([freq, at]) => ({
        freq,
        duration: 0.22,
        type: "triangle" as OscillatorType,
        at,
        gain: 0.12,
      })),
    ),
  draw: () =>
    playAll([
      { freq: 400, duration: 0.16, type: "sine", gain: 0.1 },
      { freq: 330, duration: 0.22, type: "sine", at: 0.14, gain: 0.1 },
    ]),
};
