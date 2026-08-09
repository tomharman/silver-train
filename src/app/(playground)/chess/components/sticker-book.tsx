"use client";

import { PixelSheet } from "./pixel-ui";
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
    <PixelSheet title={`Stickers ${earned}/${STICKERS.length}`} onClose={onClose}>
      <p className="font-pixel mb-4 text-[10px] leading-relaxed opacity-55">
        Every sticker is something you actually did on the board.
      </p>

      <div className="grid grid-cols-3 gap-2">
        {STICKERS.map((sticker) => {
          const has = Boolean(stickers[sticker.id]);
          return (
            <div
              key={sticker.id}
              className="flex flex-col items-center gap-1 p-2 text-center"
              style={{
                background: has ? "#FFFDF5" : "rgba(0,0,0,0.06)",
                boxShadow: has
                  ? `0 0 0 3px ${theme.world.guide}`
                  : "0 0 0 3px rgba(0,0,0,0.12)",
              }}
            >
              <span
                className={`text-3xl leading-none ${has ? "" : "opacity-25 grayscale"}`}
                aria-hidden="true"
              >
                {has ? sticker.emoji : "❓"}
              </span>
              <span
                className="font-pixel text-[8px] uppercase leading-relaxed tracking-widest"
                style={{ color: has ? "#1B1D26" : undefined, opacity: has ? 1 : 0.45 }}
              >
                {has ? sticker.name : "???"}
              </span>
              {has && (
                <span className="text-[10px] leading-tight text-neutral-500">{sticker.how}</span>
              )}
            </div>
          );
        })}
      </div>
    </PixelSheet>
  );
}
