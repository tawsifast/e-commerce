import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, Lock } from "lucide-react";
import { z } from "zod";
import { getApiErrorMessage, OrdersAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/format";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Marketa" },
      { name: "description", content: "Complete your Marketa purchase securely." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  line1: z.string().min(3, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().optional(),
  zip: z.string().min(3, "ZIP required"),
  country: z.string().min(2, "Country required"),
  contact: z.string().min(6, "Contact number required"),
  notes: z.string().optional(),
});

function CheckoutPage() {
  const { user, loading } = useAuth();
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please sign in to checkout");
      void navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  const [form, setForm] = useState({ line1: "", city: "", state: "", zip: "", country: "United States", contact: "", notes: "" });
  const [errors, setErrors] = useState({});

  const checkout = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) {
        const errs = {};
        parsed.error.issues.forEach((i) => { errs[i.path[0]] = i.message; });
        setErrors(errs);
        throw new Error("Please fix the highlighted fields");
      }
      setErrors({});
      const res = await OrdersAPI.create({
        items: items.map((i) => ({ product: i.productId, quantity: i.quantity })),
        address: { line1: form.line1, city: form.city, state: form.state, zip: form.zip, country: form.country },
        contact: form.contact,
        notes: form.notes || undefined,
      });
      // NOTE: Real Stripe integration happens on your server — this UI expects a `clientSecret`
      // returned from POST /orders/checkout. Wire Stripe.js on your end and confirm with:
      //   await OrdersAPI.confirm(res.orderId, paymentIntentId)
      return res;
    },
    onSuccess: () => {
      toast.success("Order placed successfully");
      clear();
      setDone(true);
    },
    onError: (e) => toast.error(getApiErrorMessage(e, "Checkout failed")),
  });

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="h-9 w-9" />
        </div>
        <h1 className="mt-6 font-serif text-5xl">Thank you</h1>
        <p className="mt-3 text-sm text-muted-foreground">Your order is confirmed. We've sent details to your email.</p>
        <div className="mt-8 flex justify-center gap-2">
          <Link to="/dashboard/buyer"><Button variant="outline">View my orders</Button></Link>
          <Link to="/products"><Button className="bg-gradient-hero text-primary-foreground hover:opacity-90">Keep shopping</Button></Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="font-serif text-4xl">Nothing to check out</h1>
        <p className="mt-2 text-sm text-muted-foreground">Add something to your bag first.</p>
        <Link to="/products" className="mt-6 inline-block"><Button>Browse products</Button></Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-serif text-5xl">Checkout</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
        <form
          onSubmit={(e) => { e.preventDefault(); checkout.mutate(); }}
          className="space-y-6 rounded-xl border border-border bg-card p-6 sm:p-8"
        >
          <div>
            <h2 className="font-serif text-2xl">Delivery</h2>
            <div className="mt-4 grid gap-4">
              <Field label="Street address" error={errors.line1}>
                <Input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="123 Main St, Apt 4" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" error={errors.city}>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </Field>
                <Field label="State / Region">
                  <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="ZIP / Postal code" error={errors.zip}>
                  <Input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
                </Field>
                <Field label="Country" error={errors.country}>
                  <Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
                </Field>
              </div>
              <Field label="Contact number" error={errors.contact}>
                <Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="+1 555 000 0000" />
              </Field>
              <Field label="Additional notes (optional)">
                <Textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Leave at the front desk, etc." />
              </Field>
            </div>
          </div>

          <div>
            <h2 className="font-serif text-2xl">Payment</h2>
            <div className="mt-4 rounded-lg border border-dashed border-border bg-surface p-5 text-sm text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 text-foreground">
                <Lock className="h-4 w-4" /> <span className="font-medium">Secure Stripe checkout</span>
              </div>
              Stripe Elements will render here after you wire <code className="rounded bg-background px-1.5 py-0.5">POST /orders/checkout</code> on your server to return a Stripe <code className="rounded bg-background px-1.5 py-0.5">clientSecret</code>.
            </div>
          </div>

          <Button
            type="submit"
            disabled={checkout.isPending}
            className="h-12 w-full bg-gradient-hero text-primary-foreground hover:opacity-90"
          >
            {checkout.isPending ? "Placing order…" : `Place order · ${formatPrice(subtotal)}`}
          </Button>
        </form>

        <aside className="h-fit rounded-xl border border-border bg-card p-6">
          <h2 className="font-serif text-2xl">Order summary</h2>
          <ul className="mt-4 divide-y divide-border">
            {items.map((i) => (
              <li key={i.productId} className="flex gap-3 py-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-muted">
                  {i.image && <img src={i.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="flex flex-1 flex-col justify-between text-sm">
                  <p className="line-clamp-1 font-medium">{i.title}</p>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Qty {i.quantity}</span>
                    <span>{formatPrice(i.price * i.quantity)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
            <span className="text-sm">Total</span>
            <span className="font-serif text-2xl">{formatPrice(subtotal)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
