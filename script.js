// Full script.js – restores all animations and RSVP logic

document.addEventListener('DOMContentLoaded', () => {

    /* --- Scroll Reveal Animation --- */
    function reveal() {
        const reveals = document.querySelectorAll('.reveal');
        for (let i = 0; i < reveals.length; i++) {
            const windowHeight = window.innerHeight;
            const elementTop = reveals[i].getBoundingClientRect().top;
            const elementVisible = 100; // trigger threshold
            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add('active');
            }
        }
    }
    window.addEventListener('scroll', reveal, { passive: true });
    reveal();

    /* --- Hero Gallery: вычисляем дистанцию прокрутки --- */
    function setHeroSlideDistance() {
        const gallery = document.querySelector('.hero-gallery');
        const track = document.querySelector('.hero-track');
        if (gallery && track) {
            const diff = gallery.offsetWidth - track.scrollWidth;
            document.documentElement.style.setProperty('--hero-slide-end', diff + 'px');
        }
    }
    setHeroSlideDistance();
    window.addEventListener('resize', setHeroSlideDistance);
    window.addEventListener('load', setHeroSlideDistance);

    /* --- Position Timeline Elements --- */
    function layoutTimeline() {
        const tl = document.querySelector('.tl');
        const svg = document.querySelector('.tl-svg');
        if (!tl || !svg) return;
        const W = tl.clientWidth;
        if (W === 0) return;
        const svgAspect = 210 / 400;
        const svgH = W * svgAspect;
        const tier1Frac = 1 / 210;
        const tier3Frac = 209 / 210;
        const TIME_H = 33;
        const GAP_TIME = 30;
        const GAP_LABEL = 15;
        const svgTop = TIME_H + GAP_TIME;
        const tier1Y = svgTop + svgH * tier1Frac;
        const tier3Y = svgTop + svgH * tier3Frac;
        svg.style.top = svgTop + 'px';
        const r1TimeTop = tier1Y - GAP_TIME - TIME_H;
        document.querySelectorAll('.tl-r1-left.tl-time, .tl-r1-right.tl-time')
            .forEach(el => el.style.top = r1TimeTop + 'px');
        const r1LabelTop = tier1Y + GAP_LABEL;
        document.querySelectorAll('.tl-r1-left.tl-label, .tl-r1-right.tl-label')
            .forEach(el => el.style.top = r1LabelTop + 'px');
        const r2TimeTop = tier3Y - GAP_TIME - TIME_H;
        document.querySelectorAll('.tl-r2-left.tl-time, .tl-r2-right.tl-time')
            .forEach(el => el.style.top = r2TimeTop + 'px');
        const r2LabelTop = tier3Y + GAP_LABEL;
        document.querySelectorAll('.tl-r2-left.tl-label, .tl-r2-right.tl-label')
            .forEach(el => el.style.top = r2LabelTop + 'px');
        const labelH = 52;
        tl.style.height = (r2LabelTop + labelH) + 'px';
        const svgRect = svg.getBoundingClientRect();
        const svgW = svgRect.width;
        const scale = 400 / svgW;
        const pairs = [
            ['.tl-r1-left.tl-time',  '.tl-dot-1'],
            ['.tl-r1-right.tl-time', '.tl-dot-2'],
            ['.tl-r2-left.tl-time',  '.tl-dot-3'],
            ['.tl-r2-right.tl-time', '.tl-dot-4'],
        ];
        pairs.forEach(([timeSel, dotSel]) => {
            const timeEl = document.querySelector(timeSel);
            const dotEl = svg.querySelector(dotSel);
            if (!timeEl || !dotEl) return;
            const cx = (timeEl.getBoundingClientRect().left - svgRect.left) * scale;
            dotEl.setAttribute('cx', cx);
        });
    }
    window.addEventListener('resize', layoutTimeline);
    setTimeout(layoutTimeline, 100);

    /* --- Parallax Effect for Ampersand --- */
    const ampersand = document.querySelector('.bg-ampersand');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (ampersand) {
            ampersand.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.2}px))`;
        }
    }, { passive: true });

    /* --- RSVP Form Submission Logic (Google Sheets) --- */
    const form = document.getElementById('rsvp-form');
    const submitBtn = document.getElementById('submit-btn');
    const successMsg = document.getElementById('form-success');
    const errorMsg = document.getElementById('form-error');

    // <-- замените URL на ваш развернутый Web‑App URL -->
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyvCkz3m34bTUeV6OYWpJ5wsYPHFWISs9K4fU6XlorrQ2O-UAjtB_cVY4SnxMEoZZRq/exec';

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        submitBtn.textContent = 'ОТПРАВКА...';
        submitBtn.disabled = true;

        // Honeypot: если скрытое поле заполнено — это бот
        const honeypot = form.querySelector('input[name="phone"]');
        if (honeypot && honeypot.value) {
            // Имитируем успех, но ничего не отправляем
            setTimeout(() => {
                form.reset();
                submitBtn.classList.add('hidden');
                successMsg.classList.remove('hidden');
            }, 1500);
            return;
        }

        // собрать данные формы и отправить как URL‑encoded
        const formData = new FormData(form);
        formData.delete('phone'); // удаляем honeypot-поле из отправки
        const params = new URLSearchParams(formData);

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Используем no-cors для обхода ограничений Google Apps Script
            body: params // URLSearchParams автоматически задаст нужный Content-Type
        })
        .then(() => {
            console.log('RSVP sent');
            form.reset();
            submitBtn.classList.add('hidden');
            successMsg.classList.remove('hidden');
        })
        .catch((error) => {
            console.error('Error sending RSVP:', error);
            submitBtn.textContent = 'ОТПРАВИТЬ';
            submitBtn.disabled = false;
            errorMsg.classList.remove('hidden');
        });
    });

}); // DOMContentLoaded
