import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { serverAPI } from "@/lib/server-api";
import { BuyerDashboard } from "@/components/dashboard/BuyerDashboard";

export default async function BuyerDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const [initialOrders, initialWishlist] = await Promise.all([
    serverAPI.myOrders(1, 8).catch(() => null),
    serverAPI.wishlist().catch(() => []),
  ]);

  return (
    <BuyerDashboard user={user} initialOrders={initialOrders} initialWishlist={initialWishlist} />
  );
}