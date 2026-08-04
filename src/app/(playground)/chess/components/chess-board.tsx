"use client";

import { useEffect, useRef, useState } from "react";

import { PieceToken } from "./piece-token";
import type { Board, Move, PieceTheme } from "../types";
import {
  burstFor,
  burstVector,
  captureEffectFor,
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
  checkSquare: number | null;
  onSquare: (square: number) => void;
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
  checkSquare,
  onSquare,
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

  return (
    <div
      className="w-full touch-manipulation select-none rounded-2xl p-2 shadow-lg sm:p-3"
      style={{ background: theme.world.frame, maxWidth: boardMaxWidth(board) }}
    >
      <div
        ref={ref}
        className="relative w-full overflow-hidden rounded-lg"
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
                    <span className="pointer-events-none absolute inset-0 bg-amber-300/35" />
                  )}

                  {isSelected && (
                    <span className="pointer-events-none absolute inset-0 bg-amber-300/60 ring-4 ring-inset ring-amber-400" />
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

                  {/* Move hints: a fat dot on an empty square, a ring on something to take. */}
                  {/* Dark core, light halo: the one combination that stays
                      visible on both square colours in every world. */}
                  {target && !occupied && (
                    <span
                      className="chess-throb pointer-events-none absolute rounded-full"
                      style={{
                        width: "32%",
                        height: "32%",
                        background: "rgba(20,22,30,0.45)",
                        boxShadow: "0 0 0 3px rgba(255,255,255,0.55)",
                      }}
                    />
                  )}

                  {target && occupied && (
                    <span
                      className="chess-throb pointer-events-none absolute inset-[6%] rounded-full"
                      style={{ boxShadow: "inset 0 0 0 6px rgba(220,38,38,0.85)" }}
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
                    zIndex: justMoved ? 2 : 1,
                  }}
                >
                  <div
                    // Re-keyed on each move so the flourish replays; pieces that
                    // stayed put keep the same key and stay still.
                    key={justMoved ? `travel-${ply}` : "resting"}
                    className={`flex h-full w-full items-center justify-center ${
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
                    <PieceToken piece={piece} theme={theme} size={squareSize} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
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
        zIndex: 3,
      }}
    >
      <div
        className={`chess-victim-${effect} flex h-full w-full items-center justify-center`}
        style={{ animationDelay: `${delay}ms` }}
      >
        <PieceToken piece={move.capture.piece} theme={theme} size={size} />
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
 * width, so the whole game — board, whose-turn bar and the Oops! button — lands
 * on one screen without scrolling. The height cap is what does the work on a
 * short phone; on anything roomier the width or the 34rem ceiling wins first.
 */
export function boardMaxWidth(board: { width: number; height: number }): string {
  return `min(96vw, 34rem, calc(44vh * ${board.width} / ${board.height}))`;
}
