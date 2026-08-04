import { LEVELS } from "./levels";

/**
 * The sticker book.
 *
 * Levels teach; stickers are what make him want to come back tomorrow. Every
 * one is earned by doing something real on the board — not by playing for long
 * enough — so the collection is a record of things he actually managed.
 */
export interface Sticker {
  id: string;
  emoji: string;
  name: string;
  /** Shown once earned, so it means something when it turns up. */
  how: string;
}

const FEATS: Sticker[] = [
  { id: "first-capture", emoji: "😋", name: "First Munch", how: "Took your first piece" },
  { id: "promoter", emoji: "👑", name: "All Grown Up", how: "Turned a pawn into something bigger" },
  { id: "king-catcher", emoji: "🤠", name: "King Catcher", how: "Caught the other king" },
  { id: "checkmate", emoji: "🏆", name: "Checkmate!", how: "Won a game of real chess" },
  { id: "flawless", emoji: "🛡️", name: "Not A Scratch", how: "Won without losing a single piece" },
  { id: "speedy", emoji: "⚡", name: "Lightning", how: "Won in ten moves or fewer" },
  { id: "explorer", emoji: "🧭", name: "Explorer", how: "Played in all five worlds" },
  { id: "grand-master", emoji: "🌟", name: "Grand Master", how: "Finished every single game" },
];

/** One per level, plus the feats. */
export const STICKERS: Sticker[] = [
  ...LEVELS.map((level) => ({
    id: `level-${level.id}`,
    emoji: level.emoji,
    name: level.name,
    how: `Won at ${level.name}`,
  })),
  ...FEATS,
];

export function getSticker(id: string): Sticker | undefined {
  return STICKERS.find((sticker) => sticker.id === id);
}
