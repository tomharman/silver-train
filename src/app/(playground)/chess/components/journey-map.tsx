"use client";

import { Sticker as StickerIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { PipSays } from "./pip";
import { LEVELS } from "../data/levels";
import { THEMES } from "../data/themes";
import { STICKERS } from "../data/stickers";
import type { PieceTheme } from "../types";

/**
 * The map.
 *
 * A row of level cards is a control; a path with places on it is somewhere you
 * are. The six games sit as stops along a winding trail, drawn in the same
 * 0–100 space as the path behind them so the whole thing stretches to whatever
 * screen it lands on. Nothing is ever locked — a five year old meeting a
 * padlock just wants the padlock — but the trail makes it obvious where he got
 * to and what comes next.
 */

/** Percentage positions down the trail. Hand-placed to feel like a walk. */
const STOPS: { x: number; y: number }[] = [
  { x: 24, y: 7 },
  { x: 70, y: 21 },
  { x: 28, y: 37 },
  { x: 73, y: 53 },
  { x: 27, y: 70 },
  { x: 70, y: 88 },
];

const TRAIL =
  "M24 7 C 44 9, 58 14, 70 21 S 40 30, 28 37 S 60 45, 73 53 S 38 62, 27 70 S 60 80, 70 88";

/** Fixed scatter, so the scenery doesn't leap about between renders. */
const SCENERY: { x: number; y: number; size: number }[] = [
  { x: 78, y: 5, size: 22 },
  { x: 8, y: 20, size: 26 },
  { x: 50, y: 30, size: 18 },
  { x: 88, y: 38, size: 20 },
  { x: 10, y: 52, size: 24 },
  { x: 48, y: 66, size: 19 },
  { x: 88, y: 74, size: 23 },
  { x: 14, y: 90, size: 20 },
];

interface JourneyMapProps {
  theme: PieceTheme;
  won: Record<string, boolean>;
  stickers: Record<string, boolean>;
  playerName: string;
  onPickLevel: (id: string) => void;
  onPickTheme: (id: string) => void;
  onOpenStickers: () => void;
}

export function JourneyMap({
  theme,
  won,
  stickers,
  playerName,
  onPickLevel,
  onPickTheme,
  onOpenStickers,
}: JourneyMapProps) {
  const world = theme.world;
  const earned = STICKERS.filter((sticker) => stickers[sticker.id]).length;

  // Where he's up to: the first game he hasn't won yet.
  const nextIndex = LEVELS.findIndex((level) => !won[level.id]);
  const allDone = nextIndex === -1;

  // Being called "Player 1" by your friend is a bit sad, so if nobody has set a
  // name yet, Pip asks for one. It's the single thing that makes this feel like
  // it was made for him.
  const anonymous = !playerName || playerName === "Player 1";

  const greeting = anonymous
    ? "Hello! I'm Pip. Tap Setup up there and tell me your name!"
    : allDone
      ? `You've finished every game, ${playerName}! Play any of them again?`
      : `Welcome to ${world.name}, ${playerName}! Tap a stop to play.`;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <PipSays
        text={greeting}
        mood="cheer"
        colour={world.guide}
        speechKey={`${theme.id}-${nextIndex}`}
      />

      {/* `contain: inline-size` stops this row's width demanding space from the
          page. Without it the un-shrinkable chips set a min-content width that
          propagates all the way out to <main>, which cannot shrink inside the
          sidebar's flex row, and the whole page scrolls sideways on a tablet. */}
      <div className="min-w-0" style={{ contain: "inline-size" }}>
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Choose your world
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {THEMES.map((candidate) => {
            const active = candidate.id === theme.id;
            return (
              <button
                key={candidate.id}
                type="button"
                onClick={() => onPickTheme(candidate.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition-transform active:scale-95 ${
                  active ? "text-white" : "border-border bg-card text-foreground"
                }`}
                style={
                  active
                    ? { background: candidate.world.guide, borderColor: candidate.world.guide }
                    : undefined
                }
              >
                <span className="text-base leading-none">{candidate.emoji}</span>
                {candidate.world.name}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="relative min-h-[24rem] flex-1 overflow-hidden rounded-2xl border"
        style={{ background: world.backdrop }}
      >
        {/* Atmosphere. Deliberately faint — it should never compete with a stop. */}
        {SCENERY.map((spot, index) => (
          <span
            key={index}
            aria-hidden="true"
            className="chess-drift pointer-events-none absolute select-none opacity-30"
            style={{
              left: `${spot.x}%`,
              top: `${spot.y}%`,
              fontSize: spot.size,
              animationDelay: `${index * 0.7}s`,
            }}
          >
            {world.scenery[index % world.scenery.length]}
          </span>
        ))}

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <path
            d={TRAIL}
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={2.4}
            strokeLinecap="round"
            strokeDasharray="0.1 5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {LEVELS.map((level, index) => {
          const spot = STOPS[index];
          const complete = Boolean(won[level.id]);
          const isNext = index === nextIndex;

          return (
            <button
              key={level.id}
              type="button"
              onClick={() => onPickLevel(level.id)}
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 transition-transform active:scale-95"
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
            >
              <span className="relative">
                <span
                  className={`flex size-14 items-center justify-center rounded-full border-[3px] bg-card text-2xl shadow-lg ${
                    isNext ? "chess-beacon" : ""
                  }`}
                  style={{ borderColor: complete ? "#F0A81E" : world.frame }}
                >
                  {level.emoji}
                </span>
                {complete && (
                  <span className="absolute -right-1.5 -top-1.5 text-lg drop-shadow">⭐</span>
                )}
              </span>
              <span
                className="whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold text-white shadow"
                style={{ background: world.frame }}
              >
                {level.name}
              </span>
            </button>
          );
        })}
      </div>

      <Button variant="outline" size="lg" className="w-full" onClick={onOpenStickers}>
        <StickerIcon />
        Sticker Book
        <span className="ml-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-950">
          {earned}/{STICKERS.length}
        </span>
      </Button>
    </div>
  );
}
