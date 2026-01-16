"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface PhoneFrameProps {
  children: React.ReactNode;
  currentState: "asleep" | "awake";
}

export function PhoneFrame({ children, currentState }: PhoneFrameProps) {
  const isMobile = useIsMobile();

  // Background tint based on current state
  const bgTint =
    currentState === "asleep"
      ? "bg-[#FFF5F8]" // Subtle pink/purple tint
      : "bg-[#FFF8F0]"; // Warm cream/orange tint

  if (isMobile) {
    return (
      <div
        className={cn(
          "min-h-screen w-full transition-colors duration-500",
          bgTint
        )}
      >
        {children}
      </div>
    );
  }

  // Desktop: render in phone frame
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-100 dark:bg-neutral-900 p-4">
      <div
        className={cn(
          "relative w-[375px] h-[812px] rounded-[44px] overflow-hidden shadow-2xl transition-colors duration-500",
          bgTint
        )}
      >
        {/* Phone notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150px] h-[34px] bg-black rounded-b-3xl z-50" />
        {/* Content */}
        <div className="h-full w-full pt-[34px] overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
