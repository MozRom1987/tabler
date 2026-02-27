/**
 * fix24-tracker.js
 * Вставити перед </body> на всіх сторінках fix24.pro
 * Збирає дані тільки якщо є gclid (клік з Google Ads)
 */

(function() {
    'use strict';

    // Перевіряємо чи є gclid в URL (ознака кліку з Google Ads)
    const params = new URLSearchParams(window.location.search);
    const gclid = params.get('gclid');

    // Якщо немає gclid — це не рекламний клік, нічого не робимо
    if (!gclid) return;

    const startTime = Date.now();
    let mouseMoved = false;
    let scrolled = false;
    let clickedPhone = false;

    // Відслідковуємо поведінку
    document.addEventListener('mousemove', function() { mouseMoved = true; }, { once: true });
    document.addEventListener('scroll', function() { scrolled = true; }, { once: true });
    document.addEventListener('touchstart', function() { mouseMoved = true; }, { once: true });

    // Відслідковуємо клік на телефон
    document.querySelectorAll('a[href^="tel:"]').forEach(function(el) {
        el.addEventListener('click', function() { clickedPhone = true; });
    });

    // Збираємо базові дані браузера
    function getBrowserData() {
        const nav = navigator;
        const screen = window.screen;
        const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

        return {
            userAgent: nav.userAgent,
            language: nav.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen: screen.width + 'x' + screen.height + '@' + (screen.colorDepth || 24),
            cores: nav.hardwareConcurrency || null,
            memory: nav.deviceMemory || null,
            connection: conn ? (conn.effectiveType || conn.type) : null,
            touchSupport: ('ontouchstart' in window) || (nav.maxTouchPoints > 0),
            cookiesEnabled: nav.cookieEnabled,
            doNotTrack: nav.doNotTrack === '1',
        };
    }

    // Генеруємо простий fingerprint без зовнішніх бібліотек
    async function generateFingerprint() {
        const data = getBrowserData();

        // Canvas fingerprint
        let canvasHash = '';
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.textBaseline = 'alphabetic';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('fix24.pro 🔍', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('fix24.pro 🔍', 4, 17);
            canvasHash = canvas.toDataURL().slice(-50);
        } catch(e) {}

        // WebGL fingerprint
        let webglHash = '';
        try {
            const gl = document.createElement('canvas').getContext('webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    webglHash = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                }
            }
        } catch(e) {}

        const fpString = [
            data.userAgent,
            data.language,
            data.timezone,
            data.screen,
            data.cores,
            data.memory,
            data.touchSupport,
            canvasHash,
            webglHash,
        ].join('|');

        // Простий hash
        let hash = 0;
        for (let i = 0; i < fpString.length; i++) {
            const char = fpString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }

    // Відправляємо дані після того як користувач побув на сторінці
    async function sendData(timeOnPage) {
        const fingerprint = await generateFingerprint();
        const browserData = getBrowserData();

        const payload = {
            gclid: gclid,
            landingPage: window.location.href,
            fingerprint: fingerprint,
            timeOnPage: timeOnPage,
            mouseMoved: mouseMoved,
            scrolled: scrolled,
            clickedPhone: clickedPhone,
            ...browserData,
        };

        try {
            await fetch('https://api.fix24.pro/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true,
            });
        } catch(e) {
            // Тихо ігноруємо помилки
        }
    }

    // Відправляємо при закритті сторінки
    window.addEventListener('beforeunload', function() {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000);
        sendData(timeOnPage);
    });

    // Також відправляємо через 10 секунд (для мобільних де beforeunload не спрацьовує)
    setTimeout(function() {
        const timeOnPage = Math.round((Date.now() - startTime) / 1000);
        sendData(timeOnPage);
    }, 10000);

})();