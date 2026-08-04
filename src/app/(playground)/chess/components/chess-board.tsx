"use client";

import { useEffect, useRef, useState } from "react";

import { PieceToken } from "./piece-token";
import type { Board, Move, PieceTheme } from "../types";

const LIGHT_SQUARE = "#F6E7C6";
const DARK_SQUARE = "#6FA8A0";

interface ChessBoardProps {
  board: Board;
  theme: PieceTheme;
  selected: number | null;
  /** Legal moves from the selected square, keyed by destination. */
  targets: Map<number, Move>;
  /** Squares holding a piece that the player is allowed to pick up. */
  pickable: Set<number>;
  lastMove: Move | null;
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
  checkSquare,
  onSquare,
}: ChessBoardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [squareSize, setSquareSize] = useState(64);

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

  return (
    <div
      className="w-full rounded-2xl p-2 shadow-lg sm:p-3"
      style={{ background: "#4A3B2E", maxWidth: boardMaxWidth(board) }}
    >
      <div
        ref={ref}
        className="grid w-full overflow-hidden rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${board.width}, minmax(0, 1fr))`,
          aspectRatio: `${board.width} / ${board.height}`,
        }}
      >
        {ranks.map((rank) =>
          files.map((file) => {
            const square = rank * board.width + file;
            const piece = board.squares[square];
            const isLight = (file + rank) % 2 === 1;
            const target = targets.get(square);
            const isSelected = selected === square;
            const canPick = pickable.has(square);
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
                className="relative flex aspect-square items-center justify-center border-0 p-0 transition-transform disabled:cursor-default"
                style={{
                  background: isLight ? LIGHT_SQUARE : DARK_SQUARE,
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

                {piece && (
                  <span
                    className="pointer-events-none relative flex items-center justify-center chess-pop"
                    key={`${piece.type}-${piece.color}`}
                  >
                    <PieceToken piece={piece} theme={theme} size={squareSize} />
                  </span>
                )}

                {/* The move hints: a fat dot on an empty square, a ring around something to take. */}
                {target && !piece && (
                  <span
                    className="pointer-events-none absolute rounded-full bg-slate-900/35 chess-throb"
                    style={{ width: squareSize * 0.34, height: squareSize * 0.34 }}
                  />
                )}

                {target && piece && (
                  <span
                    className="pointer-events-none absolute inset-[6%] rounded-full chess-throb"
                    style={{ boxShadow: "inset 0 0 0 6px rgba(220,38,38,0.85)" }}
                  />
                )}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}

/**
 * Widest the board may get. Capped by the viewport's height as well as its
 * width, so a tall board like Pawn Race still lands fully on screen underneath
 * the level picker instead of pushing the buttons below the fold.
 */
export function boardMaxWidth(board: { width: number; height: number }): string {
  return `min(92vw, 34rem, calc(52vh * ${board.width} / ${board.height}))`;
}
