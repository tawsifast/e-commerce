"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <ShieldAlert className="mx-auto h-14 w-14 text-gold" aria-hidden />
        <h1 className="mt-6 font-serif text-5xl text-foreground">403</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Access denied</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          You don&apos;t have permission to view this page. Sign in with an account that has the
          right access.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-gradient-hero px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Go home
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Sign in with another account
          </Link>
        </div>
      </div>
    </div>
  );
}