// Adds chartRef='/demos/orderflow.html' to the simulator section of the footprint post.
// Run from blog/: node scripts/add-simulator-chartref.mjs

import pg from "pg";
import "dotenv/config";

const VIDEO_ID = "RGdCgiqVdsA";
const SIM_HEADING = "Try It Yourself: Live Order Book and Footprint Simulator";
const DEMO_URL = "/demos/orderflow.html";

const { Client } = pg;
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function main() {
  await client.connect();
  const r = await client.query(`SELECT id, sections FROM "Post" WHERE "videoId" = $1`, [VIDEO_ID]);
  if (r.rows.length === 0) {
    console.error("Post not found:", VIDEO_ID);
    process.exit(1);
  }
  const { id, sections } = r.rows[0];
  if (!Array.isArray(sections)) {
    console.error("sections is not an array:", typeof sections);
    process.exit(1);
  }
  const idx = sections.findIndex((s) => s && s.heading === SIM_HEADING);
  if (idx === -1) {
    console.error("Simulator section not found by heading. Headings present:");
    sections.forEach((s, i) => console.error(`  [${i}] ${s?.heading}`));
    process.exit(1);
  }
  sections[idx].chartRef = DEMO_URL;

  const result = await client.query(
    `UPDATE "Post" SET "sections" = $1::jsonb, "updatedAt" = NOW() WHERE "id" = $2 RETURNING id, slug`,
    [JSON.stringify(sections), id]
  );
  console.log("Set chartRef on section", idx, "→", DEMO_URL);
  console.log("Updated post:", result.rows[0]);
  await client.end();
}

main().catch(async (e) => {
  console.error(e);
  await client.end().catch(() => {});
  process.exit(1);
});
