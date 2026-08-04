"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authClient } from "./auth-client";
import { exchangeApiToken, logoutApiToken } from "./api";

const AuthContext = createContext<AuthContextValue>(null as unknown as AuthContextValue);

const RENEW_INTERVAL_MS = 50 * 60 * 1000; // re-exchange before the 1h JWT expires

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: User | null) => void;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  photo?: string;
}

function mapSessionUser(u: { id: string; name: string; email: string; image?: string | null }): User {
  return {
    _id: u.id,
    name: u.name,
    email: u.email,
    role: (u as { role?: string }).role ?? "buyer",
    photo: u.image ?? undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { data } = await authClient.getSession();
      setUser(data?.user ? mapSessionUser(data.user) : null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let disposed = false;
    Promise.resolve().then(() => {
      if (!disposed) void refresh();
    });
    return () => {
      disposed = true;
    };
  }, [refresh]);

  // Exchange the better-auth session for the API JWT cookie whenever a user
  // is signed in, and renew it periodically so the cookie never expires.
  useEffect(() => {
    if (!user) return;
    void exchangeApiToken();
    const timer = window.setInterval(() => void exchangeApiToken(), RENEW_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [user]);

  const logout = useCallback(async () => {
    await logoutApiToken();
    await authClient.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, logout, refresh, setUser }),
    [user, loading, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
