import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getSellerAnalytics, getSellerOrders, getSellerOverview, getSellerProducts } from "@/lib/server-api";
import { SellerDashboard } from "@/components/dashboard/SellerDashboard";

export const dynamic = "force-dynamic";

export default async function SellerDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "seller") redirect("/unauthorized");

  const [overview, analytics, products, orders] = await Promise.all([
    getSellerOverview().catch(() => null),
    getSellerAnalytics("30d").catch(() => null),
    getSellerProducts().catch(() => null),
    getSellerOrders(1, 10).catch(() => null),
  ]);

  return (
    <SellerDashboard user={user} initial={{ overview, analytics, products, orders }} />
  );
}