#!/usr/bin/env node

/**
 * Tuttilo Brand Assets Generator
 * Generates all PNG variants from SVG logo using sharp.
 *
 * Usage: node scripts/gen-brand-assets.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const BRAND_DIR = path.join(__dirname, '..', 'public', 'brand');

// The 4 logo paths (2x2 rounded squares with concave notch)
const PATHS = `
    <path d="M6295 7284 c53 -29 100 -75 124 -122 37 -73 43 -140 39 -517 -3 -342 -4 -362 -24 -406 -46 -99 -136 -159 -250 -167 -105 -7 -174 17 -241 84 -67 66 -83 119 -83 267 0 126 -11 171 -52 222 -52 63 -94 77 -253 84 -104 5 -148 12 -173 25 -44 23 -105 87 -128 134 -26 52 -30 167 -10 230 32 94 128 177 222 190 26 4 214 5 418 2 355 -5 373 -6 411 -26Z"/>
    <path d="M4847 7282 c63 -33 106 -74 133 -129 l25 -48 3 -396 c3 -377 2 -399 -18 -450 -24 -64 -83 -129 -148 -161 -46 -23 -53 -23 -420 -26 -416 -3 -444 0 -523 61 -23 17 -56 57 -73 87 l-31 55 0 415 0 415 27 51 c31 60 73 98 143 131 l50 23 395 -2 c388 -3 396 -3 437 -26Z"/>
    <path d="M4859 5815 c61 -34 123 -108 141 -170 8 -28 10 -157 8 -435 l-3 -395 -27 -45 c-35 -60 -83 -105 -138 -129 -43 -19 -69 -20 -437 -22 l-391 -1 -68 33 c-57 28 -73 42 -105 92 -21 32 -41 77 -44 100 -3 23 -5 213 -3 422 3 375 3 381 26 423 13 24 43 63 66 87 74 74 78 74 526 72 l395 -2 54 -30Z"/>
    <path d="M6287 5822 c66 -35 110 -79 140 -140 l28 -57 0 -396 0 -395 -30 -59 c-34 -66 -101 -125 -166 -144 -27 -8 -155 -12 -417 -11 -418 0 -436 3 -508 64 -22 19 -53 58 -69 87 l-30 54 0 410 c0 382 1 412 19 445 34 65 85 118 138 144 l53 27 400 -3 c393 -3 401 -3 442 -26Z"/>`;

/**
 * Create SVG string with given fill color and optional background
 */
function makeSvg(fillColor, bgColor = null, viewBox = '350 265 320 320', bgRx = '50') {
  const [vx, vy, vw, vh] = viewBox.split(' ').map(Number);
  const bgRect = bgColor
    ? `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" rx="${bgRx}" fill="${bgColor}"/>`
    : '';
  return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg">
  ${bgRect}
  <g transform="translate(0,1024) scale(0.1,-0.1)" fill="${fillColor}" stroke="none">
${PATHS}
  </g>
</svg>`;
}

/**
 * Create maskable SVG with extra padding for safe zone (20% each side)
 * The icon content is the same but the viewBox is expanded so the icon
 * sits within the inner 60% of the canvas.
 */
function makeMaskableSvg(fillColor, bgColor) {
  // Original viewBox: 350 265 320 320 (icon area)
  // We need 20% padding on each side. If total = icon / 0.6, padding = total * 0.2
  // total = 320 / 0.6 = 533.33, padding = 106.67
  const padding = 107;
  const totalSize = 320 + padding * 2; // 534
  const vx = 350 - padding; // 243
  const vy = 265 - padding; // 158
  return `<svg viewBox="${vx} ${vy} ${totalSize} ${totalSize}" xmlns="http://www.w3.org/2000/svg">
  <rect x="${vx}" y="${vy}" width="${totalSize}" height="${totalSize}" fill="${bgColor}"/>
  <g transform="translate(0,1024) scale(0.1,-0.1)" fill="${fillColor}" stroke="none">
${PATHS}
  </g>
</svg>`;
}

/**
 * Create social image SVG (wider aspect ratio, logo centered)
 */
function makeSocialSvg(width, height, fillColor, bgColor) {
  // Place the logo (320x320 original) centered in the wider canvas
  // Scale logo to fit ~200px equivalent in the center
  const logoOrigSize = 320;
  const logoDisplaySize = 200;
  const scale = logoDisplaySize / logoOrigSize;

  // Center the logo
  const logoX = (width - logoDisplaySize) / 2;
  const logoY = (height - logoDisplaySize) / 2;

  // We use a nested svg to position and scale the logo
  return `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="${width}" height="${height}" fill="${bgColor}"/>
  <svg x="${logoX}" y="${logoY}" width="${logoDisplaySize}" height="${logoDisplaySize}" viewBox="350 265 320 320">
    <g transform="translate(0,1024) scale(0.1,-0.1)" fill="${fillColor}" stroke="none">
${PATHS}
    </g>
  </svg>
</svg>`;
}

/**
 * Render SVG to PNG at a specific size
 */
async function svgToPng(svgString, size, outputPath) {
  await sharp(Buffer.from(svgString), { density: 300 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outputPath);
}

/**
 * Render SVG to PNG with custom width/height
 */
async function svgToPngRect(svgString, width, height, outputPath) {
  await sharp(Buffer.from(svgString), { density: 300 })
    .resize(width, height, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(outputPath);
}

/**
 * Create ICO file from multiple PNG buffers
 * ICO format: header + directory entries + image data
 */
function createIco(pngBuffers) {
  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);       // Reserved
  header.writeUInt16LE(1, 2);       // Type: 1 = ICO
  header.writeUInt16LE(pngBuffers.length, 4); // Number of images

  // Each directory entry: 16 bytes
  const dirSize = 16 * pngBuffers.length;
  const directory = Buffer.alloc(dirSize);

  let dataOffset = 6 + dirSize;

  for (let i = 0; i < pngBuffers.length; i++) {
    const buf = pngBuffers[i];
    const sizes = [16, 32, 48];
    const size = sizes[i] || 32;
    const offset = i * 16;

    directory.writeUInt8(size === 256 ? 0 : size, offset + 0);  // Width
    directory.writeUInt8(size === 256 ? 0 : size, offset + 1);  // Height
    directory.writeUInt8(0, offset + 2);    // Color palette
    directory.writeUInt8(0, offset + 3);    // Reserved
    directory.writeUInt16LE(1, offset + 4); // Color planes
    directory.writeUInt16LE(32, offset + 6); // Bits per pixel
    directory.writeUInt32LE(buf.length, offset + 8);  // Image size
    directory.writeUInt32LE(dataOffset, offset + 12);  // Data offset

    dataOffset += buf.length;
  }

  return Buffer.concat([header, directory, ...pngBuffers]);
}

/**
 * Ensure directory exists
 */
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function main() {
  console.log('Generating Tuttilo brand assets...\n');

  const sizes = [16, 32, 48, 64, 128, 256, 512, 1024];

  // Ensure all output directories
  const dirs = [
    path.join(BRAND_DIR, 'png-transparent'),
    path.join(BRAND_DIR, 'png-dark'),
    path.join(BRAND_DIR, 'png-light'),
    path.join(BRAND_DIR, 'favicon'),
    path.join(BRAND_DIR, 'social'),
  ];
  dirs.forEach(ensureDir);

  // --- PNG Transparent (cyan on transparent) ---
  console.log('  PNG transparent (cyan)...');
  const svgCyanTransparent = makeSvg('#06B6D4');
  for (const size of sizes) {
    await svgToPng(
      svgCyanTransparent,
      size,
      path.join(BRAND_DIR, 'png-transparent', `logo-${size}.png`)
    );
  }

  // --- PNG Transparent (white on transparent) ---
  console.log('  PNG transparent (white)...');
  const svgWhiteTransparent = makeSvg('#FFFFFF');
  for (const size of sizes) {
    await svgToPng(
      svgWhiteTransparent,
      size,
      path.join(BRAND_DIR, 'png-transparent', `logo-white-${size}.png`)
    );
  }

  // --- PNG Dark Background ---
  console.log('  PNG dark background...');
  const svgDarkBg = makeSvg('#06B6D4', '#09090b');
  for (const size of sizes) {
    await svgToPng(
      svgDarkBg,
      size,
      path.join(BRAND_DIR, 'png-dark', `logo-${size}.png`)
    );
  }

  // --- PNG Light Background ---
  console.log('  PNG light background...');
  const svgLightBg = makeSvg('#06B6D4', '#FFFFFF');
  for (const size of sizes) {
    await svgToPng(
      svgLightBg,
      size,
      path.join(BRAND_DIR, 'png-light', `logo-${size}.png`)
    );
  }

  // --- Favicons ---
  console.log('  Favicons...');
  const svgFavicon = makeSvg('#06B6D4', '#09090b');

  // favicon-16, 32, 48
  const faviconSizes = [16, 32, 48];
  const faviconPngBuffers = [];
  for (const size of faviconSizes) {
    const outPath = path.join(BRAND_DIR, 'favicon', `favicon-${size}.png`);
    await svgToPng(svgFavicon, size, outPath);
    faviconPngBuffers.push(fs.readFileSync(outPath));
  }

  // favicon.ico (multi-resolution)
  console.log('  favicon.ico (multi-resolution)...');
  const icoBuffer = createIco(faviconPngBuffers);
  fs.writeFileSync(path.join(BRAND_DIR, 'favicon', 'favicon.ico'), icoBuffer);

  // apple-touch-icon (180x180, dark bg with padding)
  console.log('  apple-touch-icon.png (180x180)...');
  // Use a slightly padded version — extend viewBox by 15% each side
  const applePad = 48;
  const appleVb = `${350 - applePad} ${265 - applePad} ${320 + applePad * 2} ${320 + applePad * 2}`;
  const svgApple = makeSvg('#06B6D4', '#09090b', appleVb);
  await svgToPng(svgApple, 180, path.join(BRAND_DIR, 'favicon', 'apple-touch-icon.png'));

  // android-chrome 192, 512
  console.log('  android-chrome icons...');
  await svgToPng(svgFavicon, 192, path.join(BRAND_DIR, 'favicon', 'android-chrome-192.png'));
  await svgToPng(svgFavicon, 512, path.join(BRAND_DIR, 'favicon', 'android-chrome-512.png'));

  // maskable icons (20% safe zone padding)
  console.log('  maskable icons...');
  const svgMaskable = makeMaskableSvg('#06B6D4', '#09090b');
  await svgToPng(svgMaskable, 192, path.join(BRAND_DIR, 'favicon', 'maskable-icon-192.png'));
  await svgToPng(svgMaskable, 512, path.join(BRAND_DIR, 'favicon', 'maskable-icon-512.png'));

  // --- Social Media ---
  console.log('  Social media images...');

  // OG Image 1200x630
  const svgOg = makeSocialSvg(1200, 630, '#06B6D4', '#09090b');
  await svgToPngRect(svgOg, 1200, 630, path.join(BRAND_DIR, 'social', 'og-image.png'));

  // Twitter Card 1200x600
  const svgTwitter = makeSocialSvg(1200, 600, '#06B6D4', '#09090b');
  await svgToPngRect(svgTwitter, 1200, 600, path.join(BRAND_DIR, 'social', 'twitter-card.png'));

  console.log('\nAll brand assets generated successfully!');

  // Print summary
  const countFiles = (dir) => {
    try { return fs.readdirSync(dir).length; } catch { return 0; }
  };
  console.log('\nSummary:');
  console.log(`  SVG variants:      ${countFiles(path.join(BRAND_DIR, 'svg'))} files`);
  console.log(`  PNG transparent:   ${countFiles(path.join(BRAND_DIR, 'png-transparent'))} files`);
  console.log(`  PNG dark bg:       ${countFiles(path.join(BRAND_DIR, 'png-dark'))} files`);
  console.log(`  PNG light bg:      ${countFiles(path.join(BRAND_DIR, 'png-light'))} files`);
  console.log(`  Favicon:           ${countFiles(path.join(BRAND_DIR, 'favicon'))} files`);
  console.log(`  Social:            ${countFiles(path.join(BRAND_DIR, 'social'))} files`);
}

main().catch((err) => {
  console.error('Error generating brand assets:', err);
  process.exit(1);
});
