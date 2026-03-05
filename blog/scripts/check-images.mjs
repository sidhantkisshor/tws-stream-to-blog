import { readFileSync } from "fs";
import pg from "pg";

const env = readFileSync(".env", "utf-8");
for (const line of env.split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq === -1) continue;
  const k = t.slice(0, eq).trim();
  let v = t.slice(eq + 1).trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  if (!process.env[k]) process.env[k] = v;
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const { rows } = await pool.query('SELECT title, "heroImage" FROM "Post" ORDER BY "publishedAt" DESC');
for (const r of rows) {
  const has = r.heroImage && r.heroImage.length > 0;
  console.log(has ? "OK" : "MISSING", "|", r.title, "|", (r.heroImage || "").slice(0, 80));
}
await pool.end();
