"use client";

import { PixelButton, PixelChoice, PixelSheet } from "./pixel-ui";
import { PixelPiece } from "./pixel-piece";
import { LEVELS } from "../data/levels";
import { STICKERS } from "../data/stickers";
import { THEMES } from "../data/themes";
import type { Difficulty, Mode, PieceTheme } from "../types";

/**
 * Everything, in one place.
 *
 * The board is the whole screen now, so this is where the rest of the game
 * lives: which game you are playing, who is playing it, what it looks like and
 * what it sounds like. Bundling it all behind one button is worth a little
 * scrolling here, because the alternative is a permanent band of controls that
 * a five year old will press by accident and cannot read anyway.
 *
 * Ordered by how often a grown-up actually reaches for it: the game first, then
 * the opponent, then the paint.
 */

interface SettingsPanelProps {
  levelId: string;
  onLevelChange: (id: string) => void;
  /** Levels already beaten, for the little star. */
  won: Record<string, boolean>;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  theme: PieceTheme;
  themeId: string;
  onThemeChange: (themeId: string) => void;
  playerOne: string;
  playerTwo: string;
  onPlayerOneChange: (name: string) => void;
  onPlayerTwoChange: (name: string) => void;
  soundOn: boolean;
  onSoundChange: (value: boolean) => void;
  showDanger: boolean;
  onShowDangerChange: (value: boolean) => void;
  stickers: Record<string, boolean>;
  onHowToPlay: () => void;
  onStickers: () => void;
  onRestart: () => void;
  onClose: () => void;
}

export function SettingsPanel({
  levelId,
  onLevelChange,
  won,
  mode,
  onModeChange,
  difficulty,
  onDifficultyChange,
  theme,
  themeId,
  onThemeChange,
  playerOne,
  playerTwo,
  onPlayerOneChange,
  onPlayerTwoChange,
  soundOn,
  onSoundChange,
  showDanger,
  onShowDangerChange,
  stickers,
  onHowToPlay,
  onStickers,
  onRestart,
  onClose,
}: SettingsPanelProps) {
  const collected = STICKERS.filter((sticker) => stickers[sticker.id]).length;

  return (
    <PixelSheet title="Settings" onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="font-pixel text-[9px] uppercase tracking-[0.22em] opacity-50">
            Which game
          </span>
          <div className="flex flex-col gap-1.5">
            {LEVELS.map((level) => (
              <PixelButton
                key={level.id}
                size="sm"
                tone={level.id === levelId ? "bright" : "quiet"}
                className="!justify-start"
                onClick={() => {
                  onLevelChange(level.id);
                  onClose();
                }}
              >
                <span className="normal-case tracking-normal">{level.emoji}</span>
                <span className="truncate">{level.name}</span>
                {won[level.id] && <span className="ml-auto normal-case">★</span>}
              </PixelButton>
            ))}
          </div>
        </div>

        <PixelChoice<Mode>
          label="Who's playing"
          value={mode}
          onChange={onModeChange}
          options={[
            { value: "two", label: "Two of us" },
            { value: "one", label: "Computer" },
          ]}
        />

        {mode === "one" && (
          <PixelChoice<Difficulty>
            label="Computer skill"
            value={difficulty}
            onChange={onDifficultyChange}
            options={[
              { value: "sleepy", label: "Sleepy" },
              { value: "thinky", label: "Thinky" },
              { value: "tricky", label: "Tricky" },
            ]}
          />
        )}

        <div className="flex flex-col gap-1.5">
          <span className="font-pixel text-[9px] uppercase tracking-[0.22em] opacity-50">
            Names
          </span>
          <div className="flex gap-1.5">
            <NameField value={playerOne} onChange={onPlayerOneChange} label="First player" />
            <NameField
              value={playerTwo}
              onChange={onPlayerTwoChange}
              label="Second player"
              disabled={mode === "one"}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="font-pixel text-[9px] uppercase tracking-[0.22em] opacity-50">
            Colours
          </span>
          <div className="flex gap-1.5">
            {THEMES.map((candidate) => (
              <button
                key={candidate.id}
                type="button"
                aria-label={candidate.name}
                aria-pressed={candidate.id === themeId}
                onClick={() => onThemeChange(candidate.id)}
                className="flex flex-1 items-end justify-center gap-0.5 py-1.5"
                style={{
                  background: candidate.world.frame,
                  boxShadow:
                    candidate.id === themeId
                      ? "0 0 0 3px #FCD34D, 0 0 0 6px rgba(0,0,0,0.28)"
                      : "0 0 0 3px rgba(0,0,0,0.24)",
                }}
              >
                {/* A pawn from each army: the only preview that tells you the
                    thing you actually want to know, which is whether you can
                    tell the two sides apart. */}
                <PixelPiece
                  type="pawn"
                  palette={candidate.world.teams.white}
                  face="happy"
                  gaze={{ x: 0.3, y: 0 }}
                  seed={2}
                  size={26}
                />
                <PixelPiece
                  type="pawn"
                  palette={candidate.world.teams.black}
                  face="happy"
                  gaze={{ x: -0.3, y: 0 }}
                  seed={5}
                  size={26}
                />
              </button>
            ))}
          </div>
        </div>

        <PixelChoice<"on" | "off">
          label="Sound"
          value={soundOn ? "on" : "off"}
          onChange={(value) => onSoundChange(value === "on")}
          options={[
            { value: "on", label: "On" },
            { value: "off", label: "Off" },
          ]}
        />

        <PixelChoice<"on" | "off">
          label="Show what's in danger"
          value={showDanger ? "on" : "off"}
          onChange={(value) => onShowDangerChange(value === "on")}
          options={[
            { value: "off", label: "Off" },
            { value: "on", label: "Ring it" },
          ]}
        />

        <div className="flex flex-col gap-1.5 border-t-4 border-black/10 pt-4">
          <PixelButton onClick={onHowToPlay}>How do the pieces move?</PixelButton>
          <PixelButton onClick={onStickers}>
            Stickers — {collected} / {STICKERS.length}
          </PixelButton>
          <PixelButton
            tone="quiet"
            onClick={() => {
              onRestart();
              onClose();
            }}
          >
            Start this game again
          </PixelButton>
        </div>

        <p className="font-pixel text-[9px] leading-relaxed tracking-widest opacity-40">
          {theme.world.name}
        </p>
      </div>
    </PixelSheet>
  );
}

function NameField({
  value,
  onChange,
  label,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label={label}
      disabled={disabled}
      maxLength={12}
      className="font-pixel min-w-0 flex-1 bg-white px-2.5 py-2 text-xs uppercase tracking-[0.14em] text-neutral-900 outline-none disabled:opacity-35 dark:bg-neutral-100"
      style={{ boxShadow: "0 0 0 3px rgba(0,0,0,0.24)" }}
    />
  );
}
