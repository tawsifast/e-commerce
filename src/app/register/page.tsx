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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SignUpEmailBody = Parameters<typeof authClient.signUp.email>[0] & { role?: string };

export default function RegisterPage() {
  const { refresh } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", photo: "", role: "buyer" });
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setBusy(true);
    try {
      const { error } = await authClient.signUp.email({
        name: form.name,
        email: form.email,
        password: form.password,
        image: form.photo || undefined,
        role: form.role,
      } as SignUpEmailBody);
      if (error) throw new Error(error.message);
      await refresh();
      toast.success("Account created — welcome");
      router.push("/");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Couldn't create account"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div className="flex items-center justify-center order-2 lg:order-1">
        <div className="w-full max-w-md">
          <h1 className="font-serif text-5xl">Create account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have one? <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">Sign in</Link>
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1.5 h-11" />
              <p className="mt-1 text-xs text-muted-foreground">At least 6 characters.</p>
            </div>
            <div>
              <Label htmlFor="photo">Photo URL (optional)</Label>
              <Input id="photo" type="url" value={form.photo} onChange={(e) => setForm({ ...form, photo: e.target.value })} placeholder="https://…" className="mt-1.5 h-11" />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v ?? "buyer" })}>
                <SelectTrigger className="mt-1.5 h-11 w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="seller">Seller</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">Dev preview — anyone can pick any role.</p>
            </div>
            <Button type="submit" disabled={busy} className="h-11 w-full bg-gradient-hero text-primary-foreground hover:opacity-90">
              {busy ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="hidden flex-col justify-between rounded-3xl bg-gradient-hero p-10 text-primary-foreground lg:flex order-1 lg:order-2">
        <div>
          <span className="text-xs uppercase tracking-widest text-gold">Marketa</span>
          <h2 className="mt-6 font-serif text-5xl leading-tight">A calmer way to shop and sell online.</h2>
          <p className="mt-4 max-w-sm text-sm text-primary-foreground/75">
            Free to browse, always. Free to list your first product. Fair fees when you make a sale.
          </p>
        </div>
        <ul className="space-y-3 text-sm text-primary-foreground/80">
          <li>· No hidden fees</li>
          <li>· Buyer &amp; seller protection</li>
          <li>· Ships worldwide</li>
        </ul>
      </motion.div>
    </div>
  );
}
