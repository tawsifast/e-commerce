"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
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
  Edit3,
  Package,
  Plus,
  Star,
  Trash2,
  TrendingUp,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getApiErrorMessage, SellerAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { formatDate, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import { Badge } from "@/components/ui/badge";

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--gold))", "#7c9885", "#c98d5e", "#8b7fb5"];

interface SellerProduct extends Product {
  sold?: number;
}

interface SellerOrder {
  _id: string;
  buyer?: { name?: string };
  total?: number;
  createdAt?: string;
  status: string;
}

export default function SellerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="grid min-h-[60vh] place-items-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-serif text-4xl">Seller Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Welcome back, {user.name.split(" ")[0]}. Here&apos;s how your shop is doing.
        </p>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview"><BarChart3 className="mr-2 h-4 w-4" /> Overview</TabsTrigger>
          <TabsTrigger value="products"><Package className="mr-2 h-4 w-4" /> Products</TabsTrigger>
          <TabsTrigger value="orders"><Truck className="mr-2 h-4 w-4" /> Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="products"><ProductsTab /></TabsContent>
        <TabsContent value="orders"><OrdersTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, delta }: { icon: LucideIcon; label: string; value: React.ReactNode; delta?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-accent">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="mt-3 font-serif text-3xl">{value}</div>
      {delta != null && (
        <p className={`mt-1 text-xs ${delta >= 0 ? "text-emerald-600" : "text-destructive"}`}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs last period
        </p>
      )}
    </div>
  );
}

function OverviewTab() {
  const [range, setRange] = useState("30d");
  const overview = useQuery({ queryKey: ["seller", "overview"], queryFn: SellerAPI.overview });
  const analytics = useQuery({
    queryKey: ["seller", "analytics", range],
    queryFn: () => SellerAPI.analytics(range),
  });

  const stats = overview.data ?? {};
  const salesSeries = analytics.data?.salesSeries ?? [];
  const topProducts = analytics.data?.topProducts ?? [];
  const categoryBreakdown = analytics.data?.categoryBreakdown ?? [];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={DollarSign} label="Revenue" value={formatPrice(stats.revenue ?? 0)} delta={stats.revenueDelta} />
        <StatCard icon={Package} label="Orders" value={stats.orders ?? 0} delta={stats.ordersDelta} />
        <StatCard icon={TrendingUp} label="Products" value={stats.productsCount ?? 0} />
        <StatCard icon={Star} label="Avg Rating" value={(stats.avgRating ?? 0).toFixed(1)} />
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl">Sales trend</h2>
        <Select value={range} onValueChange={(v) => setRange(v ?? "7d")}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesSeries}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatPrice(Number(v))} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-serif text-xl">Top products</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="title" type="category" width={120} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="sold" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h3 className="mb-4 font-serif text-xl">Category mix</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryBreakdown} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {categoryBreakdown.map((_: unknown, i: number) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

const EMPTY_PRODUCT = {
  title: "",
  description: "",
  price: "",
  discountPrice: "",
  category: "",
  stock: "",
  images: "",
};

function ProductsTab() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SellerProduct | null>(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);

  const { data, isLoading } = useQuery({
    queryKey: ["seller", "products"],
    queryFn: () => SellerAPI.products(),
  });
  const items: SellerProduct[] = data?.items ?? [];

  const save = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        category: form.category,
        stock: Number(form.stock),
        images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
      };
      if (editing) return SellerAPI.updateProduct(editing._id, payload);
      return SellerAPI.createProduct(payload);
    },
    onSuccess: () => {
      toast.success(editing ? "Product updated" : "Product created");
      setOpen(false);
      setEditing(null);
      setForm(EMPTY_PRODUCT);
      qc.invalidateQueries({ queryKey: ["seller", "products"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const del = useMutation({
    mutationFn: (id: string) => SellerAPI.deleteProduct(id),
    onSuccess: () => {
      toast.success("Product removed");
      qc.invalidateQueries({ queryKey: ["seller", "products"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const openEdit = (p: SellerProduct) => {
    setEditing(p);
    setForm({
      title: p.title ?? "",
      description: p.description ?? "",
      price: String(p.price ?? ""),
      discountPrice: p.discountPrice != null ? String(p.discountPrice) : "",
      category: p.category ?? "",
      stock: String(p.stock ?? ""),
      images: (p.images ?? []).join(", "),
    });
    setOpen(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_PRODUCT);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl">My products</h2>
          <p className="text-sm text-muted-foreground">{items.length} listed</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button onClick={openCreate} className="bg-gradient-hero text-primary-foreground hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" /> New product
              </Button>
            }
          />
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit product" : "Create product"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>Description</Label>
                <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <Label>Price</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
              <div>
                <Label>Discount price (optional)</Label>
                <Input type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
              </div>
              <div>
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
              </div>
              <div>
                <Label>Stock</Label>
                <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>Image URLs (comma separated)</Label>
                <Textarea rows={2} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button disabled={save.isPending} onClick={() => save.mutate()} className="bg-gradient-hero text-primary-foreground hover:opacity-90">
                {save.isPending ? "Saving…" : editing ? "Save changes" : "Create product"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Stock</th>
              <th className="px-6 py-3">Sold</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">No products yet. Add your first one.</td></tr>
            ) : (
              items.map((p) => (
                <tr key={p._id} className="border-t border-border">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                        {p.images?.[0] && <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />}
                      </div>
                      <Link href={`/products/${p._id}`} className="line-clamp-1 font-medium hover:underline">
                        {p.title}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-muted-foreground">{p.category}</td>
                  <td className="px-6 py-3">{formatPrice(p.discountPrice ?? p.price)}</td>
                  <td className="px-6 py-3">
                    {p.stock > 0 ? p.stock : <Badge variant="destructive">Out</Badge>}
                  </td>
                  <td className="px-6 py-3">{p.sold ?? 0}</td>
                  <td className="px-6 py-3">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEdit(p)} aria-label="Edit">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => del.mutate(p._id)} aria-label="Delete">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

function OrdersTab() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["seller", "orders", page],
    queryFn: () => SellerAPI.orders(page, 10),
  });
  const items: SellerOrder[] = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => SellerAPI.updateOrderStatus(id, status),
    onSuccess: () => {
      toast.success("Order updated");
      qc.invalidateQueries({ queryKey: ["seller", "orders"] });
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl">Incoming orders</h2>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-6 py-3">Order</th>
              <th className="px-6 py-3">Buyer</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Placed</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">Loading…</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">No orders yet.</td></tr>
            ) : (
              items.map((o) => (
                <tr key={o._id} className="border-t border-border">
                  <td className="px-6 py-3 font-mono text-xs">{o._id.slice(-8)}</td>
                  <td className="px-6 py-3">{o.buyer?.name ?? "—"}</td>
                  <td className="px-6 py-3">{formatPrice(o.total ?? 0)}</td>
                  <td className="px-6 py-3 text-muted-foreground">{o.createdAt ? formatDate(o.createdAt) : "—"}</td>
                  <td className="px-6 py-3">
                    <Select value={o.status} onValueChange={(v) => updateStatus.mutate({ id: o._id, status: v ?? o.status })}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
