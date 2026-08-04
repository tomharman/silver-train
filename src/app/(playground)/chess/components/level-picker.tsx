"use client";

import { LEVELS } from "../data/levels";

interface LevelPickerProps {
  activeId: string;
  won: Record<string, boolean>;
  onPick: (id: string) => void;
}

export function LevelPicker({ activeId, won, onPick }: LevelPickerProps) {
  return (
    <div className="flex w-full gap-2 overflow-x-auto pb-2">
      {LEVELS.map((level, index) => {
        const isActive = level.id === activeId;

        return (
          <button
            key={level.id}
            type="button"
            onClick={() => onPick(level.id)}
            className={`relative flex min-w-[6.5rem] flex-1 shrink-0 sm:min-w-[8rem] flex-col items-start gap-0.5 rounded-xl border-2 px-3 py-2 text-left transition-colors ${
              isActive
                ? "border-amber-400 bg-amber-50 dark:bg-amber-950/40"
                : "border-border bg-card hover:bg-accent"
            }`}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-xl leading-none sm:text-2xl">{level.emoji}</span>
              <span className="text-xs font-medium text-muted-foreground">
                {won[level.id] ? "⭐" : index + 1}
              </span>
            </div>
            <span className="text-sm font-semibold leading-tight">{level.name}</span>
            <span className="hidden text-xs leading-tight text-muted-foreground sm:block">
              {level.tagline}
            </span>
          </button>
        );
      })}
    </div>
  );
}
