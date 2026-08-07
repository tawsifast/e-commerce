"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { Suspense, useMemo, useState } from "react";
import { z } from "zod";
import { API_BASE_URL, ProductsAPI } from "@/lib/api";
import { groupCategories } from "@/lib/categories";
import { ProductCard, ProductCardSkeleton } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const searchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "rating"]).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
});

type SearchParams = z.infer<typeof searchSchema>;
type SearchPatch = Partial<SearchParams>;

const ALL_CATEGORIES = "__all__";

function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = useMemo(() => {
    const raw = Object.fromEntries(searchParams.entries());
    const parsed = searchSchema.safeParse(raw);
    return parsed.success ? parsed.data : ({} as z.infer<typeof searchSchema>);
  }, [searchParams]);

  const [searchInput, setSearchInput] = useState(search.search ?? "");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ["products", search],
    queryFn: () => ProductsAPI.list({ ...search, limit: 12 }),
    placeholderData: keepPreviousData,
  });

  const categories = useQuery({ queryKey: ["categories"], queryFn: () => ProductsAPI.categories() });
  const groups = groupCategories(categories.data ?? []);

  const update = (patch: SearchPatch) => {
    const params = new URLSearchParams(searchParams.toString());
    const merged = { ...search, ...patch };
    if (patch.page === undefined) params.delete("page");
    for (const [k, v] of Object.entries(merged)) {
      if (v === undefined || v === null || v === "" || (k === "page" && v === 1)) {
        params.delete(k);
      } else {
        params.set(k, String(v));
      }
    }
    const qs = params.toString();
    router.replace(qs ? `/products?${qs}` : "/products");
  };

  const clearFilters = () => router.replace("/products");

  const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    update({ search: searchInput || undefined });
  };

  const active = query.data ?? { items: [], total: 0, page: 1, pages: 1 };

  const pageNumbers = (() => {
    const total = active.pages;
    const cur = active.page;
    const start = Math.max(1, cur - 2);
    const end = Math.min(total, start + 4);
    const out: number[] = [];
    for (let i = start; i <= end; i++) out.push(i);
    return out;
  })();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Shop</span>
        <h1 className="mt-2 font-serif text-5xl">All products</h1>
        <p className="mt-2 text-sm text-muted-foreground">{active?.total ?? 0} results {search.category ? `in ${search.category}` : ""}</p>
      </motion.div>

      {/* Toolbar */}
      <div className="mt-8 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
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
        <Select value={search.sort ?? "newest"} onValueChange={(v) => update({ sort: v as SearchParams["sort"] })}>
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
          className={`flex h-8 items-center gap-1.5 rounded-full border px-3 text-sm font-medium transition-colors hover:bg-accent ${!search.category ? "border-primary bg-primary/10 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
        >
          <Filter className="h-4 w-4" />
          All categories
        </button>
        {groups.map((g) => {
          const isActive = !!search.category && g.items.some((c) => c.name === search.category);
          return (
            <Select
              key={g.group}
              items={g.items.map((c) => ({ label: c.name, value: c.name }))}
              value={isActive ? search.category : null}
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
                key={search.brand ? `brand-${search.brand}` : "brand"}
                placeholder="e.g. Aesop"
                defaultValue={search.brand ?? ""}
                onBlur={(e) => update({ brand: e.target.value.trim() || undefined })}
                onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
              />
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider">Price range</h3>
              <div className="flex gap-2">
                <Input
                  key={search.minPrice != null ? `min-${search.minPrice}` : "min"}
                  type="number"
                  placeholder="Min"
                  defaultValue={search.minPrice != null ? String(search.minPrice) : ""}
                  onBlur={(e) => update({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
                  onKeyDown={(e) => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                />
                <Input
                  key={search.maxPrice != null ? `max-${search.maxPrice}` : "max"}
                  type="number"
                  placeholder="Max"
                  defaultValue={search.maxPrice != null ? String(search.maxPrice) : ""}
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
        <div>
          {query.isLoading ? (
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : query.isError ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-8 text-center text-sm text-destructive">
              Couldn&apos;t load products. Check your API is running at <code>{API_BASE_URL}</code>.
            </div>
          ) : (active?.items.length ?? 0) === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
              <p className="font-serif text-2xl">No products found</p>
              <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or search.</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">Clear filters</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
                {active.items.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
              </div>

              {active.pages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={active.page <= 1}
                    onClick={() => update({ page: active.page - 1 })}
                  >
                    Previous
                  </Button>
                  {pageNumbers.map((p) => (
                    <Button
                      key={p}
                      variant="outline"
                      size="icon"
                      onClick={() => update({ page: p })}
                      className={`h-9 w-9 rounded-md ${active.page === p ? "bg-primary border-transparent text-primary-foreground" : "hover:bg-accent!"}`}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={active.page >= active.pages}
                    onClick={() => update({ page: active.page + 1 })}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8" />}>
      <ProductsPage />
    </Suspense>
  );
}
