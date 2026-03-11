/**
 * fix24-tracker.js — v2
 * Вставити перед </body> на всіх сторінках fix24.pro (і піддоменах)
 * Збирає дані тільки якщо є gclid (клік з Google Ads)
 */

(function () {
    'use strict';

    const params = new URLSearchParams(window.location.search);
    const gclid = params.get('gclid');

    if (!gclid) return;

    const API_URL = 'https://api.fix24.pro';
    const startTime = Date.now();

    let mouseMoved = false;
    let scrollDepth = 0;
    let clickedPhone = false;
    let timeToPhoneClick = null;
    let convertedMessenger = false;
    let convertedForm = false;
    let timeToFirstAction = null;
    let activeTime = 0;
    let isPageVisible = true;
    let dataSent = false;

    // ============================================
    // Поведінкові сигнали
    // ============================================

    function recordFirstAction() {
        if (timeToFirstAction === null) {
            timeToFirstAction = Date.now() - startTime;
        }
    }

    document.addEventListener('mousemove', function () {
        mouseMoved = true;
        recordFirstAction();
    }, { once: true });

    document.addEventListener('touchstart', function () {
        mouseMoved = true;
        recordFirstAction();
    }, { once: true });

    // Scroll depth % (замість bool)
    document.addEventListener('scroll', function () {
        recordFirstAction();
        const newDepth = Math.round(
            (window.scrollY + window.innerHeight) / document.body.scrollHeight * 100
        );
        if (newDepth > scrollDepth) scrollDepth = Math.min(newDepth, 100);
    });

    document.addEventListener('click', recordFirstAction);

    // Видимість сторінки
    document.addEventListener('visibilitychange', function () {
        isPageVisible = !document.hidden;
    });

    // Активний час
    const timeInterval = setInterval(function () {
        if (isPageVisible) {
            activeTime = Math.round((Date.now() - startTime) / 1000);
        }
    }, 1000);

    // ============================================
    // Конверсії → POST /mark-converted
    // ============================================

    function markConverted() {
        fetch(API_URL + '/mark-converted', {
            method: 'POST',
            keepalive: true,
        }).catch(function () { });
    }

    // Телефон
    document.querySelectorAll('a[href^="tel:"]').forEach(function (el) {
        el.addEventListener('click', function () {
            if (!clickedPhone) {
                clickedPhone = true;
                timeToPhoneClick = Date.now() - startTime;
                markConverted();
                sendData(true);
            }
        });
    });

    // WhatsApp
    document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]').forEach(function (el) {
        el.addEventListener('click', function () {
            convertedMessenger = true;
            markConverted();
            sendData(true);
        });
    });

    // Telegram
    document.querySelectorAll('a[href*="t.me"], a[href*="telegram.me"]').forEach(function (el) {
        el.addEventListener('click', function () {
            convertedMessenger = true;
            markConverted();
            sendData(true);
        });
    });

    // Messenger (Facebook)
    document.querySelectorAll('a[href*="m.me"], a[href*="messenger.com"]').forEach(function (el) {
        el.addEventListener('click', function () {
            convertedMessenger = true;
            markConverted();
            sendData(true);
        });
    });

    // Viber
    document.querySelectorAll('a[href^="viber://"]').forEach(function (el) {
        el.addEventListener('click', function () {
            convertedMessenger = true;
            markConverted();
            sendData(true);
        });
    });

    // Форма
    document.querySelectorAll('form').forEach(function (form) {
        form.addEventListener('submit', function () {
            convertedForm = true;
            markConverted();
            sendData(true);
        });
    });

    // ============================================
    // Fingerprint (SHA-256)
    // ============================================

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
            // Новий сигнал: виявлення Selenium/Puppeteer
            webdriver: nav.webdriver || false,
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

        // SHA-256 замість 32-bit хешу — менше колізій
        try {
            const encoder = new TextEncoder();
            const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(fpString));
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
        } catch (e) {
            // Fallback до старого хешу якщо crypto.subtle недоступний
            let hash = 0;
            for (let i = 0; i < fpString.length; i++) {
                const char = fpString.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(16).padStart(8, '0');
        }
    }

    // ============================================
    // Відправка даних
    // ============================================

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
            // Поведінка
            mouseMoved,
            scrollDepth,
            timeToFirstAction,
            // Конверсії
            clickedPhone,
            timeToPhoneClick,
            convertedMessenger,
            convertedForm,
            isFinal,
            // Браузер
            ...browserData,
        };

        try {
            await fetch(API_URL + '/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                keepalive: true,
            });
        } catch (e) { }
    }

    // При закритті сторінки
    window.addEventListener('beforeunload', function () {
        sendData(true);
    });

    // Проміжні відправки
    setTimeout(function () { sendData(false); }, 30000);
    setTimeout(function () { sendData(false); }, 120000);

})();