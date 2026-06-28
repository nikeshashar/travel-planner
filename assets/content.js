const obs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
        if (e.isIntersecting) {
            e.target.classList.add('in');
            obs.unobserve(e.target);
        }
    });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.day').forEach((d) => obs.observe(d));

(function () {
    const itinerary = document.getElementById('page-itinerary');
    const stargazing = document.getElementById('page-stargazing');
    const shopping = document.getElementById('page-shopping');
    const TITLES = {
        itinerary: 'Gourdon Villa Trip — Summer 2026',
        stargazing: 'Night Sky — Gourdon Villa 2026',
        shopping: 'Shopping List — Gourdon Villa 2026',
    };

    function showPage(name) {
        itinerary?.classList.toggle('is-active', name === 'itinerary');
        stargazing?.classList.toggle('is-active', name === 'stargazing');
        shopping?.classList.toggle('is-active', name === 'shopping');
        document.body.classList.toggle('stars-active', name === 'stargazing');
        document.body.classList.toggle('shopping-active', name === 'shopping');
        document.title = TITLES[name] || TITLES.itinerary;
    }

    function scrollToHash(id) {
        if (!id || id === 'stars' || id === 'shopping') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function route() {
        const hash = location.hash.slice(1);
        if (hash === 'stars' || hash.startsWith('stars-jul-')) {
            showPage('stargazing');
            requestAnimationFrame(() => scrollToHash(hash));
            return;
        }
        if (hash === 'shopping' || hash.startsWith('shopping-')) {
            showPage('shopping');
            requestAnimationFrame(() => scrollToHash(hash));
            return;
        }
        showPage('itinerary');
    }

    window.addEventListener('hashchange', route);
    route();
})();

(function () {
    const pad = (n) => String(n).padStart(2, '0');

    document.querySelectorAll('.countdown[data-target]').forEach((el) => {
        const target = new Date(el.dataset.target);
        const doneMsg = el.dataset.done || 'Bon voyage!';
        const units = {
            days: el.querySelector('[data-unit="days"]'),
            hours: el.querySelector('[data-unit="hours"]'),
            mins: el.querySelector('[data-unit="mins"]'),
            secs: el.querySelector('[data-unit="secs"]'),
        };

        function tick() {
            const diff = target - Date.now();
            if (diff <= 0) {
                el.classList.add('done');
                el.querySelector('.countdown-label').textContent = 'Departed';
                el.querySelector('.countdown-units').innerHTML =
                    `<span class="countdown-num">${doneMsg}</span>`;
                return;
            }
            const totalSecs = Math.floor(diff / 1000);
            units.days.textContent = pad(Math.floor(totalSecs / 86400));
            units.hours.textContent = pad(Math.floor((totalSecs % 86400) / 3600));
            units.mins.textContent = pad(Math.floor((totalSecs % 3600) / 60));
            units.secs.textContent = pad(totalSecs % 60);
        }

        tick();
        setInterval(tick, 1000);
    });
})();

(function () {
    const LAT = 44.738;
    const LON = 1.383;
    const TZ = 'Europe/Paris';
    const TRIP_START = '2026-07-06';
    const TRIP_END = '2026-07-17';
    const CACHE_KEY = 'gourdon-weather-v3';
    const CACHE_MS = 48 * 60 * 60 * 1000;

    const WX_SVG = {
        clear: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/><g fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M12 1.5v2.5M12 20v2.5M1.5 12h2.5M20 12h2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M4.2 19.8l1.8-1.8M18 6l1.8-1.8"/></g></svg>',
        partly: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="9" r="3.5" fill="currentColor" stroke="none"/><path d="M18 11h-1.1A5.5 5.5 0 0 0 7.5 11 5 5 0 0 0 8 21h9a4 4 0 0 0 0-8z"/></svg>',
        overcast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M18 11h-1.1A5.5 5.5 0 0 0 7.5 11 5 5 0 0 0 8 21h9a4 4 0 0 0 0-8z" fill="currentColor" fill-opacity=".15"/></svg>',
        fog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M4 14h16M6 18h12M4 10h16"/></svg>',
        drizzle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M18 11h-1.1A5.5 5.5 0 0 0 7.5 11 5 5 0 0 0 8 21h9a4 4 0 0 0 0-8z"/><path d="M8 20v2M12 20v2M16 20v2"/></svg>',
        rain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M18 11h-1.1A5.5 5.5 0 0 0 7.5 11 5 5 0 0 0 8 21h9a4 4 0 0 0 0-8z"/><path d="M7 20l1.5 3M12 20l1.5 3M17 20l1.5 3"/></svg>',
        storm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M18 11h-1.1A5.5 5.5 0 0 0 7.5 11 5 5 0 0 0 8 21h9a4 4 0 0 0 0-8z"/><path d="M13 16l-2.5 4.5h3l-2 4" fill="currentColor" stroke="none"/></svg>',
    };

    function codeToIcon(code) {
        if (code === 0) return 'clear';
        if (code === 1 || code === 2) return 'partly';
        if (code === 3) return 'overcast';
        if (code === 45 || code === 48) return 'fog';
        if (code >= 51 && code <= 57) return 'drizzle';
        if (code >= 61 && code <= 67) return 'rain';
        if (code >= 71 && code <= 77) return 'rain';
        if (code >= 80 && code <= 82) return 'rain';
        if (code >= 95) return 'storm';
        return 'partly';
    }

    function modeCode(codes) {
        const counts = {};
        codes.forEach((c) => { counts[c] = (counts[c] || 0) + 1; });
        return +Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    }

    function climateIconCode(codes) {
        const fair = codes.filter((c) => c <= 2).sort((a, b) => a - b);
        if (fair.length) return fair[0];
        const dry = codes.filter((c) => c <= 3);
        if (dry.length) return modeCode(dry);
        return modeCode(codes);
    }

    const days = [...document.querySelectorAll('.day')];
    if (!days.length) return;

    days.forEach((day) => {
        const n = parseInt(day.querySelector('.badge')?.textContent, 10);
        if (!n) return;
        day.dataset.date = `2026-07-${String(5 + n).padStart(2, '0')}`;
    });

    function addDays(iso, offset) {
        const d = new Date(iso + 'T12:00:00');
        d.setDate(d.getDate() + offset);
        return d.toISOString().slice(0, 10);
    }

    async function fetchJson(url) {
        const res = await fetch(url);
        if (!res.ok) throw new Error(res.status);
        return res.json();
    }

    async function fetchForecast() {
        const today = new Date().toISOString().slice(0, 10);
        const forecastEnd = addDays(today, 15);
        if (forecastEnd < TRIP_START) return {};

        const end = forecastEnd < TRIP_END ? forecastEnd : TRIP_END;
        const url = new URL('https://api.open-meteo.com/v1/forecast');
        url.searchParams.set('latitude', LAT);
        url.searchParams.set('longitude', LON);
        url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weather_code');
        url.searchParams.set('timezone', TZ);
        url.searchParams.set('start_date', TRIP_START);
        url.searchParams.set('end_date', end);

        const data = await fetchJson(url);
        const temps = {};
        data.daily.time.forEach((date, i) => {
            temps[date] = {
                max: data.daily.temperature_2m_max[i],
                min: data.daily.temperature_2m_min[i],
                code: data.daily.weather_code[i],
                src: 'forecast',
            };
        });
        return temps;
    }

    async function fetchClimateAverages() {
        const url = new URL('https://archive-api.open-meteo.com/v1/archive');
        url.searchParams.set('latitude', LAT);
        url.searchParams.set('longitude', LON);
        url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weather_code');
        url.searchParams.set('timezone', TZ);
        url.searchParams.set('start_date', '2020-07-06');
        url.searchParams.set('end_date', '2024-07-17');

        const data = await fetchJson(url);
        const buckets = {};
        data.daily.time.forEach((date, i) => {
            const md = date.slice(5);
            if (!buckets[md]) buckets[md] = { max: 0, min: 0, codes: [], n: 0 };
            buckets[md].max += data.daily.temperature_2m_max[i];
            buckets[md].min += data.daily.temperature_2m_min[i];
            buckets[md].codes.push(data.daily.weather_code[i]);
            buckets[md].n += 1;
        });

        const temps = {};
        for (let day = 6; day <= 17; day++) {
            const md = `07-${String(day).padStart(2, '0')}`;
            const b = buckets[md];
            if (!b) continue;
            temps[`2026-${md}`] = {
                max: b.max / b.n,
                min: b.min / b.n,
                code: climateIconCode(b.codes),
                src: 'climate',
            };
        }
        return temps;
    }

    async function loadTemps() {
        try {
            const raw = localStorage.getItem(CACHE_KEY);
            if (raw) {
                const cached = JSON.parse(raw);
                if (Date.now() - cached.ts < CACHE_MS) return cached.data;
            }
        } catch (_) { /* ignore corrupt cache */ }

        const [forecast, climate] = await Promise.all([
            fetchForecast().catch(() => ({})),
            fetchClimateAverages(),
        ]);
        const data = { ...climate, ...forecast };

        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
        } catch (_) { /* storage full or blocked */ }

        return data;
    }

    function render(temps) {
        days.forEach((day) => {
            const t = temps[day.dataset.date];
            if (!t) return;

            const meta = day.querySelector('.meta');
            if (!meta) return;

            let el = meta.querySelector('.day-temp');
            if (!el) {
                el = document.createElement('span');
                el.className = 'day-temp';
                meta.appendChild(el);
            }

            const max = Math.round(t.max);
            const min = Math.round(t.min);
            const iconKey = codeToIcon(t.code);
            const icon = WX_SVG[iconKey] || WX_SVG.partly;
            const label = t.src === 'forecast'
                ? `Forecast: ${min}° – ${max}°C`
                : `Typical for early July: ${min}° – ${max}°C`;

            el.innerHTML = `<span class="day-temp-ic day-temp-ic--${iconKey}" aria-hidden="true">${icon}</span><span class="day-temp-val">${max}°</span>`;
            el.title = label;
            el.setAttribute('aria-label', label);
        });
    }

    loadTemps().then(render).catch(() => {});
})();

(function () {
    const page = document.getElementById('page-shopping');
    if (!page) return;

    const form = page.querySelector('#shopping-form');
    const input = page.querySelector('#shopping-input');
    const listEl = page.querySelector('#shopping-list-active');
    const boughtListEl = page.querySelector('#shopping-bought-list');
    const boughtSection = page.querySelector('#shopping-bought-section');
    const showBoughtBtn = page.querySelector('#shopping-show-bought');
    const emptyEl = page.querySelector('#shopping-empty');
    const statusEl = page.querySelector('#shopping-status');
    const countEl = page.querySelector('#shopping-bought-count');
    const addBtn = form?.querySelector('button[type="submit"]');

    const SUPABASE_URL = (page.dataset.supabaseUrl || '').replace(/\/$/, '');
    const SUPABASE_KEY = page.dataset.supabaseAnonKey || '';
    const TABLE = 'shopping_items';
    const LOCAL_KEY = 'gourdon-shopping-v1';
    const shared = !!(SUPABASE_URL && SUPABASE_KEY);

    let items = {};
    let showBought = false;
    let pollTimer = null;
    let realtimeChannel = null;
    let busy = false;

    function itemList() {
        return Object.entries(items)
            .filter(([, item]) => item && typeof item.text === 'string')
            .map(([id, item]) => ({ id, ...item }))
            .sort((a, b) => (a.addedAt || 0) - (b.addedAt || 0));
    }

    function setStatus(msg, isError) {
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.classList.toggle('shop-note--err', !!isError);
    }

    function sbHeaders(extra) {
        return {
            apikey: SUPABASE_KEY,
            Authorization: 'Bearer ' + SUPABASE_KEY,
            ...(extra || {}),
        };
    }

    function rowToItem(row) {
        return {
            text: row.text,
            bought: row.bought,
            addedAt: row.added_at,
            boughtAt: row.bought_at,
        };
    }

    function rowsToMap(rows) {
        const map = {};
        rows.forEach((row) => {
            map[row.id] = rowToItem(row);
        });
        return map;
    }

    async function loadRemote() {
        const url = SUPABASE_URL + '/rest/v1/' + TABLE + '?select=*&order=added_at.asc';
        const res = await fetch(url, { headers: sbHeaders() });
        if (!res.ok) throw new Error('load failed');
        const rows = await res.json();
        return Array.isArray(rows) ? rowsToMap(rows) : {};
    }

    function loadLocal() {
        try {
            const raw = localStorage.getItem(LOCAL_KEY);
            const data = raw ? JSON.parse(raw) : {};
            return data && typeof data === 'object' ? data : {};
        } catch (_) {
            return {};
        }
    }

    function saveLocal(data) {
        try {
            localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
        } catch (_) { /* storage full or blocked */ }
    }

    async function connectRealtime() {
        if (!shared) return;
        try {
            const mod = await import('https://esm.sh/@supabase/supabase-js@2');
            const client = mod.createClient(SUPABASE_URL, SUPABASE_KEY);
            realtimeChannel = client
                .channel('shopping-list')
                .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, () => {
                    refresh();
                })
                .subscribe();
        } catch (_) {
            /* polling still keeps the list in sync */
        }
    }

    async function refresh() {
        if (busy) return;
        try {
            items = shared ? await loadRemote() : loadLocal();
            render();
            if (shared) setStatus('Shared list — changes sync for everyone.');
        } catch (_) {
            setStatus('Could not sync the list — will retry shortly.', true);
        }
    }

    async function addItem(text) {
        const trimmed = text.trim();
        if (!trimmed) return;

        if (shared) {
            const res = await fetch(SUPABASE_URL + '/rest/v1/' + TABLE, {
                method: 'POST',
                headers: sbHeaders({
                    'Content-Type': 'application/json',
                    Prefer: 'return=representation',
                }),
                body: JSON.stringify({
                    text: trimmed,
                    bought: false,
                    added_at: Date.now(),
                    bought_at: null,
                }),
            });
            if (!res.ok) throw new Error('add failed');
            const rows = await res.json();
            const row = rows[0];
            items[row.id] = rowToItem(row);
        } else {
            const id = crypto.randomUUID();
            items[id] = {
                text: trimmed,
                bought: false,
                addedAt: Date.now(),
                boughtAt: null,
            };
            saveLocal(items);
        }
        render();
    }

    async function setBought(id, bought) {
        const existing = items[id];
        if (!existing) return;

        const patch = {
            bought,
            boughtAt: bought ? Date.now() : null,
        };

        if (shared) {
            const res = await fetch(
                SUPABASE_URL + '/rest/v1/' + TABLE + '?id=eq.' + encodeURIComponent(id),
                {
                    method: 'PATCH',
                    headers: sbHeaders({
                        'Content-Type': 'application/json',
                        Prefer: 'return=representation',
                    }),
                    body: JSON.stringify({
                        bought,
                        bought_at: patch.boughtAt,
                    }),
                }
            );
            if (!res.ok) throw new Error('update failed');
        }

        items[id] = { ...existing, ...patch };
        if (!shared) saveLocal(items);
        render();
    }

    function createRow(item, isBought) {
        const li = document.createElement('li');
        li.className = 'shop-item' + (isBought ? ' shop-item--bought' : '');

        const label = document.createElement('label');
        label.className = 'shop-item-label';

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = isBought;
        cb.className = 'shop-item-check';
        cb.setAttribute('aria-label', isBought ? `Mark ${item.text} as not bought` : `Mark ${item.text} as bought`);
        cb.addEventListener('change', async () => {
            cb.disabled = true;
            try {
                await setBought(item.id, cb.checked);
            } catch (_) {
                cb.checked = !cb.checked;
                setStatus('Could not update that item — try again.', true);
            } finally {
                cb.disabled = false;
            }
        });

        const span = document.createElement('span');
        span.className = 'shop-item-text';
        span.textContent = item.text;

        label.append(cb, span);
        li.appendChild(label);
        return li;
    }

    function render() {
        const all = itemList();
        const pending = all.filter((i) => !i.bought);
        const bought = all.filter((i) => i.bought);

        listEl.innerHTML = '';
        boughtListEl.innerHTML = '';

        emptyEl.hidden = pending.length > 0;

        pending.forEach((item) => {
            listEl.appendChild(createRow(item, false));
        });

        bought.forEach((item) => {
            boughtListEl.appendChild(createRow(item, true));
        });

        countEl.textContent = String(bought.length);
        showBoughtBtn.setAttribute('aria-pressed', showBought ? 'true' : 'false');
        showBoughtBtn.classList.toggle('is-on', showBought);
        boughtSection.hidden = !showBought || bought.length === 0;
        showBoughtBtn.disabled = bought.length === 0;
    }

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value;
        if (!text.trim()) return;

        busy = true;
        addBtn.disabled = true;
        try {
            await addItem(text);
            input.value = '';
            input.focus();
            if (!shared) setStatus('Saved on this device only. Add Supabase credentials to share with the group.');
        } catch (_) {
            setStatus('Could not add that item — try again.', true);
        } finally {
            busy = false;
            addBtn.disabled = false;
        }
    });

    showBoughtBtn?.addEventListener('click', () => {
        showBought = !showBought;
        render();
    });

    if (shared) {
        refresh().then(connectRealtime);
        pollTimer = window.setInterval(refresh, 30000);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) refresh();
        });
    } else {
        items = loadLocal();
        render();
        setStatus('Saved on this device only. Add Supabase credentials to share with the group.');
    }

    window.addEventListener('pagehide', () => {
        if (pollTimer) window.clearInterval(pollTimer);
        realtimeChannel?.unsubscribe();
    });
})();
