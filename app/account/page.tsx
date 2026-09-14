import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/session";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "@/components/account/SignOutButton";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="max-w-[1500px] mx-auto px-2 sm:px-3 py-12 flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl text-text">Sign in to view your account</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/sign-in?redirect=/account">
            <Button variant="cta" className="px-6 py-2 font-medium">
              Sign in
            </Button>
          </Link>
          <Link href="/signup?redirect=/account">
            <Button variant="secondary" className="px-6 py-2 font-medium">
              Create account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const myOrders = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.placedAt));
  const savedAddress = myOrders[0]
    ? {
        fullName: myOrders[0].addressFullName,
        line1: myOrders[0].addressLine1,
        line2: myOrders[0].addressLine2 ?? undefined,
        city: myOrders[0].addressCity,
        state: myOrders[0].addressState,
        zip: myOrders[0].addressZip,
      }
    : null;

  return (
    <div className="max-w-[700px] mx-auto px-2 sm:px-3 py-4 flex flex-col gap-4">
      <h1 className="text-2xl text-text">Your Account</h1>

      <div className="bg-white border border-border rounded-sm p-5 flex flex-col gap-3">
        <h2 className="font-bold text-text">Profile</h2>
        <div>
          <p className="text-text-secondary text-xs">Name</p>
          <p className="text-text">{user.name}</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">Email</p>
          <p className="text-text">{user.email}</p>
        </div>
        <SignOutButton />
      </div>

      <div className="bg-white border border-border rounded-sm p-5">
        <h2 className="font-bold text-text mb-2">Saved address</h2>
        {savedAddress ? (
          <div className="text-sm text-text-secondary">
            <p className="text-text">{savedAddress.fullName}</p>
            <p>
              {savedAddress.line1}
              {savedAddress.line2 ? `, ${savedAddress.line2}` : ""}
            </p>
            <p>
              {savedAddress.city}, {savedAddress.state} {savedAddress.zip}
            </p>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">
            No saved address yet - the address from your first order will show up here.
          </p>
        )}
      </div>

      <Link
        href="/account/orders"
        className="bg-white border border-border rounded-sm p-5 hover:shadow-md transition-shadow"
      >
        <h2 className="font-bold text-text">Your Orders</h2>
        <p className="text-sm text-text-secondary mt-1">
          {myOrders.length > 0
            ? `${myOrders.length} order${myOrders.length === 1 ? "" : "s"} placed.`
            : "Track, view, or manage your recent orders."}
        </p>
      </Link>
    </div>
  );
}
