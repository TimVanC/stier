import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessageSquare } from "lucide-react";

import { AuthGateProvider } from "@/components/auth/AuthGateProvider";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { ProductCard } from "@/components/product/ProductCard";
import {
  ProductDetailStatsBar,
  ProductDetailRankBadge,
  ProductDetailVoteActions,
} from "@/components/product/ProductDetailVoteUI";
import { ProductVoteProvider } from "@/components/product/ProductVoteProvider";
import { ProductReviewsBlock } from "@/components/review/ProductReviewsBlock";
import { Stars } from "@/components/review/Stars";
import { mergeVoteSnapshot } from "@/lib/db/merge-votes";
import {
  getProductReviewBundle,
  getReviewCounts,
  mergeReviewCounts,
} from "@/lib/db/reviews";
import { dbProductId, getVoteSnapshot } from "@/lib/db/votes";
import { recomputeRankedProducts } from "@/lib/recompute-rankings";
import {
  getCategories,
  getProductBySlug,
  getRankedProducts,
  getRelatedProducts,
} from "@/lib/seed-data";
import { formatCount } from "@/lib/utils";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getCategories().flatMap((c) =>
    getRankedProducts(c.slug).map((p) => ({
      slug: c.slug,
      "product-slug": p.slug,
    })),
  );
}

export function generateMetadata({
  params,
}: {
  params: { slug: string; "product-slug": string };
}): Metadata {
  const product = getProductBySlug(params.slug, params["product-slug"]);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} by ${product.brand} — ${product.tier} Tier`,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string; "product-slug": string };
}) {
  const seedProduct = getProductBySlug(params.slug, params["product-slug"]);
  if (!seedProduct) notFound();

  const seedCategoryProducts = getRankedProducts(params.slug);
  const productId = dbProductId(params.slug, params["product-slug"]);
  const snapshot = await getVoteSnapshot([productId]);
  const reviewBundle = await getProductReviewBundle(productId);

  let [product] = mergeVoteSnapshot([seedProduct], params.slug, snapshot);
  product = {
    ...product,
    reviewCount: reviewBundle.stats.count,
  };
  product = recomputeRankedProducts([product])[0];

  const userVote = snapshot.userVotes[productId] ?? null;

  const relatedSeed = getRelatedProducts(product.categorySlug, product.slug);
  const relatedIds = relatedSeed.map((p) =>
    dbProductId(params.slug, p.slug),
  );
  const relatedReviewCounts = await getReviewCounts(relatedIds);
  const related = recomputeRankedProducts(
    mergeReviewCounts(
      relatedSeed.map((p) => ({
        ...p,
        id: dbProductId(params.slug, p.slug),
      })),
      relatedReviewCounts,
    ),
  );

  return (
    <AuthGateProvider isAuthenticated={snapshot.isAuthenticated}>
      <ProductVoteProvider
        initialProduct={product}
        categorySlug={params.slug}
        seedProducts={seedCategoryProducts}
      >
        <div className="container py-8 pb-28 md:py-12 lg:pb-12">
          <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <Link href="/" className="transition hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link
              href="/categories"
              className="transition hover:text-foreground"
            >
              Categories
            </Link>
            <ChevronRight className="size-3.5" />
            <Link
              href={`/categories/${product.categorySlug}`}
              className="transition hover:text-foreground"
            >
              {product.categoryName}
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="font-medium text-foreground">{product.name}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-2">
            <ImagePlaceholder
              label={product.imageLabel}
              className="aspect-[4/3] w-full rounded-xl border border-border lg:aspect-square"
            />

            <div>
              <ProductDetailRankBadge />

              <div className="mt-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {product.brand}
              </div>
              <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                {product.name}
              </h1>

              <div className="mt-3 flex items-center gap-3">
                <Stars rating={reviewBundle.stats.avgRating} />
                <span className="text-sm text-muted-foreground">
                  {reviewBundle.stats.avgRating || "—"} ·{" "}
                  {formatCount(reviewBundle.stats.count)} reviews
                </span>
              </div>

              <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
                {product.description}
              </p>

              <ProductDetailVoteActions
                productId={product.id}
                initialUpvotes={product.upvotes}
                initialDownvotes={product.downvotes}
                initialUserVote={userVote}
                price={product.price}
                affiliateUrl={product.affiliateUrl}
              />
            </div>
          </div>

          <ProductDetailStatsBar
            reviewCount={reviewBundle.stats.count}
            avgRating={reviewBundle.stats.avgRating}
            rankChange={product.rankChange}
          />

          <ProductReviewsBlock
            productId={productId}
            initialReviews={reviewBundle.reviews}
            initialStats={reviewBundle.stats}
            userReview={reviewBundle.userReview}
          />

          {related.length > 0 ? (
            <section className="mt-12">
              <div className="mb-5 flex items-center gap-2">
                <MessageSquare className="size-4 text-coral" />
                <h2 className="font-display text-2xl font-extrabold tracking-tight">
                  Other top products in {product.categoryName}
                </h2>
              </div>
              <div className="fade-right -mx-6 px-6">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {related.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur lg:hidden">
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-coral text-sm font-bold text-white"
            >
              Buy {product.price}
            </a>
          </div>
        </div>
      </ProductVoteProvider>
    </AuthGateProvider>
  );
}
