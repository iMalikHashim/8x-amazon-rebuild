"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";

export default function AccountPage() {
  const { user, signOut } = useAuth();

  if (!user) {
    return (
      <div className="max-w-[1500px] mx-auto px-2 sm:px-3 py-12 flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl text-text">Sign in to view your account</h1>
        <Link href="/sign-in?redirect=/account">
          <Button variant="cta" className="px-6 py-2 font-medium">
            Sign in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto px-2 sm:px-3 py-4 flex flex-col gap-4">
      <h1 className="text-2xl text-text">Your Account</h1>

      <div className="bg-white border border-border rounded-sm p-5 flex flex-col gap-3">
        <div>
          <p className="text-text-secondary text-xs">Name</p>
          <p className="text-text">{user.name}</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">Email</p>
          <p className="text-text">{user.email}</p>
        </div>
        <Button type="button" variant="secondary" onClick={() => signOut()} className="w-fit px-4 py-1.5 mt-2">
          Sign out
        </Button>
      </div>

      <Link
        href="/account/orders"
        className="bg-white border border-border rounded-sm p-5 hover:shadow-md transition-shadow"
      >
        <h2 className="font-bold text-text">Your Orders</h2>
        <p className="text-sm text-text-secondary mt-1">Track, view, or manage your recent orders.</p>
      </Link>
    </div>
  );
}
