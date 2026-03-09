/**
 * fix24-tracker.js
 * Вставити перед </body> на всіх сторінках fix24.pro (і піддоменах)
 * Збирає дані тільки якщо є gclid (клік з Google Ads)
 */

(function () {
    'use strict';

    const params = new URLSearchParams(window.location.search);
    const gclid = params.get('gclid');

    if (!gclid) return;

    const startTime = Date.now();
    let mouseMoved = false;
    let scrolled = false;
    let clickedPhone = false;
    let lastActivityTime = Date.now();
    let activeTime = 0;
    let isPageVisible = true;
    let dataSent = false;

    // Відслідковуємо активність
    document.addEventListener('mousemove', function () {
        mouseMoved = true;
        lastActivityTime = Date.now();
    }, { once: true });

    document.addEventListener('scroll', function () {
        scrolled = true;
        lastActivityTime = Date.now();
    }, { once: true });

    document.addEventListener('touchstart', function () {
        mouseMoved = true;
        lastActivityTime = Date.now();
    }, { once: true });

    document.addEventListener('click', function () {
        lastActivityTime = Date.now();
    });

    // Відслідковуємо видимість сторінки (мінімізація, перехід на іншу вкладку)
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            isPageVisible = false;
        } else {
            isPageVisible = true;
            lastActivityTime = Date.now();
        }
    });

    // Відслідковуємо клік на телефон
    document.querySelectorAll('a[href^="tel:"]').forEach(function (el) {
        el.addEventListener('click', function () {
            clickedPhone = true;
            sendData(true); // Відправляємо одразу при дзвінку
        });
    });

    // Рахуємо активний час кожну секунду
    const timeInterval = setInterval(function () {
        if (isPageVisible) {
            activeTime = Math.round((Date.now() - startTime) / 1000);
        }
    }, 1000);

    function getBrowserData() {
        const nav = navigator;
        const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
        return {
            userAgent: nav.userAgent,
            language: nav.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen: window.screen.width + 'x' + window.screen.height + '@' + (window.screen.colorDepth || 24),
            cores: nav.hardwareConcurrency || null,
            memory: nav.deviceMemory || null,
            connection: conn ? (conn.effectiveType || conn.type) : null,
            touchSupport: ('ontouchstart' in window) || (nav.maxTouchPoints > 0),
        };
    }

    async function generateFingerprint() {
        const data = getBrowserData();

        let canvasHash = '';
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = 'alphabetic';
            ctx.font = '14px Arial';
            ctx.fillStyle = '#f60';
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = '#069';
            ctx.fillText('fix24.pro', 2, 15);
            ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
            ctx.fillText('fix24.pro', 4, 17);
            canvasHash = canvas.toDataURL().slice(-50);
        } catch (e) { }

        let webglHash = '';
        try {
            const gl = document.createElement('canvas').getContext('webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    webglHash = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                }
            }
        } catch (e) { }

        const fpString = [
            data.userAgent, data.language, data.timezone,
            data.screen, data.cores, data.memory,
            data.touchSupport, canvasHash, webglHash,
        ].join('|');

        let hash = 0;
        for (let i = 0; i < fpString.length; i++) {
            const char = fpString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }

    async function sendData(isFinal = false) {
        if (dataSent && isFinal) return;
        if (isFinal) dataSent = true;

        clearInterval(timeInterval);

        const fingerprint = await generateFingerprint();
        const browserData = getBrowserData();
        const timeOnPage = Math.round((Date.now() - startTime) / 1000);

        const payload = {
            gclid,
            landingPage: window.location.href,
            fingerprint,
            timeOnPage,
            activeTime,
            mouseMoved,
            scrolled,
            clickedPhone,
            isFinal,
            ...browserData,
        };

        try {
            await fetch('https://api.fix24.pro/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true,
            });
        } catch (e) { }
    }

    // Відправляємо при закритті
    window.addEventListener('beforeunload', function () {
        sendData(true);
    });

    // Відправляємо через 30 секунд (проміжний запис)
    setTimeout(function () {
        sendData(false);
    }, 30000);

    // Відправляємо через 2 хвилини (якщо людина довго на сайті)
    setTimeout(function () {
        sendData(false);
    }, 120000);

})();