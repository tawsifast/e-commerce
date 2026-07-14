"use client";
import { Link } from "@/lib/router-compat";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { formatPrice, isNewProduct } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";

export function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart();
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const isNew = isNewProduct(product.createdAt);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.4) }}
      className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant"
    >
      <Link to="/products/$id" params={{ id: product._id }} className="relative block aspect-square overflow-hidden bg-muted">
        {product.images?.[0] && (
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {isNew && <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">New</span>}
          {hasDiscount && <span className="rounded-full bg-gradient-gold px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold-foreground shadow-gold">Sale</span>}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-muted-foreground">
          <span>{product.brand}</span>
          <span>{product.category}</span>
        </div>

        <Link to="/products/$id" params={{ id: product._id }} className="line-clamp-2 min-h-[2.5rem] font-medium leading-snug hover:underline">
          {product.title}
        </Link>

        {(product.averageRating ?? 0) > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-gold text-gold" />
            <span>{product.averageRating?.toFixed(1)}</span>
            <span>({product.reviewCount ?? 0})</span>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            {hasDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-xl">{formatPrice(product.discountPrice)}</span>
                <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
              </div>
            ) : (
              <span className="font-serif text-xl">{formatPrice(product.price)}</span>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => { e.preventDefault(); addItem(product); }}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? "Sold out" : "Add"}
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card">
      <div className="aspect-square animate-pulse bg-muted" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}