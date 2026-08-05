"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { RotateCcw, Settings2, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Confetti } from "../chess/components/celebration";
import { PipSays } from "../chess/components/pip";
import { LEVELS, getLevel } from "../chess/data/levels";
import { pickMove } from "../chess/engine/ai";
import { findKing, opponent, promotionRank, rankOf } from "../chess/engine/board";
import { applyMove, createGame, inCheckNow } from "../chess/engine/game";
import { legalMoves } from "../chess/engine/moves";
import { useStoredState } from "../chess/hooks/use-stored-state";
import type { Color, Difficulty, GameState, Mode, Move, Piece, PieceType } from "../chess/types";
import { listenForUnlock, sounds } from "../chess/utils/sound";
import { SquareButtons } from "./components/square-overlay";
import { PALETTES, getPalette } from "./data/palettes";
import { SCENES, getScene } from "./data/scenes";
import type { CameraAngle } from "./utils/board-space";
import * as reefSound from "./utils/reef-sound";
import * as talk from "./utils/reef-talk";

/**
 * Reef Quest.
 *
 * The same game as Chess Club — same engine, same six levels, same computer
 * opponent, covered by the same tests — rendered as a reef instead of a grid.
 * No rule lives in this folder; if the two ever disagree, this is the one
 * that's wrong.
 */

// Three.js has no business on the server, and this keeps it out of everyone
// else's bundle until somebody actually opens the reef.
const QuestScene = dynamic(
  () => import("./components/quest-scene").then((module) => module.QuestScene),
  { ssr: false },
);

const NO_FLAGS: Record<string, boolean> = {};

let webglAnswer: boolean | null = null;

function hasWebGL(): boolean {
  if (webglAnswer !== null) return webglAnswer;
  try {
    const canvas = document.createElement("canvas");
    webglAnswer = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    webglAnswer = false;
  }
  return webglAnswer;
}

/** Assume yes while rendering on the server, then ask the browser for real. */
function useWebGL(): boolean {
  return useSyncExternalStore(
    () => () => {},
    hasWebGL,
    () => true,
  );
}

export default function ReefQuestPage() {
  const [levelId, setLevelId] = useStoredState("reef-level", LEVELS[0].id);
  const [mode, setMode] = useStoredState<Mode>("chess-mode", "two");
  const [difficulty, setDifficulty] = useStoredState<Difficulty>("chess-difficulty", "sleepy");
  const [soundOn, setSoundOn] = useStoredState("chess-sound", true);
  const [showDanger, setShowDanger] = useStoredState("chess-danger", false);
  const [playerOne] = useStoredState("chess-player-one", "Player 1");
  const [playerTwo] = useStoredState("chess-player-two", "Player 2");
  const [won, setWon] = useStoredState("reef-progress", NO_FLAGS);
  const [sceneId, setSceneId] = useStoredState("reef-scene", SCENES[0].id);
  const [angle, setAngle] = useStoredState<CameraAngle>("reef-angle", "normal");
  const [whitePalette, setWhitePalette] = useStoredState("reef-palette-white", PALETTES[0].id);
  const [blackPalette, setBlackPalette] = useStoredState("reef-palette-black", PALETTES[1].id);

  const scene = getScene(sceneId);
  const palettes = useMemo(
    () => ({ white: getPalette(whitePalette), black: getPalette(blackPalette) }),
    [whitePalette, blackPalette],
  );

  const level = getLevel(levelId);
  const webgl = useWebGL();

  const [state, setState] = useState<GameState>(() => createGame(level));
  const [past, setPast] = useState<GameState[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [dying, setDying] = useState<{ piece: Piece; square: number; key: number } | null>(null);
  const [taught, setTaught] = useState<PieceType[]>([]);
  const [showSetup, setShowSetup] = useState(false);
  const [dismissedWin, setDismissedWin] = useState(false);

  const [message, setMessage] = useState<talk.Line>(() =>
    talk.welcome(level, playerOne || "Player 1", SCENES[0].welcome),
  );
  const [messageKey, setMessageKey] = useState(0);

  const speak = useCallback((line: talk.Line) => {
    setMessage(line);
    setMessageKey((key) => key + 1);
  }, []);

  // iOS needs a real gesture before it will make a sound, and it will accept
  // several different ones. This wires up all of them.
  useEffect(() => listenForUnlock(), []);

  const nameOf = useCallback(
    (color: Color) => {
      if (color === "white") return playerOne || "Player 1";
      if (mode === "one") return "Computer";
      return playerTwo || "Player 2";
    },
    [playerOne, playerTwo, mode],
  );

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

  /** Every square a tap could mean something on. */
  const active = useMemo(() => {
    const set = new Set<number>(pickable);
    targets.forEach((_, square) => set.add(square));
    if (selected !== null) set.add(selected);
    return set;
  }, [pickable, targets, selected]);

  const play = useCallback(
    (move: Move) => {
      const next = applyMove(state, level, move);
      const mover = state.turn;

      setPast((history) => [...history, state]);
      setState(next);
      setSelected(null);
      setDying(
        move.capture
          ? { piece: move.capture.piece, square: move.capture.square, key: next.ply }
          : null,
      );

      if (soundOn) {
        // Every creature has its own voice, so you can hear which one moved.
        if (next.outcome) {
          if (next.outcome.kind === "win") sounds.win();
          else sounds.draw();
        } else if (move.promotion) reefSound.creatureGrew();
        else if (level.rules.check && inCheckNow(next, level)) reefSound.reefAlarm();
        else if (move.capture) reefSound.creatureEaten();
        else reefSound.creatureMove(move.piece);
      }

      const humanWon =
        next.outcome?.kind !== "win"
          ? null
          : mode === "two"
            ? true
            : next.outcome.winner === "white";

      if (next.outcome) {
        speak(
          talk.ending(
            humanWon,
            nameOf(next.outcome.kind === "win" ? next.outcome.winner : "white"),
            next.ply,
          ),
        );
        if (humanWon) setWon((current) => ({ ...current, [level.id]: true }));
        return;
      }

      if (move.promotion) speak(talk.promoted(move.promotion));
      else if (level.rules.check && inCheckNow(next, level)) speak(talk.inCheck());
      else if (level.win === "raceToEnd" && oneStepFromHome(next, mover))
        speak(talk.nearlyThere(next.ply));
      else if (move.capture)
        speak(
          talk.munched(
            move.capture.piece.type,
            mode === "one" && move.capture.piece.color === "white",
            next.ply,
          ),
        );
      else if (mode === "one" && next.turn === "black") speak(talk.thinking(next.ply));
      else speak(talk.yourTurn(nameOf(next.turn), next.ply));
    },
    [state, level, soundOn, mode, nameOf, speak, setWon],
  );

  useEffect(() => {
    if (!computerToPlay) return;
    const timer = setTimeout(() => {
      const move = pickMove(state, level, difficulty);
      if (move) play(move);
    }, 700);
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
        if (soundOn) reefSound.creaturePick();
        const piece = state.board.squares[square];
        if (piece) {
          const seen = taught.includes(piece.type);
          if (!seen) setTaught((current) => [...current, piece.type]);
          speak(talk.pickedUp(piece.type, seen, square + state.ply));
        }
        return;
      }
      setSelected(null);
    },
    [targets, selected, pickable, play, soundOn, state, taught, speak],
  );

  const startLevel = useCallback(
    (id: string) => {
      const next = getLevel(id);
      setLevelId(id);
      setState(createGame(next));
      setPast([]);
      setSelected(null);
      setDying(null);
      setTaught([]);
      setDismissedWin(false);
      setShowSetup(false);
      speak(talk.welcome(next, playerOne || "Player 1", getScene(sceneId).welcome));
    },
    [setLevelId, speak, playerOne, sceneId],
  );

  const restart = useCallback(() => startLevel(level.id), [startLevel, level.id]);

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const steps = mode === "one" && past.length >= 2 ? 2 : 1;
    setState(past[past.length - steps]);
    setPast(past.slice(0, past.length - steps));
    setSelected(null);
    setDying(null);
    setDismissedWin(false);
    speak({ text: "No problem — take it back and try again!", mood: "happy" });
  }, [past, mode, speak]);

  const humanWon =
    state.outcome?.kind === "win"
      ? mode === "two"
        ? true
        : state.outcome.winner === "white"
      : null;

  const levelIndex = LEVELS.findIndex((candidate) => candidate.id === level.id);
  const nextLevel = LEVELS[levelIndex + 1];

  if (!webgl) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="text-5xl">🐠</div>
        <h1 className="text-xl font-bold">The reef needs 3D graphics</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This browser can&apos;t do WebGL, so the underwater board won&apos;t load. The flat
          version plays exactly the same game.
        </p>
        <Button asChild size="lg">
          <Link href="/chess">Go to Chess Club</Link>
        </Button>
      </div>
    );
  }

  return (
    <div
      className="relative flex min-w-0 flex-1 flex-col overflow-hidden"
      style={{ minHeight: "calc(100svh - 5rem)" }}
    >
      {/* The reef fills the whole panel; everything else floats over it. */}
      <div className="absolute inset-0">
        <QuestScene
          state={state}
          selected={selected}
          targets={targets}
          inDanger={inDanger}
          checkSquare={checkSquare}
          dying={dying}
          scene={scene}
          palettes={palettes}
          angle={angle}
          rails={{
            near: {
              name: nameOf("white"),
              colour: palettes.white.body,
              active: state.turn === "white" && !state.outcome,
            },
            far: {
              name: nameOf("black"),
              colour: palettes.black.body,
              active: state.turn === "black" && !state.outcome,
            },
          }}
        />
      </div>

      <SquareButtons board={state.board} active={active} onSquare={handleSquare} />

      {showSetup && (
        <div className="pointer-events-auto absolute inset-x-3 top-3 z-20 max-h-[62vh] overflow-y-auto rounded-2xl bg-black/75 p-3 backdrop-blur-sm">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            <Choice
              label="Who's playing"
              value={mode}
              onChange={setMode}
              options={[
                { value: "two" as Mode, label: "Two of us" },
                { value: "one" as Mode, label: "Computer" },
              ]}
            />
            <Choice
              label="Computer skill"
              value={difficulty}
              onChange={setDifficulty}
              options={[
                { value: "sleepy" as Difficulty, label: "Sleepy" },
                { value: "thinky" as Difficulty, label: "Thinky" },
                { value: "tricky" as Difficulty, label: "Tricky" },
              ]}
            />
            <Choice
              label="Danger rings"
              value={showDanger ? "on" : "off"}
              onChange={(value) => setShowDanger(value === "on")}
              options={[
                { value: "off", label: "Off" },
                { value: "on", label: "On" },
              ]}
            />
            <Choice
              label="Sound"
              value={soundOn ? "on" : "off"}
              onChange={(value) => {
                const next = value === "on";
                setSoundOn(next);
                // A deliberate tap is the best moment to wake iOS audio up, and
                // hearing something back confirms it worked.
                if (next) reefSound.creatureGrew();
              }}
              options={[
                { value: "off", label: "Off" },
                { value: "on", label: "On" },
              ]}
            />
            <Choice
              label="Camera"
              value={angle}
              onChange={setAngle}
              options={[
                { value: "low" as CameraAngle, label: "Low" },
                { value: "normal" as CameraAngle, label: "Mid" },
                { value: "high" as CameraAngle, label: "High" },
                { value: "top" as CameraAngle, label: "Top" },
              ]}
            />
            <Choice
              label="Where to play"
              value={sceneId}
              onChange={(id) => {
                setSceneId(id);
                const next = getScene(id);
                speak({ text: `Off we go to ${next.name}!`, mood: "cheer" });
              }}
              options={SCENES.map((candidate) => ({
                value: candidate.id,
                label: `${candidate.emoji} ${candidate.short}`,
              }))}
            />
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <ColourRow
              label={nameOf("white")}
              value={whitePalette}
              onPick={(id) => {
                // Taking the other player's colour hands them yours.
                if (id === blackPalette) setBlackPalette(whitePalette);
                setWhitePalette(id);
              }}
            />
            <ColourRow
              label={nameOf("black")}
              value={blackPalette}
              onPick={(id) => {
                if (id === whitePalette) setWhitePalette(blackPalette);
                setBlackPalette(id);
              }}
            />
          </div>

          <div className="mt-3 flex gap-1.5 overflow-x-auto">
            {LEVELS.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                onClick={() => startLevel(candidate.id)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${
                  candidate.id === level.id ? "bg-cyan-300 text-cyan-950" : "bg-white/15 text-white"
                }`}
              >
                {candidate.emoji} {candidate.name} {won[candidate.id] ? "⭐" : ""}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1" />

      <div className="pointer-events-none relative z-10 flex flex-col gap-2 p-3">
        <div className="pointer-events-auto">
          <PipSays
            text={message.text}
            mood={message.mood}
            colour={scene.guide}
            speechKey={messageKey}
            compact
            tone="dark"
          />
        </div>

        <div className="pointer-events-auto flex justify-center gap-2">
          <Button variant="secondary" size="lg" onClick={undo} disabled={past.length === 0}>
            <Undo2 />
            Oops!
          </Button>
          <Button variant="secondary" size="lg" onClick={restart}>
            <RotateCcw />
            Start again
          </Button>
          <Button
            variant={showSetup ? "default" : "secondary"}
            size="lg"
            onClick={() => setShowSetup(!showSetup)}
            aria-label="Setup"
          >
            <Settings2 />
          </Button>
        </div>
      </div>

      {state.outcome && !dismissedWin && (
        <>
          {humanWon !== false && <Confetti />}
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="chess-rise w-full max-w-sm rounded-2xl bg-card p-5 text-center shadow-2xl">
              <div className="mb-1 text-5xl">{state.outcome.kind === "win" ? "🎉" : "🤝"}</div>
              <h2 className="text-2xl font-bold">
                {state.outcome.kind === "win"
                  ? `${nameOf(state.outcome.winner)} wins!`
                  : "It's a draw!"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{state.outcome.reason}</p>
              <div className="mt-4 flex flex-col gap-2">
                {nextLevel && (
                  <Button size="lg" onClick={() => startLevel(nextLevel.id)}>
                    Next game →
                  </Button>
                )}
                <Button size="lg" variant="outline" onClick={restart}>
                  Play again
                </Button>
                <Button size="lg" variant="ghost" onClick={() => setDismissedWin(true)}>
                  Look at the reef
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Colour swatches, one row per player.
 *
 * The first version disabled whatever the other player had taken, which meant
 * half the choices were dead and a child tapping one got nothing at all. Now
 * picking a colour someone else holds simply swaps the two of you — nobody is
 * ever blocked, no swatch is ever inert, and the trade explains itself the
 * moment you see the other row change.
 */
function ColourRow({
  label,
  value,
  onPick,
}: {
  label: string;
  value: string;
  onPick: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 truncate text-[10px] font-bold uppercase tracking-wide text-white/70">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {PALETTES.map((palette) => {
          const mine = palette.id === value;
          return (
            <button
              key={palette.id}
              type="button"
              onClick={() => onPick(palette.id)}
              aria-label={palette.name}
              aria-pressed={mine}
              title={palette.name}
              className={`relative size-9 rounded-full transition-transform active:scale-90 ${
                mine ? "ring-[3px] ring-white" : "ring-1 ring-white/25 hover:ring-white/60"
              }`}
              style={{ background: palette.body, boxShadow: `inset 0 -6px 0 0 ${palette.accent}` }}
            >
              {mine && (
                <span className="absolute inset-0 grid place-items-center text-sm font-black text-white drop-shadow">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Choice<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div>
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-cyan-100/70">
        {label}
      </div>
      <div className="flex rounded-lg bg-white/10 p-0.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 truncate rounded-md px-2 py-1 text-xs font-semibold ${
              option.value === value ? "bg-white text-slate-900" : "text-white/80"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

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
