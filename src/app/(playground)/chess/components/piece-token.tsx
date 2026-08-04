"use client";

import { PieceArt } from "./piece-art";
import type { Piece, PieceTheme } from "../types";

interface PieceTokenProps {
  piece: Piece;
  theme: PieceTheme;
  /** Square size in pixels — everything scales off this. */
  size: number;
  className?: string;
}

export function PieceToken({ piece, theme, size, className = "" }: PieceTokenProps) {
  const skin = theme.pieces[piece.type];
  const isWhite = piece.color === "white";

  if (skin.imageSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- themed art is dropped in by hand at unknown sizes
      <img
        src={skin.imageSrc}
        alt={skin.name}
        draggable={false}
        className={`select-none object-contain ${className}`}
        style={{ width: size * 0.86, height: size * 0.86 }}
      />
    );
  }

  if (theme.style === "art") {
    return (
      <span className={`flex items-center justify-center ${className}`}>
        <PieceArt type={piece.type} light={isWhite} size={size * 0.84} />
      </span>
    );
  }

  // Emoji carry their own colours, so the two sides are told apart by the disc
  // they sit on rather than by the character itself.
  return (
    <span
      className={`flex select-none items-center justify-center rounded-full ${className}`}
      style={{
        width: size * 0.78,
        height: size * 0.78,
        fontSize: size * 0.44,
        lineHeight: 1,
        background: isWhite ? "#FFFCF2" : "#2A2E3A",
        boxShadow: isWhite
          ? "0 2px 4px rgba(0,0,0,0.28), inset 0 0 0 2px rgba(0,0,0,0.12)"
          : "0 2px 4px rgba(0,0,0,0.38), inset 0 0 0 2px rgba(255,255,255,0.22)",
      }}
    >
      {skin.glyph}
    </span>
  );
}
