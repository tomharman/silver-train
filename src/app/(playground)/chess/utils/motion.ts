import type { CaptureEffect, PieceTheme, PieceType, TravelStyle } from "../types";

/**
 * The decorative layer. None of this touches the rules — a knight moves in an L
 * whether it hops, rolls or slides — but it is not idle decoration either.
 *
 * How a piece carries itself is a second channel for teaching what it is. The
 * knight is the only one that leaves the ground, because leaving the ground is
 * the thing about knights. The rook lands with a thump because it is a castle.
 * The bishop glides, because it never touches a square of the other colour. A
 * child who cannot yet read the words has still been told all three.
 */

const TRAVEL_BY_PIECE: Record<PieceType, TravelStyle> = {
  pawn: "hop",
  knight: "hop",
  bishop: "float",
  rook: "stomp",
  queen: "float",
  king: "slide",
};

/** How long the piece takes to cross, in milliseconds. */
const TRAVEL_MS: Record<TravelStyle, number> = {
  slide: 320,
  hop: 420,
  float: 460,
  spin: 380,
  roll: 420,
  stomp: 340,
};

const TRAVEL_EASING: Record<TravelStyle, string> = {
  slide: "cubic-bezier(0.22, 1, 0.36, 1)",
  hop: "cubic-bezier(0.4, 0, 0.2, 1)",
  float: "cubic-bezier(0.4, 0, 0.2, 1)",
  spin: "cubic-bezier(0.22, 1, 0.36, 1)",
  roll: "linear",
  stomp: "cubic-bezier(0.6, 0, 0.9, 0.6)",
};

/** Emoji thrown outwards from the square where something was taken. */
const BURST: Record<CaptureEffect, string[]> = {
  poof: ["💨", "✨", "💨"],
  chomp: ["💥", "⭐", "💫"],
  sparkle: ["✨", "💫", "⭐", "🌟"],
  yum: ["😋", "✨", "💛"],
  crumble: ["💥", "🔥", "💨"],
};

export function travelStyleFor(theme: PieceTheme, type: PieceType): TravelStyle {
  // A world may override it, but none of them do and none of them should: the
  // movement belongs to the piece, not the paint.
  return theme.pieces[type].travel ?? TRAVEL_BY_PIECE[type];
}

export function travelDuration(style: TravelStyle): number {
  return TRAVEL_MS[style];
}

export function travelEasing(style: TravelStyle): string {
  return TRAVEL_EASING[style];
}

export function captureEffectFor(theme: PieceTheme): CaptureEffect {
  return theme.captureEffect ?? "poof";
}

export function burstFor(effect: CaptureEffect): string[] {
  return BURST[effect];
}

/**
 * Where each burst particle flies. Fixed angles rather than random ones, so the
 * server and the browser draw the same thing and nothing has to rehydrate.
 */
export function burstVector(index: number, count: number): { dx: number; dy: number } {
  const angle = (index / count) * Math.PI * 2 - Math.PI / 2;
  return { dx: Math.cos(angle), dy: Math.sin(angle) };
}

/**
 * The idle bob, per piece.
 *
 * Duration varies with the piece's id so a rank of pawns doesn't rise and fall
 * as one block, and the delay is negative so each one starts already partway
 * through rather than the whole board lurching upwards on the first frame.
 */
export function idleRhythm(id: number): { duration: string; delay: string } {
  return {
    duration: `${2.1 + (id % 7) * 0.19}s`,
    delay: `${-((id % 11) * 0.31).toFixed(2)}s`,
  };
}
