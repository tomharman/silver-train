"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

interface QuickToggleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentState: "asleep" | "awake";
  onConfirm: (targetState: "asleep" | "awake") => void;
  onCancel: () => void;
}

export function QuickToggleModal({
  open,
  onOpenChange,
  currentState,
  onConfirm,
  onCancel,
}: QuickToggleModalProps) {
  const oppositeState = currentState === "asleep" ? "awake" : "asleep";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle
            className="text-center text-lg"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Quick toggle detected
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4">
          <p
            className="text-sm text-neutral-600 text-center py-2"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            You toggled within a minute. Which state should your baby be in?
          </p>
        </div>

        <DrawerFooter className="flex flex-col gap-2">
          <Button
            onClick={() => onConfirm(oppositeState)}
            className="w-full capitalize"
          >
            {oppositeState}
          </Button>
          <Button
            variant="outline"
            onClick={() => onConfirm(currentState)}
            className="w-full capitalize"
          >
            {currentState}
          </Button>
          <Button
            variant="ghost"
            onClick={onCancel}
            className="w-full text-neutral-500"
          >
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
