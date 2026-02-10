const fs = require('fs');
const en = JSON.parse(fs.readFileSync('src/messages/en.json', 'utf8'));
const langs = ['it', 'es', 'fr', 'de', 'pt', 'ja', 'ko'];

// IT nav translations for the 9 new categories + groups
const navTranslations = {
  it: { calculators: "Calcolatrici", converters: "Convertitori", "color-design": "Colore e CSS", security: "Sicurezza", datetime: "Data e Ora", seo: "SEO", social: "Social Media", generators: "Generatori", network: "Rete", groupFile: "File e Media", groupContent: "Contenuti e Testo", groupUtility: "Utilità e Calcolo", groupWebDev: "Web e Sviluppo" },
  es: { calculators: "Calculadoras", converters: "Conversores", "color-design": "Color y CSS", security: "Seguridad", datetime: "Fecha y Hora", seo: "SEO", social: "Redes Sociales", generators: "Generadores", network: "Red", groupFile: "Archivos y Medios", groupContent: "Contenido y Texto", groupUtility: "Utilidades y Cálculo", groupWebDev: "Web y Desarrollo" },
  fr: { calculators: "Calculatrices", converters: "Convertisseurs", "color-design": "Couleur et CSS", security: "Sécurité", datetime: "Date et Heure", seo: "SEO", social: "Réseaux Sociaux", generators: "Générateurs", network: "Réseau", groupFile: "Fichiers et Médias", groupContent: "Contenu et Texte", groupUtility: "Utilitaires et Calcul", groupWebDev: "Web et Développement" },
  de: { calculators: "Rechner", converters: "Konverter", "color-design": "Farbe und CSS", security: "Sicherheit", datetime: "Datum und Zeit", seo: "SEO", social: "Social Media", generators: "Generatoren", network: "Netzwerk", groupFile: "Dateien und Medien", groupContent: "Inhalte und Text", groupUtility: "Werkzeuge und Berechnung", groupWebDev: "Web und Entwicklung" },
  pt: { calculators: "Calculadoras", converters: "Conversores", "color-design": "Cor e CSS", security: "Segurança", datetime: "Data e Hora", seo: "SEO", social: "Mídias Sociais", generators: "Geradores", network: "Rede", groupFile: "Arquivos e Mídia", groupContent: "Conteúdo e Texto", groupUtility: "Utilidades e Cálculo", groupWebDev: "Web e Desenvolvimento" },
  ja: { calculators: "電卓", converters: "変換ツール", "color-design": "カラー＆CSS", security: "セキュリティ", datetime: "日付と時刻", seo: "SEO", social: "ソーシャルメディア", generators: "ジェネレーター", network: "ネットワーク", groupFile: "ファイル＆メディア", groupContent: "コンテンツ＆テキスト", groupUtility: "ユーティリティ＆計算", groupWebDev: "Web＆開発" },
  ko: { calculators: "계산기", converters: "변환기", "color-design": "색상 & CSS", security: "보안", datetime: "날짜 & 시간", seo: "SEO", social: "소셜 미디어", generators: "생성기", network: "네트워크", groupFile: "파일 & 미디어", groupContent: "콘텐츠 & 텍스트", groupUtility: "유틸리티 & 계산", groupWebDev: "웹 & 개발" }
};

langs.forEach(lang => {
  const filePath = `src/messages/${lang}.json`;
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let fixes = 0;

  // Fix missing nav keys
  if (navTranslations[lang]) {
    Object.keys(navTranslations[lang]).forEach(k => {
      if (data.nav[k] === undefined) {
        data.nav[k] = navTranslations[lang][k];
        fixes++;
      }
    });
  }
  // Also copy any other missing nav keys from EN
  Object.keys(en.nav).forEach(k => {
    if (data.nav[k] === undefined) {
      data.nav[k] = en.nav[k];
      fixes++;
    }
  });

  // Fix missing common keys (deep copy from EN)
  function fillMissing(source, target) {
    let count = 0;
    Object.keys(source).forEach(k => {
      if (target[k] === undefined) {
        target[k] = source[k];
        count++;
      } else if (typeof source[k] === 'object' && source[k] !== null && typeof target[k] === 'object' && target[k] !== null) {
        count += fillMissing(source[k], target[k]);
      }
    });
    return count;
  }

  fixes += fillMissing(en.common, data.common);

  // Fix missing categories keys
  if (en.categories && data.categories) {
    fixes += fillMissing(en.categories, data.categories);
  }

  // Fix missing tool UI keys and other tool fields
  Object.keys(en.tools).forEach(id => {
    const enTool = en.tools[id];
    if (data.tools[id] === undefined) {
      data.tools[id] = enTool;
      fixes++;
      return;
    }
    const langTool = data.tools[id];

    // Fill missing top-level fields
    ['name', 'description', 'keywords', 'synonyms'].forEach(f => {
      if (enTool[f] !== undefined && langTool[f] === undefined) {
        langTool[f] = enTool[f];
        fixes++;
      }
    });

    // Fill missing seo fields
    if (enTool.seo) {
      if (langTool.seo === undefined) {
        langTool.seo = {};
      }
      ['title', 'description', 'content'].forEach(f => {
        if (enTool.seo[f] !== undefined && langTool.seo[f] === undefined) {
          langTool.seo[f] = enTool.seo[f];
          fixes++;
        }
      });
    }

    // Fill missing faq
    if (enTool.faq && langTool.faq === undefined) {
      langTool.faq = enTool.faq;
      fixes++;
    } else if (enTool.faq && langTool.faq) {
      Object.keys(enTool.faq).forEach(k => {
        if (langTool.faq[k] === undefined) {
          langTool.faq[k] = enTool.faq[k];
          fixes++;
        }
      });
    }

    // Fill missing UI keys (this is the main fix!)
    if (enTool.ui) {
      if (langTool.ui === undefined) {
        langTool.ui = {};
      }
      Object.keys(enTool.ui).forEach(k => {
        if (langTool.ui[k] === undefined) {
          langTool.ui[k] = enTool.ui[k];
          fixes++;
        }
      });
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(data));
  console.log(`${lang.toUpperCase()}: ${fixes} keys fixed`);
});

console.log('\nDone! All missing keys filled from EN as fallback.');
