import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getAdminOrders, getAdminOverview, getAdminProducts, getAdminUsers } from "@/lib/server-api";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/unauthorized");

  const [overview, users, products, orders] = await Promise.all([
    getAdminOverview().catch(() => null),
    getAdminUsers(1, 15).catch(() => null),
    getAdminProducts(1, 15).catch(() => null),
    getAdminOrders(1, 15).catch(() => null),
  ]);

  return <AdminDashboard user={user} initial={{ overview, users, products, orders }} />;
}