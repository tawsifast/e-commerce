import Link from "next/link";
import { Camera, Contact, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="flex items-center gap-2 font-serif text-2xl">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-hero text-primary-foreground text-sm font-bold">M</span>
            Marketa
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            A curated marketplace where independent sellers and thoughtful buyers find each other.
          </p>
          <div className="mt-6 flex gap-3">
            <a href="https://www.instagram.com/_t_a_w_s_i_f__" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/60 hover:text-foreground"><Camera className="h-4 w-4" /></a>
            <a href="https://www.linkedin.com/in/tawsif-islam" aria-label="LinkedIn" className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/60 hover:text-foreground"><Contact className="h-4 w-4" /></a>
            <a href="https://www.facebook.com/mdtawsifulislam.islam" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/60 hover:text-foreground"><MessageCircle className="h-4 w-4" /></a>
          </div>
        </div>
        <FooterCol title="Shop">
          <Link href="/products">All products</Link>
          <Link href="/products">Categories</Link>
          <Link href="/products">Best sellers</Link>
          <Link href="/products">New arrivals</Link>
        </FooterCol>
        <FooterCol title="Sell">
          <Link href="/register">Become a seller</Link>
          <Link href="/login">Seller sign in</Link>
          <a href="#">Seller guide</a>
          <a href="#">Fees</a>
        </FooterCol>
        <FooterCol title="Support">
          <a href="#">Help center</a>
          <a href="#">Shipping & returns</a>
          <a href="#">Contact us</a>
          <a href="#">Terms & privacy</a>
        </FooterCol>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Marketa. All rights reserved.
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-foreground">{title}</h4>
      <ul className="space-y-2.5 text-sm text-muted-foreground [&_a]:hover:text-foreground">
        {Array.isArray(children) ? children.map((c, i) => <li key={i}>{c}</li>) : <li>{children}</li>}
      </ul>
    </div>
  );
}
