import type { Board, Color, Level, Piece, PieceType } from "../types";

const CHAR_TO_TYPE: Record<string, PieceType> = {
  p: "pawn",
  n: "knight",
  b: "bishop",
  r: "rook",
  q: "queen",
  k: "king",
};

export function idx(board: Board, file: number, rank: number): number {
  return rank * board.width + file;
}

export function fileOf(board: Board, square: number): number {
  return square % board.width;
}

export function rankOf(board: Board, square: number): number {
  return Math.floor(square / board.width);
}

export function inside(board: Board, file: number, rank: number): boolean {
  return file >= 0 && file < board.width && rank >= 0 && rank < board.height;
}

export function pieceAt(board: Board, file: number, rank: number): Piece | null {
  if (!inside(board, file, rank)) return null;
  return board.squares[idx(board, file, rank)];
}

export function cloneBoard(board: Board): Board {
  return { width: board.width, height: board.height, squares: board.squares.slice() };
}

/** Builds the starting position from a level's `setup` rows (top row first). */
export function parseSetup(level: Level): Board {
  const board: Board = {
    width: level.width,
    height: level.height,
    squares: new Array<Piece | null>(level.width * level.height).fill(null),
  };

  // Ids are handed out in setup order and then carried by the piece for the
  // rest of the game, so the board can animate it from square to square.
  let nextId = 1;

  level.setup.forEach((row, rowIndex) => {
    const rank = level.height - 1 - rowIndex;
    for (let file = 0; file < level.width; file += 1) {
      const char = row[file];
      if (!char || char === ".") continue;
      const type = CHAR_TO_TYPE[char.toLowerCase()];
      if (!type) continue;
      const color: Color = char === char.toUpperCase() ? "white" : "black";
      board.squares[idx(board, file, rank)] = { id: nextId, type, color, moved: false };
      nextId += 1;
    }
  });

  return board;
}

export function forward(color: Color): number {
  return color === "white" ? 1 : -1;
}

export function opponent(color: Color): Color {
  return color === "white" ? "black" : "white";
}

/** The rank a pawn of this colour is trying to reach. */
export function promotionRank(board: Board, color: Color): number {
  return color === "white" ? board.height - 1 : 0;
}

/** The rank pawns of this colour start on, which is where a double step is allowed. */
export function pawnStartRank(board: Board, color: Color): number {
  return color === "white" ? 1 : board.height - 2;
}

export function findKing(board: Board, color: Color): number | null {
  for (let i = 0; i < board.squares.length; i += 1) {
    const piece = board.squares[i];
    if (piece && piece.color === color && piece.type === "king") return i;
  }
  return null;
}

export function countPieces(board: Board, color: Color): number {
  let count = 0;
  for (const piece of board.squares) {
    if (piece && piece.color === color) count += 1;
  }
  return count;
}

export function squareName(board: Board, square: number): string {
  const file = String.fromCharCode(97 + fileOf(board, square));
  return `${file}${rankOf(board, square) + 1}`;
}
