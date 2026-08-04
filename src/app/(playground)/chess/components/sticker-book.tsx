"use client";

import { Button } from "@/components/ui/button";

import { STICKERS } from "../data/stickers";
import type { PieceTheme } from "../types";

export function StickerBook({
  stickers,
  theme,
  onClose,
}: {
  stickers: Record<string, boolean>;
  theme: PieceTheme;
  onClose: () => void;
}) {
  const earned = STICKERS.filter((sticker) => stickers[sticker.id]).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-card p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-1 flex items-baseline justify-between">
          <h2 className="text-lg font-bold">Sticker Book</h2>
          <span className="text-sm font-semibold text-muted-foreground">
            {earned} of {STICKERS.length}
          </span>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Every sticker is something you actually did on the board.
        </p>

        <div className="mb-5 grid grid-cols-3 gap-2.5">
          {STICKERS.map((sticker) => {
            const has = Boolean(stickers[sticker.id]);
            return (
              <div
                key={sticker.id}
                className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2 text-center ${
                  has ? "bg-card" : "border-dashed bg-muted"
                }`}
                style={has ? { borderColor: theme.world.guide } : undefined}
              >
                <span
                  className={`text-3xl leading-none ${has ? "" : "opacity-25 grayscale"}`}
                  aria-hidden="true"
                >
                  {has ? sticker.emoji : "❓"}
                </span>
                <span className="text-[11px] font-bold leading-tight">
                  {has ? sticker.name : "???"}
                </span>
                {has && (
                  <span className="text-[10px] leading-tight text-muted-foreground">
                    {sticker.how}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <Button className="w-full" size="lg" onClick={onClose}>
          Back to the map
        </Button>
      </div>
    </div>
  );
}
