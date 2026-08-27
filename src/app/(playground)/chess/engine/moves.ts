import type { Board, Color, Level, Move, Piece } from "../types";
import {
  cloneBoard,
  fileOf,
  findKing,
  forward,
  idx,
  inside,
  opponent,
  pawnStartRank,
  pieceAt,
  promotionRank,
  rankOf,
} from "./board";

type Vector = readonly [number, number];

const KNIGHT_HOPS: Vector[] = [
  [1, 2],
  [2, 1],
  [2, -1],
  [1, -2],
  [-1, -2],
  [-2, -1],
  [-2, 1],
  [-1, 2],
];

const ORTHOGONALS: Vector[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const DIAGONALS: Vector[] = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

const EVERY_DIRECTION: Vector[] = [...ORTHOGONALS, ...DIAGONALS];

function slide(
  board: Board,
  from: number,
  piece: Piece,
  directions: Vector[],
  out: Move[],
): void {
  const startFile = fileOf(board, from);
  const startRank = rankOf(board, from);

  for (const [df, dr] of directions) {
    let file = startFile + df;
    let rank = startRank + dr;
    while (inside(board, file, rank)) {
      const target = board.squares[idx(board, file, rank)];
      const to = idx(board, file, rank);
      if (!target) {
        out.push({ from, to, piece: piece.type });
      } else {
        if (target.color !== piece.color) {
          out.push({ from, to, piece: piece.type, capture: { square: to, piece: target } });
        }
        break;
      }
      file += df;
      rank += dr;
    }
  }
}

function step(
  board: Board,
  from: number,
  piece: Piece,
  directions: Vector[],
  out: Move[],
): void {
  const startFile = fileOf(board, from);
  const startRank = rankOf(board, from);

  for (const [df, dr] of directions) {
    const file = startFile + df;
    const rank = startRank + dr;
    if (!inside(board, file, rank)) continue;
    const to = idx(board, file, rank);
    const target = board.squares[to];
    if (!target) {
      out.push({ from, to, piece: piece.type });
    } else if (target.color !== piece.color) {
      out.push({ from, to, piece: piece.type, capture: { square: to, piece: target } });
    }
  }
}

function pawnMoves(
  board: Board,
  level: Level,
  from: number,
  piece: Piece,
  epTarget: number | null,
  out: Move[],
): void {
  const file = fileOf(board, from);
  const rank = rankOf(board, from);
  const dir = forward(piece.color);
  const last = promotionRank(board, piece.color);
  const promoteTo = level.rules.promotion ? level.rules.promoteTo ?? "queen" : undefined;

  const push = (move: Move) => {
    if (rankOf(board, move.to) === last && promoteTo) {
      out.push({ ...move, promotion: promoteTo });
    } else {
      out.push(move);
    }
  };

  // Straight ahead, only onto an empty square.
  if (inside(board, file, rank + dir) && !pieceAt(board, file, rank + dir)) {
    push({ from, to: idx(board, file, rank + dir), piece: "pawn" });

    if (
      level.rules.pawnDoubleStep &&
      rank === pawnStartRank(board, piece.color) &&
      inside(board, file, rank + dir * 2) &&
      !pieceAt(board, file, rank + dir * 2)
    ) {
      push({ from, to: idx(board, file, rank + dir * 2), piece: "pawn", doubleStep: true });
    }
  }

  // Diagonal captures.
  for (const df of [-1, 1]) {
    const targetFile = file + df;
    const targetRank = rank + dir;
    if (!inside(board, targetFile, targetRank)) continue;
    const to = idx(board, targetFile, targetRank);
    const target = board.squares[to];

    if (target && target.color !== piece.color) {
      push({ from, to, piece: "pawn", capture: { square: to, piece: target } });
      continue;
    }

    if (level.rules.enPassant && epTarget === to && !target) {
      const victimSquare = idx(board, targetFile, rank);
      const victim = board.squares[victimSquare];
      if (victim && victim.color !== piece.color && victim.type === "pawn") {
        push({ from, to, piece: "pawn", capture: { square: victimSquare, piece: victim } });
      }
    }
  }
}

function castlingMoves(board: Board, level: Level, king: Piece, from: number, out: Move[]): void {
  if (!level.rules.castling || king.moved) return;
  if (isAttacked(board, from, opponent(king.color))) return;

  const rank = rankOf(board, from);
  const kingFile = fileOf(board, from);

  for (const rookFile of [0, board.width - 1]) {
    const rook = pieceAt(board, rookFile, rank);
    if (!rook || rook.type !== "rook" || rook.color !== king.color || rook.moved) continue;

    const dir = rookFile > kingFile ? 1 : -1;

    // Everything between king and rook must be empty.
    let clear = true;
    for (let file = kingFile + dir; file !== rookFile; file += dir) {
      if (pieceAt(board, file, rank)) {
        clear = false;
        break;
      }
    }
    if (!clear) continue;

    // The king may not travel through or land on an attacked square.
    const kingTo = kingFile + dir * 2;
    let safe = true;
    for (let file = kingFile + dir; file !== kingTo + dir; file += dir) {
      if (isAttacked(board, idx(board, file, rank), opponent(king.color))) {
        safe = false;
        break;
      }
    }
    if (!safe) continue;

    out.push({
      from,
      to: idx(board, kingTo, rank),
      piece: "king",
      castle: {
        rookFrom: idx(board, rookFile, rank),
        rookTo: idx(board, kingTo - dir, rank),
      },
    });
  }
}

/** Moves for one piece, ignoring whether they leave the king in check. */
export function pseudoMovesFrom(
  board: Board,
  level: Level,
  from: number,
  epTarget: number | null,
): Move[] {
  const piece = board.squares[from];
  if (!piece) return [];
  const out: Move[] = [];

  switch (piece.type) {
    case "pawn":
      pawnMoves(board, level, from, piece, epTarget, out);
      break;
    case "knight":
      step(board, from, piece, KNIGHT_HOPS, out);
      break;
    case "bishop":
      slide(board, from, piece, DIAGONALS, out);
      break;
    case "rook":
      slide(board, from, piece, ORTHOGONALS, out);
      break;
    case "queen":
      slide(board, from, piece, EVERY_DIRECTION, out);
      break;
    case "king":
      step(board, from, piece, EVERY_DIRECTION, out);
      castlingMoves(board, level, piece, from, out);
      break;
  }

  return out;
}

/** Is `square` attacked by any piece of colour `by`? Scans outwards from the square. */
export function isAttacked(board: Board, square: number, by: Color): boolean {
  const file = fileOf(board, square);
  const rank = rankOf(board, square);

  // Pawns attack diagonally forwards, so we look backwards from the target.
  const pawnDir = forward(by);
  for (const df of [-1, 1]) {
    const piece = pieceAt(board, file + df, rank - pawnDir);
    if (piece && piece.color === by && piece.type === "pawn") return true;
  }

  for (const [df, dr] of KNIGHT_HOPS) {
    const piece = pieceAt(board, file + df, rank + dr);
    if (piece && piece.color === by && piece.type === "knight") return true;
  }

  for (const [df, dr] of EVERY_DIRECTION) {
    const piece = pieceAt(board, file + df, rank + dr);
    if (piece && piece.color === by && piece.type === "king") return true;
  }

  const rays: [Vector[], ("rook" | "bishop")][] = [
    [ORTHOGONALS, "rook"],
    [DIAGONALS, "bishop"],
  ];

  for (const [directions, longRange] of rays) {
    for (const [df, dr] of directions) {
      let f = file + df;
      let r = rank + dr;
      while (inside(board, f, r)) {
        const piece = board.squares[idx(board, f, r)];
        if (piece) {
          if (piece.color === by && (piece.type === longRange || piece.type === "queen")) {
            return true;
          }
          break;
        }
        f += df;
        r += dr;
      }
    }
  }

  return false;
}

export function isInCheck(board: Board, level: Level, color: Color): boolean {
  if (!level.rules.check) return false;
  const king = findKing(board, color);
  if (king === null) return false;
  return isAttacked(board, king, opponent(color));
}

/**
 * Applies a move to a copy of the board. Only used to test legality here —
 * `applyMove` in game.ts is what the game itself goes through.
 */
export function boardAfter(board: Board, move: Move): Board {
  const next = cloneBoard(board);
  const piece = next.squares[move.from];
  if (!piece) return next;

  if (move.capture) next.squares[move.capture.square] = null;
  next.squares[move.from] = null;
  next.squares[move.to] = {
    id: piece.id,
    type: move.promotion ?? piece.type,
    color: piece.color,
    moved: true,
  };

  if (move.castle) {
    const rook = next.squares[move.castle.rookFrom];
    next.squares[move.castle.rookFrom] = null;
    if (rook) next.squares[move.castle.rookTo] = { ...rook, moved: true };
  }

  return next;
}

function keepsKingSafe(board: Board, level: Level, move: Move, color: Color): boolean {
  if (!level.rules.check) return true;
  return !isInCheck(boardAfter(board, move), level, color);
}

/** Every move this piece is actually allowed to make. */
export function legalMovesFrom(
  board: Board,
  level: Level,
  from: number,
  epTarget: number | null,
): Move[] {
  const piece = board.squares[from];
  if (!piece) return [];
  return pseudoMovesFrom(board, level, from, epTarget).filter((move) =>
    keepsKingSafe(board, level, move, piece.color),
  );
}

/** Every move this side is allowed to make. */
export function legalMoves(
  board: Board,
  level: Level,
  color: Color,
  epTarget: number | null,
): Move[] {
  const out: Move[] = [];
  for (let square = 0; square < board.squares.length; square += 1) {
    const piece = board.squares[square];
    if (!piece || piece.color !== color) continue;
    for (const move of pseudoMovesFrom(board, level, square, epTarget)) {
      if (keepsKingSafe(board, level, move, color)) out.push(move);
    }
  }
  return out;
}
