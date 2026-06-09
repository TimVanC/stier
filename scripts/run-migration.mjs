// One-off migration runner. Reads DATABASE_URL from .env.local and applies a
// migration SQL file against the Supabase Postgres database.
//
// Usage:
//   node scripts/run-migration.mjs [path/to/migration.sql]
// Defaults to the latest file in supabase/migrations.

import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
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
    // no .env.local — rely on process.env
  }
}

function resolveMigrationPath() {
  const arg = process.argv[2];
  if (arg) return resolve(root, arg);
  const dir = join(root, "supabase", "migrations");
  const files = readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
  if (files.length === 0) throw new Error("No .sql migrations found.");
  return join(dir, files[files.length - 1]);
}

async function main() {
  loadEnvLocal();

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error(
      "DATABASE_URL is not set. Add it to .env.local (Supabase → Project Settings → Database → Connection string → URI).",
    );
    process.exit(1);
  }

  const migrationPath = resolveMigrationPath();
  const sql = readFileSync(migrationPath, "utf8");
  console.log(`Applying migration: ${migrationPath}`);

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query("begin");
    await client.query(sql);
    await client.query("commit");
    console.log("Migration applied successfully.");
  } catch (err) {
    await client.query("rollback").catch(() => {});
    console.error("Migration failed, rolled back:\n", err.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
