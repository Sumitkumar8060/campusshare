import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/Input";

export function SearchBar({ value, onChange, placeholder = "Search listings by name…" }) {
  return (
    <div className="relative flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 pl-9 pr-9"
        aria-label="Search listings"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
