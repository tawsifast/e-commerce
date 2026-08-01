"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart, Minus, Plus, Star, Truck, ShieldCheck } from "lucide-react";
import { useState } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import toast from "react-hot-toast";
import { getApiErrorMessage, ProductsAPI, WishlistAPI, type ReviewItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { formatDate, formatPrice, isNewProduct } from "@/lib/format";

export function ProductDetail({ id }: { id: string }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const router = useRouter();
  const qc = useQueryClient();

  const productQ = useQuery({ queryKey: ["product", id], queryFn: () => ProductsAPI.get(id) });
  const reviewsQ = useQuery({ queryKey: ["reviews", id], queryFn: () => ProductsAPI.reviews(id) });

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const addWish = useMutation({
    mutationFn: () => WishlistAPI.add(id),
    onSuccess: () => toast.success("Added to wishlist"),
    onError: (e) => toast.error(getApiErrorMessage(e, "Couldn't add to wishlist")),
  });

  const addReview = useMutation({
    mutationFn: () => ProductsAPI.addReview(id, { rating, comment }),
    onSuccess: () => {
      toast.success("Review posted");
      setComment("");
      setRating(5);
      qc.invalidateQueries({ queryKey: ["reviews", id] });
      qc.invalidateQueries({ queryKey: ["product", id] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Couldn't post review")),
  });

  if (productQ.isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
        <div className="space-y-4">
          <div className="h-8 w-2/3 animate-pulse rounded bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
          <div className="h-24 w-full animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (productQ.isError || !productQ.data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-serif text-3xl">Product not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This product may have been removed.</p>
        <Link href="/products" className="mt-6 inline-block"><Button variant="outline">Back to shop</Button></Link>
      </div>
    );
  }

  const p = productQ.data;
  const hasDiscount = p.discountPrice != null && p.discountPrice < p.price;
  const finalPrice = hasDiscount && p.discountPrice != null ? p.discountPrice : p.price;
  const seller = typeof p.seller === "object" ? p.seller : null;

  const buyNow = () => {
    addItem(p, qty);
    router.push("/checkout");
  };

  const requireAuth = (action: () => void) => {
    if (!user) {
      toast.error("Please sign in first");
      router.push("/login");
      return;
    }
    action();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Images */}
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-muted"
          >
            {p.images?.[activeImg] && (
              <Zoom>
                <img src={p.images[activeImg]} alt={p.title} className="h-full w-full object-cover" />
              </Zoom>
            )}
            <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
              {isNewProduct(p.createdAt) && <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary-foreground">New</span>}
              {hasDiscount && <span className="rounded-full bg-gradient-gold px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold-foreground shadow-gold">Sale</span>}
            </div>
          </motion.div>
          {(p.images?.length ?? 0) > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {(p.images ?? []).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-square overflow-hidden rounded-md border-2 ${i === activeImg ? "border-primary" : "border-transparent"}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{p.brand} · {p.category}</span>
          <h1 className="mt-2 font-serif text-4xl leading-tight text-balance">{p.title}</h1>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className={`h-4 w-4 ${s < Math.round(p.averageRating ?? 0) ? "fill-gold text-gold" : "text-muted"}`} />
              ))}
              <span className="ml-1 text-sm font-medium">{(p.averageRating ?? 0).toFixed(1)}</span>
            </div>
            <span className="text-sm text-muted-foreground">· {p.reviewCount ?? 0} reviews</span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-serif text-4xl">{formatPrice(finalPrice)}</span>
            {hasDiscount && <span className="text-lg text-muted-foreground line-through">{formatPrice(p.price)}</span>}
          </div>

          <p className="mt-6 whitespace-pre-line leading-relaxed text-foreground/80">{p.description}</p>

          {p.specifications && Object.keys(p.specifications).length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-2 text-sm">
              {Object.entries(p.specifications).map(([k, v]) => (
                <div key={k} className="rounded-md bg-surface px-3 py-2">
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt>
                  <dd className="text-foreground">{String(v)}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-8 flex items-center gap-3">
            <div className="inline-flex items-center rounded-lg border border-border">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="grid h-11 w-11 place-items-center hover:bg-accent"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center text-sm font-medium">{qty}</span>
              <button onClick={() => setQty(Math.min(p.stock, qty + 1))} className="grid h-11 w-11 place-items-center hover:bg-accent"><Plus className="h-4 w-4" /></button>
            </div>
            <span className="text-xs text-muted-foreground">{p.stock} in stock</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => requireAuth(() => addItem(p, qty))} disabled={p.stock === 0} className="flex-1 bg-gradient-hero text-primary-foreground hover:opacity-90">
              Add to bag
            </Button>
            <Button onClick={() => requireAuth(buyNow)} disabled={p.stock === 0} variant="outline" className="flex-1 border-primary text-primary">
              Buy now
            </Button>
            <Button onClick={() => requireAuth(() => addWish.mutate())} variant="outline" size="icon" aria-label="Wishlist">
              <Heart className="h-4 w-4" />
            </Button>
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
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-medium">Share your experience</p>
            <div className="mt-3 flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} onClick={() => setRating(i + 1)}>
                  <Star className={`h-6 w-6 ${i < rating ? "fill-gold text-gold" : "text-muted"}`} />
                </button>
              ))}
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Only verified buyers can post — your review will be checked against your order history."
              className="mt-3"
              rows={3}
            />
            <Button
              onClick={() => addReview.mutate()}
              disabled={!comment.trim() || addReview.isPending}
              className="mt-3 bg-gradient-hero text-primary-foreground hover:opacity-90"
            >
              {addReview.isPending ? "Posting…" : "Post review"}
            </Button>
          </div>
        )}

        <div className="mt-6 divide-y divide-border">
          {reviewsQ.isLoading ? (
            <div className="py-6 text-sm text-muted-foreground">Loading reviews…</div>
          ) : (reviewsQ.data ?? []).length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground">No reviews yet. Be the first.</div>
          ) : (
            (reviewsQ.data ?? []).map((r) => (
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
