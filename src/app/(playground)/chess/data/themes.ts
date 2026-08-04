import type { PieceTheme } from "../types";

/**
 * Piece themes.
 *
 * To add a set of characters from a show, copy one of the `token` themes below
 * and change the six entries. Two ways to do the artwork:
 *
 *   1. Emoji — set `glyph` and you're done.
 *   2. Pictures — drop transparent PNGs into `public/chess/<theme-id>/` and set
 *      `imageSrc: "/chess/<theme-id>/king.png"`. `imageSrc` wins over `glyph`.
 *
 * The `name` on each piece is what the game calls it out loud, so a themed set
 * can rename the knight to whoever does the jumping in that show. Keep the
 * mapping honest to the movement — the knight should be the character who
 * leaps, the queen the one who goes everywhere — and the theme teaches the
 * piece instead of obscuring it.
 */
export const THEMES: PieceTheme[] = [
  {
    id: "classic",
    name: "Classic",
    emoji: "♟️",
    style: "glyph",
    whiteLabel: "White",
    blackLabel: "Black",
    pieces: {
      king: { glyph: "♚", name: "King" },
      queen: { glyph: "♛", name: "Queen" },
      rook: { glyph: "♜", name: "Rook" },
      bishop: { glyph: "♝", name: "Bishop" },
      knight: { glyph: "♞", name: "Knight" },
      pawn: { glyph: "♟", name: "Pawn" },
    },
  },
  {
    id: "animals",
    name: "Animals",
    emoji: "🦁",
    style: "token",
    whiteLabel: "Cream",
    blackLabel: "Midnight",
    pieces: {
      king: { glyph: "🦁", name: "Lion" },
      queen: { glyph: "🦊", name: "Fox" },
      rook: { glyph: "🐘", name: "Elephant" },
      bishop: { glyph: "🦉", name: "Owl" },
      knight: { glyph: "🐴", name: "Horse" },
      pawn: { glyph: "🐭", name: "Mouse" },
    },
  },
  {
    id: "space",
    name: "Space",
    emoji: "🚀",
    style: "token",
    whiteLabel: "Moon",
    blackLabel: "Deep Space",
    pieces: {
      king: { glyph: "👨‍🚀", name: "Astronaut" },
      queen: { glyph: "🛸", name: "Saucer" },
      rook: { glyph: "🪐", name: "Planet" },
      bishop: { glyph: "☄️", name: "Comet" },
      knight: { glyph: "🚀", name: "Rocket" },
      pawn: { glyph: "⭐", name: "Star" },
    },
  },
  {
    id: "dinos",
    name: "Dinos",
    emoji: "🦖",
    style: "token",
    whiteLabel: "Sand",
    blackLabel: "Swamp",
    pieces: {
      king: { glyph: "🦖", name: "T-Rex" },
      queen: { glyph: "🐉", name: "Dragon" },
      rook: { glyph: "🌋", name: "Volcano" },
      bishop: { glyph: "🥚", name: "Egg" },
      knight: { glyph: "🦕", name: "Longneck" },
      pawn: { glyph: "🦎", name: "Lizard" },
    },
  },
];

export function getTheme(id: string): PieceTheme {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}
