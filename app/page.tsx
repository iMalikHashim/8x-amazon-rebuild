import { HeroBanner } from "@/components/home/HeroBanner";
import { PromoCard, type PromoCardProps } from "@/components/home/PromoCard";
import { CarouselRow } from "@/components/ui/CarouselRow";
import { ProductCard } from "@/components/product/ProductCard";
import { getHomeRows } from "@/lib/catalog";

const PROMO_CARDS: PromoCardProps[] = [
  {
    title: "Get your game on",
    tiles: [{ label: "", icon: "Gamepad2", category: "Gaming" }],
    ctaLabel: "Shop gaming",
    ctaHref: "/search?category=Gaming",
  },
  {
    title: "Must-haves for every student",
    tiles: [{ label: "", icon: "Backpack", category: "Back to School" }],
    ctaLabel: "Shop Back to School",
    ctaHref: "/search?category=Back+to+School",
  },
  {
    title: "Top categories in Home & Kitchen",
    tiles: [
      { label: "Cookers", icon: "CookingPot", category: "Home & Kitchen" },
      { label: "Coffee", icon: "Coffee", category: "Home & Kitchen" },
      { label: "Bowls", icon: "Utensils", category: "Home & Kitchen" },
      { label: "Bottles", icon: "GlassWater", category: "Home & Kitchen" },
    ],
    ctaLabel: "Explore all products in Home & Kitchen",
    ctaHref: "/search?category=Home+%26+Kitchen",
  },
  {
    title: "Must-have accessories",
    tiles: [
      { label: "Backpacks", icon: "Backpack", category: "Back to School" },
      { label: "Electronics", icon: "Headphones", category: "Electronics" },
      { label: "Stationery", icon: "Pencil", category: "Back to School" },
      { label: "Fashion", icon: "Shirt", category: "Fashion" },
    ],
    ctaLabel: "Shop now",
    ctaHref: "/search",
  },
];

export default async function Home() {
  const rows = await getHomeRows();

  return (
    <div className="max-w-[1500px] mx-auto px-2 sm:px-3 py-4 flex flex-col gap-4">
      <HeroBanner />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 -mt-8 sm:-mt-16 relative z-10">
        {PROMO_CARDS.map((card) => (
          <PromoCard key={card.title} {...card} />
        ))}
      </div>

      {rows.map((row) => (
        <CarouselRow key={row.title} title={row.title} seeAllHref={`/search?category=${encodeURIComponent(row.title)}`}>
          {row.products.map((product) => (
            <ProductCard key={product.id} product={product} fixedWidth />
          ))}
        </CarouselRow>
      ))}
    </div>
  );
}
