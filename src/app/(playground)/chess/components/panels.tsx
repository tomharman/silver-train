"use client";

import { PixelButton, PixelSheet } from "./pixel-ui";
import { PieceToken } from "./piece-token";
import type { Level, PieceTheme, PieceType } from "../types";

const MOVEMENT: Record<PieceType, string> = {
  pawn: "Walks forward one square. Takes by stepping diagonally. Never goes back.",
  knight: "Jumps in an L — two squares, then one to the side. Hops over everyone.",
  bishop: "Slides along the diagonals, always on its own colour.",
  rook: "Rolls straight up, down, left or right.",
  queen: "Goes any direction at all, as far as she likes.",
  king: "One square at a time, in any direction.",
};

const PIECE_ORDER: PieceType[] = ["pawn", "knight", "bishop", "rook", "queen", "king"];

/**
 * Who is in this game and how they move.
 *
 * Only the pieces actually on this board are listed. A five year old on Pawn
 * Race does not need to be told about the queen, and a list of six when the
 * answer is one is how you lose someone.
 */
export function HowToPanel({
  level,
  theme,
  onClose,
}: {
  level: Level;
  theme: PieceTheme;
  onClose: () => void;
}) {
  const present = new Set<PieceType>();
  for (const row of level.setup) {
    for (const char of row) {
      const lower = char.toLowerCase();
      if (lower === "p") present.add("pawn");
      if (lower === "n") present.add("knight");
      if (lower === "b") present.add("bishop");
      if (lower === "r") present.add("rook");
      if (lower === "q") present.add("queen");
      if (lower === "k") present.add("king");
    }
  }

  return (
    <PixelSheet title={level.name} onClose={onClose}>
      <ul className="mb-5 space-y-2">
        {level.howTo.map((line) => (
          <li key={line} className="flex gap-2 text-xs leading-[1.85]">
            <span style={{ color: theme.world.guide }}>◆</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <h3 className="font-pixel mb-2 text-[9px] uppercase tracking-[0.22em] opacity-50">
        Who&apos;s playing
      </h3>
      <div className="mb-5 space-y-1.5">
        {PIECE_ORDER.filter((type) => present.has(type)).map((type) => (
          <div
            key={type}
            className="flex items-center gap-3 p-2"
            style={{ background: theme.world.lightSquare }}
          >
            <span className="flex size-11 shrink-0 items-end justify-center">
              <PieceToken
                piece={{ id: type.length, type, color: "white", moved: false }}
                theme={theme}
                size={44}
                face="happy"
              />
            </span>
            <div className="min-w-0">
              <div className="font-pixel text-[10px] uppercase tracking-[0.18em] text-neutral-900">
                {theme.pieces[type].name}
              </div>
              <div className="text-[10px] leading-[1.8] text-neutral-700">{MOVEMENT[type]}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 border-4 border-dashed border-black/12 p-3">
        <div className="font-pixel mb-1 text-[9px] uppercase tracking-[0.22em] opacity-50">
          For the grown-up
        </div>
        <p className="text-[10px] leading-[1.9] opacity-70">{level.grownUpNote}</p>
      </div>

      <PixelButton tone="bright" size="lg" className="w-full" onClick={onClose}>
        Let&apos;s play!
      </PixelButton>
    </PixelSheet>
  );
}
