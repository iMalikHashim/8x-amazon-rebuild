"use client";

import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";

const LIST_LINKS = [
  { label: "Create a List", href: "#" },
  { label: "Find a List or Registry", href: "#" },
];

const SIGNED_OUT_ACCOUNT_LINKS = [
  { label: "Account", href: "/account" },
  { label: "Orders", href: "/account/orders" },
  { label: "Recommendations", href: "#" },
  { label: "Browsing History", href: "#" },
  { label: "Your Shopping preferences", href: "#" },
  { label: "Watchlist", href: "#" },
  { label: "Video Purchases & Rentals", href: "#" },
  { label: "Content & Devices", href: "#" },
  { label: "Memberships & Subscriptions", href: "#" },
];

export function AccountFlyout() {
  const { user, signOut } = useAuth();

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="flex flex-col justify-center leading-tight h-full px-2 py-1 text-left hover:outline hover:outline-1 hover:outline-white/70 rounded-xs"
        >
          <span className="text-xs text-white/90">{user ? `Hello, ${user.name}` : "Hello, sign in"}</span>
          <span className="flex items-center gap-0.5 text-sm font-bold text-white">
            Account &amp; Lists
            <ChevronDown size={14} />
          </span>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-50 w-[340px] max-w-[calc(100vw-1.5rem)] bg-white text-text shadow-xl border border-border rounded-sm p-5 data-[state=open]:animate-[popover-in_120ms_ease-out]"
        >
          {!user && (
            <>
              <Link href="/sign-in">
                <Button variant="cta" className="w-full !rounded-md py-2 font-medium">
                  Sign in
                </Button>
              </Link>
              <p className="text-xs text-center mt-2">
                New customer?{" "}
                <Link href="/signup" className="text-link hover:text-link-hover hover:underline">
                  Start here.
                </Link>
              </p>
              <hr className="my-4 border-border" />
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-sm mb-2">Your Lists</h3>
              <ul className="space-y-1.5">
                {LIST_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm hover:text-link hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-sm mb-2">Your Account</h3>
              <ul className="space-y-1.5">
                {SIGNED_OUT_ACCOUNT_LINKS.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm hover:text-link hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {user && (
            <>
              <hr className="my-4 border-border" />
              <button
                type="button"
                onClick={() => signOut()}
                className="text-sm text-link hover:text-link-hover hover:underline"
              >
                Sign out
              </button>
            </>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
