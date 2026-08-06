import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { CartDrawer } from "@/components/site/CartDrawer";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Marketa — A curated marketplace for makers and buyers",
  description:
    "Discover thoughtfully-made products from independent sellers. Shop with confidence, ship anywhere.",
  authors: [{ name: "Marketa" }],
  openGraph: {
    title: "Marketa — A curated marketplace",
    description:
      "Discover thoughtfully-made products from independent sellers.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
          </div>
          <Toaster
            position="top-center"
  containerStyle={{
    position: "fixed",
    zIndex: 99999,
  }}
  toastOptions={{
    style: {
      backgroundColor: "#ffffff", // Use a solid color (e.g. #ffffff or #18181b for dark mode)
      color: "hsl(var(--card-foreground))",
      border: "1px solid hsl(var(--border))",
      fontSize: "14px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Adds separation from background text
    },
  }}
          />
        </Providers>
      </body>
    </html>
  );
}
