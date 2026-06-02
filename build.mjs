// Encrypts src/content.html into a password-protected index.html for GitHub Pages.
// Requires Node 18+ (uses the built-in Web Crypto API — no dependencies).
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
const payload = JSON.stringify({
    salt: b64(salt),
    iv: b64(iv),
    ct: b64(ciphertext),
    iter: ITERATIONS,
});

writeFileSync(join(here, 'index.html'), gatePage(payload));
console.log('\n  ✓ Wrote index.html — ' + content.length + ' bytes of content encrypted (AES-256-GCM).\n');

function gatePage(payloadJson) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Private &middot; Summer 2026</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&family=Hanken+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{ --paper:#f3e7d0; --ink:#2c2113; --soft:#6a5a40; --terracotta:#c14a2b; --terra-deep:#9c3a20; --ochre:#d98a2b; --card:#fbf4e6; --line:#d8c39c; }
  *{ box-sizing:border-box; }
  body{ margin:0; min-height:100vh; min-height:100dvh; display:grid; place-items:center; padding:1.5rem;
        font-family:"Hanken Grotesk",-apple-system,BlinkMacSystemFont,sans-serif; color:var(--ink);
        background:radial-gradient(140% 120% at 72% -10%, var(--ochre) 0%, var(--terracotta) 38%, var(--terra-deep) 78%, #6f2814 100%); }
  .lock{ width:100%; max-width:400px; background:var(--card); border:1px solid var(--line); border-radius:18px;
         padding:clamp(1.8rem,6vw,2.6rem); box-shadow:0 30px 60px -25px rgba(60,25,8,.6); text-align:center; }
  .ic{ font-size:2.2rem; line-height:1; }
  h1{ font-family:"Fraunces",Georgia,serif; font-weight:600; font-size:1.7rem; letter-spacing:-.01em; margin:.7rem 0 .25rem; }
  h1 em{ font-style:italic; color:var(--terracotta); }
  p.sub{ color:var(--soft); font-size:.92rem; margin:0 0 1.5rem; }
  form{ display:flex; flex-direction:column; gap:.7rem; }
  input{ font:inherit; padding:.85rem 1rem; border:1.5px solid var(--line); border-radius:10px; background:#fff;
         text-align:center; letter-spacing:.06em; }
  input:focus{ outline:none; border-color:var(--terracotta); box-shadow:0 0 0 3px rgba(193,74,43,.15); }
  button{ font:inherit; font-weight:600; padding:.85rem 1rem; border:none; border-radius:10px; cursor:pointer;
          color:var(--paper); background:var(--terracotta); transition:background .2s; }
  button:hover{ background:var(--terra-deep); }
  button:disabled{ opacity:.65; cursor:wait; }
  .err{ color:#9c2020; font-size:.85rem; min-height:1.15em; margin:.1rem 0 0; }
</style>
</head>
<body>
  <main class="lock">
    <div class="ic">&#128274;</div>
    <h1>South of France <em>Escape</em></h1>
    <p class="sub">This itinerary is private. Enter the password to view it.</p>
    <form id="f">
      <input id="pw" type="password" placeholder="Password" autocomplete="current-password" autofocus required>
      <button id="go" type="submit">Unlock</button>
      <p class="err" id="err" role="alert"></p>
    </form>
  </main>
<script>
var PAYLOAD = ${payloadJson};
function b64ToBytes(s){ var bin=atob(s); var u=new Uint8Array(bin.length); for(var i=0;i<bin.length;i++){ u[i]=bin.charCodeAt(i); } return u; }
async function decrypt(password){
  var enc=new TextEncoder();
  var baseKey=await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
  var key=await crypto.subtle.deriveKey({ name:'PBKDF2', salt:b64ToBytes(PAYLOAD.salt), iterations:PAYLOAD.iter, hash:'SHA-256' }, baseKey, { name:'AES-GCM', length:256 }, false, ['decrypt']);
  var buf=await crypto.subtle.decrypt({ name:'AES-GCM', iv:b64ToBytes(PAYLOAD.iv) }, key, b64ToBytes(PAYLOAD.ct));
  return new TextDecoder().decode(buf);
}
var form=document.getElementById('f'), pw=document.getElementById('pw'), err=document.getElementById('err'), go=document.getElementById('go');
form.addEventListener('submit', async function(e){
  e.preventDefault();
  err.textContent=''; go.disabled=true; go.textContent='Unlocking\\u2026';
  try{
    var html=await decrypt(pw.value);
    document.open(); document.write(html); document.close();
  }catch(_){
    err.textContent='Incorrect password \\u2014 try again.';
    go.disabled=false; go.textContent='Unlock'; pw.value=''; pw.focus();
  }
});
</script>
</body>
</html>
`;
}
