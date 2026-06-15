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
    const TITLES = {
        itinerary: 'Gourdon Villa Trip — Summer 2026',
        stargazing: 'Night Sky — Gourdon Villa 2026',
    };

    function showPage(name) {
        const onStars = name === 'stargazing';
        itinerary.classList.toggle('is-active', !onStars);
        stargazing.classList.toggle('is-active', onStars);
        document.body.classList.toggle('stars-active', onStars);
        document.title = TITLES[name];
    }

    function scrollToHash(id) {
        if (!id || id === 'stars') {
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
