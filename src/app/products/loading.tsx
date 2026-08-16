/**
 * Next.js route-segment loading UI for /products.
 * Automatically shown by the framework while the server component re-renders
 * (e.g. on every filter / sort / search change).
 */
import { ProductGridSkeleton, ResultsLoadingBar } from "@/components/products/ProductGridSkeleton";

export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Page header skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-12 animate-pulse rounded-full bg-muted" />
        <div className="h-10 w-48 animate-pulse rounded-xl bg-muted" />
        <div className="h-3 w-24 animate-pulse rounded-full bg-muted" />
      </div>

      <div className="mt-8">
        {/* Toolbar skeleton */}
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
          <div className="h-10 flex-1 animate-pulse rounded-lg bg-muted" />
          <div className="h-10 w-[180px] animate-pulse rounded-lg bg-muted" />
        </div>

        {/* Category pills skeleton */}
        <div className="mt-6 flex flex-wrap gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-8 animate-pulse rounded-full bg-muted"
              style={{ width: `${60 + (i % 3) * 20}px` }}
            />
          ))}
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar skeleton */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6 rounded-xl border border-border bg-card p-5">
              <div className="space-y-2">
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="flex gap-2">
                  <div className="h-10 flex-1 animate-pulse rounded-lg bg-muted" />
                  <div className="h-10 flex-1 animate-pulse rounded-lg bg-muted" />
                </div>
              </div>
              <div className="h-9 w-full animate-pulse rounded-lg bg-muted" />
            </div>
          </aside>

          {/* Product grid skeleton — 12 shimmer cards */}
          <div className="mb-5">
            <ResultsLoadingBar />
          </div>
          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  );
}
