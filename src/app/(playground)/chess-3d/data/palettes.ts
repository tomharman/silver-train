/**
 * Piece colours, chosen per player.
 *
 * The creatures themselves are fixed — a pawn is a crab in every world — so the
 * one thing worth handing over is what colour your team is. Each palette sets
 * the three colours a creature is built from: the body, the paler belly, and
 * the accent used for claws, fins, shells and crowns.
 *
 * They are deliberately far apart in hue. Two children picking near-identical
 * colours would make the board unreadable, so the picker also refuses whatever
 * the other player has already taken.
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
  { id: "coral", name: "Coral", body: "#FF8551", belly: "#FFE0C2", accent: "#FFC048", eye: "#1B2430" },
  { id: "twilight", name: "Twilight", body: "#7B5BD6", belly: "#D8CBFA", accent: "#59E8D2", eye: "#141026" },
  { id: "lagoon", name: "Lagoon", body: "#2FB6C4", belly: "#CFF3F7", accent: "#FFE066", eye: "#0E2830" },
  { id: "bubblegum", name: "Bubblegum", body: "#FF6FA8", belly: "#FFD7E8", accent: "#FFF07A", eye: "#2A0F1E" },
  { id: "lime", name: "Lime", body: "#7BC950", belly: "#E4F7C6", accent: "#FF9C3F", eye: "#16240E" },
  { id: "sunbeam", name: "Sunbeam", body: "#FFC13F", belly: "#FFF1CE", accent: "#FF6B4A", eye: "#2E1E06" },
  { id: "berry", name: "Berry", body: "#C0417F", belly: "#F7CFE2", accent: "#6FE3D6", eye: "#26091A" },
  { id: "storm", name: "Storm", body: "#4A6FA8", belly: "#D3E2F7", accent: "#FFB454", eye: "#0D1524" },
];

export function getPalette(id: string): Palette {
  return PALETTES.find((palette) => palette.id === id) ?? PALETTES[0];
}
