/**
 * Navigation catalog: parent category groups and sub-list slug mappings.
 * Sub-list slugs (e.g. over-ear-headphones) map to product categories for
 * ranked-list content until dedicated lists exist in the DB.
 */

export interface NavList {
  name: string;
  slug: string;
  /** Seed category slug whose products populate this ranked list. */
  productCategorySlug: string;
  description: string;
}

export interface NavParent {
  label: string;
  slug: string;
  description: string;
  lists: NavList[];
}

export const NAV_PARENTS: NavParent[] = [
  {
    label: "Home & Kitchen",
    slug: "home-kitchen",
    description:
      "Kitchen gear, coffee, cookware, and everything worth owning for daily cooking.",
    lists: [
      {
        name: "Coffee Beans",
        slug: "coffee-beans",
        productCategorySlug: "coffee-beans",
        description: "Single-origin, blends, and espresso — ranked by daily grinders.",
      },
      {
        name: "Cast Iron Skillets",
        slug: "cast-iron-skillets",
        productCategorySlug: "cast-iron-skillets",
        description: "Buy-it-for-life cookware, seasoned by decades of opinions.",
      },
      {
        name: "Blenders",
        slug: "blenders",
        productCategorySlug: "cast-iron-skillets",
        description: "High-power blenders for smoothies, soups, and nut butter.",
      },
      {
        name: "Knives",
        slug: "knives",
        productCategorySlug: "cast-iron-skillets",
        description: "Chef's knives and everyday cutters that stay sharp.",
      },
      {
        name: "Cookware",
        slug: "cookware",
        productCategorySlug: "cast-iron-skillets",
        description: "Pots, pans, and sets the community actually recommends.",
      },
    ],
  },
  {
    label: "Audio",
    slug: "audio",
    description: "Headphones, speakers, and gear for people who care how things sound.",
    lists: [
      {
        name: "Over-ear Headphones",
        slug: "over-ear-headphones",
        productCategorySlug: "headphones",
        description: "Open-back, closed-back, and studio cans worth the money.",
      },
      {
        name: "In-ear Headphones",
        slug: "in-ear-headphones",
        productCategorySlug: "headphones",
        description: "IEMs and earbuds for travel, gym, and daily listening.",
      },
      {
        name: "Speakers",
        slug: "speakers",
        productCategorySlug: "headphones",
        description: "Bookshelf, floor-standing, and desktop speakers ranked by owners.",
      },
      {
        name: "Soundbars",
        slug: "soundbars",
        productCategorySlug: "headphones",
        description: "Living-room sound without the home-theater headache.",
      },
      {
        name: "DACs",
        slug: "dacs",
        productCategorySlug: "headphones",
        description: "USB DACs and amps that actually improve your setup.",
      },
    ],
  },
  {
    label: "Outdoors",
    slug: "outdoors",
    description: "Gear tested in real conditions by people who live outside.",
    lists: [
      {
        name: "Winter Jackets",
        slug: "winter-jackets",
        productCategorySlug: "winter-jackets",
        description: "Insulated layers for cold, wet, and windy days.",
      },
      {
        name: "Hiking Boots",
        slug: "hiking-boots",
        productCategorySlug: "running-shoes",
        description: "Trail boots and hikers that survive the miles.",
      },
      {
        name: "Backpacks",
        slug: "backpacks",
        productCategorySlug: "backpacks",
        description: "EDC and travel packs ranked by what survives.",
      },
      {
        name: "Tents",
        slug: "tents",
        productCategorySlug: "backpacks",
        description: "Backpacking and car-camping shelters that hold up.",
      },
    ],
  },
  {
    label: "Apparel",
    slug: "apparel",
    description: "Clothes and footwear ranked by people who wear them daily.",
    lists: [
      {
        name: "Running Shoes",
        slug: "running-shoes",
        productCategorySlug: "running-shoes",
        description: "Daily trainers to race-day super shoes.",
      },
      {
        name: "Slippers",
        slug: "slippers",
        productCategorySlug: "slippers",
        description: "Indoor comfort that lasts more than one winter.",
      },
      {
        name: "Sneakers",
        slug: "sneakers",
        productCategorySlug: "running-shoes",
        description: "Everyday sneakers that look good and hold up.",
      },
    ],
  },
  {
    label: "Tools",
    slug: "tools",
    description: "Desk gear, peripherals, and tools for daily work.",
    lists: [
      {
        name: "Mechanical Keyboards",
        slug: "mechanical-keyboards",
        productCategorySlug: "mechanical-keyboards",
        description: "Boards and switches that survive the daily pound.",
      },
      {
        name: "Monitors",
        slug: "monitors",
        productCategorySlug: "mechanical-keyboards",
        description: "Work and gaming displays worth the pixel count.",
      },
      {
        name: "Mice",
        slug: "mice",
        productCategorySlug: "mechanical-keyboards",
        description: "Ergonomic and gaming mice ranked by daily users.",
      },
    ],
  },
  {
    label: "Tech",
    slug: "tech",
    description: "Laptops, phones, and tablets the community trusts.",
    lists: [
      {
        name: "Laptops",
        slug: "laptops",
        productCategorySlug: "mechanical-keyboards",
        description: "Ultrabooks, workstations, and daily drivers.",
      },
      {
        name: "Phones",
        slug: "phones",
        productCategorySlug: "mechanical-keyboards",
        description: "Flagships and value picks ranked by owners.",
      },
      {
        name: "Tablets",
        slug: "tablets",
        productCategorySlug: "mechanical-keyboards",
        description: "Reading, drawing, and couch computing devices.",
      },
    ],
  },
];

const ALL_LISTS = NAV_PARENTS.flatMap((p) => p.lists);

export function getNavParent(slug: string): NavParent | undefined {
  return NAV_PARENTS.find((p) => p.slug === slug);
}

export function getNavList(slug: string): NavList | undefined {
  return ALL_LISTS.find((l) => l.slug === slug);
}

export function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
