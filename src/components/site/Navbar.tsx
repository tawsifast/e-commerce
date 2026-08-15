"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ShoppingBag, User as UserIcon, X, LogOut, LayoutDashboard, Search, Info, Mail } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import type { User } from "@/lib/types";

const dashboardHref = (role: string) => {
  if (role === "seller") return "/dashboard/seller";
  if (role === "admin") return "/dashboard/admin";
  return "/dashboard/buyer";
};

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

export function Navbar({ user }: { user: User | null }) {
  const { count, openDrawer } = useCart();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  const navUser: User | null = session?.user
    ? {
        _id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: (session.user.role ?? "buyer") as User["role"],
        photo: session.user.image ?? undefined,
      }
    : user;

  const logout = async () => {
    await authClient.signOut();
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-serif text-2xl tracking-tight text-foreground">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-gradient-hero text-primary-foreground text-sm font-bold">M</span>
          <span>Marketa</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className={`text-sm font-medium transition-colors hover:text-foreground ${isActive(pathname, "/") ? "text-foreground" : "text-foreground/70"}`}>
            Home
          </Link>
          <Link href="/products" className={`text-sm font-medium transition-colors hover:text-foreground ${isActive(pathname, "/products") ? "text-foreground" : "text-foreground/70"}`}>
            All Products
          </Link>
          <Link href="/about" className={`text-sm font-medium transition-colors hover:text-foreground ${isActive(pathname, "/about") ? "text-foreground" : "text-foreground/70"}`}>
            About
          </Link>
          <Link href="/contact" className={`text-sm font-medium transition-colors hover:text-foreground ${isActive(pathname, "/contact") ? "text-foreground" : "text-foreground/70"}`}>
            Contact
          </Link>
          {navUser && (
            <Link href={dashboardHref(navUser.role)} className={`text-sm font-medium transition-colors hover:text-foreground ${isActive(pathname, "/dashboard") ? "text-foreground" : "text-foreground/70"}`}>
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={openDrawer}
            className="relative h-10 w-10 rounded-full! text-foreground/80 hover:bg-accent!"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-gold px-1 text-[10px] font-bold text-gold-foreground shadow-gold">
                {count}
              </span>
            )}
          </Button>

          {navUser ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link href={dashboardHref(navUser.role)} className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm">
                {navUser.photo ? (
                  <span className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full">
                    <Image src={navUser.photo} alt={navUser.name} fill sizes="24px" className="object-cover" />
                  </span>
                ) : (
                  <UserIcon className="h-4 w-4" />
                )}
                <span className="max-w-[8ch] truncate">{navUser.name.split(" ")[0]}</span>
              </Link>
              <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-gradient-hero text-primary-foreground hover:opacity-90">Get started</Button>
              </Link>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen((s) => !s)}
            className="h-10 w-10 rounded-full! hover:bg-transparent md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/60 bg-background md:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              <MobileLink href="/" onClick={() => setMobileOpen(false)} icon={<Search className="h-4 w-4" />}>Home</MobileLink>
              <MobileLink href="/products" onClick={() => setMobileOpen(false)} icon={<ShoppingBag className="h-4 w-4" />}>All Products</MobileLink>
              <MobileLink href="/about" onClick={() => setMobileOpen(false)} icon={<Info className="h-4 w-4" />}>About</MobileLink>
              <MobileLink href="/contact" onClick={() => setMobileOpen(false)} icon={<Mail className="h-4 w-4" />}>Contact</MobileLink>
              {navUser ? (
                <>
                  <MobileLink href={dashboardHref(navUser.role)} onClick={() => setMobileOpen(false)} icon={<LayoutDashboard className="h-4 w-4" />}>
                    Dashboard
                  </MobileLink>
                  <Button
                    variant="ghost"
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="h-auto w-full justify-start gap-3 rounded-md px-3 py-2.5 text-left text-destructive! hover:bg-accent!"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </Button>
                </>
              ) : (
                <>
                  <MobileLink href="/login" onClick={() => setMobileOpen(false)} icon={<UserIcon className="h-4 w-4" />}>Sign in</MobileLink>
                  <MobileLink href="/register" onClick={() => setMobileOpen(false)} icon={<UserIcon className="h-4 w-4" />}>Create account</MobileLink>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MobileLink({ href, children, icon, onClick }: { href: string; children: React.ReactNode; icon?: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent"
    >
      {icon}
      {children}
    </Link>
  );
}
