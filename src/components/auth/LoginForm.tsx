"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "@/lib/api";
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "kitagawa@gmail.com", password: "Kitagawa12345" });
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error } = await authClient.signIn.email({ email: form.email, password: form.password });
      if (error) throw new Error(error.message);
      router.refresh();
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
    <div className="w-full max-w-md">
      <h1 className="font-serif text-5xl">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">Don&apos;t have an account? <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">Create one</Link></p>

      <Button variant="outline" onClick={google} className="mt-8 h-11 w-full">
        <Globe className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="text" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 h-11" />
        </div>
        <div>
          <Label 
          
          htmlFor="password">Password</Label>
          <div className="relative mt-1.5">
            <Input id="password"  type={showPassword ? "text" : "password"} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="h-11 pr-11" />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <Button type="submit" disabled={busy} className="h-11 w-full bg-gradient-hero text-primary-foreground hover:opacity-90">
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}