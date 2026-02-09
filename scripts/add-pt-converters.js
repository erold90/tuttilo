#!/usr/bin/env node

/**
 * Add Portuguese translations for 5 converter tools
 * Run: node scripts/add-pt-converters.js
 */

const fs = require('fs');
const path = require('path');

const PT_TRANSLATIONS = {
  'pressure-converter': {
    name: 'Conversor de Pressão',
    description: 'Converta entre Pascal, kPa, bar, atm, PSI, mmHg e Torr.',
    seo: {
      title: 'Conversor de Pressão - PSI, Bar, atm, Pascal | Tuttilo',
      description: 'Conversor de pressão gratuito. Converta entre Pa, kPa, MPa, bar, atm, PSI, mmHg e Torr instantaneamente.',
      content: 'Converta entre todas as unidades de pressão comuns com nosso conversor instantâneo.',
      p2: 'Essencial para engenharia, HVAC, automotivo e aplicações científicas.',
      p3: 'Suporta unidades de pressão métricas e imperiais com fatores de conversão precisos.',
      p4: 'Todos os cálculos acontecem localmente no seu navegador.'
    },
    faq: {
      q1: 'Como converter PSI para bar?',
      a1: '1 PSI ≈ 0,0689 bar. Digite o valor em PSI e selecione bar como unidade de destino.',
      q2: 'O que é pressão atmosférica?',
      a2: 'Pressão atmosférica padrão (1 atm) = 101.325 Pa = 14,696 PSI = 1,01325 bar.',
      q3: 'Quais unidades são suportadas?',
      a3: 'Pascal, kPa, MPa, bar, atmosferas, PSI, mmHg e Torr.',
      q4: 'Qual é a diferença entre mmHg e Torr?',
      a4: 'São quase idênticas. 1 Torr ≈ 1 mmHg (a diferença é negligenciável para a maioria dos fins).',
      q5: 'É gratuito?',
      a5: 'Sim, completamente gratuito.'
    },
    ui: {
      from: 'De',
      to: 'Para',
      allConversions: 'Todas as Conversões',
      pa: 'Pascal (Pa)',
      kpa: 'Quilopascal (kPa)',
      mpa: 'Megapascal (MPa)',
      bar: 'Bar',
      atm: 'Atmosfera (atm)',
      psi: 'PSI',
      mmhg: 'mmHg',
      torr: 'Torr'
    },
    keywords: 'conversor de pressão, PSI para bar, atm para Pascal, unidades de pressão',
    synonyms: 'calculadora de pressão, conversor barométrico, força por área'
  },

  'energy-converter': {
    name: 'Conversor de Energia',
    description: 'Converta entre Joules, kJ, calorias, kcal, Wh, kWh, BTU e elétron-volts.',
    seo: {
      title: 'Conversor de Energia - Joules, Calorias, kWh, BTU | Tuttilo',
      description: 'Conversor de energia gratuito. Converta entre J, kJ, cal, kcal, Wh, kWh, BTU e eV.',
      content: 'Converta entre todas as unidades de energia e trabalho comuns instantaneamente.',
      p2: 'Perfeito para nutrição, física, engenharia e cálculos de eletricidade.',
      p3: 'Suporta unidades de energia SI, imperiais e especializadas.',
      p4: 'Fatores de conversão precisos para uso científico e cotidiano.'
    },
    faq: {
      q1: 'Quantas calorias há em uma kcal?',
      a1: '1 kcal (quilocaloria) = 1.000 cal. Calorias alimentares são na verdade kcal.',
      q2: 'Como converter kWh para BTU?',
      a2: '1 kWh = 3.412 BTU. Multiplique kWh por 3.412.',
      q3: 'Quais unidades são suportadas?',
      a3: 'Joules, quilojoules, calorias, quilocalorias, Watt-horas, quilowatt-horas, BTU, eV e libra-pés.',
      q4: 'O que é um elétron-volt?',
      a4: 'Um elétron-volt (eV) é a energia adquirida por um elétron através de uma diferença de potencial de 1 volt.',
      q5: 'É gratuito?',
      a5: 'Sim, completamente gratuito.'
    },
    ui: {
      from: 'De',
      to: 'Para',
      allConversions: 'Todas as Conversões',
      j: 'Joules (J)',
      kj: 'Quilojoules (kJ)',
      cal: 'Calorias (cal)',
      kcal: 'Quilocalorias (kcal)',
      wh: 'Watt-horas (Wh)',
      kwh: 'Quilowatt-horas (kWh)',
      btu: 'BTU',
      ev: 'Elétron-Volts (eV)',
      ft_lbf: 'Libra-pés (ft·lbf)'
    },
    keywords: 'conversor de energia, joules para calorias, kWh para BTU, unidades de energia',
    synonyms: 'conversor de trabalho, conversor de calor, unidades de energia térmica'
  },

  'number-base-converter': {
    name: 'Conversor de Base Numérica',
    description: 'Converta números entre bases binária, octal, decimal e hexadecimal.',
    seo: {
      title: 'Conversor de Base Numérica - Binário, Octal, Decimal, Hex | Tuttilo',
      description: 'Conversor de base numérica gratuito. Converta entre binário (base 2), octal (base 8), decimal (base 10) e hexadecimal (base 16).',
      content: 'Converta números entre diferentes sistemas numéricos instantaneamente.',
      p2: 'Essencial para programadores, estudantes de ciência da computação e eletrônica digital.',
      p3: 'Suporta conversões binária, octal, decimal e hexadecimal.',
      p4: 'Veja todas as conversões de base de uma vez.'
    },
    faq: {
      q1: 'Como converter decimal para binário?',
      a1: 'Digite o número decimal e selecione Decimal como base de entrada. O resultado binário aparece automaticamente.',
      q2: 'Quais bases são suportadas?',
      a2: 'Binária (base 2), Octal (base 8), Decimal (base 10) e Hexadecimal (base 16).',
      q3: 'Posso converter números grandes?',
      a3: 'Sim, JavaScript manipula inteiros até 2^53 - 1 com segurança.',
      q4: 'Quais caracteres são válidos para hex?',
      a4: 'Dígitos 0-9 e letras A-F.',
      q5: 'É gratuito?',
      a5: 'Sim, completamente gratuito.'
    },
    ui: {
      inputValue: 'Valor de Entrada',
      inputBase: 'Base de Entrada',
      bin: 'Binário (2)',
      oct: 'Octal (8)',
      dec: 'Decimal (10)',
      hex: 'Hexadecimal (16)',
      invalidInput: 'Entrada inválida para a base selecionada'
    },
    keywords: 'conversor de base numérica, binário para decimal, hex para binário, conversor de base',
    synonyms: 'conversor de base, conversor de sistema numérico, calculadora binária'
  },

  'roman-numeral-converter': {
    name: 'Conversor de Numerais Romanos',
    description: 'Converta entre números arábicos e numerais romanos (I, V, X, L, C, D, M). Suporta 1-3999.',
    seo: {
      title: 'Conversor de Numerais Romanos - Árabe para Romano | Tuttilo',
      description: 'Conversor de numerais romanos gratuito. Converta números arábicos para numerais romanos e vice-versa. Suporta 1 a 3999.',
      content: 'Converta entre números arábicos e numerais romanos instantaneamente.',
      p2: 'Perfeito para história, educação, leitura de relógios e numeração decorativa.',
      p3: 'Suporta ambas as direções: número para Romano e Romano para número.',
      p4: 'Intervalo válido: 1 a 3999 (I a MMMCMXCIX).'
    },
    faq: {
      q1: 'Qual é o intervalo?',
      a1: 'Numerais romanos padrão suportam 1 a 3999 (I a MMMCMXCIX).',
      q2: 'Como funciona?',
      a2: 'Numerais romanos usam letras: I=1, V=5, X=10, L=50, C=100, D=500, M=1000. Notação subtrativa (IV=4) é suportada.',
      q3: 'Posso converter Romano para números?',
      a3: 'Sim, mude para o modo "Romano para Número" e digite numerais romanos.',
      q4: 'E quanto a zero?',
      a4: 'Numerais romanos não têm representação para zero.',
      q5: 'É gratuito?',
      a5: 'Sim, completamente gratuito.'
    },
    ui: {
      toRoman: 'Número → Romano',
      fromRoman: 'Romano → Número',
      enterNumber: 'Digite um número (1-3999)',
      enterRoman: 'Digite numerais romanos',
      result: 'Resultado',
      rangeError: 'Digite um número entre 1 e 3999',
      invalidRoman: 'Numeral romano inválido'
    },
    keywords: 'conversor de numeral romano, árabe para romano, romano para árabe',
    synonyms: 'conversor de número romano, tradutor de numeral, MCMXCIX'
  },

  'power-converter': {
    name: 'Conversor de Potência',
    description: 'Converta entre Watts, quilowatts, megawatts, cavalos-vapor, PS, BTU/h e libra-pés/s.',
    seo: {
      title: 'Conversor de Potência - Watts, HP, kW, BTU/h | Tuttilo',
      description: 'Conversor de potência gratuito. Converta entre Watts, quilowatts, megawatts, cavalos-vapor, PS e BTU/h instantaneamente.',
      content: 'Converta entre todas as unidades de potência comuns com nosso conversor instantâneo.',
      p2: 'Essencial para automotivo, engenharia, elétrica e cálculos de HVAC.',
      p3: 'Suporta cavalos-vapor mecânicos (HP) e métricos (PS).',
      p4: 'Fatores de conversão precisos para uso profissional.'
    },
    faq: {
      q1: 'Como converter HP para kW?',
      a1: '1 HP (mecânico) ≈ 0,7457 kW. Multiplique HP por 0,7457.',
      q2: 'Qual é a diferença entre HP e PS?',
      a2: 'HP (cavalo-vapor mecânico) = 745,7W. PS (cavalo-vapor métrico) = 735,5W. PS é usado na Europa.',
      q3: 'Quais unidades são suportadas?',
      a3: 'Watts, quilowatts, megawatts, HP (mecânico), PS (métrico), BTU/h e libra-pés/segundo.',
      q4: 'É preciso?',
      a4: 'Sim, usando fatores de conversão precisos.',
      q5: 'É gratuito?',
      a5: 'Sim, completamente gratuito.'
    },
    ui: {
      from: 'De',
      to: 'Para',
      allConversions: 'Todas as Conversões',
      w: 'Watts (W)',
      kw: 'Quilowatts (kW)',
      mw: 'Megawatts (MW)',
      hp: 'Cavalo-Vapor (HP)',
      ps: 'PS (Cavalo-Vapor Métrico)',
      btuh: 'BTU/hora',
      ftlbs: 'Libra-pés/s'
    },
    keywords: 'conversor de potência, watts para HP, quilowatts para cavalos-vapor',
    synonyms: 'conversor de wattagem, calculadora de cavalos-vapor, conversor de taxa de energia'
  }
};

async function addPortugueseTranslations() {
  const ptPath = path.join(__dirname, '../src/messages/pt.json');

  try {
    // Read existing Portuguese translations
    let pt = JSON.parse(fs.readFileSync(ptPath, 'utf-8'));

    // Initialize tools object if it doesn't exist
    if (!pt.tools) {
      pt.tools = {};
    }

    // Add the 5 converter tools
    Object.assign(pt.tools, PT_TRANSLATIONS);

    // Minify: stringify without formatting
    const minifiedContent = JSON.stringify(pt);

    // Write back
    fs.writeFileSync(ptPath, minifiedContent, 'utf-8');

    console.log('✓ Portuguese translations added for:');
    Object.keys(PT_TRANSLATIONS).forEach(toolId => {
      console.log(`  - ${toolId}`);
    });

    console.log(`\n✓ File minified and saved to: ${ptPath}`);
    console.log(`✓ File size: ${(minifiedContent.length / 1024).toFixed(2)} KB`);

    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

addPortugueseTranslations();
