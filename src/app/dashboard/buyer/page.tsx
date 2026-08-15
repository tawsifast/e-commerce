import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { getMyOrders, getWishlist } from "@/lib/server-api";
import { BuyerDashboard } from "@/components/dashboard/BuyerDashboard";

export const dynamic = "force-dynamic";

export default async function BuyerDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (user.role !== "buyer") redirect("/unauthorized");

  const [initialOrders, initialWishlist] = await Promise.all([
    getMyOrders(1, 8).catch(() => null),
    getWishlist().catch(() => []),
  ]);

  return (
    <BuyerDashboard user={user} initialOrders={initialOrders} initialWishlist={initialWishlist} />
  );
}