"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function SignUpForm() {
  const { signUp, emailExists } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [formError, setFormError] = useState("");

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Enter your name.";
    if (!email.trim()) e.email = "Enter your email.";
    else if (!EMAIL_RE.test(email.trim())) e.email = "Enter a valid email address.";
    else if (emailExists(email.trim())) e.email = "An account with this email already exists.";
    if (!password) e.password = `Enter a password.`;
    else if (password.length < MIN_PASSWORD_LENGTH) e.password = `Use at least ${MIN_PASSWORD_LENGTH} characters.`;
    if (!confirm) e.confirm = "Confirm your password.";
    else if (confirm !== password) e.confirm = "Passwords don't match.";
    return e;
  }, [name, email, password, confirm, emailExists]);

  const isValid = Object.keys(errors).length === 0;

  const touch = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirm: true });
    if (!isValid) return;

    const result = signUp(name.trim(), email.trim(), password);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    router.push(redirectTo);
  };

  return (
    <div className="max-w-[380px] mx-auto py-10 px-4 flex flex-col items-center">
      <Link href="/" className="text-2xl font-bold text-text mb-4">
        amazon
      </Link>

      <form onSubmit={handleSubmit} noValidate className="w-full border border-border rounded-sm p-5 flex flex-col gap-4">
        <h1 className="text-2xl text-text">Create account</h1>

        <label className="flex flex-col gap-1 text-sm font-bold">
          Your name
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => touch("name")}
            className="border border-border-strong rounded-sm px-2 py-1.5 font-normal"
            placeholder="First and last name"
          />
          {touched.name && errors.name && <span className="text-price text-xs font-normal">{errors.name}</span>}
        </label>

        <label className="flex flex-col gap-1 text-sm font-bold">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => touch("email")}
            className="border border-border-strong rounded-sm px-2 py-1.5 font-normal"
            placeholder="you@example.com"
          />
          {touched.email && errors.email && <span className="text-price text-xs font-normal">{errors.email}</span>}
        </label>

        <label className="flex flex-col gap-1 text-sm font-bold">
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => touch("password")}
            className="border border-border-strong rounded-sm px-2 py-1.5 font-normal"
          />
          {touched.password && errors.password ? (
            <span className="text-price text-xs font-normal">{errors.password}</span>
          ) : (
            <span className="text-text-secondary text-xs font-normal">At least {MIN_PASSWORD_LENGTH} characters.</span>
          )}
        </label>

        <label className="flex flex-col gap-1 text-sm font-bold">
          Confirm password
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={() => touch("confirm")}
            className="border border-border-strong rounded-sm px-2 py-1.5 font-normal"
          />
          {touched.confirm && errors.confirm && <span className="text-price text-xs font-normal">{errors.confirm}</span>}
        </label>

        {formError && <p className="text-price text-sm">{formError}</p>}

        <Button type="submit" variant="cta" className="w-full py-2 font-medium disabled:opacity-50" disabled={!isValid}>
          Create your account
        </Button>

        <p className="text-xs text-text-secondary">
          Mocked account creation for a portfolio rebuild - stored in this browser&apos;s localStorage
          only, passwords are not hashed, and nothing is sent anywhere. See the README for details.
        </p>
      </form>

      <p className="text-sm mt-6">
        Already have an account?{" "}
        <Link
          href={`/sign-in?redirect=${encodeURIComponent(redirectTo)}`}
          className="text-link hover:text-link-hover hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
