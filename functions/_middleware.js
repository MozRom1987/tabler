/**
 * Cloudflare Pages middleware for early ad-click logging.
 * Sends one edge event before client-side JS runs, but skips obvious duplicates.
 */

const DEFAULT_WORKER_URL = 'https://api.fix24.pro/log-edge';
const DEDUPE_COOKIE = 'fix24_edge_click';
const DEDUPE_MAX_AGE = 10 * 60;
const CLICK_PARAMS = ['gclid', 'gbraid', 'wbraid'];

function getCookieValue(cookieHeader, name) {
    if (!cookieHeader) return '';

    const prefix = `${name}=`;
    const match = cookieHeader
        .split(';')
        .map((part) => part.trim())
        .find((part) => part.startsWith(prefix));

    return match ? decodeURIComponent(match.slice(prefix.length)) : '';
}

function getClickData(url) {
    for (const param of CLICK_PARAMS) {
        const value = url.searchParams.get(param);
        if (value) {
            return { type: param, value };
        }
    }

    return null;
}

function isHtmlNavigation(request) {
    if (request.method !== 'GET') return false;

    const purpose = (request.headers.get('Purpose') || request.headers.get('Sec-Purpose') || '').toLowerCase();
    if (purpose.includes('prefetch')) return false;

    const mode = (request.headers.get('Sec-Fetch-Mode') || '').toLowerCase();
    const dest = (request.headers.get('Sec-Fetch-Dest') || '').toLowerCase();
    const accept = (request.headers.get('Accept') || '').toLowerCase();

    if (dest === 'document') return true;
    if (mode === 'navigate') return true;

    return accept.includes('text/html');
}

function buildDedupeKey(url, clickData) {
    return `${clickData.type}:${clickData.value}:${url.pathname}`;
}

export async function onRequest(context) {
    const { request, next, env } = context;
    const url = new URL(request.url);
    const clickData = getClickData(url);

    if (!clickData || !isHtmlNavigation(request)) {
        return next();
    }

    const dedupeKey = buildDedupeKey(url, clickData);
    const existingKey = getCookieValue(request.headers.get('Cookie'), DEDUPE_COOKIE);
    const response = await next();

    if (existingKey === dedupeKey) {
        return response;
    }

    const workerUrl = env?.EDGE_WORKER_URL || DEFAULT_WORKER_URL;
    const workerSecret = env?.EDGE_WORKER_SECRET;
    const edgeData = {
        ip: request.headers.get('CF-Connecting-IP') || 'unknown',
        userAgent: request.headers.get('User-Agent') || '',
        clickId: clickData.value,
        clickIdType: clickData.type,
        gclid: url.searchParams.get('gclid') || '',
        gbraid: url.searchParams.get('gbraid') || '',
        wbraid: url.searchParams.get('wbraid') || '',
        landingPage: url.toString(),
        timestamp: new Date().toISOString(),
        country: request.cf?.country || null,
        city: request.cf?.city || null,
        region: request.cf?.region || null,
        asn: request.cf?.asn || null,
        asOrg: request.cf?.asOrganization || null,
        source: 'edge',
        dedupeKey,
    };

    if (workerSecret) {
        context.waitUntil(
            fetch(workerUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Edge-Secret': workerSecret,
                },
                body: JSON.stringify(edgeData),
            }).catch(() => {})
        );
    }

    response.headers.append(
        'Set-Cookie',
        `${DEDUPE_COOKIE}=${encodeURIComponent(dedupeKey)}; Max-Age=${DEDUPE_MAX_AGE}; Path=/; Secure; HttpOnly; SameSite=Lax`
    );

    return response;
}
