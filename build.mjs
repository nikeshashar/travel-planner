// Assembles src/content.html + page fragments into index.html for GitHub Pages.
//
//   node build.mjs
//
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
let html = readFileSync(join(here, 'src', 'content.html'), 'utf8');
html = html.replace('<!-- STARGAZING -->', readFileSync(join(here, 'src', 'stargazing.html'), 'utf8'));
html = html.replace('<!-- SHOPPING -->', readFileSync(join(here, 'src', 'shopping.html'), 'utf8'));

writeFileSync(join(here, 'index.html'), html);
console.log('\n  ✓ Wrote index.html — ' + Buffer.byteLength(html, 'utf8') + ' bytes.\n');
