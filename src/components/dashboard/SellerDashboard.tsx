"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState, type ChangeEvent, type ReactElement, type ReactNode } from "react";
import toast from "react-hot-toast";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  DollarSign,
  Eye,
  EyeOff,
  Loader2,
  MoreVertical,
  Package,
  Plus,
  ShoppingBag,
  Star,
  Trash2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  API_BASE_URL,
  createProduct,
  deleteSellerProduct,
  getApiErrorMessage,
  getSellerAnalytics,
  getSellerOrders,
  getSellerOverview,
  getSellerProducts,
  updateProduct,
  updateProductVisibility,
  updateSellerOrderStatus,
} from "@/lib/api";
import type { SellerAnalytics, SellerOverview, SellerOrdersPage } from "@/lib/server-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatPrice } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import type { Product, User } from "@/lib/types";

const RANGES = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
];

const CHART_COLORS = ["hsl(var(--primary))", "#7c9885", "#c98d5e", "#8b7fb5", "#5b8db8"];

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingBag },
];

export function SellerDashboard({
  user,
  initial,
}: {
  user: User;
  initial: {
    overview: SellerOverview | null;
    analytics: SellerAnalytics | null;
    products: (Product & { sold?: number })[] | null;
    orders: SellerOrdersPage | null;
  };
}) {
  const [tab, setTab] = useState("overview");

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Seller dashboard</span>
        <h1 className="mt-2 font-serif text-5xl">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Track revenue, manage products and fulfil orders.</p>
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
          {tab === "overview" && <OverviewTab initialOverview={initial.overview} initialAnalytics={initial.analytics} />}
          {tab === "products" && <ProductsTab initialProducts={initial.products} />}
          {tab === "orders" && <OrdersTab initialPage={initial.orders} />}
        </section>
      </div>
    </div>
  );
}

// -------------------- Overview --------------------

function OverviewTab({
  initialOverview,
  initialAnalytics,
}: {
  initialOverview: SellerOverview | null;
  initialAnalytics: SellerAnalytics | null;
}) {
  const [range, setRange] = useState("30d");
  const [overview, setOverview] = useState<SellerOverview | null>(initialOverview);
  const [analytics, setAnalytics] = useState<SellerAnalytics | null>(initialAnalytics);
  const [overviewError, setOverviewError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getSellerOverview()
      .then((data) => { if (!cancelled) setOverview(data as SellerOverview); })
      .catch(() => { if (!cancelled) setOverviewError(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (range === "30d" && initialAnalytics) return;
    let cancelled = false;
    getSellerAnalytics(range as "7d" | "30d" | "90d")
      .then((data) => { if (!cancelled) setAnalytics(data as SellerAnalytics); })
      .catch(() => { if (!cancelled) setAnalytics(null); });
    return () => { cancelled = true; };
  }, [range, initialAnalytics]);

  const stats = [
    {
      label: "Total revenue",
      value: formatPrice(overview?.revenue ?? 0),
      delta: overview?.revenueDelta,
      icon: DollarSign,
    },
    {
      label: "Orders",
      value: String(overview?.orders ?? 0),
      delta: overview?.ordersDelta,
      icon: ShoppingBag,
    },
    { label: "Products listed", value: String(overview?.productsCount ?? 0), icon: Package },
    { label: "Avg rating", value: `${overview?.avgRating ?? 0} / 5`, icon: Star },
  ];

  return (
    <div className="space-y-6">
      {overviewError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Couldn&apos;t load live stats — make sure your API is reachable at {API_BASE_URL}.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, delta, icon: Icon }, i) => (
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
            {typeof delta === "number" && (
              <p className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${delta >= 0 ? "text-success" : "text-destructive"}`}>
                {delta >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                {delta >= 0 ? "+" : ""}{delta}% vs last period
              </p>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-2xl">Shop analytics</h2>
        <Select value={range} onValueChange={(v) => v && setRange(v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Range" />
          </SelectTrigger>
          <SelectContent>
            {RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="rounded-xl border border-border bg-card p-5"
      >
        <h3 className="text-sm font-medium text-muted-foreground">Revenue over time</h3>
        <div className="mt-4 h-72">
          {analytics?.salesSeries?.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.salesSeries} margin={{ left: 0, right: 8, top: 4 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.6)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
                <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={56} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 13 }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revenueFill)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted-foreground">No revenue data yet.</div>
          )}
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground">Top products</h3>
          <div className="mt-4 h-64">
            {analytics?.topProducts?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.topProducts} margin={{ left: 0, right: 8, top: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.6)" vertical={false} />
                  <XAxis dataKey="title" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} interval={0} angle={-18} height={50} textAnchor="end" />
                  <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 13 }} />
                  <Bar dataKey="sold" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">No sales yet.</div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-medium text-muted-foreground">Sales by category</h3>
          <div className="relative mx-auto mt-4 aspect-square w-full max-w-72">
            {analytics?.categoryBreakdown?.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={analytics.categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="55%" outerRadius="80%" paddingAngle={3} strokeWidth={0}>
                    {analytics.categoryBreakdown.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="grid h-full place-items-center text-sm text-muted-foreground">No category data yet.</div>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            {(analytics?.categoryBreakdown ?? []).map((c, i) => (
              <span key={c.name} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                {c.name} — {formatPrice(c.value)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------- Products --------------------

function ProductsTab({ initialProducts }: { initialProducts: (Product & { sold?: number })[] | null }) {
  const [products, setProducts] = useState<(Product & { sold?: number })[] | null>(initialProducts);
  const [loading, setLoading] = useState(initialProducts === null);
  const [error, setError] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [visibilityId, setVisibilityId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<(Product & { sold?: number }) | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSellerProducts()
      .then((data) => {
        if (cancelled) return;
        setProducts(data as (Product & { sold?: number })[]);
        setLoading(false);
        setError(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
        setError(true);
      });
    return () => { cancelled = true; };
  }, []);

  const refresh = async () => {
    try {
      const data = await getSellerProducts();
      setProducts(data as (Product & { sold?: number })[]);
      setError(false);
    } catch {
      setError(true);
    }
  };

  const del = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteSellerProduct(id);
      toast.success("Product deleted");
      await refresh();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Couldn't delete product"));
    } finally {
      setDeletingId(null);
    }
  };

  const toggleVisibility = async (id: string, hidden: boolean) => {
    setVisibilityId(id);
    try {
      await updateProductVisibility(id, hidden);
      toast.success(hidden ? "Product hidden" : "Product is visible again");
      await refresh();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Couldn't update product visibility"));
    } finally {
      setVisibilityId(null);
    }
  };

  const handleSaved = async (message: string) => {
    toast.success(message);
    await refresh();
  };

  if (error && !products) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Couldn&apos;t load products — make sure your API is reachable at {API_BASE_URL}.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && products && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Couldn&apos;t refresh your products — showing the last loaded list.
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl">Your products</h2>
        <ProductDialog
          mode="create"
          trigger={<Button className="bg-gradient-hero text-primary-foreground hover:opacity-90"><Plus className="mr-1.5 h-4 w-4" /> Add product</Button>}
          onSaved={() => handleSaved("Product published")}
        />
      </div>

      {products?.length ? (
        <>
        <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Sold</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p, i) => (
              <motion.tr
                key={p._id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.03, 0.2) }}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {p.images?.[0] && <Image src={p.images[0]} alt={p.title} fill sizes="44px" className="object-cover" />}
                    </div>
                    <div>
                      <Link href={`/products/${p._id}`} className="line-clamp-1 text-sm font-medium hover:underline">{p.title}</Link>
                      <p className="text-xs text-muted-foreground">{p.brand}</p>
                      <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${p.hidden ? "bg-muted text-muted-foreground" : "bg-success/10 text-success"}`}>
                        {p.hidden ? "Hidden" : "Live"}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">
                  <span className="font-medium">{formatPrice(p.discountPrice ?? p.price)}</span>
                  {p.discountPrice != null && p.discountPrice < p.price && (
                    <span className="ml-1.5 text-xs text-muted-foreground line-through">{formatPrice(p.price)}</span>
                  )}
                </TableCell>
                <TableCell className="text-sm">{p.stock}</TableCell>
                <TableCell className="text-sm">{p.sold ?? 0}</TableCell>
                <TableCell className="text-right">
                  <div className="inline-flex gap-1.5">
                    <ProductDialog
                      mode="edit"
                      product={p}
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" aria-label="Edit product">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      }
                      onSaved={() => handleSaved("Product updated")}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground"
                      aria-label={p.hidden ? "Make product visible" : "Hide product"}
                      disabled={deletingId !== null || visibilityId !== null}
                      onClick={() => toggleVisibility(p._id, !p.hidden)}
                    >
                      {visibilityId === p._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : p.hidden ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-destructive/10! hover:text-destructive!"
                      aria-label="Delete product"
                      disabled={deletingId !== null || visibilityId !== null}
                      onClick={() => setDeleteTarget(p)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
        </div>

        <div className="space-y-3 md:hidden">
          {products.map((p) => (
            <div key={p._id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <Link href={`/products/${p._id}`} className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {p.images?.[0] && <Image src={p.images[0]} alt={p.title} fill sizes="48px" className="object-cover" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/products/${p._id}`} className="line-clamp-2 text-sm font-medium hover:underline">{p.title}</Link>
                  <p className="mt-0.5 text-xs text-muted-foreground">{p.brand}</p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${p.hidden ? "bg-muted text-muted-foreground" : "bg-success/10 text-success"}`}>
                    {p.hidden ? "Hidden" : "Live"}
                  </span>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <ProductDialog
                    mode="edit"
                    product={p}
                    trigger={
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" aria-label="Edit product">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    }
                    onSaved={() => handleSaved("Product updated")}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    aria-label={p.hidden ? "Make product visible" : "Hide product"}
                    disabled={deletingId !== null || visibilityId !== null}
                    onClick={() => toggleVisibility(p._id, !p.hidden)}
                  >
                    {visibilityId === p._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : p.hidden ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:bg-destructive/10! hover:text-destructive!"
                    aria-label="Delete product"
                    disabled={deletingId !== null || visibilityId !== null}
                    onClick={() => setDeleteTarget(p)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/60 pt-3 text-sm">
                <span className="font-medium">{formatPrice(p.discountPrice ?? p.price)}</span>
                {p.discountPrice != null && p.discountPrice < p.price && (
                  <span className="text-xs text-muted-foreground line-through">{formatPrice(p.price)}</span>
                )}
                <span className="text-xs text-muted-foreground">{p.stock} in stock</span>
                <span className="text-xs text-muted-foreground">{p.sold ?? 0} sold</span>
              </div>
            </div>
          ))}
        </div>
        </>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Package}
          title="No products yet"
          body="List your first product and start selling today."
          cta={
            <ProductDialog
              mode="create"
              trigger={<Button className="bg-gradient-hero text-primary-foreground hover:opacity-90"><Plus className="mr-1.5 h-4 w-4" /> Add product</Button>}
              onSaved={() => handleSaved("Product published")}
            />
          }
        />
      )}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete product?</DialogTitle>
            <DialogDescription>
              <span className="font-medium text-foreground">{deleteTarget?.title}</span> will be permanently
              deleted, including its reviews. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="outline" disabled={deletingId !== null} onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deletingId !== null}
              onClick={() => {
                const target = deleteTarget;
                setDeleteTarget(null);
                if (target) del(target._id);
              }}
            >
              {deletingId !== null && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              {deletingId !== null ? "Deleting…" : "Delete product"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductDialog({
  mode,
  product,
  trigger,
  onSaved,
}: {
  mode: "create" | "edit";
  product?: Product;
  trigger: ReactElement;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => {
    const images = product?.images?.join(", ") ?? "";
    return {
      title: product?.title ?? "",
      description: product?.description ?? "",
      price: product?.price != null ? String(product.price) : "",
      discountPrice: product?.discountPrice != null ? String(product.discountPrice) : "",
      stock: product?.stock != null ? String(product.stock) : "",
      brand: product?.brand ?? "",
      category: product?.category ?? "",
      image: images,
    };
  });

  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.title.trim() || !form.price) {
      toast.error("Title and price are required");
      return;
    }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      stock: form.stock ? Number(form.stock) : 0,
      brand: form.brand.trim(),
      category: form.category.trim(),
      images: form.image.split(",").map((s) => s.trim()).filter(Boolean),
    };
    setSaving(true);
    try {
      if (mode === "edit" && product) {
        await updateProduct(product._id, payload);
      } else {
        await createProduct(payload);
      }
      setOpen(false);
      onSaved();
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Couldn't save product"));
    } finally {
      setSaving(false);
    }
  };

  const set = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add a product" : "Edit product"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Publish a new product to your shop."
              : "Update the details of this product."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 px-6 pb-6">
          <div>
            <Label htmlFor="p-title">Title</Label>
            <Input id="p-title" value={form.title} onChange={set("title")} placeholder="Vintage denim jacket" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="p-desc">Description</Label>
            <Textarea id="p-desc" value={form.description} onChange={set("description")} rows={4} placeholder="Tell buyers about it…" className="mt-1.5" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="p-price">Price ($)</Label>
              <Input id="p-price" type="number" min="0" step="0.01" value={form.price} onChange={set("price")} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="p-discount">Discount price ($)</Label>
              <Input id="p-discount" type="number" min="0" step="0.01" value={form.discountPrice} onChange={set("discountPrice")} placeholder="Optional" className="mt-1.5" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="p-stock">Stock</Label>
              <Input id="p-stock" type="number" min="0" value={form.stock} onChange={set("stock")} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="p-brand">Brand</Label>
              <Input id="p-brand" value={form.brand} onChange={set("brand")} placeholder="e.g. Levi's" className="mt-1.5" />
            </div>
          </div>
          <div>
            <Label htmlFor="p-cat">Category</Label>
            <Input id="p-cat" value={form.category} onChange={set("category")} placeholder="e.g. Fashion" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="p-img">Image URLs (comma separated)</Label>
            <Input id="p-img" value={form.image} onChange={set("image")} placeholder="https://…, https://…" className="mt-1.5" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="button" disabled={saving} onClick={() => save()} className="bg-gradient-hero text-primary-foreground hover:opacity-90">
              {saving ? "Saving…" : mode === "create" ? "Publish product" : "Save changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// -------------------- Orders --------------------

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

function OrdersTab({ initialPage }: { initialPage: SellerOrdersPage | null }) {
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<SellerOrdersPage | null>(initialPage);
  const [loading, setLoading] = useState(initialPage === null);
  const [error, setError] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (page === 1 && initialPage) return;
    let cancelled = false;
    getSellerOrders(page, 10)
      .then((data) => {
        if (cancelled) return;
        setOrders(data as SellerOrdersPage);
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

  const setStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await updateSellerOrderStatus(id, status);
      toast.success("Order status updated");
      const data = await getSellerOrders(page, 10);
      setOrders(data as SellerOrdersPage);
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Couldn't update status"));
    } finally {
      setUpdatingId(null);
    }
  };

  if (error && !orders) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        Couldn&apos;t load orders — make sure your API is reachable at {API_BASE_URL}.
      </div>
    );
  }

  const items = orders?.items ?? [];
  const totalPages = orders?.totalPages ?? 1;

  if (loading && items.length === 0) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="No orders yet"
        body="Orders placed on your products will appear here for fulfilment."
        cta={<Link href="/products"><Button variant="outline">Browse the catalogue</Button></Link>}
      />
    );
  }

  return (
    <div className="space-y-4">
      {error && orders && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          Couldn&apos;t refresh orders — showing the last loaded list.
        </div>
      )}
      <h2 className="font-serif text-2xl">Orders</h2>

      <div className="hidden md:block">
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
          {items.map((o) => (
            <TableRow key={o._id}>
              <TableCell className="font-mono text-xs">#{o._id.slice(-10).toUpperCase()}</TableCell>
              <TableCell className="text-sm"><span className="block max-w-40 truncate">{o.buyer?.name ?? "—"}</span></TableCell>
              <TableCell className="text-sm text-muted-foreground">{o.createdAt ? formatDate(o.createdAt) : "—"}</TableCell>
              <TableCell className="text-sm font-medium">{formatPrice(o.total ?? 0)}</TableCell>
              <TableCell>
                <Select
                  value={o.status}
                  onValueChange={(v) => v && setStatus(o._id, v)}
                  disabled={updatingId !== null}
                >
                  <SelectTrigger className="h-8 text-xs capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORDER_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((o) => (
          <div key={o._id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs">#{o._id.slice(-10).toUpperCase()}</p>
                <p className="mt-1 truncate text-sm font-medium">{o.buyer?.name ?? "—"}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{o.createdAt ? formatDate(o.createdAt) : "—"}</p>
              </div>
              <span className="shrink-0 text-sm font-medium">{formatPrice(o.total ?? 0)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/60 pt-3">
              <span className="text-xs text-muted-foreground">Status</span>
              <Select
                value={o.status}
                onValueChange={(v) => v && setStatus(o._id, v)}
                disabled={updatingId !== null}
              >
                <SelectTrigger className="h-8 text-xs capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}
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