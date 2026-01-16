"use client";

import { useState } from "react";
import { X, Trash2 } from "lucide-react";
import type { SleepEntry } from "../types";
import { formatTime, formatDate } from "../utils/time";

interface DataEntryViewProps {
  entries: SleepEntry[];
  onUpdateEntry: (entryId: string, newTimestamp: number, newState: "asleep" | "awake") => void;
  onDeleteEntry: (entryId: string) => void;
  onClose: () => void;
}

export function DataEntryView({
  entries,
  onUpdateEntry,
  onDeleteEntry,
  onClose,
}: DataEntryViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleStartEdit = (entry: SleepEntry, field: "timestamp" | "state") => {
    setEditingId(`${entry.id}-${field}`);
    if (field === "timestamp") {
      // Format as datetime-local input value
      const date = new Date(entry.timestamp);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      setEditValue(`${year}-${month}-${day}T${hours}:${minutes}`);
    } else {
      setEditValue(entry.state);
    }
  };

  const handleSaveEdit = (entry: SleepEntry, field: "timestamp" | "state") => {
    if (field === "timestamp") {
      const newTimestamp = new Date(editValue).getTime();
      if (!isNaN(newTimestamp)) {
        onUpdateEntry(entry.id, newTimestamp, entry.state);
      }
    } else {
      const newState = editValue as "asleep" | "awake";
      onUpdateEntry(entry.id, entry.timestamp, newState);
    }
    setEditingId(null);
    setEditValue("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  // Sort entries by timestamp (oldest first)
  const sortedEntries = [...entries].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
        <h2
          className="text-xl font-semibold text-neutral-900"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Data Entry
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-neutral-200/50 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-neutral-700" />
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-neutral-100 border-b border-neutral-200">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Date
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Time
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                State
              </th>
              <th
                className="px-4 py-3 text-right text-xs font-semibold text-neutral-600 uppercase tracking-wider"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map((entry, index) => (
              <tr
                key={entry.id}
                className={index % 2 === 0 ? "bg-white" : "bg-neutral-50"}
              >
                {/* Date */}
                <td className="px-4 py-3">
                  {editingId === `${entry.id}-timestamp` ? (
                    <input
                      type="datetime-local"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleSaveEdit(entry, "timestamp")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(entry, "timestamp");
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      className="px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-400"
                      style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => handleStartEdit(entry, "timestamp")}
                      className="text-sm text-neutral-700 hover:text-neutral-900 text-left"
                      style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                    >
                      {formatDate(entry.timestamp)}
                    </button>
                  )}
                </td>

                {/* Time */}
                <td className="px-4 py-3">
                  {editingId === `${entry.id}-timestamp` ? (
                    <span className="text-sm text-neutral-400">Editing date/time</span>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(entry, "timestamp")}
                      className="text-sm text-neutral-700 hover:text-neutral-900 uppercase"
                      style={{ fontFamily: "var(--font-ibm-plex-mono)" }}
                    >
                      {formatTime(entry.timestamp)}
                    </button>
                  )}
                </td>

                {/* State */}
                <td className="px-4 py-3">
                  {editingId === `${entry.id}-state` ? (
                    <select
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={() => handleSaveEdit(entry, "state")}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(entry, "state");
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      className="px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-neutral-400"
                      style={{ fontFamily: "var(--font-inter)" }}
                      autoFocus
                    >
                      <option value="awake">Awake</option>
                      <option value="asleep">Asleep</option>
                    </select>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(entry, "state")}
                      className={`px-3 py-1 text-sm rounded-full font-medium ${
                        entry.state === "asleep"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                      style={{ fontFamily: "var(--font-inter)" }}
                    >
                      {entry.state === "asleep" ? "Asleep" : "Awake"}
                    </button>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    className="p-2 rounded-lg hover:bg-red-100 text-neutral-500 hover:text-red-600 transition-colors"
                    aria-label="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
