"use client";

import { useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { Settings2, Undo2 } from "lucide-react";

import { WinCelebration } from "./celebration";
import { ChessBoard, boardMaxWidth } from "./chess-board";
import { PipSays } from "./pip";
import { PixelButton } from "./pixel-ui";
import { PlayerBar } from "./player-bar";
import { pickMove } from "../engine/ai";
import { findKing, opponent, promotionRank, rankOf } from "../engine/board";
import { applyMove, createGame, inCheckNow } from "../engine/game";
import { legalMoves } from "../engine/moves";
import type {
  Color,
  Difficulty,
  GameState,
  Level,
  Mode,
  Move,
  PieceTheme,
  PieceType,
} from "../types";
import * as say from "../utils/commentary";
import { sounds } from "../utils/sound";

/** The one thing the shell needs to reach into the game for. */
export interface GameHandle {
  restart: () => void;
}

interface ChessGameProps {
  /** Mount this component with `key={level.id}` — a new level is a new game. */
  level: Level;
  theme: PieceTheme;
  mode: Mode;
  difficulty: Difficulty;
  soundOn: boolean;
  /** Ring the pieces the other side could take next go. */
  showDanger: boolean;
  nameOf: (color: Color) => string;
  /** Stickers already in the book, so we only celebrate genuinely new ones. */
  stickers: Record<string, boolean>;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onOpenSettings: () => void;
  onEarnSticker: (id: string) => void;
  /** Called once, the moment a game finishes, with the side that won (if any). */
  onFinish: (winner: Color | null) => void;
  /** So "start again" can live in the settings sheet with everything else. */
  handleRef?: React.RefObject<GameHandle | null>;
}

export function ChessGame({
  level,
  theme,
  mode,
  difficulty,
  soundOn,
  showDanger,
  nameOf,
  stickers,
  hasNextLevel,
  onNextLevel,
  onOpenSettings,
  onEarnSticker,
  onFinish,
  handleRef,
}: ChessGameProps) {
  const [state, setState] = useState<GameState>(() => createGame(level));
  const [past, setPast] = useState<GameState[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [dismissedWin, setDismissedWin] = useState(false);
  // Stepping backwards restores an earlier position, whose `lastMove` may well
  // be a capture. Without this, pressing Oops! replays that capture's flourish
  // and it looks like undoing ate something.
  const [showEffects, setShowEffects] = useState(true);
  const [earnedThisGame, setEarnedThisGame] = useState<string[]>([]);
  // Which pieces Pip has already explained on this level.
  const [taught, setTaught] = useState<PieceType[]>([]);
  // Bumped on restart so the pieces march on again.
  const [round, setRound] = useState(0);

  const [message, setMessage] = useState<say.Line>(() =>
    say.levelWelcome(level, theme, nameOf("white")),
  );
  const [messageKey, setMessageKey] = useState(0);

  const speak = useCallback((next: say.Line) => {
    setMessage(next);
    setMessageKey((key) => key + 1);
  }, []);

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
      if (move.from === selected) map.set(move.to, map.get(move.to) ?? move);
    }
    return map;
  }, [availableMoves, selected, canPlay]);

  // Everything the side to move could lose on the opponent's reply. The most
  // useful thing to show a beginner after "where can this go".
  const inDanger = useMemo(() => {
    const squares = new Set<number>();
    if (!showDanger || state.outcome || computerToPlay) return squares;

    for (const move of legalMoves(state.board, level, opponent(state.turn), state.epTarget)) {
      if (move.capture?.piece.color === state.turn) squares.add(move.capture.square);
    }
    return squares;
  }, [showDanger, state, level, computerToPlay]);

  const checkSquare = useMemo(() => {
    if (!level.rules.check || state.outcome || !inCheckNow(state, level)) return null;
    return findKing(state.board, state.turn);
  }, [state, level]);

  const play = useCallback(
    (move: Move) => {
      const next = applyMove(state, level, move);
      const mover = state.turn;

      setShowEffects(true);
      setPast((history) => [...history, state]);
      setState(next);
      setSelected(null);

      if (soundOn) {
        if (next.outcome) {
          if (next.outcome.kind === "win") sounds.win();
          else sounds.draw();
        } else if (move.promotion) {
          sounds.promote();
        } else if (level.rules.check && inCheckNow(next, level)) {
          sounds.check();
        } else if (move.capture) {
          sounds.capture();
        } else {
          sounds.move();
        }
      }

      // Whether this counts as "he won": in two-player mode finishing the game
      // is the achievement; against the computer he has to actually beat it.
      const humanWon =
        next.outcome?.kind !== "win"
          ? null
          : mode === "two"
            ? true
            : next.outcome.winner === "white";

      // Anything the board has just proved he can do.
      const fresh = awards(next, level, move, humanWon).filter((id) => !stickers[id]);
      if (fresh.length > 0) {
        fresh.forEach(onEarnSticker);
        setEarnedThisGame((current) => [...current, ...fresh]);
        if (soundOn) sounds.sticker();
      }

      // One thing at a time, most urgent first.
      if (next.outcome) {
        speak(
          say.ending(
            humanWon,
            nameOf(next.outcome.kind === "win" ? next.outcome.winner : "white"),
            next.ply,
          ),
        );
        onFinish(next.outcome.kind === "win" ? next.outcome.winner : null);
        return;
      }

      if (move.promotion) {
        speak(say.promoted(theme, move.promotion));
      } else if (level.rules.check && inCheckNow(next, level)) {
        speak(say.inCheck(theme));
      } else if (level.win === "raceToEnd" && oneStepFromHome(next, mover)) {
        speak(say.nearlyHome(next.ply));
      } else if (move.capture) {
        speak(
          say.tookSomething(
            theme,
            move.capture.piece.type,
            mode === "one" && move.capture.piece.color === "white",
            next.ply,
          ),
        );
      } else if (mode === "one" && next.turn === "black") {
        speak(say.thinking(next.ply));
      } else {
        speak(say.yourTurn(nameOf(next.turn), next.ply));
      }
    },
    [state, level, soundOn, theme, mode, nameOf, stickers, onEarnSticker, onFinish, speak],
  );

  // The computer's turn. The move itself happens in the timeout, which also
  // gives the pause that makes it feel like someone is sitting opposite.
  useEffect(() => {
    if (!computerToPlay) return;

    const timer = setTimeout(() => {
      const move = pickMove(state, level, difficulty);
      if (move) play(move);
    }, 620);

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

        const piece = state.board.squares[square];
        if (piece) {
          const seen = taught.includes(piece.type);
          if (!seen) setTaught((current) => [...current, piece.type]);
          speak(say.pickedUp(theme, piece.type, seen, square + state.ply));
        }
        return;
      }
      setSelected(null);
    },
    [targets, selected, pickable, play, soundOn, state, taught, theme, speak],
  );

  const restart = useCallback(() => {
    setState(createGame(level));
    setPast([]);
    setSelected(null);
    setDismissedWin(false);
    setShowEffects(false);
    setEarnedThisGame([]);
    setRound((current) => current + 1);
    speak(say.levelWelcome(level, theme, nameOf("white")));
  }, [level, theme, nameOf, speak]);

  useImperativeHandle(handleRef, () => ({ restart }), [restart]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    // Against the computer, step back over its reply too, so it's your go again.
    const steps = mode === "one" && past.length >= 2 ? 2 : 1;
    const target = past[past.length - steps];
    setState(target);
    setPast(past.slice(0, past.length - steps));
    setSelected(null);
    setDismissedWin(false);
    setShowEffects(false);
    speak({ text: "No problem — take it back and try again!", mood: "happy" });
  }, [past, mode, speak]);

  const humanWon =
    state.outcome?.kind === "win"
      ? mode === "two"
        ? true
        : state.outcome.winner === "white"
      : null;

  const width = { maxWidth: boardMaxWidth(level) };

  return (
    <div className="relative flex min-w-0 flex-1 flex-col items-center justify-center gap-2">
      <ChessBoard
        board={state.board}
        theme={theme}
        selected={selected}
        targets={targets}
        pickable={pickable}
        lastMove={state.lastMove}
        ply={state.ply}
        showEffects={showEffects}
        round={round}
        inDanger={inDanger}
        checkSquare={checkSquare}
        turn={state.turn}
        winner={state.outcome?.kind === "win" ? state.outcome.winner : null}
        thinking={computerToPlay}
        onSquare={handleSquare}
        // The far player's name goes above their own end of the board and the
        // near player's below theirs. It is the only arrangement a child reads
        // without being told: your name is on your side.
        railTop={
          <PlayerBar
            color="black"
            name={nameOf("black")}
            theme={theme}
            isTurn={state.turn === "black" && !state.outcome}
            isThinking={computerToPlay}
            loot={state.captured.filter((piece) => piece.color === "white")}
            align="left"
          />
        }
        railBottom={
          <PlayerBar
            color="white"
            name={nameOf("white")}
            theme={theme}
            isTurn={state.turn === "white" && !state.outcome}
            isThinking={false}
            loot={state.captured.filter((piece) => piece.color === "black")}
            align="left"
          />
        }
      />

      <div className="mt-1 flex w-full items-center gap-2" style={width}>
        <div className="min-w-0 flex-1">
          <PipSays
            text={message.text}
            mood={message.mood}
            colour={theme.world.guide}
            speechKey={messageKey}
            compact
          />
        </div>

        {/*
          Two buttons is the whole interface. Everything else a grown-up might
          want is behind the gear — but not Oops, which a beginner presses more
          than any other control in the game and which has to stay one tap away.
        */}
        <PixelButton
          onClick={undo}
          disabled={past.length === 0}
          aria-label="Take that move back"
          className="shrink-0"
        >
          <Undo2 className="size-3.5" />
          Oops
        </PixelButton>
        <PixelButton onClick={onOpenSettings} aria-label="Settings" className="shrink-0">
          <Settings2 className="size-3.5" />
        </PixelButton>
      </div>

      {state.outcome && !dismissedWin && (
        <WinCelebration
          outcome={state.outcome}
          theme={theme}
          nameOf={nameOf}
          humanWon={humanWon}
          earnedStickers={earnedThisGame}
          hasNextLevel={hasNextLevel}
          onPlayAgain={restart}
          onNextLevel={onNextLevel}
          onDismiss={() => setDismissedWin(true)}
        />
      )}
    </div>
  );
}

/** True when the side that just moved has a pawn one square from the far end. */
function oneStepFromHome(state: GameState, color: Color): boolean {
  const goal = promotionRank(state.board, color);
  const step = color === "white" ? -1 : 1;

  return state.board.squares.some(
    (piece, square) =>
      piece?.color === color &&
      piece.type === "pawn" &&
      rankOf(state.board, square) === goal + step,
  );
}

/** Stickers this move has just proved he can earn. */
function awards(
  state: GameState,
  level: Level,
  move: Move,
  humanWon: boolean | null,
): string[] {
  const earned: string[] = [];

  if (move.capture) earned.push("first-capture");
  if (move.promotion) earned.push("promoter");

  if (state.outcome?.kind === "win") {
    const winner = state.outcome.winner;

    if (state.outcome.reason === "checkmate") earned.push("checkmate");
    if (state.outcome.reason.includes("caught the king")) earned.push("king-catcher");

    // Nothing of the winner's was ever taken.
    if (!state.captured.some((piece) => piece.color === winner)) earned.push("flawless");
    if (state.ply <= 20) earned.push("speedy");

    // Matches the star on the map: only when it was his win.
    if (humanWon) earned.push(`level-${level.id}`);
  }

  return earned;
}
