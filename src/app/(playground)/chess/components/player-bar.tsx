"use client";

import { PieceToken } from "./piece-token";
import type { Color, Piece, PieceTheme } from "../types";

interface PlayerBarProps {
  color: Color;
  name: string;
  theme: PieceTheme;
  isTurn: boolean;
  isThinking: boolean;
  /** Pieces this player has taken from the other side. */
  loot: Piece[];
  align: "left" | "right";
}

export function PlayerBar({
  color,
  name,
  theme,
  isTurn,
  isThinking,
  loot,
  align,
}: PlayerBarProps) {
  const label = color === "white" ? theme.whiteLabel : theme.blackLabel;

  return (
    <div
      className={`flex flex-1 items-center gap-3 rounded-xl border-2 px-3 py-2 transition-colors ${
        isTurn ? "border-amber-400 bg-amber-50 dark:bg-amber-950/40" : "border-transparent bg-muted"
      } ${align === "right" ? "flex-row-reverse text-right" : ""}`}
    >
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-full"
        style={{
          background: color === "white" ? "#FFFCF2" : "#2A2E3A",
          boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.15)",
        }}
      >
        <span
          style={{
            fontSize: 20,
            lineHeight: 1,
            color: color === "white" ? "#22252E" : "#F7F3E8",
          }}
        >
          {theme.pieces.king.glyph}
        </span>
      </span>

      <div className={`min-w-0 flex-1 ${align === "right" ? "items-end" : ""}`}>
        <div className="truncate text-sm font-semibold">{name}</div>
        <div className="truncate text-xs text-muted-foreground">
          {isThinking ? "thinking…" : isTurn ? "your go!" : label}
        </div>
      </div>

      {loot.length > 0 && (
        <div className={`flex max-w-[40%] flex-wrap gap-0.5 ${align === "right" ? "justify-start" : "justify-end"}`}>
          {loot.map((piece, index) => (
            <PieceToken key={index} piece={piece} theme={theme} size={18} />
          ))}
        </div>
      )}
    </div>
  );
}
