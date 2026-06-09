import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, MessageSquare } from "lucide-react";

import { AuthGateProvider } from "@/components/auth/AuthGateProvider";
import { ImagePlaceholder } from "@/components/shared/ImagePlaceholder";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductDetailStatsBar, ProductDetailVoteActions } from "@/components/product/ProductDetailVoteUI";
import { ProductVoteProvider } from "@/components/product/ProductVoteProvider";
import { ReviewsSection } from "@/components/review/ReviewsSection";
import { Stars } from "@/components/review/Stars";
import { TierBadge } from "@/components/product/TierBadge";
import { mergeVoteSnapshot } from "@/lib/db/merge-votes";
import { dbProductId, getVoteSnapshot } from "@/lib/db/votes";
import {
  getAverageRating,
  getCategories,
  getProductBySlug,
  getRankedProducts,
  getRatingBreakdown,
  getRelatedProducts,
  getReviewsForProduct,
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

  const productId = dbProductId(params.slug, params["product-slug"]);
  const snapshot = await getVoteSnapshot([productId]);
  const [product] = mergeVoteSnapshot([seedProduct], params.slug, snapshot);
  const userVote = snapshot.userVotes[productId] ?? null;

  const reviews = getReviewsForProduct(product);
  const related = getRelatedProducts(product.categorySlug, product.slug);
  const avg = getAverageRating(product);
  const breakdown = getRatingBreakdown(product);
  const totalRatings = Object.values(breakdown).reduce((s, n) => s + n, 0);

  return (
    <AuthGateProvider isAuthenticated={snapshot.isAuthenticated}>
      <ProductVoteProvider initialNetVotes={product.netVotes}>
      <div className="container py-8 pb-28 md:py-12 lg:pb-12">
      {/* Breadcrumb */}
      <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="transition hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <Link href="/categories" className="transition hover:text-foreground">
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

      {/* Header */}
      <div className="grid gap-8 lg:grid-cols-2">
        <ImagePlaceholder
          label={product.imageLabel}
          className="aspect-[4/3] w-full rounded-xl border border-border lg:aspect-square"
        />

        <div>
          <div className="flex items-center gap-2.5">
            <TierBadge tier={product.tier} size="lg" />
            <span className="rounded-full bg-secondary px-3 py-1 text-sm font-semibold">
              #{product.rank} in {product.categoryName}
            </span>
          </div>

          <div className="mt-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {product.brand}
          </div>
          <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight md:text-4xl">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <Stars rating={avg} />
            <span className="text-sm text-muted-foreground">
              {avg} · {formatCount(product.reviewCount)} reviews
            </span>
          </div>

          <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <ProductDetailVoteActions
            productId={product.id}
            initialNetVotes={product.netVotes}
            initialUserVote={userVote}
            price={product.price}
            affiliateUrl={product.affiliateUrl}
          />
        </div>
      </div>

      <ProductDetailStatsBar
        reviewCount={product.reviewCount}
        avgRating={avg}
        rankChange={product.rankChange}
      />

      {/* Review summary */}
      {totalRatings > 0 ? (
        <section className="mt-10 grid gap-6 rounded-xl border border-border bg-card p-6 md:grid-cols-[200px_1fr]">
          <div className="flex flex-col items-center justify-center text-center">
            <span className="font-display text-5xl font-black">{avg}</span>
            <Stars rating={avg} className="mt-2" />
            <span className="mt-1 text-sm text-muted-foreground">
              {formatCount(product.reviewCount)} reviews
            </span>
          </div>
          <div className="flex flex-col justify-center gap-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = breakdown[star] ?? 0;
              const pct = totalRatings ? (count / totalRatings) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-3 text-sm">
                  <span className="w-3 text-muted-foreground">{star}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-tier-b"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-muted-foreground">
                    {formatCount(count)}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Reviews */}
      {reviews.length > 0 ? (
        <ReviewsSection reviews={reviews} />
      ) : (
        <section className="mt-10 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
          <h2 className="font-display text-lg font-bold">No reviews yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Own this one? Be the first to review it.
          </p>
          <Link
            href="/login"
            className="mt-5 inline-flex h-10 items-center rounded-full bg-coral px-5 text-sm font-semibold text-white transition hover:bg-coral-hover"
          >
            Write a review
          </Link>
        </section>
      )}

      {/* Related products */}
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

      {/* Mobile sticky buy bar */}
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
