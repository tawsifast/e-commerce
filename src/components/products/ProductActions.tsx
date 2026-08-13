"use client";

import { useRouter } from "next/navigation";
import { Heart, Minus, Plus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage, WishlistAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import type { Product, User } from "@/lib/types";

export function ProductActions({ product, user }: { product: Product; user: User | null }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [wishPending, setWishPending] = useState(false);

  const addWish = async () => {
    setWishPending(true);
    try {
      await WishlistAPI.add(product._id);
      toast.success("Added to wishlist");
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Couldn't add to wishlist"));
    } finally {
      setWishPending(false);
    }
  };

  const requireAuth = (action: () => void) => {
    if (!user) {
      toast.error("Please sign in first");
      router.push("/login");
      return;
    }
    action();
  };

  const buyNow = () => {
    addItem(product, qty);
    router.push("/checkout");
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center rounded-lg border border-border">
          <Button variant="ghost" size="icon" onClick={() => setQty(Math.max(1, qty - 1))} className="h-11 w-11 rounded-none hover:bg-accent!"><Minus className="h-4 w-4" /></Button>
          <span className="w-10 text-center text-sm font-medium">{qty}</span>
          <Button variant="ghost" size="icon" onClick={() => setQty(Math.min(product.stock, qty + 1))} className="h-11 w-11 rounded-none hover:bg-accent!"><Plus className="h-4 w-4" /></Button>
        </div>
        <span className="text-xs text-muted-foreground">{product.stock} in stock</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => requireAuth(() => addItem(product, qty))} disabled={product.stock === 0} className="flex-1 bg-gradient-hero text-primary-foreground hover:opacity-90">
          Add to bag
        </Button>
        <Button onClick={() => requireAuth(buyNow)} disabled={product.stock === 0} variant="outline" className="flex-1 border-primary text-primary">
          Buy now
        </Button>
        <Button onClick={() => requireAuth(addWish)} variant="outline" size="icon" aria-label="Wishlist" disabled={wishPending}>
          <Heart className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}