"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import {
  Heart,
  Package,
  User as UserIcon,
  MapPin,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Trash2,
  ShoppingBag,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { API_BASE_URL, cancelOrder, getApiErrorMessage, getMyOrders, getWishlist, removeFromWishlist } from "@/lib/api";
import type { OrdersPage, OrderDoc } from "@/lib/server-api";
import { authClient } from "@/lib/auth-client";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatPrice } from "@/lib/format";
import type { Product, User } from "@/lib/types";

const TABS = [
  { id: "orders", label: "My Orders", icon: Package },
  { id: "wishlist", label: "Wishlist", icon: UserIcon },
  { id: "profile", label: "Profile", icon: UserIcon },
];

export function BuyerDashboard({
  user,
  initialOrders,
  initialWishlist,
}: {
  user: User;
  initialOrders: OrdersPage | null;
  initialWishlist: Product[];
}) {
  const [tab, setTab] = useState("orders");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Buyer dashboard</span>
        <h1 className="mt-2 font-serif text-5xl">Hello, {user.name.split(" ")[0]}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Track orders, manage your wishlist and profile.</p>
      </motion.div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar tabs */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="flex overflow-x-auto rounded-xl border border-border bg-card p-2 lg:flex-col lg:overflow-visible">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <Button
                  key={t.id}
                  variant="ghost"
                  onClick={() => setTab(t.id)}
                  className={`h-auto shrink-0 justify-start gap-2.5 rounded-lg px-3 py-2.5 text-left lg:w-full ${
                    active ? "bg-gradient-hero text-primary-foreground shadow-sm" : "text-foreground/70 hover:bg-accent! hover:text-foreground/70!"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{t.label}</span>
                </Button>
              );
            })}
          </div>
        </aside>

        <section>
          {tab === "orders" && <OrdersTab initialPage={initialOrders} />}
          {tab === "wishlist" && <WishlistTab initialItems={initialWishlist} />}
          {tab === "profile" && <ProfileTab user={user} />}
        </section>
      </div>
    </div>
  );
}

// -------------------- Orders --------------------

export const ORDER_STATUS_META = {
  pending: { label: "Pending", icon: Clock, className: "bg-muted text-foreground/70" },
  processing: { label: "Processing", icon: RefreshCw, className: "bg-primary/10 text-primary" },
  shipped: { label: "Shipped", icon: Truck, className: "bg-gold/15 text-gold-foreground" },
  delivered: { label: "Delivered", icon: CheckCircle2, className: "bg-success/15 text-success" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-destructive/10 text-destructive" },
};

function OrdersTab({ initialPage }: { initialPage: OrdersPage | null }) {
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<OrdersPage | null>(initialPage);
  const [loading, setLoading] = useState(initialPage === null);
  const [error, setError] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getMyOrders(page, 8)
      .then((data) => {
        if (cancelled) return;
        setOrders(data as OrdersPage);
        setLoading(false);
        setError(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
        setError(true);
      });
    return () => { cancelled = true; };
  }, [page, initialPage]);

  const cancel = async (orderId: string) => {
    setCancellingId(orderId);
    try {
      await cancelOrder(orderId);
      toast.success("Order cancelled");
      const data = await getMyOrders(page, 8);
      setOrders(data as OrdersPage);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Couldn't cancel order"));
    } finally {
      setCancellingId(null);
    }
  };

  if (loading && !orders) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (error && !orders) {
    return (
      <EmptyState
        icon={XCircle}
        title="Couldn't load your orders"
        body={`Make sure your API is running at ${API_BASE_URL}.`}
      />
    );
  }

  const items: OrderDoc[] = orders?.items ?? [];
  const pages = orders?.pages ?? 1;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No orders yet"
        body="When you place an order it will appear here."
        cta={<Link href="/products"><Button className="bg-gradient-hero text-primary-foreground hover:opacity-90">Browse products</Button></Link>}
      />
    );
  }

  return (
    <div className="space-y-4">
      {error && orders && <p className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-center text-xs text-destructive">Couldn&apos;t refresh — showing previous results.</p>}
      {items.map((order, idx) => {
        const meta = ORDER_STATUS_META[order.orderStatus as keyof typeof ORDER_STATUS_META] ?? ORDER_STATUS_META.pending;
        const StatusIcon = meta.icon;
        return (
          <motion.article
            key={order._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(idx * 0.04, 0.3) }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Order #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="mt-1 text-sm text-foreground">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.className}`}>
                  <StatusIcon className="h-3.5 w-3.5" /> {meta.label}
                </span>
                <span className="font-serif text-xl">{formatPrice(order.totalAmount)}</span>
              </div>
            </header>

            <ul className="mt-4 space-y-3">
              {order.items.map((it, i) => (
                <li key={i} className="flex gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                    {it.image && <img src={it.image} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="flex flex-1 items-center justify-between text-sm">
                    <div>
                      <p className="line-clamp-1 font-medium">{it.title}</p>
                      <p className="text-xs text-muted-foreground">Qty {it.quantity} · {formatPrice(it.price)}</p>
                    </div>
                    <span className="text-sm font-medium">{formatPrice(it.price * it.quantity)}</span>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {order.address.line1}, {order.address.city}, {order.address.country}
              </div>
              <div className="flex items-center gap-2">
                <span>
                  Payment: <strong className="text-foreground">{order.paymentStatus}</strong>
                </span>
                {(order.orderStatus === "pending" || order.orderStatus === "processing") && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cancellingId !== null}
                    onClick={() => cancel(order._id)}
                  >
                    Cancel order
                  </Button>
                )}
              </div>
            </footer>
          </motion.article>
        );
      })}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pages}
          </span>
          <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

// -------------------- Wishlist --------------------

function WishlistTab({ initialItems }: { initialItems: Product[] }) {
  const { addItem } = useCart();
  const [items, setItems] = useState<Product[]>(initialItems);
  const [error, setError] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getWishlist()
      .then((data) => {
        if (cancelled) return;
        setItems(data);
        setError(false);
      })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, []);

  const remove = async (productId: string) => {
    setRemovingId(productId);
    try {
      await removeFromWishlist(productId);
      toast.success("Removed from wishlist");
      setItems((prev) => prev.filter((p) => p._id !== productId));
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Couldn't remove"));
    } finally {
      setRemovingId(null);
    }
  };

  if (error && items.length === 0) {
    return (
      <EmptyState
        icon={XCircle}
        title="Couldn't load your wishlist"
        body={`Make sure your API is running at ${API_BASE_URL}.`}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        body="Save products you love — they'll wait here for you."
        cta={<Link href="/products"><Button className="bg-gradient-hero text-primary-foreground hover:opacity-90">Discover products</Button></Link>}
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((p, i) => (
        <motion.article
          key={p._id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
          className="flex gap-4 rounded-xl border border-border bg-card p-4"
        >
          <Link href={`/products/${p._id}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
            {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />}
          </Link>
          <div className="flex flex-1 flex-col">
            <div className="flex items-start justify-between gap-2">
              <Link href={`/products/${p._id}`} className="line-clamp-2 text-sm font-medium hover:underline">
                {p.title}
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => remove(p._id)}
                disabled={removingId !== null}
                className="text-muted-foreground hover:bg-transparent hover:text-destructive!"
                aria-label="Remove from wishlist"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{p.brand}</p>
            <div className="mt-auto flex items-end justify-between pt-3">
              <span className="font-serif text-lg">{formatPrice(p.discountPrice ?? p.price)}</span>
              <Button
                size="sm"
                onClick={() => addItem(p, 1)}
                disabled={p.stock === 0}
                className="bg-gradient-hero text-primary-foreground hover:opacity-90"
              >
                {p.stock === 0 ? "Sold out" : "Add to bag"}
              </Button>
            </div>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

// -------------------- Profile --------------------

function ProfileTab({ user }: { user: User }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: user.name, email: user.email, photo: user.photo ?? "" });
  const [pwd, setPwd] = useState({ currentPassword: "", newPassword: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const { error } = await authClient.updateUser({
        name: form.name,
        image: form.photo || undefined,
      });
      if (error) throw new Error(error.message);
      toast.success("Profile updated");
      router.refresh();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Couldn't save profile"));
    } finally {
      setSavingProfile(false);
    }
  };

  const changePwd = async () => {
    setSavingPwd(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword: pwd.currentPassword,
        newPassword: pwd.newPassword,
      });
      if (error) throw new Error(error.message);
      toast.success("Password updated");
      setPwd({ currentPassword: "", newPassword: "" });
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Couldn't change password"));
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => { e.preventDefault(); saveProfile(); }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <h2 className="font-serif text-2xl">Personal details</h2>
        <p className="mt-1 text-sm text-muted-foreground">Update how you appear across Marketa.</p>

        <div className="mt-6 flex items-center gap-4">
          {form.photo ? (
            <img src={form.photo} alt={form.name} className="h-16 w-16 rounded-full object-cover ring-2 ring-border" />
          ) : (
            <div className="grid h-16 w-16 place-items-center rounded-full bg-gradient-hero text-lg font-semibold text-primary-foreground">
              {form.name?.[0]?.toUpperCase() ?? "U"}
            </div>
          )}
          <div className="flex-1">
            <Label htmlFor="photo">Photo URL</Label>
            <Input id="photo" type="url" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} placeholder="https://…" className="mt-1.5" />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} readOnly disabled className="mt-1.5" />
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit" disabled={savingProfile} className="bg-gradient-hero text-primary-foreground hover:opacity-90">
            {savingProfile ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (pwd.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters");
            return;
          }
          changePwd();
        }}
        className="rounded-xl border border-border bg-card p-6"
      >
        <h2 className="font-serif text-2xl">Change password</h2>
        <p className="mt-1 text-sm text-muted-foreground">Rotate your password regularly for better security.</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="cur">Current password</Label>
            <Input id="cur" type="password" value={pwd.currentPassword} onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="new">New password</Label>
            <Input id="new" type="password" value={pwd.newPassword} onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })} className="mt-1.5" />
          </div>
        </div>

        <div className="mt-6">
          <Button type="submit" disabled={savingPwd || !pwd.currentPassword || !pwd.newPassword} variant="outline">
            {savingPwd ? "Updating…" : "Update password"}
          </Button>
        </div>
      </form>

      <div className="rounded-xl border border-border bg-surface p-6">
        <h3 className="font-serif text-xl">Account role</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;re currently a <strong className="capitalize text-foreground">{user.role}</strong>.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Want to sell your own products? An admin can promote you to seller in the admin panel.
        </p>
      </div>
    </div>
  );
}

// -------------------- Shared --------------------

function EmptyState({ icon: Icon, title, body, cta }: { icon: LucideIcon; title: string; body: string; cta?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-serif text-2xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
      {cta && <div className="mt-6 flex justify-center">{cta}</div>}
    </div>
  );
}