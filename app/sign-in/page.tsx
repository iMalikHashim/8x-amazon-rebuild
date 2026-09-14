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
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    signIn(email, name.trim() || undefined);
    router.push(redirectTo);
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
            onChange={(e) => setEmail(e.target.value)}
            className="border border-border-strong rounded-sm px-2 py-1.5 font-normal"
            placeholder="you@example.com"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-bold">
          Name (optional)
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-border-strong rounded-sm px-2 py-1.5 font-normal"
            placeholder="How should we greet you?"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-bold">
          Password
          <input
            type="password"
            required
            className="border border-border-strong rounded-sm px-2 py-1.5 font-normal"
            placeholder="Anything works - this is mocked"
          />
        </label>

        {error && <p className="text-price text-sm">{error}</p>}

        <Button type="submit" variant="cta" className="w-full py-2 font-medium">
          Sign in
        </Button>

        <p className="text-xs text-text-secondary">
          This is a mocked sign-in for a portfolio rebuild - any email/password combination
          works, and nothing is sent anywhere.
        </p>
      </form>

      <p className="text-sm mt-6">
        New here?{" "}
        <span className="text-link hover:text-link-hover hover:underline cursor-default">
          Just fill out the form above.
        </span>
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
