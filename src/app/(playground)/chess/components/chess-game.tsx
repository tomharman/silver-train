"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RotateCcw, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ChessBoard, boardMaxWidth } from "./chess-board";
import { WinOverlay } from "./panels";
import { PlayerBar } from "./player-bar";
import { pickMove } from "../engine/ai";
import { findKing } from "../engine/board";
import { applyMove, createGame, inCheckNow } from "../engine/game";
import { legalMoves } from "../engine/moves";
import type { Color, Difficulty, GameState, Level, Mode, Move, PieceTheme } from "../types";
import { sounds } from "../utils/sound";

interface ChessGameProps {
  /** Mount this component with `key={level.id}` — a new level is a new game. */
  level: Level;
  theme: PieceTheme;
  mode: Mode;
  difficulty: Difficulty;
  soundOn: boolean;
  nameOf: (color: Color) => string;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  /** Called once, the moment a game finishes, with the side that won (if any). */
  onFinish: (winner: Color | null) => void;
}

export function ChessGame({
  level,
  theme,
  mode,
  difficulty,
  soundOn,
  nameOf,
  hasNextLevel,
  onNextLevel,
  onFinish,
}: ChessGameProps) {
  const [state, setState] = useState<GameState>(() => createGame(level));
  const [past, setPast] = useState<GameState[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [dismissedWin, setDismissedWin] = useState(false);

  const computerToPlay = mode === "one" && state.turn === "black" && !state.outcome;
  const canPlay = !state.outcome && !computerToPlay;

  const availableMoves = useMemo(
    () => legalMoves(state.board, level, state.turn, state.epTarget),
    [state, level],
  );

  const pickable = useMemo(
    () => (canPlay ? new Set(availableMoves.map((move) => move.from)) : new Set<number>()),
    [availableMoves, canPlay],
  );

  const targets = useMemo(() => {
    const map = new Map<number, Move>();
    if (selected === null || !canPlay) return map;
    for (const move of availableMoves) {
      if (move.from === selected) map.set(move.to, move);
    }
    return map;
  }, [availableMoves, selected, canPlay]);

  const checkSquare = useMemo(() => {
    if (!level.rules.check || state.outcome || !inCheckNow(state, level)) return null;
    return findKing(state.board, state.turn);
  }, [state, level]);

  const play = useCallback(
    (move: Move) => {
      const next = applyMove(state, level, move);
      setPast((history) => [...history, state]);
      setState(next);
      setSelected(null);

      if (soundOn) {
        if (next.outcome) {
          if (next.outcome.kind === "win") sounds.win();
          else sounds.draw();
        } else if (move.capture) {
          sounds.capture();
        } else {
          sounds.move();
        }
      }

      if (next.outcome) {
        onFinish(next.outcome.kind === "win" ? next.outcome.winner : null);
      }
    },
    [state, level, soundOn, onFinish],
  );

  // The computer's turn. The move itself happens in the timeout, which also
  // gives the pause that makes it feel like someone is sitting opposite.
  useEffect(() => {
    if (!computerToPlay) return;

    const timer = setTimeout(() => {
      const move = pickMove(state, level, difficulty);
      if (move) play(move);
    }, 550);

    return () => clearTimeout(timer);
  }, [computerToPlay, state, level, difficulty, play]);

  const handleSquare = useCallback(
    (square: number) => {
      const move = targets.get(square);
      if (move) {
        play(move);
        return;
      }
      if (selected === square) {
        setSelected(null);
        return;
      }
      if (pickable.has(square)) {
        setSelected(square);
        if (soundOn) sounds.pick();
        return;
      }
      setSelected(null);
    },
    [targets, selected, pickable, play, soundOn],
  );

  const restart = useCallback(() => {
    setState(createGame(level));
    setPast([]);
    setSelected(null);
    setDismissedWin(false);
  }, [level]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    // Against the computer, step back over its reply too, so it's your go again.
    const steps = mode === "one" && past.length >= 2 ? 2 : 1;
    setState(past[past.length - steps]);
    setPast(past.slice(0, past.length - steps));
    setSelected(null);
    setDismissedWin(false);
  }, [past, mode]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex w-full gap-2" style={{ maxWidth: boardMaxWidth(level) }}>
        <PlayerBar
          color="white"
          name={nameOf("white")}
          theme={theme}
          isTurn={state.turn === "white" && !state.outcome}
          isThinking={false}
          loot={state.captured.filter((piece) => piece.color === "black")}
          align="left"
        />
        <PlayerBar
          color="black"
          name={nameOf("black")}
          theme={theme}
          isTurn={state.turn === "black" && !state.outcome}
          isThinking={computerToPlay}
          loot={state.captured.filter((piece) => piece.color === "white")}
          align="right"
        />
      </div>

      {checkSquare !== null && (
        <div className="rounded-full bg-red-100 px-4 py-1 text-sm font-semibold text-red-700 dark:bg-red-950 dark:text-red-300">
          Careful — your king is in check!
        </div>
      )}

      <ChessBoard
        board={state.board}
        theme={theme}
        selected={selected}
        targets={targets}
        pickable={pickable}
        lastMove={state.lastMove}
        checkSquare={checkSquare}
        onSquare={handleSquare}
      />

      <div className="flex gap-2">
        <Button variant="outline" size="lg" onClick={undo} disabled={past.length === 0}>
          <Undo2 />
          Oops!
        </Button>
        <Button variant="outline" size="lg" onClick={restart}>
          <RotateCcw />
          Start again
        </Button>
      </div>

      {state.outcome && !dismissedWin && (
        <WinOverlay
          outcome={state.outcome}
          nameOf={nameOf}
          hasNextLevel={hasNextLevel}
          onPlayAgain={restart}
          onNextLevel={onNextLevel}
          onDismiss={() => setDismissedWin(true)}
        />
      )}
    </div>
  );
}
