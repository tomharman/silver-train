import type { Level } from "../types";

/**
 * The ladder.
 *
 * Every level is a real, complete, winnable game — not a drill — and each one
 * adds exactly one idea to the level before it. Levels 2, 3 and 4 are the same
 * board and the same starting shape with a single piece swapped in, so the only
 * thing to learn is the new piece.
 *
 * The layouts here were chosen by self-play rather than by eye: earlier
 * versions kept pawns alongside the new piece, and they jammed head to head
 * within four moves and ended games by "nobody can move", which is a miserable
 * way for a five year old to lose. See the note on each level.
 */
export const LEVELS: Level[] = [
  {
    id: "pawn-race",
    name: "Pawn Race",
    tagline: "Get one soldier to the other end",
    emoji: "🏁",
    width: 5,
    height: 6,
    setup: [
      ".....",
      ".ppp.",
      ".....",
      ".....",
      ".PPP.",
      ".....",
    ],
    win: "raceToEnd",
    teaches: ["pawn"],
    howTo: [
      "Your little soldiers walk forward one square at a time. 👣",
      "They can never, ever go backwards.",
      "They munch the other team by stepping diagonally. 😋",
      "First one to reach the far end wins the race!",
    ],
    grownUpNote:
      "Pawn Wars — the standard first game for young beginners. It teaches the single hardest rule in chess (pawns move one way and capture another) with nothing else on the board to distract from it, and it produces real tactics within about four moves.",
    rules: {
      pawnDoubleStep: false,
      promotion: false,
      castling: false,
      enPassant: false,
      idleLimit: 30,
      check: false,
    },
  },
  {
    id: "rook-road",
    name: "Rook Road",
    tagline: "Castles roll in straight lines",
    emoji: "🏰",
    width: 5,
    height: 5,
    setup: [
      "r.r.r",
      ".....",
      ".....",
      ".....",
      "R.R.R",
    ],
    win: "captureAll",
    teaches: ["rook"],
    howTo: [
      "The rook is a big castle on wheels. 🏰",
      "It rolls straight — up, down, left or right.",
      "As far as it likes! But it can't jump over anybody.",
      "Gobble up ALL of their rooks to win.",
    ],
    grownUpNote:
      "Three rooks a side and nothing else, so every single move is a rook move. The rooks start staring straight down open files at each other, which hands him the two ideas that matter in about thirty seconds: rooks love open lines, and if you take something, expect to be taken back.",
    rules: {
      pawnDoubleStep: false,
      promotion: false,
      castling: false,
      enPassant: false,
      idleLimit: 20,
      check: false,
    },
  },
  {
    id: "bishop-bounce",
    name: "Bishop Bounce",
    tagline: "Slide along the slants",
    emoji: "🔷",
    width: 5,
    height: 5,
    setup: [
      "b.b.b",
      ".....",
      ".....",
      ".....",
      "B.B.B",
    ],
    win: "captureAll",
    teaches: ["bishop"],
    howTo: [
      "The bishop slides on the slanty lines. ↗️",
      "Watch closely — it always stays on its own colour!",
      "It can't jump over anybody either.",
      "Gobble up ALL of their bishops to win.",
    ],
    grownUpNote:
      "Diagonals are much harder to see than straight lines, so bishops get a level to themselves. All six start on dark squares and can never leave them, so the entire game happens on one colour — which makes the rule impossible to miss. Ask him what colour his bishop is on before and after each move.",
    rules: {
      pawnDoubleStep: false,
      promotion: false,
      castling: false,
      enPassant: false,
      idleLimit: 20,
      check: false,
    },
  },
  {
    id: "knight-hop",
    name: "Knight Hop",
    tagline: "The horse that jumps",
    emoji: "🐴",
    width: 5,
    height: 5,
    setup: [
      "n.n.n",
      ".....",
      ".....",
      ".....",
      "N.N.N",
    ],
    win: "captureAll",
    teaches: ["knight"],
    howTo: [
      "The knight is a horse, and horses JUMP. 🐴",
      "Two squares one way, then one square to the side — like a letter L.",
      "It's the only piece that can hop right over everybody!",
      "Gobble up ALL of their horses to win.",
    ],
    grownUpNote:
      "The knight is the piece that trips up nearly every beginner, so it gets a whole level with nothing else on the board. The move dots do the counting for him to begin with; he'll start predicting them within a game or two, and that's the moment chess clicks.",
    rules: {
      pawnDoubleStep: false,
      promotion: false,
      castling: false,
      enPassant: false,
      idleLimit: 20,
      check: false,
    },
  },
  {
    id: "mini-chess",
    name: "Mini Chess",
    tagline: "Everyone on a tiny board",
    emoji: "👑",
    width: 5,
    height: 5,
    setup: [
      "rnbqk",
      "ppppp",
      ".....",
      "PPPPP",
      "RNBQK",
    ],
    win: "captureKing",
    teaches: ["queen", "king"],
    howTo: [
      "Everybody's here now, on a titchy little board.",
      "The queen is the boss — any direction, as far as she likes. 👑",
      "The king is precious but slow: one square at a time.",
      "Catch the other king and you win!",
    ],
    grownUpNote:
      "Gardner's 5×5 minichess. Every piece and every movement rule of real chess, but a game lasts a few minutes and there's nowhere to hide. Crucially the king is just captured — no check, no checkmate — which is the classic bridge before the real thing.",
    rules: {
      pawnDoubleStep: false,
      promotion: true,
      promoteTo: "queen",
      castling: false,
      enPassant: false,
      idleLimit: 30,
      check: false,
    },
  },
  {
    id: "real-chess",
    name: "Real Chess",
    tagline: "The whole proper game",
    emoji: "♟️",
    width: 8,
    height: 8,
    setup: [
      "rnbqkbnr",
      "pppppppp",
      "........",
      "........",
      "........",
      "........",
      "PPPPPPPP",
      "RNBQKBNR",
    ],
    win: "checkmate",
    teaches: [],
    howTo: [
      "This is proper chess — the whole thing. ♟️",
      "Now the king can't be taken. If he's in danger you MUST save him.",
      "When there's no way to save him at all, that's checkmate — you win!",
      "A pawn that walks all the way to the end turns into a queen. ✨",
    ],
    grownUpNote:
      "Full rules: check, checkmate, stalemate, castling, en passant, the lot. Pawns auto-promote to a queen rather than asking, because a promotion menu mid-game is a mood-killer at five.",
    rules: {
      pawnDoubleStep: true,
      promotion: true,
      promoteTo: "queen",
      castling: true,
      enPassant: true,
      idleLimit: 50,
      check: true,
    },
  },
];

export function getLevel(id: string): Level {
  return LEVELS.find((level) => level.id === id) ?? LEVELS[0];
}
