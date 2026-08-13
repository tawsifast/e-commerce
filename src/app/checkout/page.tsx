import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export default async function CheckoutPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return <CheckoutClient />;
}