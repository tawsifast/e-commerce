"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

export function CartDrawer() {
  const { drawerOpen, closeDrawer, items, updateQty, removeItem, subtotal, count } = useCart();
  const router = useRouter();

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm"
            onClick={closeDrawer}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-elegant"
          >
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="font-serif text-2xl">Your bag</h2>
                <p className="text-xs text-muted-foreground">{count} item{count === 1 ? "" : "s"}</p>
              </div>
              <button onClick={closeDrawer} className="grid h-9 w-9 place-items-center rounded-full hover:bg-accent" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-accent">
                  <ShoppingBag className="h-7 w-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">Your bag is empty</p>
                  <p className="mt-1 text-sm text-muted-foreground">Discover pieces you&apos;ll love.</p>
                </div>
                <Button onClick={() => { closeDrawer(); router.push("/products"); }} className="bg-gradient-hero text-primary-foreground hover:opacity-90">
                  Browse products
                </Button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <ul className="divide-y divide-border">
                    {items.map((item) => (
                      <li key={item.productId} className="flex gap-4 py-4">
                        <Link
                          href={`/products/${item.productId}`}
                          onClick={closeDrawer}
                          className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted"
                        >
                          {item.image && <img src={item.image} alt={item.title} className="h-full w-full object-cover" />}
                        </Link>
                        <div className="flex flex-1 flex-col gap-1">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/products/${item.productId}`}
                              onClick={closeDrawer}
                              className="line-clamp-2 text-sm font-medium hover:underline"
                            >
                              {item.title}
                            </Link>
                            <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="inline-flex items-center rounded-md border border-border">
                              <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="grid h-8 w-8 place-items-center hover:bg-accent" aria-label="Decrease">
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-8 text-center text-sm">{item.quantity}</span>
                              <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="grid h-8 w-8 place-items-center hover:bg-accent" aria-label="Increase">
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-border bg-surface px-6 py-5">
                  <div className="mb-4 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-serif text-2xl">{formatPrice(subtotal)}</span>
                  </div>
                  <p className="mb-4 text-xs text-muted-foreground">Shipping and taxes calculated at checkout.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => { closeDrawer(); router.push("/cart"); }}>
                      View bag
                    </Button>
                    <Button className="flex-1 bg-gradient-hero text-primary-foreground hover:opacity-90" onClick={() => { closeDrawer(); router.push("/checkout"); }}>
                      Checkout
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
