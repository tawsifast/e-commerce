"use client";


import { Link, useNavigate } from "@/lib/router-compat";
import { useState } from "react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { getApiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";



function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", photo: "" });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setBusy(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, photo: form.photo || undefined });
      toast.success("Account created — welcome");
      void navigate({ to: "/" });
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
            Already have one? <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">Sign in</Link>
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
            <p className="text-xs text-muted-foreground">
              You'll join as a <strong>Buyer</strong>. Want to sell? You can upgrade from your dashboard.
            </p>
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
          <li>· Buyer & seller protection</li>
          <li>· Ships worldwide</li>
        </ul>
      </motion.div>
    </div>
  );
}


export default RegisterPage;
