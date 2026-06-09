export type Tier = "S+" | "S" | "A" | "B" | "C" | "D" | "F";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  isFeatured: boolean;
  isActive: boolean;
  createdDaysAgo: number;
}

export interface CategoryWithStats extends Category {
  productCount: number;
  voteCount: number;
  topProductName: string | null;
  topTier: Tier | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  categorySlug: string;
  description: string;
  /** Display price, e.g. "$220" or "$18 / 12oz". */
  price: string;
  upvotes: number;
  downvotes: number;
  reviewCount: number;
  /** Rank positions gained/lost in the last 7 days. */
  rankChange: number;
  /** Net votes gained in the last 7 days (for "rising"). */
  weeklyVotes: number;
  createdDaysAgo: number;
  /** Placeholder label shown on the image area. */
  imageLabel: string;
  affiliateUrl: string;
}

export interface RankedProduct extends Product {
  rank: number;
  score: number;
  tier: Tier;
  categoryName: string;
  netVotes: number;
}

export interface Review {
  id: string;
  username: string;
  rating: number;
  title: string;
  body: string;
  pros: string;
  cons: string;
  ownsProduct: boolean;
  helpfulCount: number;
  daysAgo: number;
}
