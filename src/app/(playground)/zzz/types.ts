export interface SleepEntry {
  id: string;
  timestamp: number; // Unix ms when state started
  state: "asleep" | "awake";
}

export interface SleepData {
  entries: SleepEntry[];
  currentState: "asleep" | "awake";
}

// For computed display
export interface DisplayEntry extends SleepEntry {
  duration: number | null; // null for active entry
  endTimestamp: number | null; // null for active entry
}
