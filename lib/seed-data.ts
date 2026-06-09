import type {
  Category,
  CategoryWithStats,
  Product,
  RankedProduct,
  Review,
} from "@/types";
import { assignTier, calculateScore } from "@/lib/ranking";

/**
 * Placeholder seed data for Phase 2 browsing. This is intentionally local and
 * deterministic so every page looks populated before the Supabase data layer
 * is wired in. Shapes mirror the DB schema in .cursorrules.
 */

const RAW_CATEGORIES: Category[] = [
  {
    id: "cat-coffee",
    name: "Coffee Beans",
    slug: "coffee-beans",
    description:
      "Single-origin, blends, light to dark — ranked by people who grind every morning.",
    isFeatured: true,
    isActive: true,
    createdDaysAgo: 210,
  },
  {
    id: "cat-headphones",
    name: "Headphones",
    slug: "headphones",
    description:
      "Over-ear, open-back, and studio cans worth the money. No marketing fluff.",
    isFeatured: true,
    isActive: true,
    createdDaysAgo: 240,
  },
  {
    id: "cat-jackets",
    name: "Winter Jackets",
    slug: "winter-jackets",
    description:
      "Insulated layers tested in real cold by people who live in it.",
    isFeatured: true,
    isActive: true,
    createdDaysAgo: 150,
  },
  {
    id: "cat-running-shoes",
    name: "Running Shoes",
    slug: "running-shoes",
    description: "Daily trainers to race-day super shoes, ranked by milage.",
    isFeatured: false,
    isActive: true,
    createdDaysAgo: 180,
  },
  {
    id: "cat-slippers",
    name: "Slippers",
    slug: "slippers",
    description: "Indoor comfort that lasts more than one winter.",
    isFeatured: false,
    isActive: true,
    createdDaysAgo: 60,
  },
  {
    id: "cat-skillets",
    name: "Cast Iron Skillets",
    slug: "cast-iron-skillets",
    description: "Buy-it-for-life cookware, seasoned by decades of opinions.",
    isFeatured: false,
    isActive: true,
    createdDaysAgo: 95,
  },
  {
    id: "cat-keyboards",
    name: "Mechanical Keyboards",
    slug: "mechanical-keyboards",
    description: "Boards and switches that survive the daily pound.",
    isFeatured: false,
    isActive: true,
    createdDaysAgo: 30,
  },
  {
    id: "cat-backpacks",
    name: "Backpacks",
    slug: "backpacks",
    description: "Everyday carry and travel packs ranked by what survives.",
    isFeatured: false,
    isActive: true,
    createdDaysAgo: 45,
  },
];

type RawProduct = Omit<Product, "categorySlug">;

const RAW_PRODUCTS: Record<string, RawProduct[]> = {
  "coffee-beans": [
    {
      id: "p-hairbender",
      slug: "stumptown-hairbender",
      name: "Hairbender",
      brand: "Stumptown Coffee",
      description:
        "A complex, syrupy espresso blend with notes of dark cherry and chocolate. The benchmark most other blends get measured against.",
      price: "$18 / 12oz",
      upvotes: 3210,
      downvotes: 180,
      reviewCount: 240,
      rankChange: 0,
      weeklyVotes: 2140,
      createdDaysAgo: 200,
      imageLabel: "Coffee bean bag · 12 oz",
      affiliateUrl: "https://example.com/buy/hairbender",
    },
    {
      id: "p-hologram",
      slug: "counter-culture-hologram",
      name: "Hologram",
      brand: "Counter Culture",
      description:
        "Bright, layered, and endlessly drinkable. A rotating blend tuned for clarity in the cup.",
      price: "$20 / 12oz",
      upvotes: 2884,
      downvotes: 210,
      reviewCount: 185,
      rankChange: 1,
      weeklyVotes: 1180,
      createdDaysAgo: 160,
      imageLabel: "Coffee bean bag · 12 oz",
      affiliateUrl: "https://example.com/buy/hologram",
    },
    {
      id: "p-black-cat",
      slug: "intelligentsia-black-cat",
      name: "Black Cat Classic Espresso",
      brand: "Intelligentsia",
      description:
        "Heavy body, low acidity, caramel sweetness. Pulls a forgiving, consistent shot.",
      price: "$17 / 12oz",
      upvotes: 2012,
      downvotes: 240,
      reviewCount: 140,
      rankChange: -1,
      weeklyVotes: 640,
      createdDaysAgo: 150,
      imageLabel: "Coffee bean bag · 12 oz",
      affiliateUrl: "https://example.com/buy/black-cat",
    },
    {
      id: "p-wizard",
      slug: "onyx-monarch",
      name: "Monarch",
      brand: "Onyx Coffee Lab",
      description:
        "A bold, chocolate-forward blend built for milk drinks and straight shots alike.",
      price: "$22 / 10oz",
      upvotes: 1776,
      downvotes: 190,
      reviewCount: 95,
      rankChange: 2,
      weeklyVotes: 720,
      createdDaysAgo: 120,
      imageLabel: "Coffee bean bag · 10 oz",
      affiliateUrl: "https://example.com/buy/monarch",
    },
    {
      id: "p-french",
      slug: "peets-major-dickasons",
      name: "Major Dickason's Blend",
      brand: "Peet's Coffee",
      description:
        "Full-bodied, rich, and dependable dark roast. A grocery-aisle staple that earns its spot.",
      price: "$13 / 12oz",
      upvotes: 1120,
      downvotes: 520,
      reviewCount: 60,
      rankChange: -2,
      weeklyVotes: 210,
      createdDaysAgo: 320,
      imageLabel: "Coffee bean bag · 12 oz",
      affiliateUrl: "https://example.com/buy/major-dickasons",
    },
    {
      id: "p-decaf",
      slug: "lifeboost-medium",
      name: "Medium Roast",
      brand: "Lifeboost",
      description:
        "Smooth, low-acid single origin. Polarizing on price, loved for the stomach-friendly cup.",
      price: "$35 / 12oz",
      upvotes: 410,
      downvotes: 610,
      reviewCount: 34,
      rankChange: -1,
      weeklyVotes: 60,
      createdDaysAgo: 90,
      imageLabel: "Coffee bean bag · 12 oz",
      affiliateUrl: "https://example.com/buy/lifeboost-medium",
    },
  ],
  headphones: [
    {
      id: "p-hd6xx",
      slug: "sennheiser-hd-6xx",
      name: "HD 6XX",
      brand: "Sennheiser × Drop",
      description:
        "The open-back reference for under $250. Natural mids, smooth treble, endlessly comfortable for long sessions.",
      price: "$220",
      upvotes: 14800,
      downvotes: 420,
      reviewCount: 300,
      rankChange: 0,
      weeklyVotes: 3402,
      createdDaysAgo: 220,
      imageLabel: "Over-ear headphones",
      affiliateUrl: "https://example.com/buy/hd6xx",
    },
    {
      id: "p-dt770",
      slug: "beyerdynamic-dt-770-pro",
      name: "DT 770 Pro",
      brand: "Beyerdynamic",
      description:
        "Closed-back studio workhorse with deep bass and bombproof build. Great for noisy rooms.",
      price: "$159",
      upvotes: 9100,
      downvotes: 510,
      reviewCount: 225,
      rankChange: 1,
      weeklyVotes: 842,
      createdDaysAgo: 240,
      imageLabel: "Over-ear headphones",
      affiliateUrl: "https://example.com/buy/dt770",
    },
    {
      id: "p-edition-xs",
      slug: "hifiman-edition-xs",
      name: "Edition XS",
      brand: "HIFIMAN",
      description:
        "Planar magnetic detail and a wide soundstage at a price that undercuts the competition.",
      price: "$269",
      upvotes: 6400,
      downvotes: 380,
      reviewCount: 160,
      rankChange: 2,
      weeklyVotes: 980,
      createdDaysAgo: 140,
      imageLabel: "Over-ear headphones",
      affiliateUrl: "https://example.com/buy/edition-xs",
    },
    {
      id: "p-m50x",
      slug: "audio-technica-m50x",
      name: "ATH-M50x",
      brand: "Audio-Technica",
      description:
        "The ubiquitous closed-back monitor. Punchy, durable, and a safe first 'real' pair.",
      price: "$149",
      upvotes: 5200,
      downvotes: 690,
      reviewCount: 60,
      rankChange: -1,
      weeklyVotes: 420,
      createdDaysAgo: 300,
      imageLabel: "Over-ear headphones",
      affiliateUrl: "https://example.com/buy/m50x",
    },
    {
      id: "p-sundara",
      slug: "hifiman-sundara",
      name: "Sundara",
      brand: "HIFIMAN",
      description:
        "Crisp, neutral planar sound. Needs a little power but rewards you for it.",
      price: "$299",
      upvotes: 4100,
      downvotes: 320,
      reviewCount: 100,
      rankChange: 3,
      weeklyVotes: 560,
      createdDaysAgo: 130,
      imageLabel: "Over-ear headphones",
      affiliateUrl: "https://example.com/buy/sundara",
    },
  ],
  "winter-jackets": [
    {
      id: "p-das-light",
      slug: "patagonia-das-light-hoody",
      name: "DAS Light Hoody",
      brand: "Patagonia",
      description:
        "Lightweight synthetic belay jacket that stays warm when wet. An alpine favorite.",
      price: "$329",
      upvotes: 5800,
      downvotes: 240,
      reviewCount: 240,
      rankChange: -1,
      weeklyVotes: 84,
      createdDaysAgo: 140,
      imageLabel: "Insulated jacket",
      affiliateUrl: "https://example.com/buy/das-light",
    },
    {
      id: "p-cerium",
      slug: "arcteryx-cerium",
      name: "Cerium Hoody",
      brand: "Arc'teryx",
      description:
        "Premium down warmth at a featherweight. Pricey, but the gold standard for cold-dry days.",
      price: "$400",
      upvotes: 5500,
      downvotes: 410,
      reviewCount: 180,
      rankChange: 1,
      weeklyVotes: 320,
      createdDaysAgo: 160,
      imageLabel: "Down jacket",
      affiliateUrl: "https://example.com/buy/cerium",
    },
    {
      id: "p-nano-puff",
      slug: "patagonia-nano-puff",
      name: "Nano Puff",
      brand: "Patagonia",
      description:
        "The do-everything synthetic puffy. Compresses small, layers well, lasts years.",
      price: "$239",
      upvotes: 4800,
      downvotes: 300,
      reviewCount: 120,
      rankChange: 0,
      weeklyVotes: 210,
      createdDaysAgo: 200,
      imageLabel: "Synthetic puffy",
      affiliateUrl: "https://example.com/buy/nano-puff",
    },
    {
      id: "p-mcmurdo",
      slug: "north-face-mcmurdo",
      name: "McMurdo Parka",
      brand: "The North Face",
      description:
        "A serious city parka for deep winter. Heavy, warm, and built to shrug off slush.",
      price: "$380",
      upvotes: 3100,
      downvotes: 360,
      reviewCount: 70,
      rankChange: -2,
      weeklyVotes: 70,
      createdDaysAgo: 220,
      imageLabel: "Winter parka",
      affiliateUrl: "https://example.com/buy/mcmurdo",
    },
  ],
  "running-shoes": [
    {
      id: "p-endorphin-pro",
      slug: "saucony-endorphin-pro-4",
      name: "Endorphin Pro 4",
      brand: "Saucony",
      description:
        "Carbon-plated race shoe with a springy, propulsive ride from 5k to the marathon.",
      price: "$225",
      upvotes: 9100,
      downvotes: 280,
      reviewCount: 240,
      rankChange: 4,
      weeklyVotes: 1820,
      createdDaysAgo: 90,
      imageLabel: "Running shoe · side",
      affiliateUrl: "https://example.com/buy/endorphin-pro-4",
    },
    {
      id: "p-vaporfly",
      slug: "nike-vaporfly-3",
      name: "Vaporfly 3",
      brand: "Nike",
      description:
        "The shoe that started the super-shoe era, still one of the most efficient on race day.",
      price: "$260",
      upvotes: 8400,
      downvotes: 520,
      reviewCount: 180,
      rankChange: -1,
      weeklyVotes: 940,
      createdDaysAgo: 150,
      imageLabel: "Running shoe · side",
      affiliateUrl: "https://example.com/buy/vaporfly-3",
    },
    {
      id: "p-ghost",
      slug: "brooks-ghost-16",
      name: "Ghost 16",
      brand: "Brooks",
      description:
        "The dependable daily trainer. Smooth, neutral, and friendly to high-mileage weeks.",
      price: "$140",
      upvotes: 7200,
      downvotes: 410,
      reviewCount: 120,
      rankChange: 0,
      weeklyVotes: 510,
      createdDaysAgo: 130,
      imageLabel: "Running shoe · side",
      affiliateUrl: "https://example.com/buy/ghost-16",
    },
    {
      id: "p-clifton",
      slug: "hoka-clifton-9",
      name: "Clifton 9",
      brand: "HOKA",
      description:
        "Plush, lightweight cushioning for easy days. A crowd favorite for recovery runs.",
      price: "$145",
      upvotes: 6600,
      downvotes: 480,
      reviewCount: 70,
      rankChange: 1,
      weeklyVotes: 430,
      createdDaysAgo: 140,
      imageLabel: "Running shoe · side",
      affiliateUrl: "https://example.com/buy/clifton-9",
    },
  ],
  slippers: [
    {
      id: "p-glerups",
      slug: "glerups-wool-boot",
      name: "Wool Boot, Natural",
      brand: "Glerups",
      description:
        "Felted wool that breathes and lasts. The rubber sole makes them quick-trip-to-the-mailbox ready.",
      price: "$130",
      upvotes: 3200,
      downvotes: 210,
      reviewCount: 200,
      rankChange: 2,
      weeklyVotes: 612,
      createdDaysAgo: 50,
      imageLabel: "Wool slipper",
      affiliateUrl: "https://example.com/buy/glerups",
    },
    {
      id: "p-mayari",
      slug: "birkenstock-mayari",
      name: "Mayari",
      brand: "Birkenstock",
      description:
        "Cork footbed comfort that molds to your foot. Not fuzzy, but unmatched support.",
      price: "$110",
      upvotes: 3000,
      downvotes: 260,
      reviewCount: 150,
      rankChange: 0,
      weeklyVotes: 280,
      createdDaysAgo: 70,
      imageLabel: "Footbed sandal",
      affiliateUrl: "https://example.com/buy/mayari",
    },
    {
      id: "p-suicoke",
      slug: "suicoke-original",
      name: "Original",
      brand: "Suicoke",
      description:
        "Strappy, cushioned house-to-street comfort. A cult favorite that lasts.",
      price: "$120",
      upvotes: 2600,
      downvotes: 340,
      reviewCount: 90,
      rankChange: -1,
      weeklyVotes: 130,
      createdDaysAgo: 60,
      imageLabel: "Slide slipper",
      affiliateUrl: "https://example.com/buy/suicoke",
    },
    {
      id: "p-llbean-moc",
      slug: "llbean-wicked-good-moccasin",
      name: "Wicked Good Moccasin",
      brand: "L.L.Bean",
      description:
        "Shearling-lined moccasins that feel like a hug. Warm, cushioned, and a perennial value pick.",
      price: "$89",
      upvotes: 2400,
      downvotes: 300,
      reviewCount: 50,
      rankChange: -1,
      weeklyVotes: 90,
      createdDaysAgo: 75,
      imageLabel: "Shearling moccasin",
      affiliateUrl: "https://example.com/buy/llbean-moccasin",
    },
  ],
  "cast-iron-skillets": [
    {
      id: "p-field-no8",
      slug: "field-company-no-8",
      name: "No. 8 Cast Iron Skillet",
      brand: "Field Company",
      description:
        "Lightweight, machine-smooth cast iron with a naturally slick finish out of the box.",
      price: "$165",
      upvotes: 3400,
      downvotes: 190,
      reviewCount: 200,
      rankChange: 6,
      weeklyVotes: 980,
      createdDaysAgo: 80,
      imageLabel: "Cast iron skillet · 10 in",
      affiliateUrl: "https://example.com/buy/field-no8",
    },
    {
      id: "p-lodge",
      slug: "lodge-classic-10-25",
      name: 'Classic 10.25" Skillet',
      brand: "Lodge",
      description:
        "The unkillable budget pick. Rougher finish, but seasons up beautifully and costs a fraction.",
      price: "$25",
      upvotes: 2900,
      downvotes: 520,
      reviewCount: 150,
      rankChange: 0,
      weeklyVotes: 410,
      createdDaysAgo: 300,
      imageLabel: "Cast iron skillet · 10 in",
      affiliateUrl: "https://example.com/buy/lodge",
    },
    {
      id: "p-smithey",
      slug: "smithey-no-10",
      name: "No. 10 Skillet",
      brand: "Smithey Ironware",
      description:
        "Hand-finished, polished interior with heirloom looks. The splurge that earns compliments.",
      price: "$200",
      upvotes: 2600,
      downvotes: 230,
      reviewCount: 90,
      rankChange: 1,
      weeklyVotes: 340,
      createdDaysAgo: 110,
      imageLabel: "Cast iron skillet · 10 in",
      affiliateUrl: "https://example.com/buy/smithey",
    },
    {
      id: "p-stargazer",
      slug: "stargazer-10-5-skillet",
      name: '10.5" Skillet',
      brand: "Stargazer",
      description:
        "Polished cooking surface, ergonomic handle, and pour spouts. A modern take that cooks like a dream.",
      price: "$135",
      upvotes: 2200,
      downvotes: 180,
      reviewCount: 50,
      rankChange: 2,
      weeklyVotes: 260,
      createdDaysAgo: 70,
      imageLabel: "Cast iron skillet · 10 in",
      affiliateUrl: "https://example.com/buy/stargazer",
    },
  ],
  "mechanical-keyboards": [
    {
      id: "p-q1",
      slug: "keychron-q1-pro",
      name: "Q1 Pro",
      brand: "Keychron",
      description:
        "Gasket-mounted aluminum board with wireless, hot-swap switches, and a thocky sound out of the box.",
      price: "$199",
      upvotes: 2200,
      downvotes: 180,
      reviewCount: 200,
      rankChange: 5,
      weeklyVotes: 760,
      createdDaysAgo: 28,
      imageLabel: "Mechanical keyboard",
      affiliateUrl: "https://example.com/buy/q1-pro",
    },
    {
      id: "p-nk65",
      slug: "novelkeys-nk65",
      name: "NK65",
      brand: "NovelKeys",
      description:
        "A reliable 65% entry into the hobby with a great stock typing feel.",
      price: "$120",
      upvotes: 2100,
      downvotes: 160,
      reviewCount: 150,
      rankChange: 1,
      weeklyVotes: 240,
      createdDaysAgo: 60,
      imageLabel: "Mechanical keyboard",
      affiliateUrl: "https://example.com/buy/nk65",
    },
    {
      id: "p-mode-sonnet",
      slug: "mode-sonnet",
      name: "Sonnet",
      brand: "Mode Designs",
      description:
        "Premium enthusiast board with a refined sound profile. For people who know what they want.",
      price: "$345",
      upvotes: 1500,
      downvotes: 140,
      reviewCount: 90,
      rankChange: 2,
      weeklyVotes: 180,
      createdDaysAgo: 40,
      imageLabel: "Mechanical keyboard",
      affiliateUrl: "https://example.com/buy/sonnet",
    },
    {
      id: "p-keychron-v1",
      slug: "keychron-v1",
      name: "V1",
      brand: "Keychron",
      description:
        "Wired budget sibling of the Q-series. Gasket mount and hot-swap at a fraction of the price.",
      price: "$84",
      upvotes: 2000,
      downvotes: 150,
      reviewCount: 50,
      rankChange: 3,
      weeklyVotes: 320,
      createdDaysAgo: 35,
      imageLabel: "Mechanical keyboard",
      affiliateUrl: "https://example.com/buy/keychron-v1",
    },
  ],
  backpacks: [
    {
      id: "p-aer-travel",
      slug: "aer-travel-pack-3",
      name: "Travel Pack 3",
      brand: "Aer",
      description:
        "Clamshell carry-on backpack with smart organization and bombproof Cordura.",
      price: "$249",
      upvotes: 3300,
      downvotes: 160,
      reviewCount: 200,
      rankChange: 3,
      weeklyVotes: 540,
      createdDaysAgo: 40,
      imageLabel: "Travel backpack",
      affiliateUrl: "https://example.com/buy/aer-travel-3",
    },
    {
      id: "p-fjallraven",
      slug: "fjallraven-kanken",
      name: "Kånken",
      brand: "Fjällräven",
      description:
        "Iconic, simple daypack. Not the most ergonomic, but durable and endlessly stylish.",
      price: "$90",
      upvotes: 2600,
      downvotes: 520,
      reviewCount: 90,
      rankChange: -1,
      weeklyVotes: 160,
      createdDaysAgo: 200,
      imageLabel: "Daypack",
      affiliateUrl: "https://example.com/buy/kanken",
    },
    {
      id: "p-peak-everyday",
      slug: "peak-design-everyday-v2",
      name: "Everyday Backpack V2",
      brand: "Peak Design",
      description:
        "Camera-friendly EDC pack with clever FlexFold dividers and weatherproof build.",
      price: "$280",
      upvotes: 3000,
      downvotes: 240,
      reviewCount: 150,
      rankChange: 1,
      weeklyVotes: 300,
      createdDaysAgo: 90,
      imageLabel: "EDC backpack",
      affiliateUrl: "https://example.com/buy/everyday-v2",
    },
    {
      id: "p-tombihn-synapse",
      slug: "tom-bihn-synapse-25",
      name: "Synapse 25",
      brand: "Tom Bihn",
      description:
        "Cult-favorite EDC pack with deep pockets and bombproof stitching. Made in Seattle, built to outlast you.",
      price: "$230",
      upvotes: 2400,
      downvotes: 180,
      reviewCount: 50,
      rankChange: 1,
      weeklyVotes: 210,
      createdDaysAgo: 65,
      imageLabel: "EDC backpack",
      affiliateUrl: "https://example.com/buy/tom-bihn-synapse",
    },
  ],
};

// --- Enrichment helpers -----------------------------------------------------

function enrich(raw: RawProduct, categorySlug: string): Omit<RankedProduct, "rank" | "tier"> {
  const score = calculateScore(
    raw.upvotes,
    raw.downvotes,
    raw.reviewCount,
    raw.createdDaysAgo,
  );
  const category = RAW_CATEGORIES.find((c) => c.slug === categorySlug);
  return {
    ...raw,
    categorySlug,
    score,
    categoryName: category?.name ?? "",
    netVotes: raw.upvotes - raw.downvotes,
  };
}

/** All products in a category, ranked (1..n) with relative tiers assigned. */
export function getRankedProducts(categorySlug: string): RankedProduct[] {
  const raws = RAW_PRODUCTS[categorySlug] ?? [];
  const enriched = raws
    .map((r) => enrich(r, categorySlug))
    .sort((a, b) => b.score - a.score);
  if (enriched.length === 0) return [];

  const scores = enriched.map((p) => p.score);
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const categoryVotes = enriched.reduce(
    (sum, p) => sum + p.upvotes + p.downvotes,
    0,
  );

  return enriched.map((p, i) => ({
    ...p,
    rank: i + 1,
    tier: assignTier({
      score: p.score,
      minScore,
      maxScore,
      netVotes: p.netVotes,
      productVotes: p.upvotes + p.downvotes,
      categoryVotes,
    }),
  }));
}

export function getCategories(): Category[] {
  return RAW_CATEGORIES.filter((c) => c.isActive);
}

export function getCategoriesWithStats(): CategoryWithStats[] {
  return getCategories().map((c) => {
    const ranked = getRankedProducts(c.slug);
    const voteCount = ranked.reduce((sum, p) => sum + p.upvotes + p.downvotes, 0);
    return {
      ...c,
      productCount: ranked.length,
      voteCount,
      topProductName: ranked[0]?.name ?? null,
      topTier: ranked[0]?.tier ?? null,
    };
  });
}

export function getFeaturedCategories(): CategoryWithStats[] {
  return getCategoriesWithStats().filter((c) => c.isFeatured);
}

export function getCategoryBySlug(slug: string): CategoryWithStats | undefined {
  return getCategoriesWithStats().find((c) => c.slug === slug);
}

export function getProductBySlug(
  categorySlug: string,
  productSlug: string,
): RankedProduct | undefined {
  return getRankedProducts(categorySlug).find((p) => p.slug === productSlug);
}

/** Top movers across all categories in the last 7 days. */
export function getRisingProducts(limit = 7): RankedProduct[] {
  const all = getCategories().flatMap((c) => getRankedProducts(c.slug));
  return all.sort((a, b) => b.weeklyVotes - a.weeklyVotes).slice(0, limit);
}

export function getRelatedProducts(
  categorySlug: string,
  excludeSlug: string,
  limit = 4,
): RankedProduct[] {
  return getRankedProducts(categorySlug)
    .filter((p) => p.slug !== excludeSlug)
    .slice(0, limit);
}

export function getSiteStats() {
  const categories = getCategories();
  const all = categories.flatMap((c) => getRankedProducts(c.slug));
  const votes = all.reduce((sum, p) => sum + p.upvotes + p.downvotes, 0);
  return {
    productCount: all.length,
    categoryCount: categories.length,
    voteCount: votes,
    affiliateLinks: 0,
  };
}

// --- Reviews ----------------------------------------------------------------

const REVIEW_TEMPLATES: Omit<Review, "id">[] = [
  {
    username: "trailmix_tom",
    rating: 5,
    title: "Lives up to the hype",
    body: "I was skeptical given how much people rave about this, but after three months of daily use it's genuinely earned the top spot for me. No regrets.",
    pros: "Build quality, value, comfortable for hours",
    cons: "Took a week to break in",
    ownsProduct: true,
    helpfulCount: 84,
    daysAgo: 6,
  },
  {
    username: "minimalist_mia",
    rating: 4,
    title: "Great, with one caveat",
    body: "Does almost everything right. Knocked one star because the price creeps up fast once you add the extras, but the core product is excellent.",
    pros: "Thoughtful design, durable",
    cons: "Accessories are pricey",
    ownsProduct: true,
    helpfulCount: 41,
    daysAgo: 12,
  },
  {
    username: "weekend_warrior",
    rating: 5,
    title: "Replaced two other products",
    body: "This consolidated a couple things I owned into one that just works better. Wish I'd bought it first instead of cheaping out twice.",
    pros: "Versatile, well made",
    cons: "Heavier than expected",
    ownsProduct: true,
    helpfulCount: 29,
    daysAgo: 20,
  },
  {
    username: "data_driven_dan",
    rating: 3,
    title: "Good, not great for me",
    body: "Solid pick if it matches your use-case, but it didn't quite fit mine. Nothing wrong with it — just be honest about what you need.",
    pros: "Reliable",
    cons: "Not the right fit for my needs",
    ownsProduct: false,
    helpfulCount: 14,
    daysAgo: 33,
  },
  {
    username: "longhaul_lara",
    rating: 5,
    title: "Buy it for life, genuinely",
    body: "Years in and it still performs like new. This is exactly the kind of thing Stier should be ranking — stuff that lasts.",
    pros: "Longevity, no compromises",
    cons: "None worth mentioning",
    ownsProduct: true,
    helpfulCount: 57,
    daysAgo: 48,
  },
];

/** Deterministic subset of reviews sized to the product's reviewCount. */
export function getReviewsForProduct(product: RankedProduct): Review[] {
  if (product.reviewCount === 0) return [];
  const count = Math.min(REVIEW_TEMPLATES.length, Math.max(2, Math.min(5, Math.ceil(product.reviewCount / 40))));
  return REVIEW_TEMPLATES.slice(0, count).map((t, i) => ({
    ...t,
    id: `${product.id}-review-${i}`,
  }));
}

export function getRatingBreakdown(product: RankedProduct): Record<number, number> {
  // Deterministic-ish distribution weighted toward the product's tier.
  const total = product.reviewCount;
  const base = product.netVotes > 0 ? [0.62, 0.24, 0.08, 0.04, 0.02] : [0.3, 0.25, 0.2, 0.15, 0.1];
  return {
    5: Math.round(total * base[0]),
    4: Math.round(total * base[1]),
    3: Math.round(total * base[2]),
    2: Math.round(total * base[3]),
    1: Math.round(total * base[4]),
  };
}

export function getAverageRating(product: RankedProduct): number {
  const breakdown = getRatingBreakdown(product);
  const total = Object.values(breakdown).reduce((s, n) => s + n, 0);
  if (total === 0) return 0;
  const weighted = Object.entries(breakdown).reduce(
    (s, [stars, n]) => s + Number(stars) * n,
    0,
  );
  return Math.round((weighted / total) * 10) / 10;
}
