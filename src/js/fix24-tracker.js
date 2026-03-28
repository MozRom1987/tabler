/**
 * fix24-tracker.js v4
 * Client-side anti-fraud tracker for ad traffic.
 */

(function () {
    'use strict';

    const params = new URLSearchParams(window.location.search);
    const clickId = params.get('gclid') || params.get('gbraid') || params.get('wbraid');
    const clickIdType = params.get('gclid') ? 'gclid' : (params.get('gbraid') ? 'gbraid' : (params.get('wbraid') ? 'wbraid' : ''));
    const campaignType = params.get('campaign_type') || '';
    const campaignName = params.get('campaign_name') || '';

    if (!clickId) return;

    const API_BASE = 'https://api.fix24.pro';
    const startTime = Date.now();
    const visitId = (function () {
        const key = 'fix24_visit_id';
        const existing = sessionStorage.getItem(key);
        if (existing) return existing;
        const created = [clickIdType, clickId, Date.now(), Math.random().toString(36).slice(2, 10)].join(':');
        sessionStorage.setItem(key, created);
        return created;
    })();

    let mouseMoved = false;
    let scrolled = false;
    let clickedPhone = false;
    let clickedMessenger = false;
    let submittedForm = false;
    let activeTime = 0;
    let isPageVisible = true;
    let dataSentFinal = false;
    let lastSentAt = 0;
    const actions = new Set();

    function markAction(action) {
        if (action) actions.add(action);
    }

    function postJson(url, payload) {
        var body = JSON.stringify(payload);

        if (navigator.sendBeacon) {
            try {
                var blob = new Blob([body], { type: 'application/json' });
                if (navigator.sendBeacon(url, blob)) {
                    return Promise.resolve(true);
                }
            } catch (e) {}
        }

        return fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: body,
            keepalive: true,
        }).catch(function () { });
    }

    document.addEventListener('mousemove', function () {
        mouseMoved = true;
        markAction('mouse_move');
    }, { once: true });

    document.addEventListener('scroll', function () {
        scrolled = true;
        markAction('scroll');
    }, { once: true, passive: true });

    document.addEventListener('touchstart', function () {
        mouseMoved = true;
        markAction('touch');
    }, { once: true, passive: true });

    document.addEventListener('visibilitychange', function () {
        isPageVisible = !document.hidden;
    });

    setInterval(function () {
        if (isPageVisible) {
            activeTime = Math.round((Date.now() - startTime) / 1000);
        }
    }, 1000);

    document.querySelectorAll('input[name="website_confirm"]').forEach(function (field) {
        field.addEventListener('input', function () {
            if (field.value.length > 0) sendHoneypot('field');
        });
    });

    document.querySelectorAll('.ajax_form').forEach(function (form) {
        form.addEventListener('submit', function (e) {
            var hp = form.querySelector('input[name="website_confirm"]');
            if (hp && hp.value.length > 0) {
                e.preventDefault();
                e.stopPropagation();
                sendHoneypot('field');
                return false;
            }

            submittedForm = true;
            markAction('form_submit');
            sendConversion('form');
            sendData(true, 'form_submit');
            return true;
        }, true);
    });

    document.addEventListener('click', function (event) {
        var el = event.target && event.target.closest ? event.target.closest('a') : null;
        if (!el) return;

        if (el.matches('a[data-honeypot="true"]')) {
            event.preventDefault();
            sendHoneypot('phone');
            return;
        }

        if (el.matches('a[href^="tel:"]:not([data-honeypot])')) {
            clickedPhone = true;
            markAction('phone_click');
            sendConversion('phone');
            sendData(true, 'phone_click');
            return;
        }

        if (el.matches([
            'a[href*="wa.me"]', 'a[href*="whatsapp.com"]',
            'a[href*="t.me"]', 'a[href*="telegram.me"]',
            'a[href*="m.me"]', 'a[href*="messenger.com"]',
            'a[href^="viber://"]'
        ].join(','))) {
            clickedMessenger = true;
            markAction('messenger_click');
            sendConversion('messenger');
            sendData(true, 'messenger_click');
            return;
        }

        if (el.matches([
            'a[href*="facebook.com"]',
            'a[href*="instagram.com"]',
            'a[href*="maps.google."]',
            'a[href*="goo.gl/maps"]'
        ].join(','))) {
            markAction('external_link_click');
            sendData(false, 'external_link_click');
        }
    }, true);

    function sendConversion(type) {
        var payload = buildPayload(true, 'conversion');
        payload.conversionType = type;
        postJson(API_BASE + '/mark-converted', payload);
    }

    function sendHoneypot(type) {
        postJson(API_BASE + '/honeypot', {
            clickId: clickId,
            clickIdType: clickIdType,
            gclid: params.get('gclid') || null,
            gbraid: params.get('gbraid') || null,
            wbraid: params.get('wbraid') || null,
            campaignType: campaignType || null,
            campaignName: campaignName || null,
            landingPage: window.location.href,
            type: type,
            visitId: visitId,
        });
    }

    function getBrowserData() {
        var nav = navigator;
        var conn = nav.connection || nav.mozConnection || nav.webkitConnection;
        return {
            userAgent: nav.userAgent,
            language: nav.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen: window.screen.width + 'x' + window.screen.height + '@' + (window.screen.colorDepth || 24),
            viewport: window.innerWidth + 'x' + window.innerHeight,
            devicePixelRatio: window.devicePixelRatio || 1,
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
        } catch (e) {}

        var webglHash = '';
        try {
            var gl = document.createElement('canvas').getContext('webgl');
            if (gl) {
                var dbg = gl.getExtension('WEBGL_debug_renderer_info');
                if (dbg) webglHash = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL);
            }
        } catch (e) {}

        var fpString = [
            data.userAgent, data.language, data.timezone,
            data.screen, data.viewport, data.devicePixelRatio, data.cores, data.memory,
            data.touchSupport, canvasHash, webglHash
        ].join('|');

        var hash = 0;
        for (var i = 0; i < fpString.length; i++) {
            var char = fpString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        return Math.abs(hash).toString(16).padStart(8, '0');
    }

    function buildPayload(isFinal, eventType, fingerprint, browserData) {
        var timeOnPage = Math.round((Date.now() - startTime) / 1000);
        return Object.assign({
            clickId: clickId,
            clickIdType: clickIdType,
            gclid: params.get('gclid') || null,
            gbraid: params.get('gbraid') || null,
            wbraid: params.get('wbraid') || null,
            campaignType: campaignType || null,
            campaignName: campaignName || null,
            visitId: visitId,
            landingPage: window.location.href,
            fingerprint: fingerprint,
            timeOnPage: timeOnPage,
            activeTime: activeTime,
            mouseMoved: mouseMoved,
            scrolled: scrolled,
            clickedPhone: clickedPhone,
            clickedMessenger: clickedMessenger,
            submittedForm: submittedForm,
            isFinal: !!isFinal,
            eventType: eventType || 'heartbeat',
            actions: Array.from(actions),
        }, browserData);
    }

    async function sendData(isFinal, eventType) {
        if (dataSentFinal && isFinal) return;

        var now = Date.now();
        if (!isFinal && lastSentAt && now - lastSentAt < 15000) return;

        var fingerprint = await generateFingerprint();
        var browserData = getBrowserData();
        var payload = buildPayload(isFinal, eventType, fingerprint, browserData);

        if (isFinal) dataSentFinal = true;
        lastSentAt = now;

        postJson(API_BASE + '/log', payload);
    }

    window.addEventListener('beforeunload', function () {
        sendData(true, 'beforeunload');
    });

    setTimeout(function () { sendData(false, 'heartbeat_30'); }, 30000);
    setTimeout(function () { sendData(false, 'heartbeat_120'); }, 120000);
})();
