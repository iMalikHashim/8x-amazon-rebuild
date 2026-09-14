"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export type SignInError = "unknown-email" | "wrong-password" | "invalid";

interface AuthContextValue {
  user: AuthUser | null;
  /** True once the initial /api/auth/me check has completed - lets pages
   * avoid flashing a signed-out state while that request is in flight. */
  ready: boolean;
  signUp: (name: string, email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  signIn: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: SignInError }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      signUp: async (name, email, password) => {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { ok: false, error: data.error ?? "Something went wrong. Try again." };
        setUser(data.user);
        return { ok: true };
      },
      signIn: async (email, password) => {
        const res = await fetch("/api/auth/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { ok: false, error: (data.error as SignInError) ?? "invalid" };
        setUser(data.user);
        return { ok: true };
      },
      signOut: async () => {
        await fetch("/api/auth/signout", { method: "POST" }).catch(() => {});
        setUser(null);
      },
    }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
