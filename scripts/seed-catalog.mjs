// Seeds categories + products into Supabase using deterministic UUIDs that match
// lib/db/uuid.ts. Also enables Realtime on the votes table.
//
// Usage: node scripts/seed-catalog.mjs

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvLocal() {
  try {
    const raw = readFileSync(join(root, ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // rely on process.env
  }
}

function uuidFromSlug(kind, slug) {
  const hash = createHash("sha256").update(`stier:${kind}:${slug}`).digest("hex");
  return [
    hash.slice(0, 8),
    hash.slice(8, 12),
    `4${hash.slice(13, 16)}`,
    `${((parseInt(hash.slice(16, 18), 16) & 0x3f) | 0x80).toString(16).padStart(2, "0")}${hash.slice(18, 20)}`,
    hash.slice(20, 32),
  ].join("-");
}

function esc(value) {
  return value.replace(/'/g, "''");
}

const EXTRA_PRODUCTS = [
  {
    categorySlug: "cast-iron-skillets",
    slug: "lodge-classic-10-25",
    name: 'Classic 10.25" Skillet',
    brand: "Lodge",
    description:
      "The unkillable budget pick. Rougher finish, but seasons up beautifully and costs a fraction.",
    affiliateUrl: "https://example.com/buy/lodge",
  },
  {
    categorySlug: "cast-iron-skillets",
    slug: "stargazer-10-5-skillet",
    name: '10.5" Skillet',
    brand: "Stargazer",
    description:
      "Polished cooking surface, ergonomic handle, and pour spouts. A modern take that cooks like a dream.",
    affiliateUrl: "https://example.com/buy/stargazer",
  },
];

async function main() {
  loadEnvLocal();
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const catalog = JSON.parse(
    readFileSync(join(root, "scripts/catalog-seed-data.json"), "utf8"),
  );

  const products = [...catalog.products];
  for (const extra of EXTRA_PRODUCTS) {
    if (!products.some((p) => p.slug === extra.slug)) products.push(extra);
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    await client.query("begin");

    for (const cat of catalog.categories) {
      const id = uuidFromSlug("category", cat.slug);
      await client.query(
        `insert into public.categories (id, name, slug, description, is_featured, is_active)
         values ($1, $2, $3, $4, $5, true)
         on conflict (slug) do update set
           name = excluded.name,
           description = excluded.description,
           is_featured = excluded.is_featured,
           is_active = true`,
        [id, cat.name, cat.slug, cat.description, cat.isFeatured],
      );
    }

    for (const product of products) {
      const categoryId = uuidFromSlug("category", product.categorySlug);
      const id = uuidFromSlug("product", `${product.categorySlug}/${product.slug}`);
      await client.query(
        `insert into public.products (
           id, category_id, name, slug, brand, description,
           product_url, affiliate_url, status
         ) values ($1, $2, $3, $4, $5, $6, $7, $8, 'approved')
         on conflict (category_id, slug) do update set
           name = excluded.name,
           brand = excluded.brand,
           description = excluded.description,
           affiliate_url = excluded.affiliate_url,
           status = 'approved'`,
        [
          id,
          categoryId,
          product.name,
          product.slug,
          product.brand,
          product.description,
          product.affiliateUrl,
          product.affiliateUrl,
        ],
      );
    }

    await client.query(`
      do $$
      begin
        if not exists (
          select 1 from pg_publication_tables
          where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'votes'
        ) then
          alter publication supabase_realtime add table public.votes;
        end if;
      end $$;
    `);

    await client.query("commit");
    console.log(
      `Seeded ${catalog.categories.length} categories and ${products.length} products; Realtime enabled on votes.`,
    );
  } catch (err) {
    await client.query("rollback").catch(() => {});
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
