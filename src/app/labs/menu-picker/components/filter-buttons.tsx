type FilterType = "all" | "inbound" | "outbound";

interface FilterButtonsProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function FilterButtons({ filter, onFilterChange }: FilterButtonsProps) {
  return (
    <div className="mb-6 flex justify-center gap-3">
      <button
        onClick={() => onFilterChange("all")}
        className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
          filter === "all"
            ? "bg-neutral-900 text-white shadow-md"
            : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
        }`}
      >
        All Transactions
      </button>
      <button
        onClick={() => onFilterChange("inbound")}
        className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
          filter === "inbound"
            ? "bg-green-600 text-white shadow-md"
            : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
        }`}
      >
        Inbound
      </button>
      <button
        onClick={() => onFilterChange("outbound")}
        className={`rounded-lg px-6 py-2.5 text-sm font-medium transition-all ${
          filter === "outbound"
            ? "bg-neutral-900 text-white shadow-md"
            : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50"
        }`}
      >
        Outbound
      </button>
    </div>
  );
}
