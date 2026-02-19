#!/usr/bin/env node
/**
 * Splits large JSON files into individual per-tool/per-article files
 * for efficient server-side fetching in Next.js edge runtime.
 *
 * Input:
 *   public/data/tools/{locale}.json  → { "tool-id": { p2, p3, p4 } }
 *   public/data/faq/{locale}.json    → { "tool-id": { q1, a1, q2, a2, ... } }
 *   public/data/blog/{locale}.json   → { "slug": { s1: {h,p}, s2: {h,p}, ... } }
 *
 * Output:
 *   public/data/tools/{locale}/{tool-id}.json
 *   public/data/faq/{locale}/{tool-id}.json
 *   public/data/blog/{locale}/{slug}.json
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "public", "data");
const LOCALES = ["en", "it", "es", "fr", "de", "pt", "ja", "ko"];

function splitJsonDir(subdir) {
  let totalFiles = 0;
  for (const locale of LOCALES) {
    const inputFile = path.join(DATA_DIR, subdir, `${locale}.json`);
    if (!fs.existsSync(inputFile)) {
      console.log(`  Skip ${subdir}/${locale}.json (not found)`);
      continue;
    }

    const data = JSON.parse(fs.readFileSync(inputFile, "utf-8"));
    const outputDir = path.join(DATA_DIR, subdir, locale);
    fs.mkdirSync(outputDir, { recursive: true });

    const keys = Object.keys(data);
    for (const key of keys) {
      const outputFile = path.join(outputDir, `${key}.json`);
      fs.writeFileSync(outputFile, JSON.stringify(data[key]));
      totalFiles++;
    }
    console.log(`  ${subdir}/${locale}: ${keys.length} files`);
  }
  return totalFiles;
}

console.log("Splitting tools JSON...");
const toolFiles = splitJsonDir("tools");

console.log("Splitting FAQ JSON...");
const faqFiles = splitJsonDir("faq");

console.log("Splitting blog JSON...");
const blogFiles = splitJsonDir("blog");

console.log(`\nDone! Created ${toolFiles + faqFiles + blogFiles} individual files.`);
