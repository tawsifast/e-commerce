"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push(q ? `/products?search=${encodeURIComponent(q)}` : "/products");
  };

  return (
    <form
      onSubmit={submit}
      className="flex gap-2 rounded-full border border-border bg-card p-1.5 shadow-md"
    >
      <div className="flex flex-1 items-center gap-2 px-4">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products, brands, categories…"
          className="w-full bg-transparent py-2.5 text-sm outline-none"
        />
      </div>
      <Button
        type="submit"
        className="rounded-full bg-gradient-hero px-6 text-primary-foreground hover:opacity-90"
      >
        Search
      </Button>
    </form>
  );
}