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
 * can rename the knight to whoever does the jumping in that show.
 *
 * `travel` and `captureEffect` are where a theme earns its keep. The rules
 * never change — a bishop is a bishop — but the popcorn pops, the planet
 * rolls, the comet floats and the volcano lands with a thump. Pick the motion
 * that matches the character and the theme teaches the piece rather than
 * disguising it: the one that hops should be the knight.
 */
export const THEMES: PieceTheme[] = [
  {
    id: "classic",
    name: "Classic",
    emoji: "♟️",
    style: "art",
    whiteLabel: "White",
    blackLabel: "Black",
    captureEffect: "poof",
    pieces: {
      king: { glyph: "♚", name: "King" },
      queen: { glyph: "♛", name: "Queen" },
      rook: { glyph: "♜", name: "Rook" },
      bishop: { glyph: "♝", name: "Bishop" },
      knight: { glyph: "♞", name: "Knight", travel: "hop" },
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
    captureEffect: "chomp",
    pieces: {
      king: { glyph: "🦁", name: "Lion" },
      queen: { glyph: "🦊", name: "Fox", travel: "spin" },
      rook: { glyph: "🐘", name: "Elephant", travel: "stomp" },
      bishop: { glyph: "🦉", name: "Owl", travel: "float" },
      knight: { glyph: "🐴", name: "Horse", travel: "hop" },
      pawn: { glyph: "🐭", name: "Mouse" },
    },
  },
  {
    id: "dinos",
    name: "Dinos",
    emoji: "🦖",
    style: "token",
    whiteLabel: "Sand",
    blackLabel: "Swamp",
    captureEffect: "crumble",
    pieces: {
      king: { glyph: "🦖", name: "T-Rex", travel: "stomp" },
      queen: { glyph: "🐉", name: "Dragon", travel: "float" },
      rook: { glyph: "🌋", name: "Volcano", travel: "stomp" },
      bishop: { glyph: "🥚", name: "Egg", travel: "roll" },
      knight: { glyph: "🦕", name: "Longneck", travel: "hop" },
      pawn: { glyph: "🦎", name: "Lizard" },
    },
  },
  {
    id: "food",
    name: "Food",
    emoji: "🍕",
    style: "token",
    whiteLabel: "Plate",
    blackLabel: "Pantry",
    captureEffect: "yum",
    pieces: {
      king: { glyph: "🍔", name: "Burger" },
      queen: { glyph: "🍕", name: "Pizza", travel: "spin" },
      rook: { glyph: "🎂", name: "Cake", travel: "stomp" },
      bishop: { glyph: "🍦", name: "Ice Cream", travel: "float" },
      knight: { glyph: "🍿", name: "Popcorn", travel: "hop" },
      pawn: { glyph: "🫐", name: "Blueberry", travel: "roll" },
    },
  },
  {
    id: "space",
    name: "Space",
    emoji: "🚀",
    style: "token",
    whiteLabel: "Moon",
    blackLabel: "Deep Space",
    captureEffect: "sparkle",
    pieces: {
      king: { glyph: "👨‍🚀", name: "Astronaut" },
      queen: { glyph: "🛸", name: "Saucer", travel: "float" },
      rook: { glyph: "🪐", name: "Planet", travel: "roll" },
      bishop: { glyph: "☄️", name: "Comet", travel: "float" },
      knight: { glyph: "🚀", name: "Rocket", travel: "hop" },
      pawn: { glyph: "⭐", name: "Star", travel: "spin" },
    },
  },
];

export function getTheme(id: string): PieceTheme {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}
