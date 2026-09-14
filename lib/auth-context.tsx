"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface MockUser {
  name: string;
  email: string;
}

interface AuthContextValue {
  user: MockUser | null;
  signIn: (email: string, name?: string) => void;
  signOut: () => void;
}

const STORAGE_KEY = "8x-amazon-rebuild:auth";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // localStorage unavailable - stay signed out
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn: (email, name) => {
        // Mocked: no real backend or password check, by design (see docs/architecture.md).
        const nextUser: MockUser = { email, name: name ?? email.split("@")[0] };
        setUser(nextUser);
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
        } catch {
          // ignore
        }
      },
      signOut: () => {
        setUser(null);
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          // ignore
        }
      },
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
