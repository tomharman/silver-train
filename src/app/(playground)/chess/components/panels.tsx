"use client";

import { Button } from "@/components/ui/button";

import { PieceToken } from "./piece-token";
import type { Color, Level, Outcome, PieceTheme, PieceType } from "../types";

const MOVEMENT: Record<PieceType, string> = {
  pawn: "Walks forward one square. Takes by stepping diagonally. Never goes back.",
  knight: "Jumps in an L — two squares, then one to the side. Hops over everyone.",
  bishop: "Slides along the diagonals, always on its own colour.",
  rook: "Rolls straight up, down, left or right.",
  queen: "Goes any direction at all, as far as she likes.",
  king: "One square at a time, in any direction.",
};

const PIECE_ORDER: PieceType[] = ["pawn", "knight", "bishop", "rook", "queen", "king"];

function Backdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

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
    <Backdrop onClose={onClose}>
      <div className="mb-3 flex items-center gap-3">
        <span className="text-3xl">{level.emoji}</span>
        <div>
          <h2 className="text-lg font-bold leading-tight">{level.name}</h2>
          <p className="text-sm text-muted-foreground">{level.tagline}</p>
        </div>
      </div>

      <ul className="mb-5 space-y-2">
        {level.howTo.map((line) => (
          <li key={line} className="flex gap-2 text-[15px] leading-snug">
            <span className="text-amber-500">◆</span>
            <span>{line}</span>
          </li>
        ))}
      </ul>

      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Who&apos;s playing
      </h3>
      <div className="mb-5 space-y-2">
        {PIECE_ORDER.filter((type) => present.has(type)).map((type) => (
          <div key={type} className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2">
            <span className="flex size-8 shrink-0 items-center justify-center">
              {/* Dark pieces: the light ones vanish against this panel. */}
              <PieceToken
                piece={{ id: -1, type, color: "black", moved: false }}
                theme={theme}
                size={32}
              />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold">{theme.pieces[type].name}</div>
              <div className="text-xs leading-snug text-muted-foreground">{MOVEMENT[type]}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-4 rounded-lg border border-dashed p-3">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          For the grown-up
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{level.grownUpNote}</p>
      </div>

      <Button className="w-full" size="lg" onClick={onClose}>
        Let&apos;s play!
      </Button>
    </Backdrop>
  );
}

export function WinOverlay({
  outcome,
  nameOf,
  hasNextLevel,
  onPlayAgain,
  onNextLevel,
  onDismiss,
}: {
  outcome: Outcome;
  nameOf: (color: Color) => string;
  hasNextLevel: boolean;
  onPlayAgain: () => void;
  onNextLevel: () => void;
  /** Tapping outside just gets the panel out of the way so you can study the final board. */
  onDismiss: () => void;
}) {
  const isWin = outcome.kind === "win";

  return (
    <Backdrop onClose={onDismiss}>
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="text-6xl chess-pop">{isWin ? "🎉" : "🤝"}</div>
        <h2 className="text-2xl font-bold leading-tight">
          {isWin ? `${nameOf(outcome.winner)} wins!` : "It's a draw!"}
        </h2>
        <p className="text-sm text-muted-foreground">{outcome.reason}</p>

        <div className="mt-3 flex w-full flex-col gap-2">
          {hasNextLevel && (
            <Button size="lg" className="w-full" onClick={onNextLevel}>
              Next game →
            </Button>
          )}
          <Button
            size="lg"
            variant={hasNextLevel ? "outline" : "default"}
            className="w-full"
            onClick={onPlayAgain}
          >
            Play again
          </Button>
        </div>
      </div>
    </Backdrop>
  );
}
