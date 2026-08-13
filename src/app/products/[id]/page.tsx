import type { Metadata } from "next";
import Link from "next/link";
import { Star, Truck, ShieldCheck } from "lucide-react";
import { serverAPI } from "@/lib/server-api";
import { getSessionUser } from "@/lib/auth";
import { formatDate, formatPrice, isNewProduct } from "@/lib/format";
import { Gallery } from "@/components/products/Gallery";
import { ProductActions } from "@/components/products/ProductActions";
import { ReviewForm } from "@/components/products/ReviewForm";
import { Button } from "@/components/ui/button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await serverAPI.product(id);
    return {
      title: `${product.title} — Marketa`,
      description: product.description ?? `Shop ${product.title} on Marketa.`,
      robots: { index: true, follow: true },
    };
  } catch {
    return { title: "Product — Marketa", description: "Product details on Marketa." };
  }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getSessionUser();

  let product: Awaited<ReturnType<typeof serverAPI.product>> | null = null;
  let reviews: Awaited<ReturnType<typeof serverAPI.reviews>> = [];
  try {
    [product, reviews] = await Promise.all([
      serverAPI.product(id),
      serverAPI.reviews(id),
    ]);
  } catch {
    product = null;
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-serif text-3xl">Product not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This product may have been removed, or the API is unavailable.
        </p>
        <Link href="/products" className="mt-6 inline-block">
          <Button variant="outline">Back to shop</Button>
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const finalPrice = hasDiscount && product.discountPrice != null ? product.discountPrice : product.price;
  const seller = typeof product.seller === "object" ? product.seller : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <div>
          <Gallery images={product.images ?? []} title={product.title}>
            <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
              {isNewProduct(product.createdAt) && (
                <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">New</span>
              )}
              {hasDiscount && (
                <span className="rounded-full bg-gradient-gold px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold-foreground shadow-gold">Sale</span>
              )}
            </div>
          </Gallery>
        </div>

        {/* Info */}
        <div>
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{product.brand} · {product.category}</span>
          <h1 className="mt-2 font-serif text-4xl leading-tight text-balance">{product.title}</h1>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className={`h-4 w-4 ${s < Math.round(product.averageRating ?? 0) ? "fill-gold text-gold" : "text-muted"}`} />
              ))}
              <span className="ml-1 text-sm font-medium">{(product.averageRating ?? 0).toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground">· {product.reviewCount ?? 0} reviews</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-serif text-4xl">{formatPrice(finalPrice)}</span>
            {hasDiscount && <span className="text-lg text-muted-foreground line-through">{formatPrice(product.price)}</span>}
          </div>

          <p className="mt-6 whitespace-pre-line leading-relaxed text-foreground/80">{product.description}</p>

          {product.specifications && Object.keys(product.specifications).length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-2 text-sm">
              {Object.entries(product.specifications).map(([k, v]) => (
                <div key={k} className="rounded-md bg-surface px-3 py-2">
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
                  <dd className="text-foreground">{String(v)}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-8">
            <ProductActions product={product} user={user} />
          </div>

          {seller && (
            <div className="mt-8 flex items-center gap-3 rounded-xl border border-border bg-surface p-4">
              {seller.photo ? (
                <img src={seller.photo} alt={seller.name} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{seller.name[0]}</div>
              )}
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Sold by</p>
                <p className="text-sm font-medium">{seller.name}</p>
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"><Truck className="h-4 w-4" /> Ships in 48h</div>
            <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"><ShieldCheck className="h-4 w-4" /> Secure checkout</div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <h2 className="font-serif text-3xl">Reviews</h2>

        {user && (
          <div className="mt-6">
            <ReviewForm productId={id} />
          </div>
        )}

        <div className="mt-6 divide-y divide-border">
          {reviews.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground">No reviews yet. Be the first.</div>
          ) : (
            reviews.map((r) => (
              <article key={r._id} className="py-5">
                <div className="flex items-center gap-3">
                  {r.user.photo ? (
                    <img src={r.user.photo} alt={r.user.name} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-semibold">{r.user.name[0]}</div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{r.user.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                  </div>
                  <div className="ml-auto flex">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={`h-4 w-4 ${s < r.rating ? "fill-gold text-gold" : "text-muted"}`} />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground/85">{r.comment}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}