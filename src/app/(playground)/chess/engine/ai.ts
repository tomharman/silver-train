import type { Board, Color, Difficulty, GameState, Level, Move, PieceType } from "../types";
import { fileOf, idx, opponent, promotionRank, rankOf } from "./board";
import { boardAfter, isInCheck, legalMoves } from "./moves";

const VALUE: Record<PieceType, number> = {
  pawn: 100,
  knight: 300,
  bishop: 320,
  rook: 500,
  queen: 900,
  king: 0,
};

const WIN_SCORE = 1_000_000;

const DEPTH: Record<Difficulty, number> = {
  sleepy: 0,
  thinky: 2,
  tricky: 3,
};

/** Stops the search running away on the 8×8 board. */
const NODE_BUDGET = 60_000;

interface SearchContext {
  level: Level;
  nodes: number;
}

function materialAndShape(board: Board, level: Level): number {
  let score = 0;
  const centreFile = (board.width - 1) / 2;
  const centreRank = (board.height - 1) / 2;

  for (let square = 0; square < board.squares.length; square += 1) {
    const piece = board.squares[square];
    if (!piece) continue;

    const sign = piece.color === "white" ? 1 : -1;
    let value = VALUE[piece.type];

    // Where there is no checkmate, the king is simply the most valuable thing
    // on the board — that's what makes the engine defend it.
    if (piece.type === "king" && level.win === "captureKing") value = 10_000;

    if (level.win === "raceToEnd" && piece.type === "pawn") {
      // In a race, a pawn's worth is mostly how far up the board it has got.
      const rank = rankOf(board, square);
      const travelled = piece.color === "white" ? rank : board.height - 1 - rank;
      value += travelled * travelled * 8;
    }

    // A gentle nudge towards the middle, which stops aimless shuffling.
    const distance =
      Math.abs(fileOf(board, square) - centreFile) + Math.abs(rankOf(board, square) - centreRank);
    value += Math.max(0, 6 - distance);

    score += sign * value;
  }

  return score;
}

function raceFinished(board: Board, level: Level): Color | null {
  if (level.win !== "raceToEnd") return null;
  for (const color of ["white", "black"] as Color[]) {
    const goal = promotionRank(board, color);
    for (let file = 0; file < board.width; file += 1) {
      const piece = board.squares[idx(board, file, goal)];
      if (piece && piece.color === color && piece.type === "pawn") return color;
    }
  }
  return null;
}

function orderMoves(moves: Move[]): Move[] {
  return moves
    .slice()
    .sort(
      (a, b) =>
        (b.capture ? VALUE[b.capture.piece.type] : 0) - (a.capture ? VALUE[a.capture.piece.type] : 0),
    );
}

/** Negamax with alpha–beta. Returns the score from `turn`'s point of view. */
function search(
  board: Board,
  turn: Color,
  epTarget: number | null,
  depth: number,
  alpha: number,
  beta: number,
  context: SearchContext,
): number {
  const sign = turn === "white" ? 1 : -1;
  context.nodes += 1;

  const finished = raceFinished(board, context.level);
  if (finished) return sign * (finished === "white" ? WIN_SCORE : -WIN_SCORE);

  if (depth === 0 || context.nodes > NODE_BUDGET) {
    return sign * materialAndShape(board, context.level);
  }

  const moves = orderMoves(legalMoves(board, context.level, turn, epTarget));
  if (moves.length === 0) {
    // Scores here are already from `turn`'s point of view, so no `sign`.
    if (context.level.rules.check) {
      // Prefer mates that arrive sooner, and treat stalemate as level.
      return isInCheck(board, context.level, turn) ? -WIN_SCORE - depth : 0;
    }
    return -WIN_SCORE;
  }

  let best = -Infinity;
  for (const move of moves) {
    const next = boardAfter(board, move);
    const nextEp =
      move.doubleStep && context.level.rules.enPassant
        ? idx(board, fileOf(board, move.from), (rankOf(board, move.from) + rankOf(board, move.to)) / 2)
        : null;

    // Capturing a king ends it outright in the levels that allow it.
    if (move.capture?.piece.type === "king") return WIN_SCORE;

    const score = -search(next, opponent(turn), nextEp, depth - 1, -beta, -alpha, context);
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }

  return best;
}

/**
 * Picks the computer's move.
 *
 * `sleepy` is close to random on purpose — a five year old needs to win
 * sometimes — but it will grab a free piece often enough that it doesn't look
 * broken.
 */
export function pickMove(state: GameState, level: Level, difficulty: Difficulty): Move | null {
  const moves = legalMoves(state.board, level, state.turn, state.epTarget);
  if (moves.length === 0) return null;

  if (difficulty === "sleepy") {
    const captures = moves.filter((move) => move.capture);
    if (captures.length > 0 && Math.random() < 0.35) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const context: SearchContext = { level, nodes: 0 };
  const depth = DEPTH[difficulty];

  let best: Move | null = null;
  let bestScore = -Infinity;

  for (const move of orderMoves(moves)) {
    if (move.capture?.piece.type === "king") return move;

    const next = boardAfter(state.board, move);
    const nextEp =
      move.doubleStep && level.rules.enPassant
        ? idx(
            state.board,
            fileOf(state.board, move.from),
            (rankOf(state.board, move.from) + rankOf(state.board, move.to)) / 2,
          )
        : null;

    // Every root move gets a full window. Narrowing here would let moves that
    // fail low come back with a bound equal to the best score, and the random
    // tie-break below would then happily pick a blunder.
    const score = -search(next, opponent(state.turn), nextEp, depth - 1, -Infinity, Infinity, context);

    // Genuine ties broken at random, so the same game doesn't play out twice.
    if (score > bestScore || (score === bestScore && Math.random() < 0.3)) {
      bestScore = score;
      best = move;
    }
  }

  return best ?? moves[0];
}
