"use client";

import { Button } from "@/components/ui/button";

import { Pip } from "./pip";
import { getSticker } from "../data/stickers";
import type { Color, Outcome, PieceTheme } from "../types";

/**
 * Winning has to be a moment. This is the loudest thing in the app on purpose:
 * confetti, Pip cheering, and any stickers earned flying in one at a time.
 */

const CONFETTI = ["🎉", "⭐", "✨", "🎊", "💛", "🌟", "🎈", "💫"];

/** Fixed spread — deterministic so the server and the browser agree. */
const PIECES = Array.from({ length: 26 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i % 9) * 0.16,
  duration: 2.4 + ((i * 7) % 12) / 10,
  drift: ((i % 5) - 2) * 26,
  emoji: CONFETTI[i % CONFETTI.length],
  size: 16 + ((i * 5) % 14),
}));

export function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {PIECES.map((piece, index) => (
        <span
          key={index}
          className="chess-confetti absolute top-0"
          style={
            {
              left: `${piece.left}%`,
              fontSize: piece.size,
              animationDelay: `${piece.delay}s`,
              animationDuration: `${piece.duration}s`,
              "--chess-drift": `${piece.drift}px`,
            } as React.CSSProperties
          }
        >
          {piece.emoji}
        </span>
      ))}
    </div>
  );
}

export function WinCelebration({
  outcome,
  theme,
  nameOf,
  humanWon,
  earnedStickers,
  hasNextLevel,
  onPlayAgain,
  onNextLevel,
  onMap,
}: {
  outcome: Outcome;
  theme: PieceTheme;
  nameOf: (color: Color) => string;
  /** Null in two-player mode, where "somebody won" is the whole story. */
  humanWon: boolean | null;
  earnedStickers: string[];
  hasNextLevel: boolean;
  onPlayAgain: () => void;
  onNextLevel: () => void;
  onMap: () => void;
}) {
  const isWin = outcome.kind === "win";
  const cheer = isWin && humanWon !== false;

  return (
    <>
      {cheer && <Confetti />}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="chess-rise w-full max-w-sm rounded-2xl bg-card p-5 text-center shadow-2xl">
          <div className="mb-2 flex justify-center">
            <span className="chess-pip-cheer">
              <Pip
                mood={cheer ? "cheer" : "happy"}
                colour={theme.world.guide}
                size={76}
              />
            </span>
          </div>

          <h2 className="text-2xl font-bold leading-tight">
            {isWin ? `${nameOf(outcome.winner)} wins!` : "It's a draw!"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{outcome.reason}</p>

          {earnedStickers.length > 0 && (
            <div className="mt-4 rounded-xl border-2 border-dashed p-3">
              <div className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {earnedStickers.length === 1 ? "New sticker!" : "New stickers!"}
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {earnedStickers.map((id, index) => {
                  const sticker = getSticker(id);
                  if (!sticker) return null;
                  return (
                    <div
                      key={id}
                      className="chess-sticker-in flex w-20 flex-col items-center gap-0.5"
                      style={{ animationDelay: `${0.15 + index * 0.22}s` }}
                    >
                      <span className="text-4xl leading-none">{sticker.emoji}</span>
                      <span className="text-[11px] font-bold leading-tight">{sticker.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-col gap-2">
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
            <Button size="lg" variant="ghost" className="w-full" onClick={onMap}>
              Back to the map
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
