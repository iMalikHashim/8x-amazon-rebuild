"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";

function SignInForm() {
  const { signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<"unknown-email" | "wrong-password" | "invalid" | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!email.trim() || !password) {
      setError("invalid");
      return;
    }
    setSubmitting(true);
    const result = signIn(email.trim(), password);
    if (result.ok) {
      router.push(redirectTo);
      return;
    }
    setError(result.error);
    setSubmitting(false);
  };

  return (
    <div className="max-w-[350px] mx-auto py-10 px-4 flex flex-col items-center">
      <Link href="/" className="text-2xl font-bold text-text mb-4">
        amazon
      </Link>

      <form
        onSubmit={handleSubmit}
        className="w-full border border-border rounded-sm p-5 flex flex-col gap-4"
      >
        <h1 className="text-2xl text-text">Sign in</h1>

        <label className="flex flex-col gap-1 text-sm font-bold">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            className="border border-border-strong rounded-sm px-2 py-1.5 font-normal"
            placeholder="you@example.com"
          />
          {error === "unknown-email" && (
            <span className="text-price text-xs font-normal">
              We don&apos;t have an account with that email.{" "}
              <Link href={`/signup?redirect=${encodeURIComponent(redirectTo)}`} className="text-link hover:underline">
                Create one?
              </Link>
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm font-bold">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            className="border border-border-strong rounded-sm px-2 py-1.5 font-normal"
          />
          {error === "wrong-password" && (
            <span className="text-price text-xs font-normal">That password doesn&apos;t match this email.</span>
          )}
          {error === "invalid" && (
            <span className="text-price text-xs font-normal">Enter both an email and a password.</span>
          )}
        </label>

        <Button
          type="submit"
          variant="cta"
          disabled={submitting}
          aria-busy={submitting}
          className="w-full py-2 font-medium disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {submitting ? "Signing in…" : "Sign in"}
        </Button>

        <p className="text-xs text-text-secondary">
          Mocked sign-in for a portfolio rebuild - credentials are checked against accounts created
          via Sign up, stored in this browser only. Nothing is sent anywhere.
        </p>
      </form>

      <p className="text-sm mt-6">
        New here?{" "}
        <Link
          href={`/signup?redirect=${encodeURIComponent(redirectTo)}`}
          className="text-link hover:text-link-hover hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}
