/**
 * fix24-tracker.js v3
 * Вставити перед </body> на всіх сторінках fix24.pro
 * Збирає дані тільки якщо є gclid (клік з Google Ads)
 */

(function () {
    'use strict';

    const params = new URLSearchParams(window.location.search);
    const gclid = params.get('gclid');

    if (!gclid) return;

    const API_BASE = 'https://api.fix24.pro';
    const startTime = Date.now();

    let mouseMoved = false;
    let scrolled = false;
    let clickedPhone = false;
    let lastActivityTime = Date.now();
    let activeTime = 0;
    let isPageVisible = true;
    let dataSent = false;

    // ─── ПОВЕДІНКА ──────────────────────────────────────────────

    document.addEventListener('mousemove', function () { mouseMoved = true; lastActivityTime = Date.now(); }, { once: true });
    document.addEventListener('scroll', function () { scrolled = true; lastActivityTime = Date.now(); }, { once: true });
    document.addEventListener('touchstart', function () { mouseMoved = true; lastActivityTime = Date.now(); }, { once: true });
    document.addEventListener('click', function () { lastActivityTime = Date.now(); });

    document.addEventListener('visibilitychange', function () {
        isPageVisible = !document.hidden;
        if (isPageVisible) lastActivityTime = Date.now();
    });

    setInterval(function () {
        if (isPageVisible) activeTime = Math.round((Date.now() - startTime) / 1000);
    }, 1000);

    // ─── HONEYPOT — приховане поле форми ────────────────────────

    document.querySelectorAll('input[name="website_confirm"]').forEach(function (field) {
        field.addEventListener('input', function () {
            if (field.value.length > 0) sendHoneypot('field');
        });
    });

    // При submit — якщо honeypot заповнений, блокуємо відправку
    document.querySelectorAll('.ajax_form').forEach(function (form) {
        form.addEventListener('submit', function (e) {
            var hp = form.querySelector('input[name="website_confirm"]');
            if (hp && hp.value.length > 0) {
                e.preventDefault();
                e.stopPropagation();
                sendHoneypot('field');
                return false;
            }
        }, true);
    });

    // ─── HONEYPOT — прихований телефон ──────────────────────────

    document.querySelectorAll('a[data-honeypot="true"]').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();
            sendHoneypot('phone');
        });
    });

    // ─── КОНВЕРСІЇ ───────────────────────────────────────────────

    // Реальний телефон
    document.querySelectorAll('a[href^="tel:"]:not([data-honeypot])').forEach(function (el) {
        el.addEventListener('click', function () {
            clickedPhone = true;
            sendConversion('phone');
            sendData(true);
        });
    });

    // Месенджери
    document.querySelectorAll([
        'a[href*="wa.me"]', 'a[href*="whatsapp.com"]',
        'a[href*="t.me"]', 'a[href*="telegram.me"]',
        'a[href*="m.me"]', 'a[href*="messenger.com"]',
        'a[href^="viber://"]'
    ].join(',')).forEach(function (el) {
        el.addEventListener('click', function () { sendConversion('messenger'); });
    });

    // Форми — submit
    document.querySelectorAll('.ajax_form').forEach(function (form) {
        form.addEventListener('submit', function () { sendConversion('form'); });
    });

    // ─── ВІДПРАВКИ ───────────────────────────────────────────────

    function sendConversion(type) {
        fetch(API_BASE + '/mark-converted', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gclid, landingPage: window.location.href, conversionType: type }),
            keepalive: true,
        }).catch(function () { });
    }

    function sendHoneypot(type) {
        fetch(API_BASE + '/honeypot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gclid, landingPage: window.location.href, type: type }),
            keepalive: true,
        }).catch(function () { });
    }

    // ─── FINGERPRINT ─────────────────────────────────────────────

    function getBrowserData() {
        var nav = navigator;
        var conn = nav.connection || nav.mozConnection || nav.webkitConnection;
        return {
            userAgent: nav.userAgent,
            language: nav.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen: window.screen.width + 'x' + window.screen.height + '@' + (window.screen.colorDepth || 24),
            cores: nav.hardwareConcurrency || null,
            memory: nav.deviceMemory || null,
            connection: conn ? (conn.effectiveType || conn.type) : null,
            touchSupport: ('ontouchstart' in window) || (nav.maxTouchPoints > 0),
            webdriver: !!nav.webdriver,
        };
    }

    async function generateFingerprint() {
        var data = getBrowserData();
        var canvasHash = '';
        try {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
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

        var webglHash = '';
        try {
            var gl = document.createElement('canvas').getContext('webgl');
            if (gl) {
                var dbg = gl.getExtension('WEBGL_debug_renderer_info');
                if (dbg) webglHash = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
            }
        } catch (e) { }

        var fpString = [
            data.userAgent, data.language, data.timezone,
            data.screen, data.cores, data.memory,
            data.touchSupport, canvasHash, webglHash,
        ].join('|');

        var hash = 0;
        for (var i = 0; i < fpString.length; i++) {
            var char = fpString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16).padStart(8, '0');
    }

    async function sendData(isFinal) {
        if (dataSent && isFinal) return;
        if (isFinal) dataSent = true;

        var fingerprint = await generateFingerprint();
        var browserData = getBrowserData();
        var timeOnPage = Math.round((Date.now() - startTime) / 1000);

        var payload = Object.assign({
            gclid,
            landingPage: window.location.href,
            fingerprint,
            timeOnPage,
            activeTime,
            mouseMoved,
            scrolled,
            clickedPhone,
            isFinal: !!isFinal,
        }, browserData);

        fetch(API_BASE + '/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            keepalive: true,
        }).catch(function () { });
    }

    window.addEventListener('beforeunload', function () { sendData(true); });
    setTimeout(function () { sendData(false); }, 30000);
    setTimeout(function () { sendData(false); }, 120000);

})();