"use client";

import { useCallback, useEffect, useState } from "react";
import { Settings2, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ChessGame } from "./components/chess-game";
import { JourneyMap } from "./components/journey-map";
import { HowToPanel } from "./components/panels";
import { SettingsPanel } from "./components/settings-panel";
import { StickerBook } from "./components/sticker-book";
import { LEVELS, getLevel } from "./data/levels";
import { STICKERS } from "./data/stickers";
import { THEMES, getTheme } from "./data/themes";
import { useStoredState } from "./hooks/use-stored-state";
import type { Color, Difficulty, Mode } from "./types";
import { sounds, unlockAudio } from "./utils/sound";

const NO_FLAGS: Record<string, boolean> = {};

export default function ChessPage() {
  const [levelId, setLevelId] = useStoredState("chess-level", LEVELS[0].id);
  const [mode, setMode] = useStoredState<Mode>("chess-mode", "two");
  const [difficulty, setDifficulty] = useStoredState<Difficulty>("chess-difficulty", "sleepy");
  const [themeId, setThemeId] = useStoredState("chess-theme", "classic");
  const [soundOn, setSoundOn] = useStoredState("chess-sound", true);
  const [playerOne, setPlayerOne] = useStoredState("chess-player-one", "Player 1");
  const [playerTwo, setPlayerTwo] = useStoredState("chess-player-two", "Player 2");
  const [won, setWon] = useStoredState("chess-progress", NO_FLAGS);
  const [stickers, setStickers] = useStoredState("chess-stickers", NO_FLAGS);
  // Read through the updater below rather than directly — we only ever need the
  // current value at the moment a world is entered.
  const [, setWorldsSeen] = useStoredState("chess-worlds-seen", NO_FLAGS);

  // The map is home. You go into a game and come back out again.
  const [screen, setScreen] = useState<"map" | "game">("map");
  const [showHowTo, setShowHowTo] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showStickers, setShowStickers] = useState(false);

  const level = getLevel(levelId);
  const theme = getTheme(themeId);
  const levelIndex = LEVELS.findIndex((candidate) => candidate.id === level.id);
  const nextLevel = LEVELS[levelIndex + 1];

  // Mobile browsers only start audio from inside a real gesture, so the very
  // first touch anywhere on the page is what wakes it up.
  useEffect(() => {
    const wake = () => unlockAudio();
    window.addEventListener("pointerdown", wake, { capture: true });
    return () => window.removeEventListener("pointerdown", wake, { capture: true });
  }, []);

  const nameOf = useCallback(
    (color: Color) => {
      if (color === "white") return playerOne || "Player 1";
      if (mode === "one") return "Computer";
      return playerTwo || "Player 2";
    },
    [playerOne, playerTwo, mode],
  );

  const earnSticker = useCallback(
    (id: string) => {
      setStickers((current) => (current[id] ? current : { ...current, [id]: true }));
    },
    [setStickers],
  );

  const startLevel = useCallback(
    (id: string) => {
      setLevelId(id);
      setScreen("game");
      // Visiting a world counts, whether or not the game goes well.
      setWorldsSeen((current) => {
        const next = current[themeId] ? current : { ...current, [themeId]: true };
        if (THEMES.every((candidate) => next[candidate.id])) earnSticker("explorer");
        return next;
      });
    },
    [setLevelId, setWorldsSeen, themeId, earnSticker],
  );

  const handleFinish = useCallback(
    (winner: Color | null) => {
      // Two of you playing: finishing the game earns the star. Against the
      // computer you have to actually beat it.
      const earned = winner !== null && (mode === "two" || winner === "white");
      if (!earned) return;

      setWon((current) => {
        const next = { ...current, [level.id]: true };
        if (LEVELS.every((candidate) => next[candidate.id])) earnSticker("grand-master");
        return next;
      });
    },
    [mode, level.id, setWon, earnSticker],
  );

  const collected = STICKERS.filter((sticker) => stickers[sticker.id]).length;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 sm:gap-4 sm:p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold leading-tight sm:text-2xl">Chess Club</h1>
          <p className="hidden text-sm text-muted-foreground sm:block">
            {collected > 0
              ? `${collected} sticker${collected === 1 ? "" : "s"} collected so far.`
              : "Six little games that add up to real chess."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="size-9"
            aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
            onClick={() => {
              const next = !soundOn;
              setSoundOn(next);
              // Play something so you can hear that it worked.
              if (next) sounds.sticker();
            }}
          >
            {soundOn ? <Volume2 /> : <VolumeX />}
          </Button>
          <Button
            variant={showSetup ? "default" : "outline"}
            size="sm"
            onClick={() => setShowSetup(!showSetup)}
          >
            <Settings2 />
            Setup
          </Button>
        </div>
      </div>

      {showSetup && (
        <SettingsPanel
          mode={mode}
          onModeChange={setMode}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          themeId={themeId}
          onThemeChange={setThemeId}
          playerOne={playerOne}
          playerTwo={playerTwo}
          onPlayerOneChange={setPlayerOne}
          onPlayerTwoChange={setPlayerTwo}
        />
      )}

      {screen === "map" ? (
        <JourneyMap
          theme={theme}
          won={won}
          stickers={stickers}
          playerName={playerOne || "Player 1"}
          onPickLevel={startLevel}
          onPickTheme={setThemeId}
          onOpenStickers={() => setShowStickers(true)}
        />
      ) : (
        <ChessGame
          // A new level is a new game; changing the world mid-game is not.
          key={level.id}
          level={level}
          theme={theme}
          mode={mode}
          difficulty={difficulty}
          soundOn={soundOn}
          nameOf={nameOf}
          stickers={stickers}
          hasNextLevel={Boolean(nextLevel)}
          onNextLevel={() => nextLevel && startLevel(nextLevel.id)}
          onBackToMap={() => setScreen("map")}
          onHowToPlay={() => setShowHowTo(true)}
          onEarnSticker={earnSticker}
          onFinish={handleFinish}
        />
      )}

      {showHowTo && <HowToPanel level={level} theme={theme} onClose={() => setShowHowTo(false)} />}
      {showStickers && (
        <StickerBook
          stickers={stickers}
          theme={theme}
          onClose={() => setShowStickers(false)}
        />
      )}
    </div>
  );
}
