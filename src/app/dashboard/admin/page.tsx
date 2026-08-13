import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { serverAPI } from "@/lib/server-api";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/");

  const [overview, users, products, orders] = await Promise.all([
    serverAPI.adminOverview().catch(() => null),
    serverAPI.adminUsers(1, 15).catch(() => null),
    serverAPI.adminProducts(1, 15).catch(() => null),
    serverAPI.adminOrders(1, 15).catch(() => null),
  ]);

  return <AdminDashboard user={user} initial={{ overview, users, products, orders }} />;
}