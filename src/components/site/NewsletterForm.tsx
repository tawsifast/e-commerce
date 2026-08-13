"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setEmail("");
    toast.success("Thanks! You're on the list.");
  };

  return (
    <form onSubmit={submit} className="mx-auto mt-6 flex max-w-md gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="h-11 w-full rounded-full border border-border bg-background px-4 text-sm outline-none"
      />
      <Button
        type="submit"
        className="h-11 rounded-full bg-gradient-hero px-6 text-primary-foreground hover:opacity-90"
      >
        Subscribe
      </Button>
    </form>
  );
}