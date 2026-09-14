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

interface StoredUser extends MockUser {
  password: string;
}

export type SignInError = "unknown-email" | "wrong-password";

interface AuthContextValue {
  user: MockUser | null;
  /** True once localStorage has been read - avoids a flash of "unknown email" while still loading. */
  ready: boolean;
  emailExists: (email: string) => boolean;
  signUp: (name: string, email: string, password: string) => { ok: true } | { ok: false; error: string };
  signIn: (email: string, password: string) => { ok: true } | { ok: false; error: SignInError };
  signOut: () => void;
}

const USERS_KEY = "8x-amazon-rebuild:users";
const SESSION_KEY = "8x-amazon-rebuild:session";

const AuthContext = createContext<AuthContextValue | null>(null);

function loadUsers(): StoredUser[] {
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore write failures (private browsing, storage full, etc.)
  }
}

function sameEmail(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUsers(loadUsers());
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) setSessionEmail(raw);
    } catch {
      // localStorage unavailable - stay signed out
    }
    setReady(true);
  }, []);

  const user = useMemo<MockUser | null>(() => {
    if (!sessionEmail) return null;
    const found = users.find((u) => sameEmail(u.email, sessionEmail));
    return found ? { name: found.name, email: found.email } : null;
  }, [sessionEmail, users]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      ready,
      emailExists: (email) => users.some((u) => sameEmail(u.email, email)),
      signUp: (name, email, password) => {
        if (users.some((u) => sameEmail(u.email, email))) {
          return { ok: false, error: "An account with this email already exists." };
        }
        const next = [...users, { name: name.trim(), email: email.trim(), password }];
        setUsers(next);
        saveUsers(next);
        setSessionEmail(email.trim());
        try {
          window.localStorage.setItem(SESSION_KEY, email.trim());
        } catch {
          // ignore
        }
        return { ok: true };
      },
      signIn: (email, password) => {
        const found = users.find((u) => sameEmail(u.email, email));
        if (!found) return { ok: false, error: "unknown-email" };
        if (found.password !== password) return { ok: false, error: "wrong-password" };
        setSessionEmail(found.email);
        try {
          window.localStorage.setItem(SESSION_KEY, found.email);
        } catch {
          // ignore
        }
        return { ok: true };
      },
      signOut: () => {
        setSessionEmail(null);
        try {
          window.localStorage.removeItem(SESSION_KEY);
        } catch {
          // ignore
        }
      },
    }),
    [user, users, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
