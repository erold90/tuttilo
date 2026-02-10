const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));
const langs = ['it', 'es', 'fr', 'de', 'pt', 'ja', 'ko'];

// Check each language
langs.forEach(lang => {
  const data = JSON.parse(fs.readFileSync(`src/messages/${lang}.json`, 'utf8'));

  // Check nav keys
  const missingNav = [];
  Object.keys(en.nav).forEach(k => {
    if (data.nav[k] === undefined || data.nav[k] === null) {
      missingNav.push(k);
    }
  });

  // Check categories keys
  const missingCat = [];
  if (en.categories && data.categories) {
    Object.keys(en.categories).forEach(k => {
      if (data.categories[k] === undefined) {
        missingCat.push(k);
      } else if (typeof en.categories[k] === 'object') {
        Object.keys(en.categories[k]).forEach(sk => {
          if (data.categories[k] === undefined || data.categories[k][sk] === undefined) {
            missingCat.push(k + '.' + sk);
          }
        });
      }
    });
  }

  // Check common keys
  const missingCommon = [];
  Object.keys(en.common).forEach(k => {
    if (data.common[k] === undefined) {
      missingCommon.push(k);
    } else if (typeof en.common[k] === 'object' && typeof data.common[k] === 'object') {
      Object.keys(en.common[k]).forEach(sk => {
        if (data.common[k][sk] === undefined) {
          missingCommon.push(k + '.' + sk);
        }
      });
    }
  });

  // Check tools - missing UI keys
  const toolsWithMissingUi = [];
  const toolsMissingFields = [];

  Object.keys(en.tools).forEach(id => {
    const enTool = en.tools[id];
    const langTool = data.tools[id];

    if (langTool === undefined) {
      toolsMissingFields.push(id + ': ENTIRE TOOL MISSING');
      return;
    }

    // Check top-level fields
    ['name', 'description', 'keywords', 'synonyms'].forEach(f => {
      if (enTool[f] !== undefined && (langTool[f] === undefined || langTool[f] === null)) {
        toolsMissingFields.push(id + '.' + f);
      }
    });

    // Check seo
    if (enTool.seo) {
      ['title', 'description', 'content'].forEach(f => {
        if (enTool.seo[f] !== undefined && (langTool.seo === undefined || langTool.seo[f] === undefined)) {
          toolsMissingFields.push(id + '.seo.' + f);
        }
      });
    }

    // Check UI keys
    if (enTool.ui) {
      if (langTool.ui === undefined) {
        toolsWithMissingUi.push(id + ': ENTIRE UI MISSING (' + Object.keys(enTool.ui).join(',') + ')');
      } else {
        const missing = [];
        Object.keys(enTool.ui).forEach(k => {
          if (langTool.ui[k] === undefined) {
            missing.push(k);
          }
        });
        if (missing.length > 0) {
          toolsWithMissingUi.push(id + ': ' + missing.join(', '));
        }
      }
    }

    // Check FAQ (at least q1/a1)
    if (enTool.faq && enTool.faq.q1) {
      if (langTool.faq === undefined || langTool.faq.q1 === undefined) {
        toolsMissingFields.push(id + '.faq');
      }
    }
  });

  console.log(`\n========== ${lang.toUpperCase()} ==========`);
  if (missingNav.length) console.log('Missing NAV keys:', missingNav.join(', '));
  if (missingCat.length) console.log('Missing CATEGORIES keys:', missingCat.join(', '));
  if (missingCommon.length) console.log('Missing COMMON keys:', missingCommon.join(', '));
  if (toolsMissingFields.length) {
    console.log('Missing TOOL FIELDS (' + toolsMissingFields.length + '):');
    toolsMissingFields.forEach(f => console.log('  ' + f));
  }
  if (toolsWithMissingUi.length) {
    console.log('Missing UI KEYS (' + toolsWithMissingUi.length + ' tools):');
    toolsWithMissingUi.forEach(f => console.log('  ' + f));
  }
  if (missingNav.length === 0 && missingCat.length === 0 && missingCommon.length === 0 && toolsMissingFields.length === 0 && toolsWithMissingUi.length === 0) {
    console.log('ALL OK - No missing keys found');
  }
});
