import type { Face } from "../data/pixel-pieces";
import type { Board, Color, Move } from "../types";

/**
 * What each character is doing with its face, and where it is looking.
 *
 * All of it is derived from the position rather than stored, which matters more
 * than it sounds: there is no timer anywhere, nothing to clean up, and undo
 * rewinds the mood along with the board because the mood was never a separate
 * fact. Step back one move and the piece that was gloating stops gloating.
 */

export interface Attention {
  /** The square everyone is watching: what you have hold of, or what just moved. */
  focus: number | null;
  lastMove: Move | null;
  /** Squares the other side could take next go. */
  inDanger: Set<number>;
  checkSquare: number | null;
  /** Set once the game is over, so the winners can celebrate. */
  winner: Color | null;
  /** True while the computer is deciding, which is when it looks thoughtful. */
  thinking: boolean;
  turn: Color;
}

export function faceFor(
  board: Board,
  square: number,
  colour: Color,
  attention: Attention,
): Face {
  const { lastMove, winner } = attention;

  // The game is over. Nothing that happens now matters more than that.
  if (winner) return colour === winner ? "cheer" : "worried";

  if (attention.checkSquare === square) return "scared";

  if (lastMove) {
    // Whoever just took something is extremely pleased with themselves.
    if (lastMove.to === square) return lastMove.capture ? "cheer" : "happy";
    // And the side it was taken from is not.
    if (lastMove.capture && lastMove.capture.piece.color === colour) return "worried";
  }

  if (attention.inDanger.has(square)) return "worried";

  // The side that isn't to move is having a little rest. It reads as patience
  // rather than sleepiness, and it makes whose turn it is visible on the board
  // itself rather than only in the words above it.
  if (colour !== attention.turn && !attention.thinking) return "sleepy";

  return "happy";
}

/**
 * Which way to point the eyes.
 *
 * Everyone looks at the same thing — the piece you have picked up, or the one
 * that just moved — which is the cheapest possible trick and by some distance
 * the most effective one here. Thirty-two characters turning to watch the same
 * square is the moment the board stops being a diagram.
 */
export function gazeFor(
  board: Board,
  square: number,
  attention: Attention,
): { x: number; y: number } {
  const target = attention.focus;
  if (target === null || target === square) return { x: 0, y: 0 };

  const dx = (target % board.width) - (square % board.width);
  // Rank 0 is the bottom of the screen, so a higher rank is a smaller y.
  const dy = -(Math.floor(target / board.width) - Math.floor(square / board.width));

  const length = Math.hypot(dx, dy);
  if (length === 0) return { x: 0, y: 0 };

  // Normalised, then eased: a piece one square away should stare hard, a piece
  // right across the board should glance. Anything further than about three
  // squares looks the same as anything further still.
  const reach = Math.min(1, length / 3);
  return {
    x: (dx / length) * reach * 0.5,
    y: (dy / length) * reach * 0.28,
  };
}
