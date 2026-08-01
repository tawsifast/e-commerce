import Link from "next/link";

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
);

const XIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

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
            <a href="#" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/60 hover:text-foreground"><InstagramIcon /></a>
            <a href="#" aria-label="X" className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/60 hover:text-foreground"><XIcon /></a>
            <a href="#" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/60 hover:text-foreground"><FacebookIcon /></a>
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
