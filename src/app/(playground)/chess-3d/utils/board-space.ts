import type { Board } from "../../chess/types";

/** One square is one world unit. Everything else is expressed in tiles. */
export const TILE = 1;

/**
 * Square index to a point on the board's surface.
 *
 * White's home rank is nearest the camera (+z) so that the person holding the
 * phone is looking at the board from behind their own creatures, the way you
 * sit at a real one.
 */
export function squareToWorld(board: Board, square: number): [number, number, number] {
  const file = square % board.width;
  const rank = Math.floor(square / board.width);
  return [
    (file - (board.width - 1) / 2) * TILE,
    0,
    -(rank - (board.height - 1) / 2) * TILE,
  ];
}

export function everySquare(board: Board): number[] {
  return Array.from({ length: board.width * board.height }, (_, i) => i);
}

export function isLightSquare(board: Board, square: number): boolean {
  const file = square % board.width;
  const rank = Math.floor(square / board.width);
  return (file + rank) % 2 === 1;
}

export function squareName(board: Board, square: number): string {
  const file = String.fromCharCode(97 + (square % board.width));
  return `${file}${Math.floor(square / board.width) + 1}`;
}

/**
 * Where to put the camera so the whole board fills the view without the far
 * rank shrinking into nothing. Bigger boards pull back and lift a little.
 */
/**
 * Creatures are sized for the little boards. On the full 8x8 they would jostle
 * their neighbours, so everything shrinks a touch to give each square air.
 */
export function creatureScaleFor(board: Board): number {
  return board.width >= 8 ? 0.84 : 1;
}

export function cameraFor(board: Board, portrait: boolean) {
  const span = Math.max(board.width, board.height);
  // Portrait phones have far less horizontal room, so back off harder.
  const distance = span * (portrait ? 1.3 : 1.18) + 3.2;
  // Lower than you would first reach for: a steep look-down squashes the far
  // rank until it is hard to tell which square is which.
  const height = span * 0.6 + 3.2;
  return {
    position: [0, height, distance] as [number, number, number],
    // Aiming a little below the board lifts it up the frame, which is where the
    // room is once the buttons and Pip have taken the bottom.
    target: [0, portrait ? -1.2 : -0.35, 0] as [number, number, number],
    fov: portrait ? 44 : 38,
  };
}
