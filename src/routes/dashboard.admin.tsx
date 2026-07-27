import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
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
  DollarSign,
  Eye,
  EyeOff,
  Package,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Users,
} from "lucide-react";
import { AdminAPI, getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useNavigate } from "@tanstack/react-router";
import { formatDate, formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Marketa" },
      { name: "description", content: "Moderate the Marketa marketplace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

const ROLES = ["buyer", "seller", "admin"];
const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

function AdminDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      toast.error("Admin access required");
      void navigate({ to: "/" });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return <div className="grid min-h-[60vh] place-items-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="text-xs uppercase tracking-widest text-primary">Admin</span>
        </div>
        <h1 className="mt-2 font-serif text-4xl">Marketplace Control</h1>
        <p className="mt-2 text-sm text-muted-foreground">Everything happening across Marketa.</p>
      </motion.div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OverviewTab /></TabsContent>
        <TabsContent value="users"><UsersTab /></TabsContent>
        <TabsContent value="products"><ProductsTab /></TabsContent>
        <TabsContent value="orders"><OrdersTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-accent">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="mt-3 font-serif text-3xl">{value}</div>
    </div>
  );
}

function OverviewTab() {
  const { data } = useQuery({ queryKey: ["admin", "overview"], queryFn: AdminAPI.overview });
  const stats = data ?? {};
  const series = data?.revenueSeries ?? [];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Users} label="Users" value={stats.usersCount ?? 0} />
        <StatCard icon={ShoppingBag} label="Sellers" value={stats.sellersCount ?? 0} />
        <StatCard icon={Package} label="Products" value={stats.productsCount ?? 0} />
        <StatCard icon={DollarSign} label="GMV" value={formatPrice(stats.gmv ?? 0)} />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 font-serif text-xl">Marketplace revenue</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series}>
              <defs>
                <linearGradient id="gmv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => formatPrice(Number(v))} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#gmv)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", page],
    queryFn: () => AdminAPI.users({ page, limit: 15 }),
  });
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const changeRole = useMutation({
    mutationFn: ({ id, role }) => AdminAPI.updateUserRole(id, role),
    onSuccess: () => { toast.success("Role updated"); qc.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const toggleBlock = useMutation({
    mutationFn: ({ id, blocked }) => AdminAPI.toggleUserBlock(id, blocked),
    onSuccess: () => { toast.success("User updated"); qc.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const del = useMutation({
    mutationFn: (id) => AdminAPI.deleteUser(id),
    onSuccess: () => { toast.success("User deleted"); qc.invalidateQueries({ queryKey: ["admin", "users"] }); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
          <tr>
            <th className="px-6 py-3">User</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Joined</th>
            <th className="px-6 py-3">Role</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">Loading…</td></tr>
          ) : items.length === 0 ? (
            <tr><td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">No users.</td></tr>
          ) : (
            items.map((u) => (
              <tr key={u._id} className="border-t border-border">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-accent text-xs font-medium">
                      {u.photo ? <img src={u.photo} alt="" className="h-full w-full object-cover" /> : (u.name?.[0] ?? "?").toUpperCase()}
                    </div>
                    <span className="font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-6 py-3 text-muted-foreground">{u.createdAt ? formatDate(u.createdAt) : "—"}</td>
                <td className="px-6 py-3">
                  <Select value={u.role} onValueChange={(v) => changeRole.mutate({ id: u._id, role: v })}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-6 py-3">
                  {u.blocked ? <Badge variant="destructive">Blocked</Badge> : <Badge variant="secondary">Active</Badge>}
                </td>
                <td className="px-6 py-3">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleBlock.mutate({ id: u._id, blocked: !u.blocked })}>
                      {u.blocked ? "Unblock" : "Block"}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => del.mutate(u._id)} aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-border py-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

function ProductsTab() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products", page],
    queryFn: () => AdminAPI.products({ page, limit: 15 }),
  });
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const toggleHidden = useMutation({
    mutationFn: ({ id, hidden }) => AdminAPI.toggleProductVisibility(id, hidden),
    onSuccess: () => { toast.success("Product updated"); qc.invalidateQueries({ queryKey: ["admin", "products"] }); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });
  const del = useMutation({
    mutationFn: (id) => AdminAPI.deleteProduct(id),
    onSuccess: () => { toast.success("Product removed"); qc.invalidateQueries({ queryKey: ["admin", "products"] }); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-left text-xs uppercase tracking-widest text-muted-foreground">
          <tr>
            <th className="px-6 py-3">Product</th>
            <th className="px-6 py-3">Seller</th>
            <th className="px-6 py-3">Price</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">Loading…</td></tr>
          ) : items.length === 0 ? (
            <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">No products.</td></tr>
          ) : (
            items.map((p) => (
              <tr key={p._id} className="border-t border-border">
                <td className="px-6 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                      {p.images?.[0] && <img src={p.images[0]} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <span className="line-clamp-1 font-medium">{p.title}</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-muted-foreground">{p.seller?.name ?? "—"}</td>
                <td className="px-6 py-3">{formatPrice(p.discountPrice ?? p.price)}</td>
                <td className="px-6 py-3">
                  {p.hidden ? <Badge variant="destructive">Hidden</Badge> : <Badge variant="secondary">Live</Badge>}
                </td>
                <td className="px-6 py-3">
                  <div className="flex justify-end gap-1">
                    <Button size="icon" variant="ghost" onClick={() => toggleHidden.mutate({ id: p._id, hidden: !p.hidden })} aria-label="Toggle visibility">
                      {p.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
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
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-border py-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders", page],
    queryFn: () => AdminAPI.orders({ page, limit: 15 }),
  });
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => AdminAPI.updateOrderStatus(id, status),
    onSuccess: () => { toast.success("Order updated"); qc.invalidateQueries({ queryKey: ["admin", "orders"] }); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
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
            <tr><td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">No orders.</td></tr>
          ) : (
            items.map((o) => (
              <tr key={o._id} className="border-t border-border">
                <td className="px-6 py-3 font-mono text-xs">{o._id.slice(-8)}</td>
                <td className="px-6 py-3">{o.buyer?.name ?? "—"}</td>
                <td className="px-6 py-3">{formatPrice(o.total ?? 0)}</td>
                <td className="px-6 py-3 text-muted-foreground">{o.createdAt ? formatDate(o.createdAt) : "—"}</td>
                <td className="px-6 py-3">
                  <Select value={o.status} onValueChange={(v) => updateStatus.mutate({ id: o._id, status: v })}>
                    <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ORDER_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 border-t border-border py-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
