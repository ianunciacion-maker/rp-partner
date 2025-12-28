// Script to create placeholder asset files
// Run this with: node scripts/create-assets.js

const fs = require('fs');
const path = require('path');

// Minimal 1x1 teal PNG (base64)
// This is a valid PNG that's just a single teal pixel
const tealPixelPNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

// Larger placeholder images (100x100 teal square)
const createPlaceholderPNG = () => {
  // PNG header + IHDR + IDAT + IEND for a simple teal image
  // This creates a minimal valid PNG
  return tealPixelPNG;
};

const assetsDir = path.join(__dirname, '..', 'assets');

// Create assets directory if it doesn't exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const files = [
  'icon.png',
  'adaptive-icon.png',
  'splash-icon.png',
  'favicon.png'
];

files.forEach(file => {
  const filePath = path.join(assetsDir, file);
  fs.writeFileSync(filePath, createPlaceholderPNG());
  console.log(`Created: ${file}`);
});

console.log('\\nAssets created! Replace these with your actual app icons.');
console.log('Recommended sizes:');
console.log('  - icon.png: 1024x1024');
console.log('  - adaptive-icon.png: 1024x1024');
console.log('  - splash-icon.png: 200x200 (centered on splash background)');
console.log('  - favicon.png: 48x48');
