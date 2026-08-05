import type { PieceType } from "../../chess/types";
import { play, playAll, type Note } from "../../chess/utils/sound";

/**
 * Every creature has a voice.
 *
 * A single move sound tells you a move happened. A different sound per creature
 * tells you *which* creature moved, which is one more way the game teaches the
 * pieces without a word of explanation — and a five year old will work out that
 * the boing is the puffer long before he can name a king.
 *
 * Each is built from the same primitive: a frequency, optionally gliding to
 * another, over a few tens of milliseconds.
 */

type Voice = () => void;

const VOICES: Record<PieceType, Voice> = {
  // Crab: two tiny clicks, like claws on stone.
  pawn: () =>
    playAll([
      { freq: 880, duration: 0.045, type: "square", gain: 0.07 },
      { freq: 1120, duration: 0.045, type: "square", at: 0.07, gain: 0.06 },
    ]),

  // Dolphin: a swoop up, because it just leapt.
  knight: () =>
    play({ freq: 420, to: 1250, duration: 0.22, type: "sine", gain: 0.12 }),

  // Seahorse: a gentle glide, two soft notes.
  bishop: () =>
    playAll([
      { freq: 700, to: 880, duration: 0.16, type: "triangle", gain: 0.09 },
      { freq: 990, duration: 0.1, type: "sine", at: 0.14, gain: 0.06 },
    ]),

  // Turtle: a low, unhurried thunk.
  rook: () =>
    playAll([
      { freq: 200, to: 150, duration: 0.18, type: "sine", gain: 0.14 },
      { freq: 100, duration: 0.12, type: "triangle", at: 0.02, gain: 0.08 },
    ]),

  // Octopus: a warble that goes everywhere, like she does.
  queen: () =>
    playAll([
      { freq: 520, duration: 0.08, type: "sine", gain: 0.09 },
      { freq: 720, duration: 0.08, type: "sine", at: 0.07, gain: 0.09 },
      { freq: 900, to: 760, duration: 0.14, type: "sine", at: 0.14, gain: 0.09 },
    ]),

  // Pufferfish: a boing. He is round.
  king: () =>
    playAll([
      { freq: 300, to: 560, duration: 0.1, type: "triangle", gain: 0.12 },
      { freq: 520, to: 320, duration: 0.16, type: "triangle", at: 0.09, gain: 0.1 },
    ]),
};

/** The sound of that creature crossing the board. */
export function creatureMove(type: PieceType): void {
  VOICES[type]();
}

/** Picking one up: a small bubble. */
export function creaturePick(): void {
  play({ freq: 760, to: 1020, duration: 0.07, type: "sine", gain: 0.07 });
}

/** Something got eaten. A chomp, then a bubble escaping. */
export function creatureEaten(): void {
  const notes: Note[] = [
    { freq: 210, to: 90, duration: 0.13, type: "square", gain: 0.13 },
    { freq: 130, duration: 0.16, type: "sine", at: 0.03, gain: 0.1 },
    { freq: 900, to: 1400, duration: 0.12, type: "sine", at: 0.14, gain: 0.05 },
  ];
  playAll(notes);
}

/** A creature grew up. Bubbles rising. */
export function creatureGrew(): void {
  playAll(
    [440, 620, 780, 980, 1240].map((freq, i) => ({
      freq,
      to: freq * 1.12,
      duration: 0.15,
      type: "sine" as OscillatorType,
      at: i * 0.06,
      gain: 0.1,
    })),
  );
}

/** Your king is in trouble. Two urgent low pulses. */
export function reefAlarm(): void {
  playAll([
    { freq: 320, to: 260, duration: 0.14, type: "square", gain: 0.11 },
    { freq: 320, to: 240, duration: 0.18, type: "square", at: 0.17, gain: 0.11 },
  ]);
}
