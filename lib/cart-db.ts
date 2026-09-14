import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { cartItems } from "@/lib/db/schema";

/**
 * Adds to (or creates) a user's cart row for a product. Un-saves it if it
 * was previously saved-for-later, matching the old localStorage reducer's
 * behavior: adding an item you'd saved for later moves it back to the cart.
 */
export async function addToCart(userId: string, productId: string, quantity: number) {
  await db
    .insert(cartItems)
    .values({ userId, productId, quantity, savedForLater: false })
    .onConflictDoUpdate({
      target: [cartItems.userId, cartItems.productId],
      set: { quantity: sql`${cartItems.quantity} + ${quantity}`, savedForLater: false },
    });
}
