import { getGiftCardProducts } from "@/lib/catalog";
import { GiftCardPicker } from "@/components/gift-cards/GiftCardPicker";

export const dynamic = "force-dynamic";

export default async function GiftCardsPage() {
  const giftCards = await getGiftCardProducts();

  return (
    <div className="max-w-[1000px] mx-auto px-2 sm:px-3 py-8 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl text-text">Amazon Rebuild Gift Cards</h1>
        <p className="text-text-secondary mt-1">Pick a design and an amount - delivered instantly, never expires.</p>
      </div>

      <div className="bg-white border border-border rounded-sm p-6">
        <GiftCardPicker giftCards={giftCards} />
      </div>
    </div>
  );
}
