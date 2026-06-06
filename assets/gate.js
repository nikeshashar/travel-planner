function b64ToBytes(s) {
    var bin = atob(s);
    var u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) { u[i] = bin.charCodeAt(i); }
    return u;
}

async function decrypt(password, payload) {
    var enc = new TextEncoder();
    var baseKey = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']);
    var key = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: b64ToBytes(payload.salt), iterations: payload.iter, hash: 'SHA-256' },
        baseKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
    );
    var buf = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: b64ToBytes(payload.iv) },
        key,
        b64ToBytes(payload.ct)
    );
    return new TextDecoder().decode(buf);
}

var payloadEl = document.getElementById('payload');
var payload = JSON.parse(payloadEl.textContent);
var form = document.getElementById('f');
var pw = document.getElementById('pw');
var err = document.getElementById('err');
var go = document.getElementById('go');

form.addEventListener('submit', async function (e) {
    e.preventDefault();
    err.textContent = '';
    go.disabled = true;
    go.textContent = 'Unlocking\u2026';
    try {
        var html = await decrypt(pw.value, payload);
        document.open();
        document.write(html);
        document.close();
    } catch (_) {
        err.textContent = 'Incorrect password \u2014 try again.';
        go.disabled = false;
        go.textContent = 'Unlock';
        pw.value = '';
        pw.focus();
    }
});
