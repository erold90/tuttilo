#!/usr/bin/env node
/**
 * Merge expanded SEO content into a specific language file
 * Usage: node scripts/merge-seo-lang.js <lang> <json-file>
 * Example: node scripts/merge-seo-lang.js it scripts/expanded-seo-it.json
 */
const fs = require('fs');
const path = require('path');

const lang = process.argv[2];
const jsonFile = process.argv[3];

if (!lang || !jsonFile) {
  console.error('Usage: node merge-seo-lang.js <lang> <json-file>');
  process.exit(1);
}

const langPath = path.join(__dirname, '..', 'src', 'messages', `${lang}.json`);
const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
const expanded = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

let updated = 0;

for (const [toolId, data] of Object.entries(expanded)) {
  if (!langData.tools || !langData.tools[toolId]) {
    console.log(`SKIP: ${toolId} not in ${lang}.json`);
    continue;
  }

  const tool = langData.tools[toolId];

  if (data.seo) {
    if (!tool.seo) tool.seo = {};
    if (data.seo.p2) tool.seo.p2 = data.seo.p2;
    if (data.seo.p3) tool.seo.p3 = data.seo.p3;
  }

  if (data.faq) {
    if (!tool.faq) tool.faq = {};
    if (data.faq.q4) tool.faq.q4 = data.faq.q4;
    if (data.faq.a4) tool.faq.a4 = data.faq.a4;
    if (data.faq.q5) tool.faq.q5 = data.faq.q5;
    if (data.faq.a5) tool.faq.a5 = data.faq.a5;
  }

  updated++;
}

fs.writeFileSync(langPath, JSON.stringify(langData, null, 2) + '\n', 'utf8');
console.log(`${lang}: ${updated} tools updated`);
