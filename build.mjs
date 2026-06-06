// Encrypts src/content.html into a password-protected index.html for GitHub Pages.
// Requires Node 22 (uses the built-in Web Crypto API — no dependencies).
//
//   node build.mjs "your-password"
//   PASSWORD="your-password" node build.mjs
//
import { webcrypto as crypto } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const { subtle } = crypto;
const ITERATIONS = 250000;

const password = process.argv[2] ?? process.env.PASSWORD;
if (!password) {
    console.error('\n  Usage:  node build.mjs "<your-password>"');
    console.error('     or:  PASSWORD="<your-password>" node build.mjs\n');
    process.exit(1);
}

const here = dirname(fileURLToPath(import.meta.url));
const content = readFileSync(join(here, 'src', 'content.html'));
const gateTemplate = readFileSync(join(here, 'src', 'gate.html'), 'utf8');

const enc = new TextEncoder();
const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));

const baseKey = await subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
const key = await subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
);
const ciphertext = new Uint8Array(await subtle.encrypt({ name: 'AES-GCM', iv }, key, content));

const b64 = (u) => Buffer.from(u).toString('base64');
const payload = {
    salt: b64(salt),
    iv: b64(iv),
    ct: b64(ciphertext),
    iter: ITERATIONS,
};

const indexHtml = gateTemplate.replace('__PAYLOAD__', JSON.stringify(payload));
writeFileSync(join(here, 'index.html'), indexHtml);
console.log('\n  ✓ Wrote index.html — ' + content.length + ' bytes of content encrypted (AES-256-GCM).\n');
