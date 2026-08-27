import type { Board, Color, GameState, Level, Move, Outcome } from "../types";
import {
  cloneBoard,
  countPieces,
  fileOf,
  findKing,
  idx,
  opponent,
  parseSetup,
  promotionRank,
  rankOf,
} from "./board";
import { isInCheck, legalMoves } from "./moves";

export function createGame(level: Level): GameState {
  const board = parseSetup(level);
  return {
    board,
    turn: "white",
    epTarget: null,
    idleTurns: 0,
    lastMove: null,
    captured: [],
    ply: 0,
    outcome: computeOutcome(board, level, "white", null, 0),
  };
}

export function applyMove(state: GameState, level: Level, move: Move): GameState {
  const board = cloneBoard(state.board);
  const piece = board.squares[move.from];
  if (!piece) return state;

  if (move.capture) board.squares[move.capture.square] = null;
  board.squares[move.from] = null;
  // The id survives a promotion, so the pawn visibly becomes a queen in place
  // rather than one piece vanishing and another appearing.
  board.squares[move.to] = {
    id: piece.id,
    type: move.promotion ?? piece.type,
    color: piece.color,
    moved: true,
  };

  if (move.castle) {
    const rook = board.squares[move.castle.rookFrom];
    board.squares[move.castle.rookFrom] = null;
    if (rook) board.squares[move.castle.rookTo] = { ...rook, moved: true };
  }

  let epTarget: number | null = null;
  if (move.doubleStep && level.rules.enPassant) {
    const file = fileOf(board, move.from);
    const midRank = (rankOf(board, move.from) + rankOf(board, move.to)) / 2;
    epTarget = idx(board, file, midRank);
  }

  const turn = opponent(state.turn);
  // Captures and pawn moves are progress; anything else is treading water.
  const idleTurns = move.capture || move.piece === "pawn" ? 0 : state.idleTurns + 1;

  return {
    board,
    turn,
    epTarget,
    idleTurns,
    lastMove: move,
    captured: move.capture ? [...state.captured, move.capture.piece] : state.captured,
    ply: state.ply + 1,
    outcome: computeOutcome(board, level, turn, epTarget, idleTurns),
  };
}

/** Works out whether the game is over, from the point of view of whoever is about to move. */
export function computeOutcome(
  board: Board,
  level: Level,
  turn: Color,
  epTarget: number | null,
  idleTurns: number,
): Outcome | null {
  if (level.win === "raceToEnd") {
    for (const color of ["white", "black"] as Color[]) {
      const goal = promotionRank(board, color);
      for (let file = 0; file < board.width; file += 1) {
        const piece = board.squares[idx(board, file, goal)];
        if (piece && piece.color === color && piece.type === "pawn") {
          return { kind: "win", winner: color, reason: "made it all the way to the end" };
        }
      }
    }
  }

  if (level.win === "captureKing") {
    for (const color of ["white", "black"] as Color[]) {
      if (findKing(board, color) === null) {
        return { kind: "win", winner: opponent(color), reason: "caught the king" };
      }
    }
  }

  for (const color of ["white", "black"] as Color[]) {
    if (countPieces(board, color) === 0) {
      return { kind: "win", winner: opponent(color), reason: "took every last piece" };
    }
  }

  const moves = legalMoves(board, level, turn, epTarget);
  if (moves.length === 0) {
    if (level.rules.check) {
      if (isInCheck(board, level, turn)) {
        return { kind: "win", winner: opponent(turn), reason: "checkmate" };
      }
      return { kind: "draw", reason: "stalemate — nowhere left to go, so it's a draw" };
    }
    return { kind: "win", winner: opponent(turn), reason: "the other side got completely stuck" };
  }

  if (level.rules.check && isBareKings(board)) {
    return { kind: "draw", reason: "just two kings left — nobody can win" };
  }

  if (idleTurns >= level.rules.idleLimit * 2) {
    // "Take them all" would otherwise run forever, because the last piece
    // standing can simply keep running away. When the chase goes cold, whoever
    // collected more wins — which is also a goal a child can see all game.
    if (level.win === "captureAll") {
      const white = countPieces(board, "white");
      const black = countPieces(board, "black");
      if (white !== black) {
        return {
          kind: "win",
          winner: white > black ? "white" : "black",
          reason: "no more captures — and they had the most pieces left!",
        };
      }
    }
    return { kind: "draw", reason: "nobody's taken anything for ages — it's a draw!" };
  }

  return null;
}

function isBareKings(board: Board): boolean {
  return board.squares.every((piece) => !piece || piece.type === "king");
}

/** Whoever is to move is in check — used only to flash a warning in Real Chess. */
export function inCheckNow(state: GameState, level: Level): boolean {
  return isInCheck(state.board, level, state.turn);
}
