"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ShoppingBag, User as UserIcon, X, LogOut, LayoutDashboard, Search } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";

const dashboardHref = (role: string) => {
  if (role === "seller") return "/dashboard/seller";
  if (role === "admin") return "/dashboard/admin";
  return "/dashboard/buyer";
};

const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

export function Navbar() {
  const { user, logout } = useAuth();
  const { count, openDrawer } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

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
          {user && (
            <Link href={dashboardHref(user.role)} className={`text-sm font-medium transition-colors hover:text-foreground ${isActive(pathname, "/dashboard") ? "text-foreground" : "text-foreground/70"}`}>
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={openDrawer}
            className="relative grid h-10 w-10 place-items-center rounded-full text-foreground/80 transition-colors hover:bg-accent"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-gradient-gold px-1 text-[10px] font-bold text-gold-foreground shadow-gold">
                {count}
              </span>
            )}
          </button>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link href={dashboardHref(user.role)} className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm">
                {user.photo ? (
                  <img src={user.photo} alt={user.name} className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <UserIcon className="h-4 w-4" />
                )}
                <span className="max-w-[8ch] truncate">{user.name.split(" ")[0]}</span>
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

          <button
            onClick={() => setMobileOpen((s) => !s)}
            className="grid h-10 w-10 place-items-center rounded-full md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
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
              {user ? (
                <>
                  <MobileLink href={dashboardHref(user.role)} onClick={() => setMobileOpen(false)} icon={<LayoutDashboard className="h-4 w-4" />}>
                    Dashboard
                  </MobileLink>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="flex items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium text-destructive hover:bg-accent"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
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
