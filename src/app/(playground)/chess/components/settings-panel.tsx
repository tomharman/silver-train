"use client";

import { Input } from "@/components/ui/input";

import { THEMES } from "../data/themes";
import type { Difficulty, Mode } from "../types";

interface Option<T extends string> {
  value: T;
  label: string;
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <div className="flex rounded-lg bg-muted p-0.5">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`min-w-0 flex-1 truncate rounded-md px-2 py-1.5 text-xs font-medium sm:text-sm transition-colors ${
              option.value === value
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

interface SettingsPanelProps {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  difficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  themeId: string;
  onThemeChange: (themeId: string) => void;
  playerOne: string;
  playerTwo: string;
  onPlayerOneChange: (name: string) => void;
  onPlayerTwoChange: (name: string) => void;
  showDanger: boolean;
  onShowDangerChange: (value: boolean) => void;
}

export function SettingsPanel({
  mode,
  onModeChange,
  difficulty,
  onDifficultyChange,
  themeId,
  onThemeChange,
  playerOne,
  playerTwo,
  onPlayerOneChange,
  onPlayerTwoChange,
  showDanger,
  onShowDangerChange,
}: SettingsPanelProps) {
  return (
    <div className="grid gap-3 rounded-xl border bg-card p-3 sm:grid-cols-2 xl:grid-cols-4">
      <Segmented<"off" | "on">
        label="Danger hints"
        value={showDanger ? "on" : "off"}
        onChange={(value) => onShowDangerChange(value === "on")}
        options={[
          { value: "off", label: "Off" },
          { value: "on", label: "Ring what's at risk" },
        ]}
      />

      <Segmented<Mode>
        label="Who's playing"
        value={mode}
        onChange={onModeChange}
        options={[
          { value: "two", label: "👦 Two of us" },
          { value: "one", label: "🤖 Computer" },
        ]}
      />

      <Segmented<Difficulty>
        label="Computer skill"
        value={difficulty}
        onChange={onDifficultyChange}
        options={[
          { value: "sleepy", label: "Sleepy" },
          { value: "thinky", label: "Thinky" },
          { value: "tricky", label: "Tricky" },
        ]}
      />

      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Pieces
        </span>
        <div className="flex gap-1.5">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              title={theme.name}
              onClick={() => onThemeChange(theme.id)}
              className={`flex h-9 flex-1 items-center justify-center rounded-lg border-2 text-lg transition-colors ${
                theme.id === themeId ? "border-amber-400 bg-amber-50 dark:bg-amber-950/40" : "border-border bg-muted"
              }`}
            >
              {theme.emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Names
        </span>
        <div className="flex gap-1.5">
          <Input
            value={playerOne}
            onChange={(event) => onPlayerOneChange(event.target.value)}
            className="h-9"
            aria-label="First player's name"
          />
          <Input
            value={playerTwo}
            onChange={(event) => onPlayerTwoChange(event.target.value)}
            className="h-9"
            disabled={mode === "one"}
            aria-label="Second player's name"
          />
        </div>
      </div>
    </div>
  );
}
