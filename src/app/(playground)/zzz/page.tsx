"use client";

import { useState } from "react";
import { PhoneFrame } from "./components/phone-frame";
import { ZzzHeader } from "./components/zzz-header";
import { SleepFeed } from "./components/sleep-feed";
import { SleepToggle } from "./components/sleep-toggle";
import { TimePickerDrawer } from "./components/time-picker-drawer";
import { QuickToggleModal } from "./components/quick-toggle-modal";
import { MeshGradient } from "./components/mesh-gradient";
import { useSleepData } from "./hooks/useSleepData";
import type { DisplayEntry } from "./types";

export default function ZzzPage() {
  const {
    displayEntries,
    activeEntry,
    currentState,
    now,
    estimatedEndTime,
    toggle,
    updateEntryTime,
    deleteEntry,
    isQuickToggle,
    resolveQuickToggle,
  } = useSleepData();

  const [editingEntry, setEditingEntry] = useState<DisplayEntry | null>(null);
  const [showQuickToggleModal, setShowQuickToggleModal] = useState(false);
  const [dragProgress, setDragProgress] = useState<number | undefined>(undefined);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleToggle = () => {
    if (isQuickToggle()) {
      setShowQuickToggleModal(true);
    } else {
      toggle();
    }
  };

  const handleDragProgress = (progress: number) => {
    setDragProgress(progress);
  };

  const handleScrollProgress = (progress: number) => {
    setScrollProgress(progress);
  };

  const handleQuickToggleConfirm = (targetState: "asleep" | "awake") => {
    resolveQuickToggle(targetState);
    setShowQuickToggleModal(false);
  };

  const handleQuickToggleCancel = () => {
    setShowQuickToggleModal(false);
  };

  const handleEditTime = (entry: DisplayEntry) => {
    setEditingEntry(entry);
  };

  const handleSaveTime = (entryId: string, newTimestamp: number) => {
    updateEntryTime(entryId, newTimestamp);
    setEditingEntry(null);
  };

  const handleDeleteEntry = (entryId: string) => {
    deleteEntry(entryId);
    setEditingEntry(null);
  };

  return (
    <PhoneFrame currentState={currentState}>
      <div className="relative flex flex-col h-full">
        <ZzzHeader />

        <SleepFeed
          entries={displayEntries}
          currentState={currentState}
          activeStartTimestamp={activeEntry?.timestamp || null}
          activeEntryId={activeEntry?.id || null}
          now={now}
          estimatedEndTime={estimatedEndTime}
          onEditTime={handleEditTime}
          onScrollProgress={handleScrollProgress}
        />

        {/* Animated mesh gradient overlay */}
        <MeshGradient
          currentState={currentState}
          dragProgress={dragProgress}
          scrollProgress={scrollProgress}
        />

        <SleepToggle
          currentState={currentState}
          onToggle={handleToggle}
          onDragProgress={handleDragProgress}
        />
      </div>

      <TimePickerDrawer
        open={!!editingEntry}
        onOpenChange={(open) => !open && setEditingEntry(null)}
        entry={editingEntry}
        onSave={handleSaveTime}
        onDelete={handleDeleteEntry}
      />

      <QuickToggleModal
        open={showQuickToggleModal}
        onOpenChange={setShowQuickToggleModal}
        currentState={currentState}
        onConfirm={handleQuickToggleConfirm}
        onCancel={handleQuickToggleCancel}
      />
    </PhoneFrame>
  );
}
