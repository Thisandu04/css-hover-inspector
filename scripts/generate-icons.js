import sharp from 'sharp';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const svgBuffer = readFileSync(path.join(root, 'extension/icons/icon.svg'));

const sizes = [16, 48, 128];

await Promise.all(
  sizes.map((size) =>
    sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(root, `extension/icons/icon-${size}.png`))
  )
);

console.log('✅ Icons generated:', sizes.map((s) => `icon-${s}.png`).join(', '));