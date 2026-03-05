#!/usr/bin/env node
/**
 * Generate hero images for blog posts that are missing them.
 *
 * Required env vars (reads from blog/.env and services/local-api/.env):
 *   DATABASE_URL        — Neon Postgres connection string
 *   GOOGLE_API_KEY      — Google Generative AI API key (for Imagen 3)
 *   R2_ENDPOINT         — Cloudflare R2 S3-compatible endpoint
 *   R2_ACCESS_KEY       — R2 access key
 *   R2_SECRET_KEY       — R2 secret key
 *   R2_BUCKET           — R2 bucket name
 *   R2_PUBLIC_URL       — R2 public URL prefix
 *
 * Usage:
 *   node scripts/add-hero-images.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg"; // uses pg from blog's node_modules

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");

// --------------- Load env vars from both .env files ---------------
function loadEnvFile(path) {
  try {
    const content = readFileSync(path, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      // Strip surrounding quotes
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    }
  } catch {
    // file might not exist
  }
}

loadEnvFile(resolve(ROOT, "blog/.env"));
loadEnvFile(resolve(ROOT, "services/local-api/.env"));

const {
  DATABASE_URL,
  GOOGLE_API_KEY,
  R2_ENDPOINT,
  R2_ACCESS_KEY,
  R2_SECRET_KEY,
  R2_BUCKET,
  R2_PUBLIC_URL,
} = process.env;

const missing = [];
if (!DATABASE_URL) missing.push("DATABASE_URL");
if (!GOOGLE_API_KEY) missing.push("GOOGLE_API_KEY");
if (!R2_ENDPOINT) missing.push("R2_ENDPOINT");
if (!R2_ACCESS_KEY) missing.push("R2_ACCESS_KEY");
if (!R2_SECRET_KEY) missing.push("R2_SECRET_KEY");
if (!R2_BUCKET) missing.push("R2_BUCKET");
if (!R2_PUBLIC_URL) missing.push("R2_PUBLIC_URL");
if (missing.length) {
  console.error("Missing env vars:", missing.join(", "));
  process.exit(1);
}

// --------------- Database ---------------
const pool = new pg.Pool({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function getPostsMissingImages() {
  const { rows } = await pool.query(
    `SELECT id, "videoId", title, hook FROM "Post" WHERE "heroImage" = '' OR "heroImage" IS NULL OR "heroImage" LIKE 'https://placehold.co%' ORDER BY "publishedAt" DESC`
  );
  return rows;
}

async function updatePostHeroImage(postId, heroImageUrl) {
  await pool.query(`UPDATE "Post" SET "heroImage" = $1, "updatedAt" = NOW() WHERE id = $2`, [
    heroImageUrl,
    postId,
  ]);
}

// --------------- Gemini 3.1 Flash Image ---------------
async function generateImage(title, hook) {
  const prompt = `Generate a professional blog hero image for a financial trading article titled "${title}". ${hook}. Modern, clean design with abstract financial elements like charts, candlesticks, and market data visualizations. Rich color palette with deep blues and amber accents. Wide 16:9 aspect ratio, photorealistic style. No text or watermarks.`;

  const resp = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image-preview:generateContent?key=${GOOGLE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
        },
      }),
    }
  );

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Gemini API error ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts) throw new Error("No content returned from Gemini API");

  const imagePart = parts.find((p) => p.inlineData);
  if (!imagePart) throw new Error("No image part returned from Gemini API");

  return imagePart.inlineData.data;
}

// --------------- R2 Upload (S3-compatible PUT) ---------------
async function uploadToR2(base64Data, key) {
  const imageBuffer = Buffer.from(base64Data, "base64");

  // Use S3 PutObject via fetch with AWS Signature V4
  // Simpler approach: use the aws4 signing or just use the S3 API directly
  // Since we don't have aws-sdk installed, we'll use a raw S3 PUT with presigned-style auth
  // Actually, let's use the simpler approach with the S3 REST API

  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const s3 = new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: { accessKeyId: R2_ACCESS_KEY, secretAccessKey: R2_SECRET_KEY },
  });

  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: imageBuffer,
      ContentType: "image/png",
    })
  );

  return `${R2_PUBLIC_URL}/${key}`;
}

// --------------- Main ---------------
async function main() {
  console.log("Checking for posts missing hero images...");
  const posts = await getPostsMissingImages();

  if (posts.length === 0) {
    console.log("All posts already have hero images!");
    await pool.end();
    return;
  }

  console.log(`Found ${posts.length} post(s) missing hero images:\n`);
  for (const p of posts) {
    console.log(`  - ${p.title}`);
  }
  console.log();

  for (const post of posts) {
    try {
      console.log(`Generating image for: "${post.title}"...`);
      const base64 = await generateImage(post.title, post.hook);

      const key = `hero/${post.videoId}-${Date.now()}.png`;
      console.log(`Uploading to R2: ${key}...`);
      const url = await uploadToR2(base64, key);

      console.log(`Updating database with URL: ${url}`);
      await updatePostHeroImage(post.id, url);

      console.log(`Done! Hero image added for "${post.title}"\n`);
    } catch (err) {
      console.error(`Failed for "${post.title}":`, err.message);
      console.log("Continuing with next post...\n");
    }
  }

  await pool.end();
  console.log("Finished!");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
