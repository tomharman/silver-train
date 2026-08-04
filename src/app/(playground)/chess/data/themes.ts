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
    world: {
      name: "The Chess Hall",
      lightSquare: "#F6E7C6",
      darkSquare: "#6FA8A0",
      frame: "#4A3B2E",
      backdrop: "linear-gradient(170deg, #FFF7E4 0%, #F3E3C2 55%, #DFC79B 100%)",
      backdropDark: "linear-gradient(170deg, #2A2620 0%, #1E1B16 60%, #14120E 100%)",
      guide: "#E8A33D",
      scenery: ["♜", "♞", "♝", "♟"],
    },
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
    world: {
      name: "The Great Meadow",
      lightSquare: "#F4EAC8",
      darkSquare: "#7FA65C",
      frame: "#5B4326",
      backdrop: "linear-gradient(170deg, #DFF3FF 0%, #EAF7D2 48%, #BFE08C 100%)",
      backdropDark: "linear-gradient(170deg, #17251E 0%, #121B16 60%, #0D1410 100%)",
      guide: "#5FA85C",
      scenery: ["🌳", "🌻", "🦋", "🍄", "🌿"],
    },
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
    world: {
      name: "Rumble Valley",
      lightSquare: "#EFDCA8",
      darkSquare: "#5E8B55",
      frame: "#4A3524",
      backdrop: "linear-gradient(170deg, #FFE7C2 0%, #F3C98E 45%, #A8C48A 100%)",
      backdropDark: "linear-gradient(170deg, #2A1D14 0%, #1D160F 60%, #12100B 100%)",
      guide: "#C7702F",
      scenery: ["🌴", "🌋", "🦴", "🥚", "🌿"],
    },
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
    world: {
      name: "The Big Kitchen",
      lightSquare: "#FBEBD2",
      darkSquare: "#D98C6A",
      frame: "#6B4230",
      backdrop: "linear-gradient(170deg, #FFF2E0 0%, #FFD9C2 50%, #F3B49A 100%)",
      backdropDark: "linear-gradient(170deg, #2B1E19 0%, #1F1613 60%, #150F0D 100%)",
      guide: "#E4703E",
      scenery: ["🍓", "🥕", "🧁", "🍋", "🥨"],
    },
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
    world: {
      name: "Deep Space",
      lightSquare: "#DCD9F2",
      darkSquare: "#4A4A8C",
      frame: "#221F3A",
      backdrop: "linear-gradient(170deg, #1B1B3A 0%, #2E2A5E 45%, #4C3F7A 100%)",
      backdropDark: "linear-gradient(170deg, #0B0B1C 0%, #141230 60%, #1E1A3E 100%)",
      guide: "#8E7BE8",
      scenery: ["⭐", "🌙", "✨", "🪐", "💫"],
    },
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
