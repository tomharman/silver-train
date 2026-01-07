import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface ConfirmFooterProps {
  selectionCount: number;
  onConfirm: () => void;
  showSuccess: boolean;
}

export function ConfirmFooter({
  selectionCount,
  onConfirm,
  showSuccess,
}: ConfirmFooterProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Control success banner visibility with fade-out
  useEffect(() => {
    if (showSuccess) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
      {showSuccess ? (
        // Success message
        <div
          className={`w-full h-14 bg-chart-4 rounded-lg flex items-center justify-center transition-opacity duration-500 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <span className="text-white font-semibold text-lg">
            {selectionCount} Choice{selectionCount !== 1 ? "s" : ""} Confirmed!
          </span>
        </div>
      ) : (
        // Confirm button
        <Button
          onClick={onConfirm}
          className="w-full h-14 bg-chart-4 hover:bg-chart-4/90 text-white font-semibold text-lg"
          size="lg"
        >
          <span className="flex items-center justify-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              {selectionCount}
            </span>
            <span>Confirm Choices</span>
          </span>
        </Button>
      )}
    </div>
  );
}
