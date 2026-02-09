#!/usr/bin/env node

/**
 * Translate 5 converter tools to German
 * Tools: pressure-converter, energy-converter, number-base-converter,
 *        roman-numeral-converter, power-converter
 */

const fs = require('fs');
const path = require('path');

const EN_FILE = path.join(__dirname, '../src/messages/en.json');
const DE_FILE = path.join(__dirname, '../src/messages/de.json');

// German translations for the 5 converter tools
const deTranslations = {
  "pressure-converter": {
    "name": "Druckumrechner",
    "description": "Konvertieren Sie zwischen Pascal, kPa, bar, atm, PSI, mmHg und Torr Druckeinheiten.",
    "seo": {
      "title": "Druckumrechner - PSI, Bar, atm, Pascal | Tuttilo",
      "description": "Kostenloser Druckumrechner. Konvertieren Sie zwischen Pa, kPa, MPa, bar, atm, PSI, mmHg und Torr sofort.",
      "content": "Konvertieren Sie zwischen allen gängigen Druckeinheiten mit unserem sofortigen Umrechner.",
      "p2": "Unverzichtbar für Ingenieurwesen, HVAC, Automotive und wissenschaftliche Anwendungen.",
      "p3": "Unterstützt metrische und imperiale Druckeinheiten mit genauen Umrechnungsfaktoren.",
      "p4": "Alle Berechnungen erfolgen lokal in Ihrem Browser."
    },
    "faq": {
      "q1": "Wie konvertiere ich PSI in bar?",
      "a1": "1 PSI ≈ 0,0689 bar. Geben Sie den PSI-Wert ein und wählen Sie bar als Zieleinheit.",
      "q2": "Was ist atmosphärischer Druck?",
      "a2": "Standardatmosphärendruck (1 atm) = 101.325 Pa = 14,696 PSI = 1,01325 bar.",
      "q3": "Welche Einheiten werden unterstützt?",
      "a3": "Pascal, kPa, MPa, bar, Atmosphären, PSI, mmHg und Torr.",
      "q4": "Was ist der Unterschied zwischen mmHg und Torr?",
      "a4": "Sie sind nahezu identisch. 1 Torr ≈ 1 mmHg (der Unterschied ist für die meisten Zwecke vernachlässigbar).",
      "q5": "Ist das kostenlos?",
      "a5": "Ja, völlig kostenlos."
    },
    "ui": {
      "from": "Von",
      "to": "Zu",
      "allConversions": "Alle Umrechnungen",
      "pa": "Pascal (Pa)",
      "kpa": "Kilopascal (kPa)",
      "mpa": "Megapascal (MPa)",
      "bar": "Bar",
      "atm": "Atmosphäre (atm)",
      "psi": "PSI",
      "mmhg": "mmHg",
      "torr": "Torr"
    },
    "keywords": "Druckumrechner, PSI zu bar, atm zu Pascal, Druckeinheiten",
    "synonyms": "Druckrechner, barometrischer Umrechner, Kraft pro Fläche"
  },
  "energy-converter": {
    "name": "Energieumrechner",
    "description": "Konvertieren Sie zwischen Joule, kJ, Kalorien, kcal, Wh, kWh, BTU und Elektronenvolt.",
    "seo": {
      "title": "Energieumrechner - Joule, Kalorien, kWh, BTU | Tuttilo",
      "description": "Kostenloser Energieumrechner. Konvertieren Sie zwischen J, kJ, cal, kcal, Wh, kWh, BTU und eV Energieeinheiten.",
      "content": "Konvertieren Sie zwischen allen gängigen Energie- und Arbeitseinheiten sofort.",
      "p2": "Perfekt für Ernährung, Physik, Ingenieurwesen und Stromberechnungen.",
      "p3": "Unterstützt SI-, imperiale und spezialisierte Energieeinheiten.",
      "p4": "Genaue Umrechnungsfaktoren für wissenschaftliche und alltägliche Nutzung."
    },
    "faq": {
      "q1": "Wie viele Kalorien sind in einer kcal?",
      "a1": "1 kcal (Kilokalorie) = 1.000 cal. Nahrungskalorien sind eigentlich kcal.",
      "q2": "Wie konvertiere ich kWh in BTU?",
      "a2": "1 kWh = 3.412 BTU. Multiplizieren Sie kWh mit 3.412.",
      "q3": "Welche Einheiten werden unterstützt?",
      "a3": "Joule, Kilojoule, Kalorien, Kilokalorien, Wattstunden, Kilowattstunden, BTU, eV und Fuß-Pfund.",
      "q4": "Was ist ein Elektronenvolt?",
      "a4": "Ein Elektronenvolt (eV) ist die Energie, die ein Elektron durch ein Potentialdifferenz von 1 Volt gewinnt.",
      "q5": "Ist das kostenlos?",
      "a5": "Ja, völlig kostenlos."
    },
    "ui": {
      "from": "Von",
      "to": "Zu",
      "allConversions": "Alle Umrechnungen",
      "j": "Joule (J)",
      "kj": "Kilojoule (kJ)",
      "cal": "Kalorien (cal)",
      "kcal": "Kilokalorien (kcal)",
      "wh": "Wattstunden (Wh)",
      "kwh": "Kilowattstunden (kWh)",
      "btu": "BTU",
      "ev": "Elektronenvolt (eV)",
      "ft_lbf": "Fuß-Pfund (ft·lbf)"
    },
    "keywords": "Energieumrechner, Joule zu Kalorien, kWh zu BTU, Energieeinheiten",
    "synonyms": "Arbeitsumrechner, Wärmeumrechner, thermische Energieeinheiten"
  },
  "number-base-converter": {
    "name": "Zahlenbasisumrechner",
    "description": "Konvertieren Sie Zahlen zwischen Binär-, Oktal-, Dezimal- und Hexadezimalbasen.",
    "seo": {
      "title": "Zahlenbasisumrechner - Binär, Oktal, Dezimal, Hex | Tuttilo",
      "description": "Kostenloser Zahlenbasisumrechner. Konvertieren Sie zwischen Binär (Basis 2), Oktal (Basis 8), Dezimal (Basis 10) und Hexadezimal (Basis 16).",
      "content": "Konvertieren Sie Zahlen zwischen verschiedenen Zahlensystemen sofort.",
      "p2": "Unverzichtbar für Programmierer, Informatikstudenten und Digitalelektronik.",
      "p3": "Unterstützt Binär-, Oktal-, Dezimal- und Hexadezimalkonvertierungen.",
      "p4": "Sehen Sie alle Basiskonvertierungen auf einmal."
    },
    "faq": {
      "q1": "Wie konvertiere ich Dezimal zu Binär?",
      "a1": "Geben Sie die Dezimalzahl ein und wählen Sie Dezimal als Eingabebasis. Das binäre Ergebnis wird automatisch angezeigt.",
      "q2": "Welche Basen werden unterstützt?",
      "a2": "Binär (Basis 2), Oktal (Basis 8), Dezimal (Basis 10) und Hexadezimal (Basis 16).",
      "q3": "Kann ich große Zahlen konvertieren?",
      "a3": "Ja, JavaScript behandelt Ganzzahlen bis 2^53 - 1 sicher.",
      "q4": "Welche Zeichen sind für Hex gültig?",
      "a4": "Ziffern 0-9 und Buchstaben A-F.",
      "q5": "Ist das kostenlos?",
      "a5": "Ja, völlig kostenlos."
    },
    "ui": {
      "inputValue": "Eingabewert",
      "inputBase": "Eingabebasis",
      "bin": "Binär (2)",
      "oct": "Oktal (8)",
      "dec": "Dezimal (10)",
      "hex": "Hexadezimal (16)",
      "invalidInput": "Ungültige Eingabe für die ausgewählte Basis"
    },
    "keywords": "Zahlenbasisumrechner, Binär zu Dezimal, Hex zu Binär, Basisumrechner",
    "synonyms": "Radix-Umrechner, Zahlensystemumrechner, Binärrechner"
  },
  "roman-numeral-converter": {
    "name": "Römische Ziffern Umrechner",
    "description": "Konvertieren Sie zwischen arabischen Zahlen und römischen Ziffern (I, V, X, L, C, D, M). Unterstützt 1-3999.",
    "seo": {
      "title": "Römische Ziffern Umrechner - Arabisch zu Römisch | Tuttilo",
      "description": "Kostenloser römischer Ziffernumrechner. Konvertieren Sie arabische Zahlen in römische Ziffern und umgekehrt. Unterstützt 1 bis 3999.",
      "content": "Konvertieren Sie zwischen arabischen Zahlen und römischen Ziffern sofort.",
      "p2": "Perfekt für Geschichte, Bildung, Uhrenlesung und dekorative Nummerierung.",
      "p3": "Unterstützt beide Richtungen: Zahl zu Römisch und Römisch zu Zahl.",
      "p4": "Gültiger Bereich: 1 bis 3999 (I bis MMMCMXCIX)."
    },
    "faq": {
      "q1": "Welcher Bereich wird unterstützt?",
      "a1": "Standard-Römische Ziffern unterstützen 1 bis 3999 (I bis MMMCMXCIX).",
      "q2": "Wie funktioniert das?",
      "a2": "Römische Ziffern verwenden Buchstaben: I=1, V=5, X=10, L=50, C=100, D=500, M=1000. Subtraktive Notation (IV=4) wird unterstützt.",
      "q3": "Kann ich Römisch zu Zahlen konvertieren?",
      "a3": "Ja, wechseln Sie in den Modus \"Römisch zu Zahl\" und geben Sie römische Ziffern ein.",
      "q4": "Was ist mit Null?",
      "a4": "Römische Ziffern haben keine Darstellung für Null.",
      "q5": "Ist das kostenlos?",
      "a5": "Ja, völlig kostenlos."
    },
    "ui": {
      "toRoman": "Zahl → Römisch",
      "fromRoman": "Römisch → Zahl",
      "enterNumber": "Geben Sie eine Zahl ein (1-3999)",
      "enterRoman": "Geben Sie römische Ziffern ein",
      "result": "Ergebnis",
      "rangeError": "Bitte geben Sie eine Zahl zwischen 1 und 3999 ein",
      "invalidRoman": "Ungültige römische Ziffer"
    },
    "keywords": "Römische Ziffern Umrechner, Arabisch zu Römisch, Römisch zu Arabisch",
    "synonyms": "römischer Zahlenumrechner, Ziffernübersetzer, MCMXCIX"
  },
  "power-converter": {
    "name": "Leistungsumrechner",
    "description": "Konvertieren Sie zwischen Watt, Kilowatt, Megawatt, Pferdestärken, PS, BTU/h und Fuß-Pfund/s.",
    "seo": {
      "title": "Leistungsumrechner - Watt, PS, kW, BTU/h | Tuttilo",
      "description": "Kostenloser Leistungsumrechner. Konvertieren Sie zwischen Watt, Kilowatt, Megawatt, Pferdestärken, PS und BTU/h sofort.",
      "content": "Konvertieren Sie zwischen allen gängigen Leistungseinheiten mit unserem sofortigen Umrechner.",
      "p2": "Unverzichtbar für Automotive, Ingenieurwesen, Elektrotechnik und HVAC-Berechnungen.",
      "p3": "Unterstützt sowohl mechanische (HP) als auch metrische (PS) Pferdestärken.",
      "p4": "Genaue Umrechnungsfaktoren für professionelle Nutzung."
    },
    "faq": {
      "q1": "Wie konvertiere ich PS zu kW?",
      "a1": "1 PS (mechanisch) ≈ 0,7457 kW. Multiplizieren Sie PS mit 0,7457.",
      "q2": "Was ist der Unterschied zwischen PS und PS?",
      "a2": "PS (mechanische Pferdestärke) = 745,7 W. PS (metrische Pferdestärke) = 735,5 W. PS wird in Europa verwendet.",
      "q3": "Welche Einheiten werden unterstützt?",
      "a3": "Watt, Kilowatt, Megawatt, PS (mechanisch), PS (metrisch), BTU/h und Fuß-Pfund/Sekunde.",
      "q4": "Ist das genau?",
      "a4": "Ja, mit genauen Umrechnungsfaktoren.",
      "q5": "Ist das kostenlos?",
      "a5": "Ja, völlig kostenlos."
    },
    "ui": {
      "from": "Von",
      "to": "Zu",
      "allConversions": "Alle Umrechnungen",
      "w": "Watt (W)",
      "kw": "Kilowatt (kW)",
      "mw": "Megawatt (MW)",
      "hp": "Pferdestärke (HP)",
      "ps": "PS (Metrische HP)",
      "btuh": "BTU/Stunde",
      "ftlbs": "Fuß-Pfund/s"
    },
    "keywords": "Leistungsumrechner, Watt zu PS, Kilowatt zu Pferdestärke",
    "synonyms": "Wattumrechner, Pferdestärkenrechner, Energierate-Umrechner"
  }
};

// Main execution
try {
  console.log('Reading English messages...');
  const enData = JSON.parse(fs.readFileSync(EN_FILE, 'utf-8'));

  console.log('Reading German messages...');
  const deData = JSON.parse(fs.readFileSync(DE_FILE, 'utf-8'));

  // Add German translations to the tools object
  console.log('Adding German translations for 5 converter tools...');
  deData.tools = deData.tools || {};
  Object.assign(deData.tools, deTranslations);

  // Minify and write to file (single-line JSON to save space)
  console.log('Writing minified German JSON...');
  fs.writeFileSync(DE_FILE, JSON.stringify(deData, null, 0));

  console.log('✓ Successfully added German translations for:');
  console.log('  - pressure-converter');
  console.log('  - energy-converter');
  console.log('  - number-base-converter');
  console.log('  - roman-numeral-converter');
  console.log('  - power-converter');
  console.log(`\nFile saved: ${DE_FILE}`);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
