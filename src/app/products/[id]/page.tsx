import type { Metadata } from "next";
import { ProductDetail } from "./product-detail";

export const metadata: Metadata = {
  title: "Product — Marketa",
  description: "Product details on Marketa.",
  robots: { index: true, follow: true },
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}
