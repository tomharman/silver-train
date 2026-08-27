import type { PieceTheme } from "../types";

/**
 * Worlds.
 *
 * The pieces are the same six characters everywhere — a rook is a rook and it
 * is called a rook, because the point of the game is learning that. What a
 * world changes is the light: the colours the characters are painted in, the
 * board they stand on, and the sky behind it.
 *
 * That split is deliberate. An earlier version themed the pieces themselves —
 * the knight was a horse in one world and a rocket in another — which looked
 * lovely and quietly worked against the thing we are here to do, because a
 * child who has learned "the rocket jumps in an L" has not learned chess.
 *
 * Adding a world means adding an entry here and nothing else. The two `teams`
 * ramps are the important part: pick hues that disagree, not shades that do.
 */
export const THEMES: PieceTheme[] = [
  {
    id: "classic",
    name: "Sunrise",
    emoji: "🌅",
    world: {
      name: "the Chess Hall",
      teams: {
        white: {
          ramp: ["#FFD98A", "#FFB35C", "#FF8F6B", "#F7719B", "#FFC9A8"],
          accent: "#B4532F",
          shadow: "rgba(120,60,20,0.28)",
        },
        black: {
          ramp: ["#7FE3D0", "#5CC8E0", "#6BA3EC", "#9B8FE8", "#B6EDE3"],
          accent: "#1C3358",
          shadow: "rgba(20,40,80,0.3)",
        },
      },
      lightSquare: "#F6E7C6",
      darkSquare: "#6FA8A0",
      frame: "#4A3B2E",
      backdrop: "linear-gradient(170deg, #FFF7E4 0%, #F3E3C2 55%, #DFC79B 100%)",
      backdropDark: "linear-gradient(170deg, #2A2620 0%, #1E1B16 60%, #14120E 100%)",
      guide: "#E8A33D",
      scenery: ["♜", "♞", "♝", "♟"],
    },
    captureEffect: "poof",
    pieces: {
      king: { name: "King" },
      queen: { name: "Queen" },
      rook: { name: "Rook" },
      bishop: { name: "Bishop" },
      knight: { name: "Knight" },
      pawn: { name: "Pawn" },
    },
  },
  {
    id: "meadow",
    name: "Meadow",
    emoji: "🌻",
    world: {
      name: "the Great Meadow",
      teams: {
        white: {
          ramp: ["#FFE98A", "#FFD25C", "#FFB05E", "#FF8F7A", "#FFF0C2"],
          accent: "#A86B2E",
          shadow: "rgba(110,80,20,0.26)",
        },
        black: {
          ramp: ["#9BE07A", "#5FC46B", "#3FA98A", "#4E8FC4", "#C8F0A8"],
          accent: "#17452C",
          shadow: "rgba(20,60,30,0.3)",
        },
      },
      lightSquare: "#F4EAC8",
      darkSquare: "#7FA65C",
      frame: "#5B4326",
      backdrop: "linear-gradient(170deg, #DFF3FF 0%, #EAF7D2 48%, #BFE08C 100%)",
      backdropDark: "linear-gradient(170deg, #17251E 0%, #121B16 60%, #0D1410 100%)",
      guide: "#5FA85C",
      scenery: ["🌳", "🌻", "🦋", "🍄", "🌿"],
    },
    captureEffect: "chomp",
    pieces: {
      king: { name: "King" },
      queen: { name: "Queen" },
      rook: { name: "Rook" },
      bishop: { name: "Bishop" },
      knight: { name: "Knight" },
      pawn: { name: "Pawn" },
    },
  },
  {
    id: "berry",
    name: "Berry",
    emoji: "🍧",
    world: {
      name: "the Sweet Shop",
      teams: {
        white: {
          ramp: ["#FFC2E0", "#FF8FC4", "#F76BA8", "#FFA8C2", "#FFE4F0"],
          accent: "#A83A70",
          shadow: "rgba(120,30,70,0.26)",
        },
        black: {
          ramp: ["#C4B0FF", "#9B8FE8", "#7A7ED8", "#6BB6E8", "#DCD2FF"],
          accent: "#332672",
          shadow: "rgba(50,40,110,0.3)",
        },
      },
      lightSquare: "#FBEBD2",
      darkSquare: "#D98C6A",
      frame: "#6B4230",
      backdrop: "linear-gradient(170deg, #FFF2E0 0%, #FFD9C2 50%, #F3B49A 100%)",
      backdropDark: "linear-gradient(170deg, #2B1E19 0%, #1F1613 60%, #150F0D 100%)",
      guide: "#E4703E",
      scenery: ["🍓", "🧁", "🍋", "🍬", "🍧"],
    },
    captureEffect: "yum",
    pieces: {
      king: { name: "King" },
      queen: { name: "Queen" },
      rook: { name: "Rook" },
      bishop: { name: "Bishop" },
      knight: { name: "Knight" },
      pawn: { name: "Pawn" },
    },
  },
  {
    id: "space",
    name: "Space",
    emoji: "🚀",
    world: {
      name: "Deep Space",
      teams: {
        white: {
          ramp: ["#FFE9A8", "#FFC46B", "#FF9E7A", "#FFD9B0", "#FFF6DC"],
          accent: "#9B5A2E",
          shadow: "rgba(0,0,0,0.34)",
        },
        black: {
          ramp: ["#8FD8FF", "#6BA8F0", "#8F7AE8", "#C48FE8", "#CDEBFF"],
          accent: "#26265C",
          shadow: "rgba(0,0,0,0.38)",
        },
      },
      lightSquare: "#DCD9F2",
      darkSquare: "#4A4A8C",
      frame: "#221F3A",
      backdrop: "linear-gradient(170deg, #1B1B3A 0%, #2E2A5E 45%, #4C3F7A 100%)",
      backdropDark: "linear-gradient(170deg, #0B0B1C 0%, #141230 60%, #1E1A3E 100%)",
      guide: "#8E7BE8",
      scenery: ["⭐", "🌙", "✨", "🪐", "💫"],
    },
    captureEffect: "sparkle",
    pieces: {
      king: { name: "King" },
      queen: { name: "Queen" },
      rook: { name: "Rook" },
      bishop: { name: "Bishop" },
      knight: { name: "Knight" },
      pawn: { name: "Pawn" },
    },
  },
];

export function getTheme(id: string): PieceTheme {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}
