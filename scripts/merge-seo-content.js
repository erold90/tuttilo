#!/usr/bin/env node
/**
 * Merge expanded SEO content (seo.p2, seo.p3, faq.q4-q5) into en.json
 * Usage: node scripts/merge-seo-content.js
 */
const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'src', 'messages', 'en.json');
const expandedPath = path.join(__dirname, '..', 'scripts', 'expanded-seo.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const expanded = JSON.parse(fs.readFileSync(expandedPath, 'utf8'));

let updated = 0;
let skipped = 0;

for (const [toolId, data] of Object.entries(expanded)) {
  if (!en.tools || !en.tools[toolId]) {
    console.log(`SKIP: ${toolId} not found in en.json`);
    skipped++;
    continue;
  }

  const tool = en.tools[toolId];

  // Add seo.p2, seo.p3
  if (data.seo) {
    if (!tool.seo) tool.seo = {};
    if (data.seo.p2) tool.seo.p2 = data.seo.p2;
    if (data.seo.p3) tool.seo.p3 = data.seo.p3;
  }

  // Add faq.q4, a4, q5, a5
  if (data.faq) {
    if (!tool.faq) tool.faq = {};
    if (data.faq.q4) tool.faq.q4 = data.faq.q4;
    if (data.faq.a4) tool.faq.a4 = data.faq.a4;
    if (data.faq.q5) tool.faq.q5 = data.faq.q5;
    if (data.faq.a5) tool.faq.a5 = data.faq.a5;
  }

  updated++;
  console.log(`OK: ${toolId}`);
}

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n', 'utf8');
console.log(`\nDone: ${updated} updated, ${skipped} skipped`);
