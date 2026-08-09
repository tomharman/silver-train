"use client";

import { useEffect, useRef, useState } from "react";

import { PieceToken } from "./piece-token";
import type { Board, Color, Move, PieceTheme } from "../types";
import { type Attention, faceFor, gazeFor } from "../utils/expressions";
import {
  burstFor,
  burstVector,
  captureEffectFor,
  idleRhythm,
  travelDuration,
  travelEasing,
  travelStyleFor,
} from "../utils/motion";

interface ChessBoardProps {
  board: Board;
  theme: PieceTheme;
  selected: number | null;
  /** Legal moves from the selected square, keyed by destination. */
  targets: Map<number, Move>;
  /** Squares holding a piece that the player is allowed to pick up. */
  pickable: Set<number>;
  lastMove: Move | null;
  /** Half-move count. Changing it re-keys the effects so they replay. */
  ply: number;
  /** False after an undo or a restart, where a flourish would be a lie. */
  showEffects: boolean;
  /** Bumped when a fresh game starts, so the pieces march on again. */
  round: number;
  /** Your pieces the other side could take on their next go. */
  inDanger: Set<number>;
  checkSquare: number | null;
  turn: Color;
  /** Set once someone has won, so their whole army can celebrate. */
  winner: Color | null;
  thinking: boolean;
  onSquare: (square: number) => void;
  /**
   * Whose end is whose, painted on the frame above and below the grid rather
   * than floating over the page. Names on the frame read as part of the board;
   * names on the background read as an interface.
   */
  railTop: React.ReactNode;
  railBottom: React.ReactNode;
}

export function ChessBoard({
  board,
  theme,
  selected,
  targets,
  pickable,
  lastMove,
  ply,
  showEffects,
  round,
  inDanger,
  checkSquare,
  turn,
  winner,
  thinking,
  onSquare,
  railTop,
  railBottom,
}: ChessBoardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [squareSize, setSquareSize] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      if (width > 0) setSquareSize(width / board.width);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [board.width]);

  const ranks = Array.from({ length: board.height }, (_, i) => board.height - 1 - i);
  const files = Array.from({ length: board.width }, (_, i) => i);

  // Top-left corner of a square, in pixels.
  const position = (square: number) => ({
    x: (square % board.width) * squareSize,
    y: (board.height - 1 - Math.floor(square / board.width)) * squareSize,
  });

  const captureEffect = captureEffectFor(theme);
  const burst = burstFor(captureEffect);

  // What the whole board is looking at. Something in your hand beats something
  // that has already happened.
  const attention: Attention = {
    focus: selected ?? lastMove?.to ?? null,
    lastMove: showEffects ? lastMove : null,
    inDanger,
    checkSquare,
    winner,
    thinking,
    turn,
  };

  return (
    <div
      className="w-full touch-manipulation select-none p-1.5 sm:p-2"
      style={{
        background: theme.world.frame,
        maxWidth: boardMaxWidth(board),
        // Square corners. Everything else here is on a pixel grid, and a
        // rounded rectangle is the one shape a pixel grid cannot make.
        boxShadow: "0 0 0 4px rgba(0,0,0,0.16), 0 10px 0 -2px rgba(0,0,0,0.14)",
      }}
    >
      <div className="px-0.5 pb-1 pt-0.5">{railTop}</div>

      <div
        ref={ref}
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: `${board.width} / ${board.height}` }}
      >
        {/* Squares: the board itself, plus every highlight and hint. */}
        <div
          className="grid h-full w-full"
          style={{ gridTemplateColumns: `repeat(${board.width}, minmax(0, 1fr))` }}
        >
          {ranks.map((rank) =>
            files.map((file) => {
              const square = rank * board.width + file;
              const isLight = (file + rank) % 2 === 1;
              const target = targets.get(square);
              const isSelected = selected === square;
              const canPick = pickable.has(square);
              const occupied = board.squares[square] !== null;
              const inLastMove =
                lastMove !== null && (lastMove.from === square || lastMove.to === square);
              const isCheck = checkSquare === square;
              const isActive = canPick || target !== undefined;

              return (
                <button
                  key={square}
                  type="button"
                  aria-label={`${String.fromCharCode(97 + file)}${rank + 1}`}
                  disabled={!isActive && !isSelected}
                  onClick={() => onSquare(square)}
                  className="relative flex aspect-square touch-manipulation items-center justify-center border-0 p-0 disabled:cursor-default"
                  style={{
                    background: isLight ? theme.world.lightSquare : theme.world.darkSquare,
                    cursor: isActive ? "pointer" : "default",
                  }}
                >
                  {inLastMove && (
                    <span className="pointer-events-none absolute inset-0 bg-amber-300/30" />
                  )}

                  {isSelected && (
                    <span className="pointer-events-none absolute inset-0 bg-amber-300/55 ring-[3px] ring-inset ring-amber-400" />
                  )}

                  {inDanger.has(square) && (
                    <span
                      className="pointer-events-none absolute inset-[8%]"
                      style={{ boxShadow: "inset 0 0 0 3px rgba(220,38,38,0.8)" }}
                    />
                  )}

                  {isCheck && (
                    <span
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(239,68,68,0.85) 10%, rgba(239,68,68,0) 72%)",
                      }}
                    />
                  )}

                  {/* Where you may go: a fat block, not a dot, because
                      everything else in this game is made of blocks. Bright
                      core inside a dark edge is the one combination that
                      survives on both square colours in every world — and it
                      has to be BRIGHT, because it is the only thing on screen
                      a beginner is being asked to look for. */}
                  {target && !occupied && (
                    <span
                      className="chess-tile-hint pointer-events-none absolute"
                      style={{
                        width: "34%",
                        height: "34%",
                        background: "#FFE066",
                        boxShadow: "0 0 0 4px rgba(24,26,36,0.75)",
                      }}
                    />
                  )}

                  {/* Something to take: a frame round the whole square, so it
                      reads over the character standing in it. */}
                  {target && occupied && (
                    <span
                      className="chess-tile-hint pointer-events-none absolute inset-[4%]"
                      style={{ boxShadow: "inset 0 0 0 5px rgba(220,38,38,0.9)" }}
                    />
                  )}
                </button>
              );
            }),
          )}
        </div>

        {/* Pieces: one layer above the squares, positioned rather than nested,
            so a piece keeps its identity across a move and CSS can animate it. */}
        {squareSize > 0 && (
          <div className="pointer-events-none absolute inset-0">
            {/* Whatever was just taken, on its way out. */}
            {showEffects && lastMove?.capture && (
              <CaptureFlourish
                key={`capture-${ply}`}
                theme={theme}
                move={lastMove}
                size={squareSize}
                position={position(lastMove.capture.square)}
                burst={burst}
                effect={captureEffect}
              />
            )}

            {board.squares.map((piece, square) => {
              if (!piece) return null;

              const { x, y } = position(square);
              const style = travelStyleFor(theme, piece.type);
              const justMoved = showEffects && lastMove?.to === square;
              const idle = idleRhythm(piece.id);
              const held = selected === square;

              return (
                <div
                  // The round is in the key so restarting remounts every piece
                  // and they take their places again.
                  key={`${round}:${piece.id}`}
                  className="chess-piece absolute left-0 top-0"
                  style={{
                    width: squareSize,
                    height: squareSize,
                    transform: `translate3d(${x}px, ${y}px, 0)`,
                    transitionProperty: "transform",
                    transitionDuration: `${travelDuration(style)}ms`,
                    transitionTimingFunction: travelEasing(style),
                    zIndex: held ? 3 : justMoved ? 2 : 1,
                  }}
                >
                  <div
                    // Re-keyed on each move so the flourish replays; pieces that
                    // stayed put keep the same key and stay still.
                    key={justMoved ? `travel-${ply}` : "resting"}
                    className={`flex h-full w-full items-end justify-center ${
                      justMoved ? `chess-travel-${style}` : ply === 0 ? "chess-arrive" : ""
                    }`}
                    style={
                      justMoved
                        ? { animationDuration: `${travelDuration(style)}ms` }
                        : ply === 0
                          ? // Staggered across the board so they arrive as a wave.
                            { animationDelay: `${(square % board.width) * 45 + Math.floor(square / board.width) * 30}ms` }
                          : undefined
                    }
                  >
                    {/* The bob lives on its own element because the layers above
                        it are already using transform for the journey and the
                        flourish, and one element can only have one. */}
                    <div
                      className={`flex h-full w-full items-end justify-center ${held ? "chess-held" : "chess-idle"}`}
                      style={held ? undefined : { animationDuration: idle.duration, animationDelay: idle.delay }}
                    >
                      <PieceToken
                        piece={piece}
                        theme={theme}
                        size={squareSize}
                        face={faceFor(board, square, piece.color, attention)}
                        gaze={gazeFor(board, square, attention)}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-0.5 pb-0.5 pt-1">{railBottom}</div>
    </div>
  );
}

function CaptureFlourish({
  theme,
  move,
  size,
  position,
  burst,
  effect,
}: {
  theme: PieceTheme;
  move: Move;
  size: number;
  position: { x: number; y: number };
  burst: string[];
  effect: string;
}) {
  if (!move.capture) return null;

  // Held back until the attacker has almost arrived, so it reads as a hit.
  const delay = 140;

  return (
    <div
      className="absolute left-0 top-0"
      style={{
        width: size,
        height: size,
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        zIndex: 4,
      }}
    >
      <div
        className={`chess-victim-${effect} flex h-full w-full items-end justify-center`}
        style={{ animationDelay: `${delay}ms` }}
      >
        {/* Going out with a shocked face is worth the two lines it costs. */}
        <PieceToken piece={move.capture.piece} theme={theme} size={size} face="scared" />
      </div>

      {burst.map((emoji, index) => {
        const { dx, dy } = burstVector(index, burst.length);
        return (
          <span
            key={index}
            className="chess-burst absolute left-1/2 top-1/2"
            style={
              {
                fontSize: size * 0.3,
                lineHeight: 1,
                animationDelay: `${delay + index * 40}ms`,
                "--chess-dx": `${dx * size * 0.62}px`,
                "--chess-dy": `${dy * size * 0.62}px`,
              } as React.CSSProperties
            }
          >
            {emoji}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Widest the board may get. Capped by the viewport's height as well as its
 * width, so the whole game lands on one screen without scrolling. The height
 * cap is what does the work on a short phone; on anything roomier the width or
 * the 34rem ceiling wins first.
 */
export function boardMaxWidth(board: { width: number; height: number }): string {
  return `min(94vw, 34rem, calc(63vh * ${board.width} / ${board.height}))`;
}
