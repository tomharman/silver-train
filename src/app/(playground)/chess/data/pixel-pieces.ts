import type { PieceType } from "../types";

/**
 * The cast.
 *
 * Every piece is a little character drawn on an 11 x 12 grid of square cells.
 * The grid is the whole point: at the size a phone renders a square, a smooth
 * illustration turns to mush, whereas a chunky pixel silhouette survives being
 * shrunk to forty pixels and still reads as a crown or a castle.
 *
 * Two rules the shapes have to obey, and they pull against each other:
 *
 *   1. You must be able to tell a rook from a king across the room. So the
 *      difference lives in the TOP of the shape — battlements, a cross, five
 *      spikes, a pointed mitre, ears — where nothing else competes with it.
 *   2. Every one of them has to have room for a face in the same place, so the
 *      eyes can be drawn by one piece of code rather than six.
 *
 * `.` is empty and `#` is body. Colour comes from the world's palette, not from
 * here; these grids are pure shape.
 */

export const GRID_WIDTH = 11;
export const GRID_HEIGHT = 12;

export interface PixelPieceArt {
  rows: string[];
  /**
   * Top-left cell of the left eye. Each eye is two cells wide and one tall:
   * white behind, a one-cell pupil that slides inside it. The right eye is
   * mirrored about the middle column, so only the left one is written down.
   */
  eye: { x: number; y: number };
  /** Middle column of the mouth, and the row it sits on. */
  mouth: { x: number; y: number };
}

export const PIECE_ART: Record<PieceType, PixelPieceArt> = {
  /**
   * The smallest one on the board, and the only one that is only a head. The
   * others are all wider or taller than this; being able to say "the little
   * ones" and have it mean something is worth designing for.
   */
  pawn: {
    rows: [
      "...........",
      "...........",
      "...........",
      "....###....",
      "...#####...",
      "...#####...",
      "...#####...",
      "...#####...",
      "....###....",
      "...#####...",
      "..#######..",
      "...........",
    ],
    eye: { x: 3, y: 5 },
    mouth: { x: 5, y: 7 },
  },

  /** A castle: the widest thing here, with two gaps in the battlements. */
  rook: {
    rows: [
      "...........",
      ".##.###.##.",
      ".##.###.##.",
      ".#########.",
      ".#########.",
      ".#########.",
      ".#########.",
      ".#########.",
      ".#########.",
      ".#########.",
      "###########",
      "...........",
    ],
    eye: { x: 3, y: 5 },
    mouth: { x: 5, y: 7 },
  },

  /**
   * Two ears and a muzzle out to one side. The lopsidedness is deliberate: it
   * is the only piece in the set that isn't symmetrical, which is worth a great
   * deal when you are trying to find it in a row of six.
   */
  knight: {
    rows: [
      "...........",
      "...#...#...",
      "..###.###..",
      "..#######..",
      "..#######..",
      "..#######..",
      "#########..",
      "#########..",
      "..#######..",
      "..#######..",
      ".#########.",
      "...........",
    ],
    eye: { x: 3, y: 4 },
    mouth: { x: 2, y: 6 },
  },

  /** Narrow as the pawn, but twice as tall and it comes to a point. */
  bishop: {
    rows: [
      ".....#.....",
      "....###....",
      "....###....",
      "...#####...",
      "...#####...",
      "...#####...",
      "...#####...",
      "...#####...",
      "...#####...",
      "....###....",
      "..#######..",
      "...........",
    ],
    eye: { x: 3, y: 6 },
    mouth: { x: 5, y: 8 },
  },

  /**
   * Five spikes, right across the top.
   *
   * They have to be TALL and thin, not short and thin: a single row of spikes
   * and the rook's battlements are both "a row with gaps in it" at forty pixels,
   * and the two most valuable pieces on the board looked like each other.
   */
  queen: {
    rows: [
      ".#.#.#.#.#.",
      ".#.#.#.#.#.",
      ".#########.",
      "..#######..",
      "..#######..",
      "..#######..",
      "..#######..",
      "..#######..",
      "..#######..",
      "..#######..",
      ".#########.",
      "...........",
    ],
    eye: { x: 3, y: 4 },
    mouth: { x: 5, y: 6 },
  },

  /** A cross on top, and the only other one standing on a full-width base. */
  king: {
    rows: [
      ".....#.....",
      "...#####...",
      ".....#.....",
      "..#######..",
      "..#######..",
      "..#######..",
      "..#######..",
      "..#######..",
      "..#######..",
      "..#######..",
      "###########",
      "...........",
    ],
    eye: { x: 3, y: 5 },
    mouth: { x: 5, y: 7 },
  },
};

/**
 * How the face reacts to whatever just happened.
 *
 * Named `Face` rather than `Mood` because Pip already has a `Mood` and they are
 * not the same set — Pip is a narrator with five expressions, a piece is an
 * extra with six.
 */
export type Face = "calm" | "happy" | "cheer" | "worried" | "scared" | "sleepy";

/**
 * The mouth, as cells offset from the mouth anchor: [dx, dy, width].
 *
 * Heights are all one cell, so a mouth is a handful of little bars — which is
 * the whole vocabulary this style has, and quite enough. A `u` of three bars
 * with the middle one dropped is a smile; the same three with the middle one
 * raised is a frown.
 */
export const MOUTHS: Record<Face, [number, number, number][]> = {
  // Nothing at all. A calm face in this style is just eyes, and it works — the
  // reference art this is drawn from has no mouth on it whatsoever.
  calm: [],
  happy: [
    [-0.8, 0, 0.8],
    [0, 0.4, 0.8],
    [0.8, 0, 0.8],
  ],
  cheer: [
    [-0.9, 0, 2.6],
    [-0.9, 0.45, 0.8],
    [0.9, 0.45, 0.8],
  ],
  worried: [
    [-0.8, 0.4, 0.8],
    [0, 0, 0.8],
    [0.8, 0.4, 0.8],
  ],
  scared: [
    [0, 0, 1.6],
    [0, 0.5, 1.6],
  ],
  sleepy: [[0, 0.2, 1]],
};

/**
 * How wide the eyes open. Surprise makes a face read as surprised far more
 * than the mouth does, and it costs one number.
 */
export const EYE_SCALE: Record<Face, number> = {
  calm: 1,
  happy: 1,
  cheer: 0.86,
  worried: 1.1,
  scared: 1.3,
  // Half-shut, not shut. Any lower and the side that isn't to move looks
  // asleep rather than waiting, which is a different and much less nice thing.
  sleepy: 0.62,
};
