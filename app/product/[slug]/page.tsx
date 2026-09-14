import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { RatingStars } from "@/components/ui/RatingStars";
import { ImageGallery } from "@/components/pdp/ImageGallery";
import { BuyBox } from "@/components/pdp/BuyBox";
import { ReviewsSection } from "@/components/pdp/ReviewsSection";
import { CarouselRow } from "@/components/ui/CarouselRow";
import { ProductCard } from "@/components/product/ProductCard";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);

  return (
    <div className="max-w-[1500px] mx-auto px-2 sm:px-3 py-4 flex flex-col gap-4">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: product.category, href: `/search?category=${encodeURIComponent(product.category)}` },
          { label: product.title },
        ]}
      />

      <div className="bg-white border border-border rounded-sm p-4 sm:p-6 flex flex-col lg:flex-row gap-6">
        <ImageGallery product={product} />

        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <h1 className="text-xl sm:text-2xl font-medium text-text">{product.title}</h1>
          <p className="text-sm text-link hover:text-link-hover hover:underline w-fit">
            Visit the {product.brand} Store
          </p>
          <a href="#reviews" className="flex items-center gap-2 w-fit">
            <RatingStars rating={product.rating} reviewCount={product.reviewCount} size={16} />
          </a>
          <hr className="border-border my-1" />

          <h2 className="font-bold text-base text-text mt-1">About this item</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5 text-sm text-text">
            {product.bullets.map((bullet, i) => (
              <li key={i}>{bullet}</li>
            ))}
          </ul>
        </div>

        <BuyBox product={product} />
      </div>

      <section className="bg-white border border-border rounded-sm p-4 sm:p-6">
        <h2 className="text-xl font-bold text-text mb-3">Product description</h2>
        <p className="text-sm text-text leading-relaxed max-w-3xl">{product.description}</p>
      </section>

      <ReviewsSection product={product} />

      {related.length > 0 && (
        <CarouselRow title={`More from ${product.category}`}>
          {related.map((p) => (
            <ProductCard key={p.id} product={p} fixedWidth />
          ))}
        </CarouselRow>
      )}
    </div>
  );
}
