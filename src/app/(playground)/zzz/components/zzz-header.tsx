"use client";

import { BarChart2 } from "lucide-react";

interface ZzzHeaderProps {
  onDataEntryClick?: () => void;
}

export function ZzzHeader({ onDataEntryClick }: ZzzHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <h1
        className="text-2xl font-bold tracking-tight text-neutral-900"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        Zzz
      </h1>

      <button
        onClick={onDataEntryClick}
        className="p-2 rounded-lg hover:bg-neutral-200/50 transition-colors"
        aria-label="View data entry"
      >
        <BarChart2 className="w-5 h-5 text-neutral-700" />
      </button>
    </header>
  );
}
