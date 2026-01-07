import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MenuItem } from "../types";

interface MenuListProps {
  items: MenuItem[];
  selectedItem?: MenuItem;
  onSelectItem: (item: MenuItem) => void;
}

export function MenuList({ items, selectedItem, onSelectItem }: MenuListProps) {
  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Main</h3>
      <div className="space-y-1">
        {items.map((item) => {
          const isSelected = selectedItem?.id === item.id;

          return (
            <div
              key={item.id}
              className="flex items-center justify-between py-3 px-4 border-b last:border-b-0 hover:bg-accent/50 transition-colors"
            >
              <span className="text-sm font-medium">{item.name}</span>
              <Button
                variant={isSelected ? "default" : "outline"}
                size="icon"
                className={`h-8 w-8 rounded-full ${isSelected ? "bg-chart-4 hover:bg-chart-4/90" : ""}`}
                onClick={() => onSelectItem(item)}
              >
                {isSelected ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
