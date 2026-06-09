// One-off verification for the security hardening migration.
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const line of readFileSync(join(root, ".env.local"), "utf8").split(/\r?\n/)) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq === -1) continue;
  const k = t.slice(0, eq).trim();
  let v = t.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
  if (!(k in process.env)) process.env[k] = v;
}

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const checks = {
  "record_user_action fn": `select 1 from pg_proc where proname='record_user_action'`,
  "user_action_events table": `select 1 from information_schema.tables where table_schema='public' and table_name='user_action_events'`,
  "username CI unique index": `select 1 from pg_indexes where indexname='profiles_username_lower_key'`,
  "username format check": `select 1 from pg_constraint where conname='profiles_username_format'`,
  "private product-images bucket": `select 1 from storage.buckets where id='product-images' and public=false`,
  "storage policies (4)": `select count(*) c from pg_policies where schemaname='storage' and tablename='objects' and policyname like 'product_images_%'`,
  "rate-limit RLS enabled": `select 1 from pg_tables where schemaname='public' and tablename='user_action_events' and rowsecurity=true`,
};

for (const [label, sql] of Object.entries(checks)) {
  const r = await client.query(sql);
  const detail = r.rows[0]?.c !== undefined ? ` (${r.rows[0].c})` : "";
  console.log(`${r.rowCount > 0 ? "PASS" : "FAIL"}  ${label}${detail}`);
}

await client.end();
