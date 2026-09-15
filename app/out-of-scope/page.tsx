import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default async function OutOfScopePage({
  searchParams,
}: {
  searchParams: Promise<{ feature?: string }>;
}) {
  const { feature } = await searchParams;
  const name = feature?.trim();

  return (
    <div className="max-w-[600px] mx-auto px-2 sm:px-3 py-16 flex flex-col items-center gap-4 text-center">
      <div className="w-14 h-14 rounded-full bg-[#f0f2f2] flex items-center justify-center">
        <Compass size={26} className="text-text-secondary" />
      </div>
      <h1 className="text-2xl text-text">{name ? `${name} isn't part of this rebuild` : "Not part of this rebuild"}</h1>
      <p className="text-text-secondary">
        This project focused on the core shopping loop - search, product pages, cart, checkout,
        orders, reviews, and comparison - end to end, rather than spreading across every corner of
        amazon.com. {name ? name : "This surface"} was deliberately left out to keep that loop
        solid, not overlooked.
      </p>
      <Link href="/">
        <Button variant="cta" className="px-6 py-2 font-medium mt-2">
          Continue shopping
        </Button>
      </Link>
    </div>
  );
}
