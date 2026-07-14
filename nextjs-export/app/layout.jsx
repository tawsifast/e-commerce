import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Marketa — A curated marketplace for makers and buyers",
  description:
    "Discover thoughtfully-made products from independent sellers. Shop with confidence, ship anywhere.",
  authors: [{ name: "Marketa" }],
  openGraph: {
    title: "Marketa — A curated marketplace",
    description: "Discover thoughtfully-made products from independent sellers.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
