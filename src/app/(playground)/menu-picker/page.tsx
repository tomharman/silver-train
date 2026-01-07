"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CalendarGrid } from "./components/calendar-grid";
import { MenuList } from "./components/menu-list";
import { ConfirmFooter } from "./components/confirm-footer";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { formatDateKey, getMonthName, getNextAvailableDate } from "./utils/date-utils";
import type { MenuData, UserSelections, MenuItem } from "./types";
import menuDataJson from "./data/menus.json";

export default function MenuPickerPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [pendingSelections, setPendingSelections] = useState<UserSelections>({});
  const [savedSelections, setSavedSelections] = useLocalStorage<UserSelections>(
    "menu-picker-selections",
    {}
  );
  const [showSuccess, setShowSuccess] = useState(false);
  const [menuData] = useState<MenuData>(menuDataJson as MenuData);
  const calendarScrollRef = useRef<HTMLDivElement>(null);

  // Initialize: auto-select first available day
  useEffect(() => {
    if (menuData && !selectedDate) {
      const firstDate = Object.keys(menuData.menus)[0];
      if (firstDate) {
        setSelectedDate(new Date(firstDate));
      }
    }
  }, [menuData, selectedDate]);

  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const handleSelectItem = (item: MenuItem) => {
    if (!selectedDate) return;

    const dateKey = formatDateKey(selectedDate);

    // Toggle selection: if clicking the same item, remove it; otherwise, replace
    setPendingSelections((prev) => {
      const current = prev[dateKey];
      if (current?.id === item.id) {
        // Deselect
        const newSelections = { ...prev };
        delete newSelections[dateKey];
        return newSelections;
      } else {
        // Select/Replace
        return { ...prev, [dateKey]: item };
      }
    });

    // Auto-advance to next available day after selection
    const nextDate = getNextAvailableDate(
      selectedDate,
      Object.keys(menuData.menus)
    );
    if (nextDate) {
      setTimeout(() => {
        setSelectedDate(nextDate);

        // Scroll to the next date's month if needed
        const nextMonth = nextDate.getMonth();
        const monthElement = document.getElementById(`month-${nextMonth}`);
        if (monthElement) {
          monthElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 300);
    }
  };

  const handleConfirm = () => {
    // Merge pending into saved selections
    setSavedSelections({ ...savedSelections, ...pendingSelections });
    // Clear pending selections
    setPendingSelections({});
    // Show success banner
    setShowSuccess(true);
    // Hide success banner after 3 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleBack = () => {
    window.history.back();
  };

  if (!menuData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading menu data...</p>
      </div>
    );
  }

  const menuDates = Object.keys(menuData.menus);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="px-4 py-4 border-b">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-semibold absolute left-1/2 transform -translate-x-1/2">
            Choose your meals
          </h1>
          <div className="w-20" /> {/* Spacer for balance */}
        </div>
      </div>

      {/* Mobile: Vertical Stack | Desktop: Side-by-side */}
      <div className="flex flex-col lg:flex-row gap-6 px-4 py-6">
        {/* LEFT PANEL: Calendar (mobile: full width, desktop: fixed left sidebar) */}
        <div className="lg:w-80 lg:sticky lg:top-4 lg:self-start">
          <div
            ref={calendarScrollRef}
            className="overflow-y-auto max-h-[280px] lg:max-h-[calc(100vh-8rem)]"
          >
            {/* Render ALL months from Jan 2026 to Jul 2026 */}
            {[0, 1, 2, 3, 4, 5, 6].map((monthOffset) => (
              <div key={monthOffset} id={`month-${monthOffset}`} className="mb-6">
                <h2 className="text-2xl font-bold mb-3">
                  {getMonthName(2026, monthOffset)}
                </h2>
                <CalendarGrid
                  year={2026}
                  month={monthOffset}
                  selectedDate={selectedDate}
                  onSelectDate={handleSelectDate}
                  pendingSelections={pendingSelections}
                  savedSelections={savedSelections}
                  menuDates={menuDates}
                />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL: Menu List (mobile: below calendar, desktop: main content) */}
        <div className="flex-1 pb-24 lg:pb-6">
          {selectedDate && menuData.menus[formatDateKey(selectedDate)] ? (
            <MenuList
              items={menuData.menus[formatDateKey(selectedDate)].items}
              selectedItem={
                pendingSelections[formatDateKey(selectedDate)] ||
                savedSelections[formatDateKey(selectedDate)]
              }
              onSelectItem={handleSelectItem}
            />
          ) : (
            <div className="text-muted-foreground text-center py-12">
              Select a day to view menu options
            </div>
          )}
        </div>
      </div>

      {/* Sticky Footer - ONLY shows when pendingSelections has items */}
      {Object.keys(pendingSelections).length > 0 && (
        <ConfirmFooter
          selectionCount={Object.keys(pendingSelections).length}
          onConfirm={handleConfirm}
          showSuccess={showSuccess}
        />
      )}
    </div>
  );
}
