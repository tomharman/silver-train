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

export type CameraAngle = "low" | "normal" | "high" | "top";

/** How far above the board you are sitting, in degrees. */
const ELEVATION: Record<CameraAngle, number> = {
  low: 26,
  normal: 36,
  high: 55,
  top: 72,
};

/**
 * Where to put the camera so the whole board fits, at whatever angle you asked
 * for, above the panel of buttons along the bottom.
 *
 * Two things had to be solved rather than guessed. First, looking further down
 * makes a flat board *taller* on screen, not smaller — its depth projects as
 * `sin(elevation)` while the creatures standing on it project as `cos` — so the
 * distance is fitted to whichever of width and height needs more room. Second,
 * Pip and the buttons permanently cover the bottom fifth of the canvas, so the
 * board is fitted into what's left and then slid up by aiming the camera along
 * its own up axis. Aiming down in world space instead only works when you are
 * looking along the board, and does almost nothing from above.
 */
export function cameraFor(
  board: Board,
  viewWidth: number,
  viewHeight: number,
  angle: CameraAngle = "normal",
) {
  const aspect = viewWidth / Math.max(viewHeight, 1);
  const portrait = aspect < 1;
  const fovY = ((portrait ? 46 : 40) * Math.PI) / 180;
  const fovX = 2 * Math.atan(Math.tan(fovY / 2) * Math.max(aspect, 0.35));
  const elevation = (ELEVATION[angle] * Math.PI) / 180;

  // Roughly what the whose-turn cards, Pip and the two buttons occupy.
  const inset = Math.min(0.34, 215 / Math.max(viewHeight, 1));

  // Half the board plus a small margin. Generous margins cost a surprising
  // amount on a narrow phone, where the width is what limits the fit and every
  // spare tile pushes the camera further back; letting the plinth bleed a
  // little off the edges reads as immersive rather than cropped.
  const halfWidth = board.width / 2 + 0.5;
  const halfDepth = board.height / 2 + 0.6;
  const standing = 0.9;

  const projectedHalfHeight = halfDepth * Math.sin(elevation) + standing * Math.cos(elevation);

  const forWidth = halfWidth / Math.tan(fovX / 2);
  const forHeight = projectedHalfHeight / (Math.tan(fovY / 2) * (1 - inset));
  const distance = Math.max(forWidth, forHeight) * 1.06;

  // The camera's own up axis, which is what "up on screen" actually means.
  const up: [number, number, number] = [0, Math.cos(elevation), -Math.sin(elevation)];
  const visibleHalfHeight = distance * Math.tan(fovY / 2);
  // Never shift so far that the far edge leaves the top of the frame.
  const slack = Math.max(0, visibleHalfHeight - projectedHalfHeight);
  const shift = Math.min(inset * visibleHalfHeight, slack);

  return {
    position: [0, distance * Math.sin(elevation), distance * Math.cos(elevation)] as [
      number,
      number,
      number,
    ],
    target: [0, -up[1] * shift, -up[2] * shift] as [number, number, number],
    fov: (fovY * 180) / Math.PI,
  };
}
