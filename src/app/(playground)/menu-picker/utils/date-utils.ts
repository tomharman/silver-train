export function getMonthName(year: number, month: number): string {
  const date = new Date(year, month);
  return date.toLocaleDateString("en-US", { month: "long" });
}

export function formatDateKey(date: Date): string {
  return date.toISOString().split("T")[0]; // "2026-01-05"
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

export function getCalendarDays(year: number, month: number): Date[] {
  // Returns array of dates for calendar grid (includes padding from prev/next month)
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  // Adjust so Monday = 0, Sunday = 6
  let startPadding = firstDay.getDay() - 1;
  if (startPadding < 0) startPadding = 6; // Sunday becomes 6

  const days: Date[] = [];

  // Add days from previous month (padding)
  for (let i = startPadding - 1; i >= 0; i--) {
    const date = new Date(year, month, -i);
    days.push(date);
  }

  // Add days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // Only add padding to complete the current week (not always 6 weeks)
  const daysInGrid = days.length;
  const remainingInWeek = (7 - (daysInGrid % 7)) % 7;

  for (let i = 1; i <= remainingInWeek; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDateKey(date1) === formatDateKey(date2);
}

export function getCurrentMonthYear(): { year: number; month: number } {
  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() };
}

export function getNextAvailableDate(
  currentDate: Date,
  menuDates: string[]
): Date | null {
  // Find next weekday that has a menu available
  let nextDate = new Date(currentDate);
  nextDate.setDate(nextDate.getDate() + 1);

  // Try up to 14 days ahead (to handle weekends and gaps)
  for (let i = 0; i < 14; i++) {
    const dateKey = formatDateKey(nextDate);

    // Check if it's a weekday with a menu
    if (!isWeekend(nextDate) && menuDates.includes(dateKey)) {
      return nextDate;
    }

    nextDate.setDate(nextDate.getDate() + 1);
  }

  return null; // No next date found
}
