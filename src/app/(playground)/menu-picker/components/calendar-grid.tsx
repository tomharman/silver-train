import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCalendarDays, formatDateKey, isWeekend, isSameDay } from "../utils/date-utils";
import type { UserSelections } from "../types";

interface CalendarGridProps {
  year: number;
  month: number;
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  pendingSelections: UserSelections;
  savedSelections: UserSelections;
  menuDates: string[];
}

export function CalendarGrid({
  year,
  month,
  selectedDate,
  onSelectDate,
  pendingSelections,
  savedSelections,
  menuDates,
}: CalendarGridProps) {
  const days = getCalendarDays(year, month);
  const weekdays = ["M", "T", "W", "T", "F", "S", "S"];

  const getDayState = (date: Date) => {
    const dateKey = formatDateKey(date);
    const isCurrentMonth = date.getMonth() === month;
    const isSelected = selectedDate && isSameDay(date, selectedDate);
    const hasPendingSelection = dateKey in pendingSelections;
    const hasSavedSelection = dateKey in savedSelections;
    const hasMenu = menuDates.includes(dateKey);
    const isWeekendDay = isWeekend(date);

    return {
      isCurrentMonth,
      isSelected,
      hasPendingSelection,
      hasSavedSelection,
      hasMenu,
      isWeekendDay,
      isClickable: isCurrentMonth && hasMenu && !isWeekendDay,
    };
  };

  return (
    <div className="w-full">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) => {
          const state = getDayState(date);
          const day = date.getDate();

          // Don't render days from other months
          if (!state.isCurrentMonth) {
            return <div key={i} className="h-10" />;
          }

          return (
            <Button
              key={i}
              variant="ghost"
              size="sm"
              disabled={!state.isClickable}
              onClick={() => state.isClickable && onSelectDate(date)}
              className={`
                h-10 rounded-full font-medium transition-colors
                ${state.isSelected ? "bg-primary text-primary-foreground" : ""}
                ${state.hasSavedSelection && !state.isSelected ? "bg-chart-4 text-white" : ""}
                ${!state.hasSavedSelection && !state.isSelected && state.isClickable ? "hover:bg-accent" : ""}
                ${state.isWeekendDay || !state.hasMenu ? "opacity-40 cursor-not-allowed" : ""}
              `}
            >
              <span className="flex items-center gap-0">
                {day}
                {(state.hasPendingSelection || state.hasSavedSelection) && !state.isSelected && (
                  <Check className="h-3 w-3" />
                )}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
