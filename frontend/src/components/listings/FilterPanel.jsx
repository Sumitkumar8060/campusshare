import { RotateCcw } from "lucide-react";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { LISTING_TYPES, CONDITIONS } from "@/lib/constants";

export function FilterPanel({ filters, categories = [], onChange, onClear, hasActiveFilters }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <Label>Transaction type</Label>
        <Select
          value={filters.listingType}
          onChange={(e) => onChange({ listingType: e.target.value })}
        >
          <option value="">All types</option>
          {LISTING_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Category</Label>
        <Select value={filters.category} onChange={(e) => onChange({ category: e.target.value })}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Condition</Label>
        <Select
          value={filters.condition}
          onChange={(e) => onChange({ condition: e.target.value })}
        >
          <option value="">Any condition</option>
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label>Availability</Label>
        <Select value={filters.available} onChange={(e) => onChange({ available: e.target.value })}>
          <option value="">All listings</option>
          <option value="true">Available now</option>
          <option value="false">Currently unavailable</option>
        </Select>
      </div>

      {hasActiveFilters && (
        <div className="col-span-2 lg:col-span-4">
          <Button variant="ghost" size="sm" onClick={onClear}>
            <RotateCcw className="h-3.5 w-3.5" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
