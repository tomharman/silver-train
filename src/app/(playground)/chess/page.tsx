"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ChessGame, type GameHandle } from "./components/chess-game";
import { HowToPanel } from "./components/panels";
import { SettingsPanel } from "./components/settings-panel";
import { StickerBook } from "./components/sticker-book";
import { LEVELS, getLevel } from "./data/levels";
import { THEMES, getTheme } from "./data/themes";
import { useStoredState } from "./hooks/use-stored-state";
import type { Color, Difficulty, Mode } from "./types";
import { listenForUnlock } from "./utils/sound";

/**
 * Chess Club.
 *
 * The board is the screen. There used to be a map you came home to, a header, a
 * row of setup controls and a bar for each player, and between them they took
 * more of a phone than the game did. Now there is a board, one line from Pip,
 * and two buttons — and everything that used to be on screen is behind the
 * second of them.
 *
 * The trade is real and worth naming: choosing a level is two taps rather than
 * looking at a map. But the map was for the grown-up, and the board is for the
 * child, and only one of them is playing.
 */

const NO_FLAGS: Record<string, boolean> = {};

export default function ChessPage() {
  const [levelId, setLevelId] = useStoredState("chess-level", LEVELS[0].id);
  const [mode, setMode] = useStoredState<Mode>("chess-mode", "two");
  const [difficulty, setDifficulty] = useStoredState<Difficulty>("chess-difficulty", "sleepy");
  const [themeId, setThemeId] = useStoredState("chess-theme", THEMES[0].id);
  const [soundOn, setSoundOn] = useStoredState("chess-sound", true);
  const [showDanger, setShowDanger] = useStoredState("chess-danger", false);
  const [playerOne, setPlayerOne] = useStoredState("chess-player-one", "Player 1");
  const [playerTwo, setPlayerTwo] = useStoredState("chess-player-two", "Player 2");
  const [won, setWon] = useStoredState("chess-progress", NO_FLAGS);
  const [stickers, setStickers] = useStoredState("chess-stickers", NO_FLAGS);
  // Read through the updater below rather than directly — we only ever need the
  // current value at the moment a world is entered.
  const [, setWorldsSeen] = useStoredState("chess-worlds-seen", NO_FLAGS);

  const [showSettings, setShowSettings] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showStickers, setShowStickers] = useState(false);

  const game = useRef<GameHandle>(null);

  const level = getLevel(levelId);
  const theme = getTheme(themeId);
  const levelIndex = LEVELS.findIndex((candidate) => candidate.id === level.id);
  const nextLevel = LEVELS[levelIndex + 1];

  // Mobile browsers only start audio from inside a real gesture — and iOS is
  // fussy about which ones count, and mutes Web Audio entirely unless the page
  // claims the playback audio session. All of that lives in utils/sound.
  useEffect(() => listenForUnlock(), []);

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

  // Visiting a world counts, whether or not the game goes well.
  useEffect(() => {
    setWorldsSeen((current) => {
      if (current[themeId]) return current;
      const next = { ...current, [themeId]: true };
      if (THEMES.every((candidate) => next[candidate.id])) earnSticker("explorer");
      return next;
    });
  }, [themeId, setWorldsSeen, earnSticker]);

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

  return (
    <div className="relative flex min-w-0 flex-1 flex-col p-2 sm:p-4">
      {/* The sky the board stands under. Two layers rather than one, because
          the light gradient a world is designed around would be a torch in the
          face at night and the dark one is washed out by day. */}
      <div
        className="pointer-events-none absolute inset-0 dark:hidden"
        style={{ background: theme.world.backdrop }}
      />
      <div
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{ background: theme.world.backdropDark }}
      />

      <ChessGame
        // A new level is a new game; changing the world mid-game is not.
        key={level.id}
        handleRef={game}
        level={level}
        theme={theme}
        mode={mode}
        difficulty={difficulty}
        soundOn={soundOn}
        showDanger={showDanger}
        nameOf={nameOf}
        stickers={stickers}
        hasNextLevel={Boolean(nextLevel)}
        onNextLevel={() => nextLevel && setLevelId(nextLevel.id)}
        onOpenSettings={() => setShowSettings(true)}
        onEarnSticker={earnSticker}
        onFinish={handleFinish}
      />

      {showSettings && (
        <SettingsPanel
          levelId={levelId}
          onLevelChange={setLevelId}
          won={won}
          mode={mode}
          onModeChange={setMode}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          theme={theme}
          themeId={themeId}
          onThemeChange={setThemeId}
          playerOne={playerOne}
          playerTwo={playerTwo}
          onPlayerOneChange={setPlayerOne}
          onPlayerTwoChange={setPlayerTwo}
          soundOn={soundOn}
          onSoundChange={setSoundOn}
          showDanger={showDanger}
          onShowDangerChange={setShowDanger}
          stickers={stickers}
          onHowToPlay={() => {
            setShowSettings(false);
            setShowHowTo(true);
          }}
          onStickers={() => {
            setShowSettings(false);
            setShowStickers(true);
          }}
          onRestart={() => game.current?.restart()}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showHowTo && <HowToPanel level={level} theme={theme} onClose={() => setShowHowTo(false)} />}
      {showStickers && (
        <StickerBook stickers={stickers} theme={theme} onClose={() => setShowStickers(false)} />
      )}
    </div>
  );
}
