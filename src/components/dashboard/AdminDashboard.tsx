"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Ban,
  BarChart3,
  DollarSign,
  Eye,
  EyeOff,
  Loader2,
  Package,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  API_BASE_URL,
  deleteAdminProduct,
  deleteAdminUser,
  getAdminOrders,
  getAdminOverview,
  getAdminProducts,
  getAdminUsers,
  getApiErrorMessage,
  toggleProductVisibility,
  toggleUserBlock,
  updateUserRole,
} from "@/lib/api";
import type { AdminOverview, AdminOrdersPage, AdminProductsPage, AdminUsersPage, AdminUser } from "@/lib/server-api";
import { ORDER_STATUS_META } from "./BuyerDashboard";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/format";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { User } from "@/lib/types";

const ROLE_VARIANTS: Record<string, string> = {
  buyer: "bg-muted text-muted-foreground",
  seller: "bg-primary/10 text-primary",
  admin: "bg-gold/15 text-gold-foreground",
};

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "users", label: "Users", icon: Users },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
];

const ROLES = ["buyer", "seller", "admin"];

export function AdminDashboard({
  user,
  initial,
}: {
  user: User;
  initial: {
    overview: AdminOverview | null;
    users: AdminUsersPage | null;
    products: AdminProductsPage | null;
    orders: AdminOrdersPage | null;
  };
}) {
  const [tab, setTab] = useState("overview");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Admin dashboard</span>
        <h1 className="mt-2 font-serif text-5xl">Store control room</h1>
        <p className="mt-2 text-sm text-muted-foreground">Signed in as {user.name} — manage the whole market.</p>
        <Link href="/dashboard/buyer" className="mt-4 inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline">
          My purchases &amp; wishlist →
        </Link>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="min-w-0 lg:sticky lg:top-24 lg:h-fit">
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

        <section className="min-w-0">
          {tab === "overview" && <OverviewTab initialOverview={initial.overview} />}
          {tab === "users" && <UsersTab initialPage={initial.users} />}
          {tab === "products" && <ProductsTab initialPage={initial.products} />}
          {tab === "orders" && <OrdersTab initialPage={initial.orders} />}
        </section>
      </div>
    </div>
  );
}

// -------------------- Overview --------------------

function OverviewTab({ initialOverview }: { initialOverview: AdminOverview | null }) {
  const [overview, setOverview] = useState<AdminOverview | null>(initialOverview);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAdminOverview()
      .then((data) => { if (!cancelled) setOverview(data as AdminOverview); })
      .catch(() => { if (!cancelled) setError(true); });
    return () => { cancelled = true; };
  }, []);

  const stats = [
    { label: "Gross merchandise value", value: formatPrice(overview?.gmv ?? 0), icon: DollarSign },
    { label: "Users", value: String(overview?.usersCount ?? 0), icon: Users },
    { label: "Sellers", value: String(overview?.sellersCount ?? 0), icon: UserCheck },
    { label: "Products live", value: String(overview?.productsCount ?? 0), icon: Package },
  ];

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Couldn&apos;t load stats — make sure your API is reachable at {API_BASE_URL}.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="mt-2 font-serif text-3xl">{value}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-5"
      >
        <h3 className="text-sm font-medium text-muted-foreground">Revenue over time</h3>
        <div className="mt-4 h-72">
          {overview?.revenueSeries?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overview.revenueSeries} margin={{ left: 0, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id="adminRevFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.6)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={56} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 13 }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#adminRevFill)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">No revenue data yet.</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// -------------------- Users --------------------

function UsersTab({ initialPage }: { initialPage: AdminUsersPage | null }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminUsersPage | null>(initialPage);
  const [loading, setLoading] = useState(initialPage === null);
  const [error, setError] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (page === 1 && initialPage) return;
    let cancelled = false;
    getAdminUsers({ page, limit: 15 })
      .then((d) => {
        if (cancelled) return;
        setData(d as AdminUsersPage);
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

  const goToPage = (p: number) => {
    if (p === page) return;
    if (!(p === 1 && initialPage)) setLoading(true);
    setPage(p);
  };

  const reload = async () => {
    const d = await getAdminUsers({ page, limit: 15 });
    setData(d as AdminUsersPage);
  };

  const setRole = async (id: string, role: string) => {
    setPendingId(id);
    try {
      await updateUserRole(id, role);
      toast.success("Role updated");
      await reload();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Couldn't update role"));
    } finally {
      setPendingId(null);
    }
  };

  const toggleBlock = async (id: string, blocked: boolean) => {
    setPendingId(id);
    try {
      await toggleUserBlock(id, blocked);
      toast.success("User updated");
      await reload();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Couldn't update user"));
    } finally {
      setPendingId(null);
    }
  };

  const del = async (id: string) => {
    setPendingId(id);
    try {
      await deleteAdminUser(id);
      toast.success("User deleted");
      await reload();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Couldn't delete user"));
    } finally {
      setPendingId(null);
    }
  };

  if (error && !data) {
    return <ApiError />;
  }

  const items: AdminUser[] = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  if (loading && items.length === 0) {
    return <SkeletonRows rows={6} />;
  }

  if (items.length === 0) {
    return <EmptyState icon={Users} title="No users found" body="When people sign up they'll appear here." />;
  }

  return (
    <div className="space-y-4">
      {error && data && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Couldn&apos;t refresh — showing the last loaded list.
        </div>
      )}
      <h2 className="font-serif text-2xl">Users</h2>

      {/* Pagination loading overlay */}
      <div className="relative">
        {loading && items.length > 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/70 backdrop-blur-[2px]">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <div className={loading && items.length > 0 ? "pointer-events-none" : ""}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-40 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((u) => (
            <TableRow key={u._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="relative grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-sm font-medium">
                    {u.photo ? <Image src={u.photo} alt="" fill sizes="36px" className="object-cover" /> : u.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${ROLE_VARIANTS[u.role] ?? "bg-muted text-muted-foreground"}`}>
                  {u.role}
                </span>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{u.createdAt ? formatDate(u.createdAt) : "—"}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${u.blocked ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                  {u.blocked ? <Ban className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                  {u.blocked ? "Blocked" : "Active"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1.5">
                  <Select value={u.role} onValueChange={(v) => v && setRole(u._id, v)} disabled={pendingId !== null}>
                    <SelectTrigger className="h-8 w-28 text-xs capitalize">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => (
                        <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    aria-label={u.blocked ? "Unblock user" : "Block user"}
                    disabled={pendingId !== null}
                    onClick={() => toggleBlock(u._id, !u.blocked)}
                  >
                    {u.blocked ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:bg-destructive/10! hover:text-destructive!"
                    aria-label="Delete user"
                    disabled={pendingId !== null}
                    onClick={() => {
                      if (confirm(`Delete user ${u.name}? This cannot be undone.`)) del(u._id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((u) => (
          <div key={u._id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-sm font-medium">
                {u.photo ? <Image src={u.photo} alt="" fill sizes="40px" className="object-cover" /> : u.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{u.name}</p>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${ROLE_VARIANTS[u.role] ?? "bg-muted text-muted-foreground"}`}>
                {u.role}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${u.blocked ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"}`}>
                  {u.blocked ? <Ban className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                  {u.blocked ? "Blocked" : "Active"}
                </span>
                <span className="text-xs text-muted-foreground">{u.createdAt ? formatDate(u.createdAt) : "—"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Select value={u.role} onValueChange={(v) => v && setRole(u._id, v)} disabled={pendingId !== null}>
                  <SelectTrigger className="h-8 w-28 text-xs capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  aria-label={u.blocked ? "Unblock user" : "Block user"}
                  disabled={pendingId !== null}
                  onClick={() => toggleBlock(u._id, !u.blocked)}
                >
                  {u.blocked ? <ShieldCheck className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:bg-destructive/10! hover:text-destructive!"
                  aria-label="Delete user"
                  disabled={pendingId !== null}
                  onClick={() => {
                    if (confirm(`Delete user ${u.name}? This cannot be undone.`)) del(u._id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>

      {totalPages > 1 && <Pager page={page} setPage={goToPage} totalPages={totalPages} />}
    </div>
  );
}

// -------------------- Products --------------------

function ProductsTab({ initialPage }: { initialPage: AdminProductsPage | null }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminProductsPage | null>(initialPage);
  const [loading, setLoading] = useState(initialPage === null);
  const [error, setError] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (page === 1 && initialPage) return;
    let cancelled = false;
    getAdminProducts({ page, limit: 15 })
      .then((d) => {
        if (cancelled) return;
        setData(d as AdminProductsPage);
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

  const goToPage = (p: number) => {
    if (p === page) return;
    if (!(p === 1 && initialPage)) setLoading(true);
    setPage(p);
  };

  const reload = async () => {
    const d = await getAdminProducts({ page, limit: 15 });
    setData(d as AdminProductsPage);
  };

  const toggleVisibility = async (id: string, hidden: boolean) => {
    setPendingId(id);
    try {
      await toggleProductVisibility(id, hidden);
      toast.success("Product updated");
      await reload();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Couldn't update product"));
    } finally {
      setPendingId(null);
    }
  };

  const del = async (id: string) => {
    setPendingId(id);
    try {
      await deleteAdminProduct(id);
      toast.success("Product deleted");
      await reload();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Couldn't delete product"));
    } finally {
      setPendingId(null);
    }
  };

  if (error && !data) {
    return <ApiError />;
  }

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  if (loading && items.length === 0) {
    return <SkeletonRows rows={6} />;
  }

  if (items.length === 0) {
    return <EmptyState icon={Package} title="No products yet" body="Products sellers list will show up here." />;
  }

  return (
    <div className="space-y-4">
      {error && data && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Couldn&apos;t refresh — showing the last loaded list.
        </div>
      )}
      <h2 className="font-serif text-2xl">Products</h2>

      {/* Pagination loading overlay */}
      <div className="relative">
        {loading && items.length > 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/70 backdrop-blur-[2px]">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <div className={loading && items.length > 0 ? "pointer-events-none" : ""}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Seller</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Visibility</TableHead>
            <TableHead className="w-28 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((p) => (
            <TableRow key={p._id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {p.images?.[0] && <Image src={p.images[0]} alt="" fill sizes="40px" className="object-cover" />}
                  </div>
                  <Link href={`/products/${p._id}`} className="line-clamp-1 text-sm font-medium hover:underline">
                    {p.title}
                  </Link>
                </div>
              </TableCell>
              <TableCell className="text-sm">{p.seller?.name ?? "—"}</TableCell>
              <TableCell className="text-sm font-medium">{formatPrice(p.price)}</TableCell>
              <TableCell>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${p.hidden ? "bg-muted text-muted-foreground" : "bg-success/10 text-success"}`}>
                  {p.hidden ? "Hidden" : "Live"}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    aria-label={p.hidden ? "Make visible" : "Hide product"}
                    disabled={pendingId !== null}
                    onClick={() => toggleVisibility(p._id, !p.hidden)}
                  >
                    {p.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:bg-destructive/10! hover:text-destructive!"
                    aria-label="Delete product"
                    disabled={pendingId !== null}
                    onClick={() => {
                      if (confirm(`Delete "${p.title}"? This cannot be undone.`)) del(p._id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((p) => (
          <div key={p._id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <Link href={`/products/${p._id}`} className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                {p.images?.[0] && <Image src={p.images[0]} alt="" fill sizes="48px" className="object-cover" />}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/products/${p._id}`} className="line-clamp-2 text-sm font-medium hover:underline">{p.title}</Link>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.seller?.name ?? "—"}</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${p.hidden ? "bg-muted text-muted-foreground" : "bg-success/10 text-success"}`}>
                  {p.hidden ? "Hidden" : "Live"}
                </span>
              </div>
              <span className="shrink-0 text-sm font-medium">{formatPrice(p.price)}</span>
            </div>
            <div className="mt-3 flex justify-end gap-1.5 border-t border-border/60 pt-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                aria-label={p.hidden ? "Make visible" : "Hide product"}
                disabled={pendingId !== null}
                onClick={() => toggleVisibility(p._id, !p.hidden)}
              >
                {p.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:bg-destructive/10! hover:text-destructive!"
                aria-label="Delete product"
                disabled={pendingId !== null}
                onClick={() => {
                  if (confirm(`Delete "${p.title}"? This cannot be undone.`)) del(p._id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      </div>

      {totalPages > 1 && <Pager page={page} setPage={goToPage} totalPages={totalPages} />}
    </div>
  );
}

// -------------------- Orders --------------------

function OrdersTab({ initialPage }: { initialPage: AdminOrdersPage | null }) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AdminOrdersPage | null>(initialPage);
  const [loading, setLoading] = useState(initialPage === null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (page === 1 && initialPage) return;
    let cancelled = false;
    getAdminOrders({ page, limit: 15 })
      .then((d) => {
        if (cancelled) return;
        setData(d as AdminOrdersPage);
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

  const goToPage = (p: number) => {
    if (p === page) return;
    if (!(p === 1 && initialPage)) setLoading(true);
    setPage(p);
  };

  if (error && !data) {
    return <ApiError />;
  }

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  if (loading && items.length === 0) {
    return <SkeletonRows rows={6} />;
  }

  if (items.length === 0) {
    return <EmptyState icon={ShoppingBag} title="No orders yet" body="Orders placed across the store will appear here." />;
  }

  return (
    <div className="space-y-4">
      <h2 className="font-serif text-2xl">Orders</h2>

      {error && data && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Couldn&apos;t refresh — showing the last loaded list.
        </div>
      )}

      {/* Pagination loading overlay */}
      <div className="relative">
        {loading && items.length > 0 && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-background/70 backdrop-blur-[2px]">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        <div className={loading && items.length > 0 ? "pointer-events-none" : ""}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Placed</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="w-44">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((o) => {
            const meta = ORDER_STATUS_META[o.status as keyof typeof ORDER_STATUS_META] ?? { label: o.status, className: "bg-muted text-foreground/70" };
            return (
            <TableRow key={o._id}>
              <TableCell className="font-mono text-xs">#{o._id.slice(-10).toUpperCase()}</TableCell>
              <TableCell className="text-sm"><span className="block max-w-40 truncate">{o.buyer?.name ?? "—"}</span></TableCell>
              <TableCell className="text-sm text-muted-foreground">{o.createdAt ? formatDate(o.createdAt) : "—"}</TableCell>
              <TableCell className="text-sm font-medium">{formatPrice(o.total ?? 0)}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${meta.className}`}>
                  {meta.label}
                </span>
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((o) => {
          const meta = ORDER_STATUS_META[o.status as keyof typeof ORDER_STATUS_META] ?? { label: o.status, className: "bg-muted text-foreground/70" };
          return (
          <div key={o._id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs">#{o._id.slice(-10).toUpperCase()}</p>
                <p className="mt-1 truncate text-sm font-medium">{o.buyer?.name ?? "—"}</p>
              </div>
              <span className="shrink-0 text-sm font-medium">{formatPrice(o.total ?? 0)}</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
              <span className="text-xs text-muted-foreground">{o.createdAt ? formatDate(o.createdAt) : "—"}</span>
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${meta.className}`}>
                {meta.label}
              </span>
            </div>
          </div>
          );
        })}
      </div>
      </div>

      {totalPages > 1 && <Pager page={page} setPage={goToPage} totalPages={totalPages} />}
    </div>
  );
}

// -------------------- Shared --------------------

function Pager({ page, setPage, totalPages }: { page: number; setPage: (p: number) => void; totalPages: number }) {
  const goPrev = () => setPage(Math.max(1, page - 1));
  const goNext = () => setPage(Math.min(totalPages, page + 1));
  return (
    <div className="flex items-center justify-center gap-2">
      <Button size="sm" variant="outline" disabled={page <= 1} onClick={goPrev}>
        Previous
      </Button>
      <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
      <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={goNext}>
        Next
      </Button>
    </div>
  );
}

function SkeletonRows({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
      ))}
    </div>
  );
}

function ApiError() {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      Couldn&apos;t load data — make sure your API is reachable at {API_BASE_URL}.
    </div>
  );
}

function EmptyState({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-serif text-2xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">{body}</p>
    </div>
  );
}