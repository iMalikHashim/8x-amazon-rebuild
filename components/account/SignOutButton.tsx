"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";

export function SignOutButton() {
  const { signOut } = useAuth();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={signingOut}
      className="w-fit px-4 py-1.5 mt-2 disabled:opacity-70"
      onClick={async () => {
        setSigningOut(true);
        await signOut();
        router.push("/");
        router.refresh();
      }}
    >
      {signingOut ? "Signing out…" : "Sign out"}
    </Button>
  );
}
