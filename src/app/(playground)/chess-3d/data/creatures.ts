import type { Color, PieceType } from "../../chess/types";

/**
 * The cast of The Sunken Jungle.
 *
 * Every creature is chosen so its body explains its move before anybody says a
 * word: the dolphin leaps because knights jump, the octopus goes everywhere
 * because the queen does, the turtle trundles in straight lines. Get that
 * mapping right and the theme teaches the piece instead of decorating it.
 */

export type Travel = "scuttle" | "leap" | "glide" | "trundle" | "drift" | "paddle";

export interface Creature {
  name: string;
  /** How it crosses the board. Decorative — the rules never change. */
  travel: Travel;
  /** Overall size multiplier. Kings and queens are the big ones. */
  scale: number;
  /** Height it floats above the board while resting. */
  hover: number;
  /** One line, for when it's picked up for the first time. */
  blurb: string;
}

export const CREATURES: Record<PieceType, Creature> = {
  pawn: {
    name: "Crab",
    travel: "scuttle",
    scale: 0.62,
    hover: 0.02,
    blurb: "Crabs scuttle forward one square — and nip sideways to munch!",
  },
  knight: {
    name: "Dolphin",
    travel: "leap",
    scale: 0.78,
    hover: 0.16,
    blurb: "Dolphins LEAP — two squares, then one to the side, right over everyone!",
  },
  bishop: {
    name: "Seahorse",
    travel: "glide",
    scale: 0.74,
    hover: 0.2,
    blurb: "Seahorses glide along the slants, and never leave their own colour.",
  },
  rook: {
    name: "Turtle",
    travel: "trundle",
    scale: 0.76,
    hover: 0.04,
    blurb: "Turtles trundle in straight lines, as far as they like.",
  },
  queen: {
    name: "Octopus",
    travel: "drift",
    scale: 0.8,
    hover: 0.12,
    blurb: "The octopus has arms everywhere, so she can go ANY direction!",
  },
  king: {
    name: "Pufferfish",
    travel: "paddle",
    scale: 0.78,
    hover: 0.14,
    blurb: "The puffer is precious but slow — one little square at a time.",
  },
};

export interface Team {
  label: string;
  body: string;
  belly: string;
  accent: string;
  eye: string;
}

/** Warm against cool, so the two sides read instantly through blue-green water. */
export const TEAMS: Record<Color, Team> = {
  white: {
    label: "Coral",
    body: "#FF8551",
    belly: "#FFE0C2",
    accent: "#FFC048",
    eye: "#1B2430",
  },
  black: {
    label: "Twilight",
    body: "#7B5BD6",
    belly: "#D8CBFA",
    accent: "#59E8D2",
    eye: "#141026",
  },
};

/** How long a creature takes to cross, and how high it arcs on the way. */
export const TRAVEL_STYLE: Record<Travel, { duration: number; arc: number; spin: number }> = {
  scuttle: { duration: 0.42, arc: 0.12, spin: 0 },
  leap: { duration: 0.72, arc: 1.5, spin: 0 },
  glide: { duration: 0.62, arc: 0.35, spin: 0 },
  trundle: { duration: 0.5, arc: 0.06, spin: 0 },
  drift: { duration: 0.66, arc: 0.5, spin: 0.6 },
  paddle: { duration: 0.5, arc: 0.2, spin: 0 },
};
