#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const enFilePath = path.join(__dirname, '../src/messages/en.json');
const esFilePath = path.join(__dirname, '../src/messages/es.json');

// Spanish translations for the 5 converter tools
const spanishTranslations = {
  "volume-converter": {
    "name": "Convertidor de Volumen",
    "description": "Convierte entre mililitros, litros, galones, tazas, cucharadas, cucharaditas y más unidades de volumen.",
    "seo": {
      "title": "Convertidor de Volumen - Medidas de Líquido | Tuttilo",
      "description": "Convertidor de volumen gratuito. Convierte entre mL, L, galones, tazas, cucharadas, cucharaditas, cuartos, pintas y metros cúbicos.",
      "content": "Convierte entre todas las unidades comunes de volumen y medidas de líquidos al instante.",
      "p2": "Perfecto para recetas de cocina, experimentos científicos y mediciones cotidianas.",
      "p3": "Soporta unidades métricas (mL, L, m³) e imperiales (tazas, galones, fl oz).",
      "p4": "Todos los cálculos se realizan localmente en tu navegador."
    },
    "faq": {
      "q1": "¿Cuántas tazas hay en un galón?",
      "a1": "1 galón estadounidense = 16 tazas estadounidenses (aproximadamente 3,785 litros).",
      "q2": "¿Qué unidades se soportan?",
      "a2": "Mililitros, litros, metros cúbicos, cucharaditas, cucharadas, onzas líquidas, tazas, pintas, cuartos y galones.",
      "q3": "¿Son galones estadounidenses o imperiales?",
      "a3": "Usamos unidades consuetudinarias estadounidenses. Galón estadounidense = 3,785 L, Galón imperial = 4,546 L.",
      "q4": "¿Es preciso para cocinar?",
      "a4": "Sí, perfecto para conversiones de recetas con resultados precisos.",
      "q5": "¿Es gratis?",
      "a5": "Sí, completamente gratis."
    },
    "ui": {
      "from": "De",
      "to": "A",
      "allConversions": "Todas las Conversiones",
      "ml": "Mililitros (mL)",
      "l": "Litros (L)",
      "m3": "Metros Cúbicos (m³)",
      "tsp": "Cucharaditas (tsp)",
      "tbsp": "Cucharadas (tbsp)",
      "floz": "Onzas Líquidas (fl oz)",
      "cup": "Tazas",
      "pt": "Pintas (pt)",
      "qt": "Cuartos (qt)",
      "gal": "Galones (gal)"
    },
    "keywords": "convertidor de volumen, litros a galones, tazas a ml, convertidor de líquidos",
    "synonyms": "convertidor de líquidos, convertidor de capacidad, convertidor de cocina"
  },
  "speed-converter": {
    "name": "Convertidor de Velocidad",
    "description": "Convierte entre km/h, mph, m/s, nudos, pies/s y unidades de velocidad Mach.",
    "seo": {
      "title": "Convertidor de Velocidad - km/h, mph, m/s, Nudos, Mach | Tuttilo",
      "description": "Convertidor de velocidad gratuito. Convierte entre kilómetros por hora, millas por hora, metros por segundo, nudos y Mach.",
      "content": "Convierte entre todas las unidades comunes de velocidad y velocidades al instante.",
      "p2": "Esencial para viajes, aviación, física y aplicaciones deportivas.",
      "p3": "Soporta km/h, mph, m/s, nudos (náuticos), pies por segundo y número Mach.",
      "p4": "Factores de conversión precisos para uso profesional y cotidiano."
    },
    "faq": {
      "q1": "¿Cómo convierto km/h a mph?",
      "a1": "Divide km/h entre 1,609. Por ejemplo, 100 km/h ≈ 62,14 mph.",
      "q2": "¿Qué es la velocidad Mach?",
      "a2": "Mach 1 es la velocidad del sonido, aproximadamente 343 m/s o 1.235 km/h al nivel del mar.",
      "q3": "¿Qué son los nudos?",
      "a3": "Un nudo es una milla náutica por hora (1,852 km/h), utilizado en navegación aérea y marítima.",
      "q4": "¿Qué unidades se soportan?",
      "a4": "Metros/segundo, km/h, mph, nudos, pies/segundo y número Mach.",
      "q5": "¿Es gratis?",
      "a5": "Sí, completamente gratis."
    },
    "ui": {
      "from": "De",
      "to": "A",
      "ms": "Metros/segundo (m/s)",
      "kmh": "Kilómetros/hora (km/h)",
      "mph": "Millas/hora (mph)",
      "kn": "Nudos (kn)",
      "fts": "Pies/segundo (ft/s)",
      "mach": "Mach"
    },
    "keywords": "convertidor de velocidad, km/h a mph, convertidor de velocidad, nudos a mph",
    "synonyms": "convertidor de velocidad, convertidor de velocidad, convertidor de ritmo"
  },
  "time-converter": {
    "name": "Convertidor de Tiempo",
    "description": "Convierte entre milisegundos, segundos, minutos, horas, días, semanas, meses y años.",
    "seo": {
      "title": "Convertidor de Tiempo - Segundos, Minutos, Horas, Días | Tuttilo",
      "description": "Convertidor de tiempo gratuito. Convierte entre milisegundos, segundos, minutos, horas, días, semanas, meses y años al instante.",
      "content": "Convierte entre todas las unidades comunes de tiempo con nuestro convertidor instantáneo.",
      "p2": "Perfecto para planificación de proyectos, programación y cálculos científicos.",
      "p3": "Soporta todo desde milisegundos hasta años con conversión precisa.",
      "p4": "Los meses y años utilizan valores promedio (30,44 días/mes, 365,25 días/año)."
    },
    "faq": {
      "q1": "¿Cuántos segundos hay en un día?",
      "a1": "86.400 segundos (60 × 60 × 24).",
      "q2": "¿Cuántas horas hay en un año?",
      "a2": "Aproximadamente 8.766 horas (365,25 × 24).",
      "q3": "¿Qué unidades se soportan?",
      "a3": "Milisegundos, segundos, minutos, horas, días, semanas, meses y años.",
      "q4": "¿Son exactos los meses y años?",
      "a4": "Usamos valores promedio: 1 mes = 30,44 días, 1 año = 365,25 días (contabilizando años bisiestos).",
      "q5": "¿Es gratis?",
      "a5": "Sí, completamente gratis."
    },
    "ui": {
      "from": "De",
      "to": "A",
      "allConversions": "Todas las Conversiones",
      "ms": "Milisegundos (ms)",
      "s": "Segundos (s)",
      "min": "Minutos (min)",
      "h": "Horas (h)",
      "d": "Días (d)",
      "wk": "Semanas (wk)",
      "mo": "Meses (mo)",
      "yr": "Años (yr)"
    },
    "keywords": "convertidor de tiempo, horas a minutos, días a segundos, unidad de tiempo",
    "synonyms": "convertidor de duración, calculadora de tiempo, convertidor temporal"
  },
  "fuel-economy-converter": {
    "name": "Convertidor de Consumo de Combustible",
    "description": "Convierte entre km/L, MPG (EE.UU.), MPG (Imperial) y unidades de eficiencia de combustible L/100km.",
    "seo": {
      "title": "Convertidor de Consumo de Combustible - MPG, L/100km, km/L | Tuttilo",
      "description": "Convertidor de consumo de combustible gratuito. Convierte entre MPG (EE.UU. e Imperial), L/100km y km/L al instante.",
      "content": "Convierte unidades de consumo de combustible y eficiencia entre diferentes sistemas de medición.",
      "p2": "Esencial para comparar la eficiencia de combustible de vehículos entre países.",
      "p3": "Soporta MPG (galones estadounidenses), MPG (galones imperiales), km/L y L/100km.",
      "p4": "Todos los cálculos se realizan localmente en tu navegador."
    },
    "faq": {
      "q1": "¿Cómo convierto MPG a L/100km?",
      "a1": "L/100km = 235,215 / MPG (EE.UU.). Por ejemplo, 30 MPG ≈ 7,84 L/100km.",
      "q2": "¿Cuál es la diferencia entre MPG estadounidense e imperial?",
      "a2": "Los galones imperiales son más grandes (4,546 L vs 3,785 L), por lo que los números de MPG imperiales son más altos para el mismo vehículo.",
      "q3": "¿Qué unidades se soportan?",
      "a3": "km/L, MPG (EE.UU.), MPG (Imperial) y L/100km.",
      "q4": "¿Por qué L/100km funciona de manera diferente?",
      "a4": "L/100km es una medida inversa: números más bajos significan mejor eficiencia, a diferencia de MPG donde más es mejor.",
      "q5": "¿Es gratis?",
      "a5": "Sí, completamente gratis."
    },
    "ui": {
      "from": "De",
      "to": "A",
      "kml": "Kilómetros por Litro (km/L)",
      "mpg": "Millas por Galón EE.UU. (MPG)",
      "mpgimp": "Millas por Galón Imperial",
      "l100km": "Litros por 100km (L/100km)"
    },
    "keywords": "convertidor de consumo de combustible, MPG a L/100km, convertidor de consumo de gasolina",
    "synonyms": "convertidor de eficiencia de combustible, calculadora de consumo de gasolina, convertidor de rendimiento"
  },
  "shoe-size-converter": {
    "name": "Convertidor de Tallas de Zapatos",
    "description": "Convierte tallas de zapatos entre sistemas de EE.UU. Hombre, EE.UU. Mujer, Reino Unido, UE y cm (largo del pie).",
    "seo": {
      "title": "Convertidor de Tallas de Zapatos - EE.UU., Reino Unido, UE, cm | Tuttilo",
      "description": "Convertidor de tallas de zapatos gratuito. Convierte entre EE.UU. Hombre, EE.UU. Mujer, Reino Unido, UE y centímetros.",
      "content": "Convierte tallas de zapatos entre sistemas de tallas internacionales al instante.",
      "p2": "Esencial para comprar zapatos en línea en diferentes países y marcas.",
      "p3": "Soporta sistemas de medición EE.UU. (Hombre y Mujer), Reino Unido, UE y cm (largo del pie).",
      "p4": "Utiliza tablas de tallas estándar para conversiones precisas."
    },
    "faq": {
      "q1": "¿Cómo funciona la conversión de tallas de zapatos?",
      "a1": "Convertimos basándonos en el largo del pie en centímetros, que es la línea base universal para todos los sistemas de tallas de zapatos.",
      "q2": "¿Son exactas?",
      "a2": "Las tallas de zapatos varían ligeramente entre marcas. Estas conversiones siguen tablas de tallas estándar y proporcionan buenas aproximaciones.",
      "q3": "¿Qué sistemas se soportan?",
      "a3": "EE.UU. Hombre, EE.UU. Mujer, Reino Unido, UE (Europa) y centímetros (largo del pie).",
      "q4": "¿Cuál es la diferencia entre tallas EE.UU. Hombre y Mujer?",
      "a4": "Las tallas EE.UU. Mujer son típicamente 1,5 tallas más grandes que EE.UU. Hombre para el mismo largo de pie.",
      "q5": "¿Es gratis?",
      "a5": "Sí, completamente gratis."
    },
    "ui": {
      "shoeSize": "Talla de Zapato",
      "system": "Sistema de Tallas",
      "us_m": "EE.UU. Hombre",
      "us_w": "EE.UU. Mujer",
      "uk": "Reino Unido",
      "eu": "UE",
      "cm": "cm (largo del pie)"
    },
    "keywords": "convertidor de tallas de zapatos, talla EE.UU. a UE, tabla de tallas de zapatos",
    "synonyms": "convertidor de tallas de calzado, tabla de tallas de zapatos, tallas internacionales de zapatos"
  }
};

// Read both files
const enData = JSON.parse(fs.readFileSync(enFilePath, 'utf8'));
const esData = JSON.parse(fs.readFileSync(esFilePath, 'utf8'));

// Add Spanish translations
Object.keys(spanishTranslations).forEach((toolId) => {
  esData.tools[toolId] = spanishTranslations[toolId];
});

// Write minified JSON
fs.writeFileSync(esFilePath, JSON.stringify(esData), 'utf8');

console.log('✓ Spanish translations added for:');
console.log('  - volume-converter');
console.log('  - speed-converter');
console.log('  - time-converter');
console.log('  - fuel-economy-converter');
console.log('  - shoe-size-converter');
console.log(`✓ File saved: ${esFilePath}`);
