"use client";

import { PixelPiece } from "./pixel-piece";
import type { Face } from "../data/pixel-pieces";
import type { Piece, PieceTheme } from "../types";

interface PieceTokenProps {
  piece: Piece;
  theme: PieceTheme;
  /** Square size in pixels — everything scales off this. */
  size: number;
  face?: Face;
  /** Which way the eyes are pointing, roughly -1 to 1 on each axis. */
  gaze?: { x: number; y: number };
  className?: string;
}

const STRAIGHT_AHEAD = { x: 0, y: 0 };

export function PieceToken({
  piece,
  theme,
  size,
  face = "calm",
  gaze = STRAIGHT_AHEAD,
  className = "",
}: PieceTokenProps) {
  const palette = theme.world.teams[piece.color];

  return (
    <span className={`flex items-end justify-center pb-[2%] ${className}`}>
      <PixelPiece
        type={piece.type}
        palette={palette}
        face={face}
        gaze={gaze}
        seed={piece.id}
        // A shade under the square, so a full board still reads as a grid of
        // separate things rather than one continuous wall of characters.
        size={size * 0.92}
      />
    </span>
  );
}
