"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import type { DisplayEntry } from "../types";

interface TimePickerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: DisplayEntry | null;
  onSave: (entryId: string, newTimestamp: number) => void;
  onDelete: (entryId: string) => void;
}

export function TimePickerDrawer({
  open,
  onOpenChange,
  entry,
  onSave,
  onDelete,
}: TimePickerDrawerProps) {
  const [timeValue, setTimeValue] = useState("");

  // Initialize time value when entry changes
  useEffect(() => {
    if (entry) {
      const date = new Date(entry.timestamp);
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      setTimeValue(`${hours}:${minutes}`);
    }
  }, [entry]);

  const handleSave = () => {
    if (!entry || !timeValue) return;

    const [hours, minutes] = timeValue.split(":").map(Number);
    const originalDate = new Date(entry.timestamp);
    const newDate = new Date(originalDate);
    newDate.setHours(hours, minutes, 0, 0);

    onSave(entry.id, newDate.getTime());
  };

  const handleDelete = () => {
    if (!entry) return;
    onDelete(entry.id);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle
            className="text-center"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Edit Time
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 py-6">
          <input
            type="time"
            value={timeValue}
            onChange={(e) => setTimeValue(e.target.value)}
            className="w-full text-center text-4xl font-medium py-4 bg-neutral-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300"
            style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
          />
        </div>

        <DrawerFooter>
          <Button onClick={handleSave} className="w-full">
            Save
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            Cancel
          </Button>
          <Button
            variant="ghost"
            onClick={handleDelete}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Delete Entry
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
