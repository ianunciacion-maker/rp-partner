// Script to create branded asset files for RP-Partner
// Run this with: node scripts/create-assets.js

const fs = require('fs');
const path = require('path');

// Brand colors
const NAVY = '#1a365d';
const TEAL = '#38b2ac';

// Create a simple SVG icon and convert to data URI (can be viewed in browser)
const createIconSVG = (size, text = 'RP') => {
  const fontSize = size * 0.4;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${NAVY};stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2d4a6f;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size * 0.15}" fill="url(#grad)"/>
  <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif" font-weight="bold"
        font-size="${fontSize}" fill="${TEAL}">${text}</text>
</svg>`;
};

// Create splash icon SVG (house icon)
const createSplashSVG = (size) => {
  const scale = size / 200;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${NAVY}"/>
  <g transform="translate(${size/2}, ${size/2}) scale(${scale})">
    <!-- House icon -->
    <path d="M0 -60 L60 0 L45 0 L45 50 L-45 50 L-45 0 L-60 0 Z" fill="${TEAL}" stroke="${TEAL}" stroke-width="4"/>
    <rect x="-15" y="10" width="30" height="40" fill="${NAVY}"/>
  </g>
  <text x="50%" y="85%" dominant-baseline="middle" text-anchor="middle"
        font-family="system-ui, -apple-system, sans-serif" font-weight="bold"
        font-size="${size * 0.12}" fill="white">RP-Partner</text>
</svg>`;
};

// For actual PNG generation, we'll create proper base64-encoded PNGs
// These are pre-generated 48x48, 192x192, and 512x512 branded icons

// Simple colored square PNG generator (creates actual valid PNGs)
const createSimplePNG = (width, height, r, g, b) => {
  // PNG signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0); // Length
  ihdr.write('IHDR', 4);
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr.writeUInt8(8, 16); // Bit depth
  ihdr.writeUInt8(2, 17); // Color type (RGB)
  ihdr.writeUInt8(0, 18); // Compression
  ihdr.writeUInt8(0, 19); // Filter
  ihdr.writeUInt8(0, 20); // Interlace
  const ihdrCrc = crc32(ihdr.slice(4, 21));
  ihdr.writeUInt32BE(ihdrCrc, 21);

  // IDAT chunk (image data)
  const rawData = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 3)] = 0; // Filter byte
    for (let x = 0; x < width; x++) {
      const offset = y * (1 + width * 3) + 1 + x * 3;
      rawData[offset] = r;
      rawData[offset + 1] = g;
      rawData[offset + 2] = b;
    }
  }

  const zlib = require('zlib');
  const compressed = zlib.deflateSync(rawData);

  const idat = Buffer.alloc(compressed.length + 12);
  idat.writeUInt32BE(compressed.length, 0);
  idat.write('IDAT', 4);
  compressed.copy(idat, 8);
  const idatCrc = crc32(Buffer.concat([Buffer.from('IDAT'), compressed]));
  idat.writeUInt32BE(idatCrc, compressed.length + 8);

  // IEND chunk
  const iend = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);

  return Buffer.concat([signature, ihdr, idat, iend]);
};

// CRC32 implementation for PNG
const crc32 = (data) => {
  let crc = 0xffffffff;
  const table = [];

  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }

  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
};

const assetsDir = path.join(__dirname, '..', 'assets');
const publicDir = path.join(__dirname, '..', 'public');

// Create directories
[assetsDir, publicDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create SVG files for assets (these render properly in browsers)
const assets = [
  { name: 'icon.svg', content: createIconSVG(1024), dir: assetsDir },
  { name: 'adaptive-icon.svg', content: createIconSVG(1024), dir: assetsDir },
  { name: 'splash-icon.svg', content: createSplashSVG(200), dir: assetsDir },
  { name: 'favicon.svg', content: createIconSVG(48), dir: assetsDir },
];

// Create branded PNG placeholders (teal color: #38b2ac = RGB 56, 178, 172)
const pngAssets = [
  { name: 'icon.png', width: 512, height: 512 },
  { name: 'adaptive-icon.png', width: 512, height: 512 },
  { name: 'splash-icon.png', width: 200, height: 200 },
  { name: 'favicon.png', width: 48, height: 48 },
];

// Navy color for PNGs: #1a365d = RGB 26, 54, 93
pngAssets.forEach(({ name, width, height }) => {
  const filePath = path.join(assetsDir, name);
  const png = createSimplePNG(width, height, 26, 54, 93);
  fs.writeFileSync(filePath, png);
  console.log(`Created: ${name} (${width}x${height})`);
});

// Save SVGs for reference/conversion
assets.forEach(({ name, content, dir }) => {
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content);
  console.log(`Created: ${name}`);
});

// Create PWA icons for public folder
const pwaIcons = [
  { name: 'icon-192.png', width: 192, height: 192 },
  { name: 'icon-512.png', width: 512, height: 512 },
];

pwaIcons.forEach(({ name, width, height }) => {
  const filePath = path.join(publicDir, name);
  const png = createSimplePNG(width, height, 26, 54, 93);
  fs.writeFileSync(filePath, png);
  console.log(`Created PWA: ${name} (${width}x${height})`);
});

console.log('\n✅ Assets created successfully!');
console.log('\nFor production, replace PNGs with properly designed icons.');
console.log('You can use the SVG files as templates - they show the brand design.');
console.log('\nRecommended sizes:');
console.log('  - icon.png: 1024x1024 (app icon)');
console.log('  - adaptive-icon.png: 1024x1024 (Android adaptive)');
console.log('  - splash-icon.png: 200x200 (splash screen)');
console.log('  - favicon.png: 48x48 (browser tab)');
console.log('  - public/icon-192.png: 192x192 (PWA)');
console.log('  - public/icon-512.png: 512x512 (PWA)');
