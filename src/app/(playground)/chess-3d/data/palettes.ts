/**
 * Piece colours, chosen per player.
 *
 * The creatures themselves are fixed — a pawn is a crab in every world — so the
 * one thing worth handing over is what colour your team is. Each palette sets
 * the three colours a creature is built from: the body, the paler belly, and
 * the accent used for claws, fins, shells and crowns.
 *
 * They are deliberately far apart in hue, and each accent is a lighter shade of
 * that palette's own body colour rather than a contrasting one. That second
 * part matters more than it sounds: accents cover a lot of some creatures, and
 * when two palettes happened to share a yellow accent, both players ended up
 * with an identical-looking turtle.
 */

export interface Palette {
  id: string;
  name: string;
  body: string;
  belly: string;
  accent: string;
  /** Eye colour — dark for pale creatures, near-black for everything. */
  eye: string;
}

export const PALETTES: Palette[] = [
  { id: "coral", name: "Coral", body: "#FF8551", belly: "#FFE0C2", accent: "#FFB877", eye: "#1B2430" },
  { id: "twilight", name: "Twilight", body: "#7B5BD6", belly: "#D8CBFA", accent: "#B79CFF", eye: "#141026" },
  { id: "lagoon", name: "Lagoon", body: "#2FB6C4", belly: "#CFF3F7", accent: "#7BF0E0", eye: "#0E2830" },
  { id: "bubblegum", name: "Bubblegum", body: "#FF6FA8", belly: "#FFD7E8", accent: "#FFB3D1", eye: "#2A0F1E" },
  { id: "lime", name: "Lime", body: "#7BC950", belly: "#E4F7C6", accent: "#C6F07A", eye: "#16240E" },
  { id: "sunbeam", name: "Sunbeam", body: "#FFC13F", belly: "#FFF1CE", accent: "#FFE18A", eye: "#2E1E06" },
  { id: "berry", name: "Berry", body: "#C0417F", belly: "#F7CFE2", accent: "#F58FC0", eye: "#26091A" },
  { id: "storm", name: "Storm", body: "#4A6FA8", belly: "#D3E2F7", accent: "#9CC4F0", eye: "#0D1524" },
];

export function getPalette(id: string): Palette {
  return PALETTES.find((palette) => palette.id === id) ?? PALETTES[0];
}
