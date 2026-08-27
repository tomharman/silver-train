"use client";

import { Pip } from "./pip";
import { PixelButton } from "./pixel-ui";
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
  onDismiss,
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
  /** Gets the panel out of the way so you can look at the finished board. */
  onDismiss: () => void;
}) {
  const isWin = outcome.kind === "win";
  const cheer = isWin && humanWon !== false;

  return (
    <>
      {cheer && <Confetti />}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div
          className="chess-rise w-full max-w-sm bg-neutral-100 p-5 text-center text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100"
          style={{ boxShadow: "0 0 0 4px rgba(0,0,0,0.3)" }}
        >
          <div className="mb-2 flex justify-center">
            <span className="chess-pip-cheer">
              <Pip
                mood={cheer ? "cheer" : "happy"}
                colour={theme.world.guide}
                size={76}
              />
            </span>
          </div>

          <h2 className="font-pixel text-base uppercase leading-relaxed tracking-[0.14em]">
            {isWin ? `${nameOf(outcome.winner)} wins!` : "It's a draw!"}
          </h2>
          <p className="mt-2 text-[10px] leading-[1.8] opacity-60">{outcome.reason}</p>

          {earnedStickers.length > 0 && (
            <div className="mt-4 border-4 border-dashed border-black/15 p-3">
              <div className="font-pixel mb-2 text-[9px] uppercase tracking-[0.22em] opacity-50">
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
                      <span className="text-[8px] uppercase leading-[1.6] tracking-widest">{sticker.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2">
            {hasNextLevel && (
              <PixelButton size="lg" tone="bright" className="w-full" onClick={onNextLevel}>
                Next game →
              </PixelButton>
            )}
            <PixelButton size="lg" className="w-full" onClick={onPlayAgain}>
              Play again
            </PixelButton>
            <PixelButton size="lg" tone="quiet" className="w-full" onClick={onDismiss}>
              Look at the board
            </PixelButton>
          </div>
        </div>
      </div>
    </>
  );
}
