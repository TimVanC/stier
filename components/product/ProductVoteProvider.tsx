"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { VoteTallyState } from "@/components/product/VoteButtons";
import { fetchVoteSnapshot } from "@/lib/actions/vote-read";
import { mergeVoteSnapshot } from "@/lib/db/merge-votes";
import { recomputeRankedProducts } from "@/lib/recompute-rankings";
import type { RankedProduct, Tier } from "@/types";

interface ProductVoteContextValue {
  netVotes: number;
  tier: Tier;
  rank: number;
  categoryName: string;
  onTallyChange: (tally: VoteTallyState) => void;
}

const ProductVoteContext = createContext<ProductVoteContextValue | null>(null);

export function ProductVoteProvider({
  initialProduct,
  categorySlug,
  seedProducts,
  children,
}: {
  initialProduct: RankedProduct;
  categorySlug: string;
  seedProducts: RankedProduct[];
  children: ReactNode;
}) {
  const [live, setLive] = useState(initialProduct);

  const refreshRankings = useCallback(async () => {
    const productIds = seedProducts.map((p) => p.id);
    const snapshot = await fetchVoteSnapshot(productIds);
    const merged = mergeVoteSnapshot(seedProducts, snapshot);
    const current = merged.find((p) => p.slug === initialProduct.slug);
    if (current) setLive(current);
  }, [seedProducts, initialProduct.slug]);

  const onTallyChange = useCallback(
    (tally: VoteTallyState) => {
      const categoryRows = seedProducts.map((p) => {
        if (p.slug === initialProduct.slug) {
          return {
            ...p,
            upvotes: tally.upvotes,
            downvotes: tally.downvotes,
            netVotes: tally.netVotes,
          };
        }
        return p;
      });
      const recomputed = recomputeRankedProducts(categoryRows);
      const current = recomputed.find((p) => p.slug === initialProduct.slug);
      if (current) setLive(current);
      void refreshRankings();
    },
    [seedProducts, initialProduct.slug, refreshRankings],
  );

  const value = useMemo(
    () => ({
      netVotes: live.netVotes,
      tier: live.tier,
      rank: live.rank,
      categoryName: live.categoryName,
      onTallyChange,
    }),
    [live, onTallyChange],
  );

  return (
    <ProductVoteContext.Provider value={value}>
      {children}
    </ProductVoteContext.Provider>
  );
}

export function useProductVoteCount() {
  const ctx = useContext(ProductVoteContext);
  if (!ctx) {
    throw new Error(
      "useProductVoteCount must be used within ProductVoteProvider",
    );
  }
  return ctx;
}
