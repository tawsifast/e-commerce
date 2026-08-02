"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const { refresh } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await authClient.signIn.email({ email: form.email, password: form.password });
      if (error) throw new Error(error.message);
      await refresh();
      toast.success("Welcome back");
      router.push("/");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Invalid credentials"));
    } finally {
      setBusy(false);
    }
  };

  const google = () => {
    toast("Wire Google OAuth on your end, then call googleLogin(idToken)", { icon: "🔧" });
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="hidden flex-col justify-between rounded-3xl bg-gradient-hero p-10 text-primary-foreground lg:flex">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold">Marketa</span>
          <h2 className="mt-6 font-serif text-5xl leading-tight">Welcome back to the marketplace you helped build.</h2>
        </div>
        <blockquote className="border-l-2 border-gold pl-4 text-sm italic text-primary-foreground/80">
          &quot;Marketa is the first shop I actually enjoy opening every morning.&quot;
          <footer className="mt-2 not-italic text-primary-foreground/60">— A seller, three months in</footer>
        </blockquote>
      </motion.div>

      <div className="flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="font-serif text-5xl">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">Don&apos;t have an account? <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">Create one</Link></p>

          <Button variant="outline" onClick={google} className="mt-8 h-11 w-full">
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.24 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.2 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
            Continue with Google
          </Button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1.5 h-11" />
            </div>
            <Button type="submit" disabled={busy} className="h-11 w-full bg-gradient-hero text-primary-foreground hover:opacity-90">
              {busy ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
