import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";
import { API_BASE_URL, serverAPI } from "@/lib/server-api";
import type { ProductListResponse } from "@/lib/server-api";
import { groupCategories } from "@/lib/categories";
import { ProductCard } from "@/components/site/ProductCard";
import { Reveal } from "@/components/site/Reveal";
import { ProductsToolbar } from "@/components/products/ProductsToolbar";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "All products — Marketa",
  description: "Browse every product listed on Marketa.",
};

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

function hrefFor(search: SearchParams, page = search.page ?? 1) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(search)) {
    if (v === undefined || v === null || v === "") continue;
    if (k === "page") continue;
    params.set(k, String(v));
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/products?${qs}` : "/products";
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw: Record<string, string> = {};
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") raw[k] = v;
  }
  const parsed = searchSchema.safeParse(raw);
  const search: SearchParams = parsed.success ? parsed.data : { page: 1 };

  let list: ProductListResponse = { items: [], total: 0, page: 1, pages: 1 };
  let categories: Awaited<ReturnType<typeof serverAPI.categories>> = [];
  let error = false;
  try {
    const [l, c] = await Promise.all([
      serverAPI.products({ ...search, limit: 12 }),
      serverAPI.categories(),
    ]);
    list = l;
    categories = c;
  } catch {
    error = true;
  }
  const groups = groupCategories(categories);

  const pageNumbers = (() => {
    const total = list.pages;
    const cur = list.page;
    const start = Math.max(1, cur - 2);
    const end = Math.min(total, start + 4);
    const out: number[] = [];
    for (let i = start; i <= end; i++) out.push(i);
    return out;
  })();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Reveal y={15}>
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Shop</span>
        <h1 className="mt-2 font-serif text-5xl">All products</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {error ? 0 : list.total} results {search.category ? `in ${search.category}` : ""}
        </p>
      </Reveal>

      <div className="mt-8">
        <ProductsToolbar initial={search} groups={groups}>
          {error ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-8 text-center text-sm text-destructive">
              Couldn&apos;t load products. Check your API is running at <code>{API_BASE_URL}</code>.
            </div>
          ) : list.items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-16 text-center">
              <p className="font-serif text-2xl">No products found</p>
              <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters or search.</p>
              <Link href="/products" className="mt-4 inline-block">
                <Button variant="outline">Clear filters</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
                {list.items.map((p, i) => (
                  <ProductCard key={p._id} product={p} index={i} />
                ))}
              </div>

              {list.pages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  <Link
                    href={hrefFor(search, list.page - 1)}
                    aria-disabled={list.page <= 1}
                    className={`rounded-md border border-border px-4 py-2 text-sm ${list.page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-accent"}`}
                  >
                    Previous
                  </Link>
                  {pageNumbers.map((p) => (
                    <Link
                      key={p}
                      href={hrefFor(search, p)}
                      className={`flex h-9 w-9 items-center justify-center rounded-md border border-border text-sm ${list.page === p ? "border-transparent bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                    >
                      {p}
                    </Link>
                  ))}
                  <Link
                    href={hrefFor(search, list.page + 1)}
                    aria-disabled={list.page >= list.pages}
                    className={`rounded-md border border-border px-4 py-2 text-sm ${list.page >= list.pages ? "pointer-events-none opacity-50" : "hover:bg-accent"}`}
                  >
                    Next
                  </Link>
                </div>
              )}
            </>
          )}
        </ProductsToolbar>
      </div>
    </div>
  );
}