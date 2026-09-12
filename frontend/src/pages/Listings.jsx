import { useMemo, useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { getItems } from "@/api/items";
import { SearchBar } from "@/components/listings/SearchBar";
import { FilterPanel } from "@/components/listings/FilterPanel";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { Button } from "@/components/ui/Button";
import { useDebounce } from "@/hooks/useDebounce";

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 400);

  const filters = {
    listingType: searchParams.get("listingType") || "",
    category: searchParams.get("category") || "",
    condition: searchParams.get("condition") || "",
    available: searchParams.get("available") || "",
  };

  // Keep the URL in sync with the debounced search term.
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (debouncedSearch) next.set("search", debouncedSearch);
    else next.delete("search");
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const queryParams = { search: debouncedSearch, ...filters };

  const {
    data: items,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["items", queryParams],
    queryFn: () => getItems(queryParams),
  });

  // Fetch an unfiltered snapshot once to build the category dropdown from real data,
  // since the backend has no category-list endpoint.
  const { data: allItems } = useQuery({
    queryKey: ["items", "all-for-categories"],
    queryFn: () => getItems({}),
    staleTime: 5 * 60 * 1000,
  });

  const categories = useMemo(() => {
    const set = new Set((allItems || []).map((i) => i.category).filter(Boolean));
    return Array.from(set).sort();
  }, [allItems]);

  const handleFilterChange = useCallback(
    (patch) => {
      const next = new URLSearchParams(searchParams);
      Object.entries(patch).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  function handleClearFilters() {
    setSearch("");
    setSearchParams({}, { replace: true });
  }

  const hasActiveFilters = !!(search || filters.listingType || filters.category || filters.condition || filters.available);

  return (
    <div className="container-page py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900 sm:text-3xl">Browse listings</h1>
        <p className="mt-1 text-ink-500">Discover items shared by students on your campus.</p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <SearchBar value={search} onChange={setSearch} />
        <Button
          variant="secondary"
          onClick={() => setShowFilters((s) => !s)}
          className="shrink-0 sm:w-auto"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 h-2 w-2 rounded-full bg-brand-600" />
          )}
        </Button>
      </div>

      {showFilters && (
        <div className="mb-6 rounded-2xl border border-ink-200 bg-white p-4">
          <FilterPanel
            filters={filters}
            categories={categories}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      )}

      <p className="mb-4 text-sm text-ink-500">
        {isLoading ? "Loading…" : `${items?.length || 0} listing${items?.length === 1 ? "" : "s"} found`}
      </p>

      <ListingGrid
        items={items}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyAction={hasActiveFilters ? { label: "Clear filters" } : { label: "Create the first listing", href: "/listings/create" }}
        onEmptyAction={hasActiveFilters ? handleClearFilters : undefined}
      />
    </div>
  );
}
