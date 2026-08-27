"use client";

import { PixelPiece } from "./pixel-piece";
import type { Color, Piece, PieceTheme } from "../types";

/**
 * Whose end of the board this is.
 *
 * One line of pixel type above and below the board, in that player's own team
 * colour, with the pieces they have taken lined up beside it. The name is lit
 * when it is your go and dim when it isn't, and a little block blinks on the
 * end like a cursor waiting for input — which is exactly what it is.
 *
 * This replaced two cards floating above the board. The cards said the same
 * thing and took up a fifth of a phone screen to say it.
 */

interface PlayerBarProps {
  color: Color;
  name: string;
  theme: PieceTheme;
  isTurn: boolean;
  isThinking: boolean;
  /** Their pieces you have taken. */
  loot: Piece[];
  align: "left" | "right";
}

export function PlayerBar({ color, name, theme, isTurn, isThinking, loot, align }: PlayerBarProps) {
  const palette = theme.world.teams[color];
  const ink = palette.ramp[Math.floor(palette.ramp.length / 2)];

  return (
    <div
      className={`flex min-w-0 flex-1 items-center gap-1.5 ${
        align === "right" ? "flex-row-reverse" : ""
      }`}
    >
      <span
        className="font-pixel truncate text-[11px] uppercase leading-none tracking-[0.2em] sm:text-xs"
        style={{ color: ink, opacity: isTurn ? 1 : 0.42 }}
      >
        {name}
      </span>

      {isTurn && (
        <span
          className="chess-rail-blink inline-block shrink-0"
          style={{ width: 6, height: 12, background: ink }}
          aria-hidden="true"
        />
      )}

      {isThinking && (
        <span className="font-pixel shrink-0 text-[10px] uppercase tracking-widest opacity-60">
          …
        </span>
      )}

      {/* The trophy shelf. Deliberately tiny: it is a score, not a second board. */}
      <span
        className={`flex min-w-0 flex-1 items-end gap-px overflow-hidden ${
          align === "right" ? "flex-row-reverse" : ""
        }`}
        aria-label={`${loot.length} taken`}
      >
        {loot.slice(-10).map((piece) => (
          <PixelPiece
            key={piece.id}
            type={piece.type}
            palette={theme.world.teams[piece.color]}
            face="sleepy"
            gaze={{ x: 0, y: 0 }}
            seed={piece.id}
            size={13}
          />
        ))}
      </span>
    </div>
  );
}
