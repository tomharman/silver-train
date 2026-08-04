"use client";

import { useCallback, useState } from "react";
import { HelpCircle, Settings2, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ChessGame } from "./components/chess-game";
import { LevelPicker } from "./components/level-picker";
import { HowToPanel } from "./components/panels";
import { SettingsPanel } from "./components/settings-panel";
import { LEVELS, getLevel } from "./data/levels";
import { getTheme } from "./data/themes";
import { useStoredState } from "./hooks/use-stored-state";
import type { Color, Difficulty, Mode } from "./types";

const NO_PROGRESS: Record<string, boolean> = {};

export default function ChessPage() {
  const [levelId, setLevelId] = useStoredState("chess-level", LEVELS[0].id);
  const [mode, setMode] = useStoredState<Mode>("chess-mode", "two");
  const [difficulty, setDifficulty] = useStoredState<Difficulty>("chess-difficulty", "sleepy");
  const [themeId, setThemeId] = useStoredState("chess-theme", "classic");
  const [soundOn, setSoundOn] = useStoredState("chess-sound", true);
  const [playerOne, setPlayerOne] = useStoredState("chess-player-one", "Player 1");
  const [playerTwo, setPlayerTwo] = useStoredState("chess-player-two", "Player 2");
  const [won, setWon] = useStoredState("chess-progress", NO_PROGRESS);

  const [showHowTo, setShowHowTo] = useState(false);
  // Closed by default: the board should be the first thing you see, especially
  // on a phone handed to a child.
  const [showSetup, setShowSetup] = useState(false);

  const level = getLevel(levelId);
  const theme = getTheme(themeId);
  const levelIndex = LEVELS.findIndex((candidate) => candidate.id === level.id);
  const nextLevel = LEVELS[levelIndex + 1];

  const nameOf = useCallback(
    (color: Color) => {
      if (color === "white") return playerOne || "Player 1";
      if (mode === "one") return "Computer";
      return playerTwo || "Player 2";
    },
    [playerOne, playerTwo, mode],
  );

  const handleFinish = useCallback(
    (winner: Color | null) => {
      // Two of you playing: finishing the game earns the star. Against the
      // computer you have to actually beat it.
      const earned = winner !== null && (mode === "two" || winner === "white");
      if (earned) setWon((current) => ({ ...current, [level.id]: true }));
    },
    [mode, level.id, setWon],
  );

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold leading-tight">Chess Club</h1>
          <p className="text-sm text-muted-foreground">
            Six little games that add up to real chess.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
            onClick={() => setSoundOn(!soundOn)}
          >
            {soundOn ? <Volume2 /> : <VolumeX />}
          </Button>
          <Button
            variant={showSetup ? "default" : "outline"}
            onClick={() => setShowSetup(!showSetup)}
          >
            <Settings2 />
            Setup
          </Button>
          <Button variant="outline" onClick={() => setShowHowTo(true)}>
            <HelpCircle />
            How to play
          </Button>
        </div>
      </div>

      <LevelPicker activeId={level.id} won={won} onPick={setLevelId} />

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

      <ChessGame
        key={level.id}
        level={level}
        theme={theme}
        mode={mode}
        difficulty={difficulty}
        soundOn={soundOn}
        nameOf={nameOf}
        hasNextLevel={Boolean(nextLevel)}
        onNextLevel={() => nextLevel && setLevelId(nextLevel.id)}
        onFinish={handleFinish}
      />

      {showHowTo && <HowToPanel level={level} theme={theme} onClose={() => setShowHowTo(false)} />}
    </div>
  );
}
