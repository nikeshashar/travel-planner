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
    const target = new Date('2026-07-06T00:00:00');
    const el = document.getElementById('countdown');
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-mins');
    const secsEl = document.getElementById('cd-secs');
    const pad = (n) => String(n).padStart(2, '0');

    function tick() {
        const diff = target - Date.now();
        if (diff <= 0) {
            el.classList.add('done');
            el.querySelector('.countdown-label').textContent = 'The adventure begins';
            el.querySelector('.countdown-units').innerHTML =
                '<span class="countdown-num">Bon voyage!</span>';
            return;
        }
        const totalSecs = Math.floor(diff / 1000);
        daysEl.textContent = pad(Math.floor(totalSecs / 86400));
        hoursEl.textContent = pad(Math.floor((totalSecs % 86400) / 3600));
        minsEl.textContent = pad(Math.floor((totalSecs % 3600) / 60));
        secsEl.textContent = pad(totalSecs % 60);
    }

    tick();
    setInterval(tick, 1000);
})();
