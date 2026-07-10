import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — Marketa" },
      { name: "description", content: "Review the items in your shopping bag on Marketa." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, updateQty, removeItem, subtotal, count, clear } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-serif text-5xl">Your bag is empty</h1>
        <p className="mt-3 text-sm text-muted-foreground">Time to find something worth keeping.</p>
        <Link to="/products" className="mt-6 inline-block">
          <Button className="bg-gradient-hero text-primary-foreground hover:opacity-90">Browse products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-5xl">Your bag</h1>
      <p className="mt-2 text-sm text-muted-foreground">{count} item{count === 1 ? "" : "s"}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <ul className="divide-y divide-border rounded-xl border border-border bg-card">
          {items.map((item) => (
            <li key={item.productId} className="flex gap-4 p-4 sm:gap-6 sm:p-6">
              <Link to="/products/$id" params={{ id: item.productId }} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:h-32 sm:w-32">
                {item.image && <img src={item.image} alt={item.title} className="h-full w-full object-cover" />}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link to="/products/$id" params={{ id: item.productId }} className="font-medium hover:underline">
                    {item.title}
                  </Link>
                  <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-destructive" aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="inline-flex items-center rounded-lg border border-border">
                    <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="grid h-9 w-9 place-items-center hover:bg-accent"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="grid h-9 w-9 place-items-center hover:bg-accent"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                  <span className="font-serif text-xl">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-xl border border-border bg-card p-6">
          <h2 className="font-serif text-2xl">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Items</dt><dd>{count}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>Calculated at checkout</dd></div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
            <span className="text-sm">Total</span>
            <span className="font-serif text-3xl">{formatPrice(subtotal)}</span>
          </div>
          <Link to="/checkout" className="mt-6 block">
            <Button className="w-full bg-gradient-hero text-primary-foreground hover:opacity-90">Proceed to checkout</Button>
          </Link>
          <button onClick={clear} className="mt-3 w-full text-xs text-muted-foreground hover:text-destructive">Clear bag</button>
        </aside>
      </div>
    </div>
  );
}
