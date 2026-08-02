"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-3xl text-foreground">This page didn&apos;t load</h1>
        <p className="mt-2 text-sm text-muted-foreground">Something went wrong. Try refreshing or head back home.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button onClick={() => reset()} className="bg-gradient-hero px-4 text-primary-foreground hover:opacity-90">
            Try again
          </Button>
          <Button variant="outline" className="rounded-md border-input px-4 hover:bg-accent!" render={<Link href="/" />}>
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}
