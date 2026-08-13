"use client";

import { useRouter } from "next/navigation";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import type { CategoryGroup } from "@/lib/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface SearchParams {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price-asc" | "price-desc" | "rating";
  page?: number;
}

type SearchPatch = Partial<SearchParams>;

const ALL_CATEGORIES = "__all__";

export function ProductsToolbar({
  initial,
  groups,
  children,
}: {
  initial: SearchParams;
  groups: CategoryGroup[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState(initial.search ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const update = (patch: SearchPatch) => {
    const merged = { ...initial, ...patch };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v === undefined || v === null || v === "" || (k === "page" && v === 1)) {
        continue;
      }
      params.set(k, String(v));
    }
    const qs = params.toString();
    router.replace(qs ? `/products?${qs}` : "/products");
  };

  const clearFilters = () => router.replace("/products");

  const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    update({ search: searchInput || undefined });
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
        <form onSubmit={submitSearch} className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products…"
            className="w-full bg-transparent py-2 text-sm outline-none"
          />
          <Button size="sm" type="submit" variant="ghost">Go</Button>
        </form>
        <Button variant="outline" onClick={() => setFiltersOpen((s) => !s)} className="gap-2 px-3 md:hidden">
          <Filter className="h-4 w-4" /> Filters
        </Button>
        <Select value={initial.sort ?? "newest"} onValueChange={(v) => update({ sort: v as SearchParams["sort"] })}>
          <SelectTrigger className="w-[180px]"><SlidersHorizontal className="mr-2 h-4 w-4" /><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
            <SelectItem value="rating">Top rated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category pills */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button
          onClick={() => { setOpenGroup(null); update({ category: undefined, page: 1 }); }}
          className={`flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors hover:bg-accent ${!initial.category ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
        >
          <Filter className="h-4 w-4" />
          All categories
        </button>
        {groups.map((g) => {
          const isActive = !!initial.category && g.items.some((c) => c.name === initial.category);
          return (
            <Select
              key={g.group}
              items={g.items.map((c) => ({ label: c.name, value: c.name }))}
              value={isActive ? initial.category : null}
              open={openGroup === g.group}
              onOpenChange={(o) => setOpenGroup(o ? g.group : null)}
              onValueChange={(v) => { setOpenGroup(null); update({ category: v === ALL_CATEGORIES || v == null ? undefined : v, page: 1 }); }}
            >
              <SelectTrigger
                className={`h-8 rounded-full px-3 text-sm font-medium transition-colors hover:bg-accent ${isActive ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
              >
                <SelectValue placeholder={g.group} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATEGORIES}>All {g.group}</SelectItem>
                {g.items.map((c) => (
                  <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        })}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className={`${filtersOpen ? "block" : "hidden"} lg:block`}>
          <div className="sticky top-24 space-y-6 rounded-xl border border-border bg-card p-5">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider">Brand</h3>
              <Input
                key={initial.brand ? `brand-${initial.brand}` : "brand"}
                placeholder="e.g. Aesop"
                defaultValue={initial.brand ?? ""}
                onBlur={(e) => update({ brand: e.target.value.trim() || undefined })}
                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
              />
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider">Price range</h3>
              <div className="flex gap-2">
                <Input
                  key={initial.minPrice != null ? `min-${initial.minPrice}` : "min"}
                  type="number"
                  placeholder="Min"
                  defaultValue={initial.minPrice != null ? String(initial.minPrice) : ""}
                  onBlur={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                  onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                />
                <Input
                  key={initial.maxPrice != null ? `max-${initial.maxPrice}` : "max"}
                  type="number"
                  placeholder="Max"
                  defaultValue={initial.maxPrice != null ? String(initial.maxPrice) : ""}
                  onBlur={(e) => update({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                  onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                />
              </div>
            </div>

            <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
              <X className="mr-1 h-4 w-4" /> Clear filters
            </Button>
          </div>
        </aside>

        {/* Grid */}
        <div>{children}</div>
      </div>
    </>
  );
}