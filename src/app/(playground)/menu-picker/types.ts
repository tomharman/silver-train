export interface MenuItem {
  id: string;
  name: string;
  category: "rotating" | "jacket-potato";
}

export interface DayMenu {
  dayOfWeek: string;
  items: MenuItem[];
}

export interface MenuData {
  startDate: string;
  endDate: string;
  menus: {
    [date: string]: DayMenu; // "2026-01-05" -> DayMenu
  };
}

export interface UserSelections {
  [date: string]: MenuItem; // date as key, selected item as value
}
