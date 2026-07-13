/**
 * Pre-build script: download bench images from R2 directly (bypassing Cloudflare proxy)
 * so that Astro can reference them as local files during build.
 *
 * Usage: pnpm exec tsx scripts/fetch-bench-images.ts
 */

import { exec } from "node:child_process";
import { existsSync, mkdirSync, statSync, unlinkSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { parseCsv } from "../src/data.ts";

const BUCKET = "benchbuilders-bucket";
const IMG_DIR = "src/assets/bench-images";
const IMG_HOST = "img.sfbabc.org";
const CONCURRENCY = 10;

// Read CSV URL from .env file
const envText = await readFile(".env", "utf-8");
const csvUrl = envText.match(/VITE_SHEET_BENCHES="([^"]+)"/)?.[1];
if (!csvUrl) {
  console.error("Could not find VITE_SHEET_BENCHES in .env");
  process.exit(1);
}

mkdirSync(IMG_DIR, { recursive: true });

console.log("Fetching bench CSV to extract image URLs...");
const res = await fetch(csvUrl);
const [head, ...rows] = parseCsv(await res.text());
const headIdx = Object.fromEntries(head!.map((col, i) => [col.toUpperCase().replace(/[^ A-Z0-9]/g, ''), i]));
const imagesCol = headIdx["IMAGES"];

if (imagesCol == null) {
  console.error("Could not find IMAGES column in CSV");
  process.exit(1);
}

// Extract all img.sfbabc.org image keys
const imageKeys = new Set<string>();
for (const row of rows) {
  const url = row[imagesCol];
  if (!url) continue;
  const match = url.match(new RegExp(`https?://${IMG_HOST.replace(/\./g, "\\.")}/(.+)`));
  if (match) imageKeys.add(match[1]!);
}

console.log(`Found ${imageKeys.size} images on ${IMG_HOST} to download from R2.`);

function downloadImage(key: string): Promise<boolean> {
  const filePath = `${IMG_DIR}/${key}`;

  // Skip if already downloaded and non-empty
  if (existsSync(filePath) && statSync(filePath).size > 0) {
    console.log(`  [cached] ${key}`);
    return Promise.resolve(true);
  }

  // Remove empty/corrupt files from previous failed attempts
  if (existsSync(filePath)) unlinkSync(filePath);

  console.log(`  [fetch]  ${key}`);
  return new Promise((resolve) => {
    exec(
      `npx wrangler r2 object get "${BUCKET}/${key}" --file="${filePath}"`,
      (error) => {
        if (error) {
          console.log(`  [FAILED] ${key}`);
          if (existsSync(filePath)) unlinkSync(filePath);
          resolve(false);
        } else {
          resolve(true);
        }
      }
    );
  });
}

// Process downloads with concurrency limit
const keys = [...imageKeys];
let failed = 0;

for (let i = 0; i < keys.length; i += CONCURRENCY) {
  const batch = keys.slice(i, i + CONCURRENCY);
  const results = await Promise.all(batch.map(downloadImage));
  failed += results.filter((ok) => !ok).length;
}

if (failed > 0) {
  console.log(`WARNING: ${failed} image(s) failed to download. Build may fall back to remote fetch.`);
}

console.log(`Done. ${keys.length - failed}/${keys.length} images stored in ${IMG_DIR}/`);
