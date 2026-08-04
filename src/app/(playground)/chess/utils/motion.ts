import type { CaptureEffect, PieceTheme, PieceType, TravelStyle } from "../types";

/**
 * The decorative layer. None of this touches the rules — a knight moves in an
 * L whether it hops, rolls or slides — but matching the movement to the
 * character is what makes a theme worth having.
 */

/** How long the piece takes to cross, in milliseconds. */
const TRAVEL_MS: Record<TravelStyle, number> = {
  slide: 260,
  hop: 420,
  float: 480,
  spin: 380,
  roll: 420,
  stomp: 320,
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
  // Knights jump in every theme, because that is the thing about knights.
  return theme.pieces[type].travel ?? (type === "knight" ? "hop" : "slide");
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
