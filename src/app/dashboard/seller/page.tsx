import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { serverAPI } from "@/lib/server-api";
import { SellerDashboard } from "@/components/dashboard/SellerDashboard";

export default async function SellerDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "seller" && user.role !== "admin") redirect("/");

  const [overview, analytics, products, orders] = await Promise.all([
    serverAPI.sellerOverview().catch(() => null),
    serverAPI.sellerAnalytics("30d").catch(() => null),
    serverAPI.sellerProducts().catch(() => null),
    serverAPI.sellerOrders(1, 10).catch(() => null),
  ]);

  return (
    <SellerDashboard user={user} initial={{ overview, analytics, products, orders }} />
  );
}