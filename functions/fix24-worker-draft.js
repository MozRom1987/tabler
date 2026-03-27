/**
 * Draft Cloudflare Worker for fix24.pro anti-fraud.
 * Local copy for editing/review before manual deploy to Cloudflare.
 */

const VPN_KEYWORDS = [
    'm247', 'datacamp', 'digitalocean', 'linode', 'vultr', 'ovh', 'hetzner',
    'amazon', 'google cloud', 'microsoft azure', 'nordvpn', 'expressvpn',
    'mullvad', 'surfshark', 'privateinternetaccess', 'hosting', 'datacenter',
    'data center', 'server', 'colocation', 'colo'
];

const MOBILE_OPERATORS = [
    'orange', 'play', 't-mobile', 'plus', 'polkomtel', 'p4 sp',
    'netia', 't-mobile polska'
];

const GOOGLE_BOT_MARKERS = ['google-adwords', 'googlebot', 'adsbot-google'];
const BLOCK_DURATIONS = {
    hard: 30 * 86400,
    temp: 7 * 86400,
    tempShort: 3 * 86400,
};

function jsonHeaders(extra = {}) {
    return { 'Content-Type': 'application/json', ...extra };
}

function corsHeaders(origin) {
    const allowedOrigins = ['https://fix24.pro', 'https://admin.fix24.pro'];
    const corsOrigin = allowedOrigins.includes(origin) ? origin : 'https://fix24.pro';
    return {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
}

function normalizeText(value) {
    return String(value || '').trim();
}

function lower(value) {
    return normalizeText(value).toLowerCase();
}

function normalizeIp(ip) {
    return normalizeText(ip || 'unknown');
}

function parseJsonSafe(value, fallback = null) {
    if (!value) return fallback;
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
}

function isVPNbyASN(asOrganization) {
    const org = lower(asOrganization);
    return org ? VPN_KEYWORDS.some((keyword) => org.includes(keyword)) : false;
}

function isMobileOperator(asOrganization) {
    const org = lower(asOrganization);
    return org ? MOBILE_OPERATORS.some((keyword) => org.includes(keyword)) : false;
}

function isGoogleBot(userAgent) {
    const ua = lower(userAgent);
    return GOOGLE_BOT_MARKERS.some((marker) => ua.includes(marker));
}

function getClickIdentifier(data) {
    return normalizeText(data.clickId || data.gclid || data.gbraid || data.wbraid || '');
}

function hashLike(value) {
    let hash = 0;
    const text = normalizeText(value);
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }
    return Math.abs(hash).toString(36);
}

function buildVisitKey(data) {
    const clickIdentifier = getClickIdentifier(data);
    if (clickIdentifier) {
        return `click:${clickIdentifier}`;
    }

    const ip = normalizeIp(data.ip);
    const fingerprint = normalizeText(data.fingerprint);
    if (fingerprint) {
        return `fp:${ip}:${fingerprint}`;
    }

    const path = (() => {
        try {
            return new URL(data.landingPage || 'https://fix24.pro').pathname;
        } catch {
            return '/';
        }
    })();
    const uaHash = hashLike(`${ip}|${normalizeText(data.userAgent)}|${path}`);
    const bucket = Math.floor(Date.parse(data.timestamp || new Date().toISOString()) / (5 * 60 * 1000));
    return `edge:${ip}:${uaHash}:${bucket}`;
}

function createEmptyVisit(visitKey, data) {
    return {
        visitKey,
        createdAt: data.timestamp,
        updatedAt: data.timestamp,
        merged: false,
        sources: [],
        eventsCount: 0,
        firstSource: data.source || 'unknown',
        clickId: getClickIdentifier(data) || null,
        gclid: normalizeText(data.gclid) || null,
        gbraid: normalizeText(data.gbraid) || null,
        wbraid: normalizeText(data.wbraid) || null,
        ip: normalizeIp(data.ip),
        fingerprint: normalizeText(data.fingerprint) || null,
        userAgent: normalizeText(data.userAgent),
        landingPage: normalizeText(data.landingPage) || null,
        timestamp: data.timestamp,
        country: data.country || null,
        city: data.city || null,
        region: data.region || null,
        asn: data.asn || null,
        asOrg: data.asOrg || null,
        ipinfo: null,
        abuseipdb: null,
        ipqs: null,
        isVpn: false,
        isProxy: false,
        isTor: false,
        isHosting: false,
        isRepeat: false,
        fingerprintRepeat: false,
        suspicionScore: 0,
        suspicionReasons: [],
        autoBlocked: false,
        blockReason: null,
        blockDecision: 'ignore',
        exportedToAds: false,
        converted: false,
        conversionType: null,
        conversionTypes: [],
        actions: [],
        timeOnPage: 0,
        activeTime: 0,
        mouseMoved: null,
        scrolled: null,
        clickedPhone: false,
        clickedMessenger: false,
        submittedForm: false,
        source: data.source || 'unknown',
    };
}

function mergeVisit(existing, incoming) {
    const merged = {
        ...existing,
        ...incoming,
        updatedAt: incoming.timestamp || existing.updatedAt,
        eventsCount: (existing.eventsCount || 0) + 1,
        sources: Array.from(new Set([...(existing.sources || []), incoming.source || 'unknown'])),
        merged: (existing.sources || []).length > 0,
    };

    const stickyFields = [
        'ip', 'fingerprint', 'userAgent', 'landingPage', 'country', 'city', 'region', 'asn',
        'asOrg', 'ipinfo', 'abuseipdb', 'ipqs', 'clickId', 'gclid', 'gbraid', 'wbraid'
    ];

    for (const field of stickyFields) {
        if (!normalizeText(merged[field]) && existing[field]) {
            merged[field] = existing[field];
        }
    }

    merged.isVpn = Boolean(existing.isVpn || incoming.isVpn);
    merged.isProxy = Boolean(existing.isProxy || incoming.isProxy);
    merged.isTor = Boolean(existing.isTor || incoming.isTor);
    merged.isHosting = Boolean(existing.isHosting || incoming.isHosting);
    merged.isRepeat = Boolean(existing.isRepeat || incoming.isRepeat);
    merged.fingerprintRepeat = Boolean(existing.fingerprintRepeat || incoming.fingerprintRepeat);
    merged.converted = Boolean(existing.converted || incoming.converted);
    merged.clickedPhone = Boolean(existing.clickedPhone || incoming.clickedPhone);
    merged.clickedMessenger = Boolean(existing.clickedMessenger || incoming.clickedMessenger);
    merged.submittedForm = Boolean(existing.submittedForm || incoming.submittedForm);
    merged.scrolled = existing.scrolled === true || incoming.scrolled === true;
    merged.mouseMoved = existing.mouseMoved === true || incoming.mouseMoved === true;
    merged.timeOnPage = Math.max(Number(existing.timeOnPage || 0), Number(incoming.timeOnPage || 0));
    merged.activeTime = Math.max(Number(existing.activeTime || 0), Number(incoming.activeTime || 0));
    merged.actions = Array.from(new Set([...(existing.actions || []), ...(incoming.actions || [])]));
    merged.conversionTypes = Array.from(new Set([...(existing.conversionTypes || []), ...(incoming.conversionTypes || [])]));
    merged.conversionType = merged.conversionTypes[merged.conversionTypes.length - 1] || incoming.conversionType || existing.conversionType || null;

    if ((incoming.source || '') === 'js') {
        merged.source = 'js';
    }

    return merged;
}

async function checkIPInfo(ip, token) {
    try {
        const res = await fetch(`https://ipinfo.io/${ip}?token=${token}`, {
            headers: { Accept: 'application/json' },
        });
        if (!res.ok) return null;
        const data = await res.json();
        return {
            org: data.org || null,
            isVpn: data.privacy?.vpn || false,
            isProxy: data.privacy?.proxy || false,
            isHosting: data.privacy?.hosting || false,
            isTor: data.privacy?.tor || false,
            usageType: data.privacy?.service || null,
        };
    } catch {
        return null;
    }
}

async function checkAbuseIPDB(ip, apiKey) {
    try {
        const res = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`, {
            headers: { Key: apiKey, Accept: 'application/json' },
        });
        if (!res.ok) return null;
        const data = await res.json();
        return {
            abuseScore: data.data?.abuseConfidenceScore || 0,
            totalReports: data.data?.totalReports || 0,
            lastReportedAt: data.data?.lastReportedAt || null,
            usageType: data.data?.usageType || null,
            isp: data.data?.isp || null,
            isPublic: data.data?.isPublic !== false,
        };
    } catch {
        return null;
    }
}

async function checkIPQS(ip, apiKey) {
    try {
        const res = await fetch(
            `https://ipqualityscore.com/api/json/ip/${apiKey}/${ip}?strictness=1&allow_public_access_points=true`,
            { headers: { Accept: 'application/json' } }
        );
        if (!res.ok) return null;
        const data = await res.json();
        if (!data.success) return null;
        return {
            fraudScore: data.fraud_score || 0,
            isProxy: data.proxy || false,
            isVpn: data.vpn || false,
            isTor: data.tor || false,
            isBot: data.bot_status || false,
            isCrawler: data.is_crawler || false,
            recentAbuse: data.recent_abuse || false,
            abuseVelocity: data.abuse_velocity || 'none',
        };
    } catch {
        return null;
    }
}

function calculateSuspicionScore(data) {
    let score = 0;
    const reasons = [];
    const ua = lower(data.userAgent);
    const sourceSet = new Set(data.sources || []);
    const hasOnlyEdge = sourceSet.has('edge') && !sourceSet.has('js');
    const hasClickId = Boolean(getClickIdentifier(data));

    if (data.isVpn) {
        score += 30;
        reasons.push('VPN/датацентр (ASN)');
    }

    if (data.ipinfo?.isVpn) {
        score += 35;
        reasons.push('VPN (IPinfo)');
    }
    if (data.ipinfo?.isProxy) {
        score += 40;
        reasons.push('Proxy (IPinfo)');
    }
    if (data.ipinfo?.isHosting) {
        score += 35;
        reasons.push('Хостинг (IPinfo)');
    }
    if (data.ipinfo?.isTor) {
        score += 50;
        reasons.push('TOR (IPinfo)');
    }

    if (data.abuseipdb?.abuseScore >= 50) {
        score += 40;
        reasons.push(`Abuse Score: ${data.abuseipdb.abuseScore}/100`);
    } else if (data.abuseipdb?.abuseScore >= 25) {
        score += 20;
        reasons.push(`Abuse Score: ${data.abuseipdb.abuseScore}/100`);
    }
    if (data.abuseipdb?.totalReports > 0) {
        score += 10;
        reasons.push(`${data.abuseipdb.totalReports} скарг в базі`);
    }
    if (['Data Center/Web Hosting/Transit', 'VPN'].includes(data.abuseipdb?.usageType)) {
        score += 25;
        reasons.push(`Тип IP: ${data.abuseipdb.usageType}`);
    }

    if (data.ipqs?.isBot) {
        score += 60;
        reasons.push('Bot (IPQS)');
    }
    if (data.ipqs?.isTor) {
        score += 50;
        reasons.push('TOR (IPQS)');
    }
    if (data.ipqs?.isProxy) {
        score += 45;
        reasons.push('Proxy (IPQS)');
    }
    if (data.ipqs?.isVpn) {
        score += 35;
        reasons.push('VPN (IPQS)');
    }
    if (data.ipqs?.fraudScore >= 85) {
        score += 40;
        reasons.push(`IPQS Fraud: ${data.ipqs.fraudScore}`);
    } else if (data.ipqs?.fraudScore >= 60) {
        score += 20;
        reasons.push(`IPQS Fraud: ${data.ipqs.fraudScore}`);
    }
    if (data.ipqs?.abuseVelocity === 'high') {
        score += 30;
        reasons.push('IPQS abuse: high');
    } else if (data.ipqs?.abuseVelocity === 'medium') {
        score += 15;
        reasons.push('IPQS abuse: medium');
    }
    if (data.ipqs?.recentAbuse) {
        score += 20;
        reasons.push('IPQS: recent abuse');
    }

    if (data.honeypot) {
        score = 100;
        reasons.push('Honeypot');
    }

    if (/android \d+; k\b/.test(ua)) {
        score += 25;
        reasons.push('UA: прихована модель Android');
    }
    if (ua.includes('headlesschrome') || ua.includes('phantomjs') || ua.includes('selenium')) {
        score += 60;
        reasons.push('UA: headless');
    }
    if (data.webdriver) {
        score += 60;
        reasons.push('WebDriver');
    }

    const cores = Number(data.cores || 0);
    const memory = Number(data.memory || 0);
    const connection = lower(data.connection);
    if (cores === 8 && memory === 4 && connection === '4g') {
        score += 15;
        reasons.push('Hardware: click-farm profile');
    }
    if (cores > 64) {
        score += 40;
        reasons.push(`Hardware: too many cores (${cores})`);
    }

    const screenWidth = parseInt(normalizeText(data.screen).split('x')[0], 10) || 0;
    if (screenWidth > 0 && screenWidth < 300) {
        score += 20;
        reasons.push(`Screen: too small (${screenWidth}px)`);
    }

    if (data.mouseMoved === false && data.source === 'js') {
        score += 20;
        reasons.push('миша не рухалась');
    }
    if (data.language && !['pl', 'uk', 'ru'].some((lang) => lower(data.language).startsWith(lang))) {
        score += 15;
        reasons.push(`нестандартна мова: ${data.language}`);
    }

    const hour = new Date(data.timestamp || Date.now()).getHours();
    if (hour >= 1 && hour <= 5) {
        score += 15;
        reasons.push('нічний час');
    }
    if (data.isRepeat) {
        score += 30;
        reasons.push('повторний клік (IP)');
    }
    if (data.fingerprintRepeat) {
        score += 35;
        reasons.push('повторний клік (Fingerprint)');
    }

    if (hasOnlyEdge && hasClickId) {
        score += 15;
        reasons.push('є лише edge-слід без JS');
    }

    return { score: Math.min(score, 100), reasons };
}

function classifyVisit(visit) {
    const score = Number(visit.suspicionScore || 0);
    const abuseScore = Number(visit.abuseipdb?.abuseScore || 0);
    const ipqsScore = Number(visit.ipqs?.fraudScore || 0);
    const hasJs = (visit.sources || []).includes('js');
    const repeat = Boolean(visit.isRepeat || visit.fingerprintRepeat);
    const hasOnlyEdge = (visit.sources || []).includes('edge') && !hasJs;
    const ua = lower(visit.userAgent);

    if (isMobileOperator(visit.asOrg)) {
        return { decision: 'ignore', reason: 'мобільний оператор', ttl: 0 };
    }

    if (visit.converted || visit.clickedPhone || visit.clickedMessenger || visit.submittedForm) {
        return { decision: 'ignore', reason: 'є конверсія/контакт', ttl: 0 };
    }

    if (visit.honeypot) {
        return { decision: 'hard_block', reason: 'Honeypot', ttl: BLOCK_DURATIONS.hard };
    }
    if (visit.isTor) {
        return { decision: 'hard_block', reason: 'TOR', ttl: BLOCK_DURATIONS.hard };
    }
    if (visit.isHosting) {
        return { decision: 'hard_block', reason: 'Хостинг/датацентр', ttl: BLOCK_DURATIONS.hard };
    }
    if (visit.ipqs?.isBot) {
        return { decision: 'hard_block', reason: 'Bot Activity', ttl: BLOCK_DURATIONS.hard };
    }
    if (visit.webdriver || ua.includes('headlesschrome') || ua.includes('selenium')) {
        return { decision: 'hard_block', reason: 'Headless/WebDriver', ttl: BLOCK_DURATIONS.hard };
    }
    if (ipqsScore >= 90) {
        return { decision: 'hard_block', reason: `IPQS Fraud Score: ${ipqsScore}`, ttl: BLOCK_DURATIONS.hard };
    }
    if (visit.isProxy && abuseScore >= 70) {
        return { decision: 'hard_block', reason: `Proxy + Abuse ${abuseScore}`, ttl: BLOCK_DURATIONS.hard };
    }
    if (repeat && visit.isProxy) {
        return { decision: 'hard_block', reason: 'Proxy + повтор', ttl: BLOCK_DURATIONS.hard };
    }
    if (repeat && hasOnlyEdge) {
        return { decision: 'hard_block', reason: 'Повтор без JS (edge only)', ttl: BLOCK_DURATIONS.hard };
    }

    if (score >= 65 || ipqsScore >= 75 || abuseScore >= 50 || (repeat && score >= 45)) {
        return { decision: 'temp_block', reason: `Підозрілий score ${score}`, ttl: BLOCK_DURATIONS.temp };
    }
    if ((visit.isVpn || visit.isProxy || hasOnlyEdge) && score >= 35) {
        return { decision: 'temp_block', reason: `Підозрілий технічний вхід (${score})`, ttl: BLOCK_DURATIONS.tempShort };
    }

    return { decision: 'ignore', reason: null, ttl: 0 };
}

async function updateRepeatState(env, key, visitKey, timestamp, ttl) {
    const current = parseJsonSafe(await env.CLICKS_KV.get(key), null);
    const state = current || {
        count: 0,
        firstClick: timestamp,
        lastClick: timestamp,
        lastVisitKey: null,
    };

    const sameVisit = state.lastVisitKey && state.lastVisitKey === visitKey;
    if (sameVisit) {
        state.lastClick = timestamp;
        await env.CLICKS_KV.put(key, JSON.stringify(state), { expirationTtl: ttl });
        return { isRepeat: state.count > 1, count: state.count, sameVisit: true };
    }

    const hoursDiff = (Date.now() - new Date(state.lastClick).getTime()) / (1000 * 60 * 60);
    const isRepeat = state.count > 0 && hoursDiff < 24;

    state.count = isRepeat ? (state.count || 1) + 1 : 1;
    state.lastClick = timestamp;
    state.lastVisitKey = visitKey;
    if (!state.firstClick || !isRepeat) {
        state.firstClick = timestamp;
    }

    await env.CLICKS_KV.put(key, JSON.stringify(state), { expirationTtl: ttl });
    return { isRepeat, count: state.count, sameVisit: false };
}

async function storeVisitIndex(env, dayKey, visitKey, ttl) {
    const list = parseJsonSafe(await env.CLICKS_KV.get(dayKey), []);
    const filtered = list.filter((key) => key !== visitKey);
    filtered.unshift(visitKey);
    await env.CLICKS_KV.put(dayKey, JSON.stringify(filtered.slice(0, 5000)), { expirationTtl: ttl });
}

async function upsertBlock(env, ip, decision, reason, ttlSeconds, extra = {}) {
    if (!ip || ip === 'unknown' || decision === 'ignore') return null;

    const blockKey = `block:${ip}`;
    const existing = parseJsonSafe(await env.CLICKS_KV.get(blockKey), null);
    const hardWins = existing?.decision === 'hard_block' || decision === 'hard_block';
    const ttl = hardWins ? BLOCK_DURATIONS.hard : ttlSeconds;
    const now = new Date().toISOString();
    const unblockAt = ttl ? new Date(Date.now() + ttl * 1000).toISOString() : null;
    const block = {
        ip,
        decision: hardWins ? 'hard_block' : decision,
        reason: hardWins && existing?.reason ? existing.reason : reason,
        blockedAt: existing?.blockedAt || now,
        updatedAt: now,
        unblockAt,
        active: true,
        source: extra.source || 'worker',
        score: extra.score || 0,
    };

    await env.CLICKS_KV.put(blockKey, JSON.stringify(block), ttl ? { expirationTtl: ttl } : undefined);

    const listKey = 'blocklist';
    const list = parseJsonSafe(await env.CLICKS_KV.get(listKey), []);
    if (!list.includes(ip)) {
        list.push(ip);
        await env.CLICKS_KV.put(listKey, JSON.stringify(list));
    }

    return block;
}

async function getActiveBlockEntries(env) {
    const list = parseJsonSafe(await env.CLICKS_KV.get('blocklist'), []);
    const uniqueIps = Array.from(new Set(list));
    const now = Date.now();
    const activeBlocks = [];
    const activeIps = [];

    for (const ip of uniqueIps) {
        const raw = await env.CLICKS_KV.get(`block:${ip}`);
        const block = parseJsonSafe(raw, null);
        if (!block || block.active === false) {
            continue;
        }

        if (block.unblockAt && Date.parse(block.unblockAt) <= now) {
            await env.CLICKS_KV.delete(`block:${ip}`);
            continue;
        }

        activeBlocks.push(block);
        activeIps.push(ip);
    }

    if (activeIps.length !== uniqueIps.length) {
        await env.CLICKS_KV.put('blocklist', JSON.stringify(activeIps));
    }

    activeBlocks.sort((a, b) => Date.parse(b.updatedAt || b.blockedAt) - Date.parse(a.updatedAt || a.blockedAt));
    return activeBlocks;
}

function buildAuthorized(request, env) {
    const authHeader = request.headers.get('Authorization');
    const adminToken = env.ADMIN_PASSWORD;
    return Boolean(adminToken) && authHeader === `Bearer ${adminToken}`;
}

async function loadVisit(env, visitKey, incoming) {
    const raw = await env.CLICKS_KV.get(`visit:${visitKey}`);
    const existing = parseJsonSafe(raw, null);
    if (!existing) {
        const fresh = createEmptyVisit(visitKey, incoming);
        fresh.sources = incoming.source ? [incoming.source] : [];
        fresh.eventsCount = 1;
        return fresh;
    }
    return mergeVisit(existing, incoming);
}

async function enrichVisitIfNeeded(env, visit, options = {}) {
    const shouldFetchExternal = options.fetchExternal !== false;
    if (!shouldFetchExternal || !visit.ip || visit.ip === 'unknown') {
        return visit;
    }

    if (visit.ipinfo || visit.abuseipdb || visit.ipqs) {
        return visit;
    }

    const [ipinfoData, abuseData, ipqsData] = await Promise.all([
        env.IPINFO_TOKEN ? checkIPInfo(visit.ip, env.IPINFO_TOKEN) : null,
        env.ABUSEIPDB_KEY ? checkAbuseIPDB(visit.ip, env.ABUSEIPDB_KEY) : null,
        env.IPQS_KEY ? checkIPQS(visit.ip, env.IPQS_KEY) : null,
    ]);

    visit.ipinfo = ipinfoData;
    visit.abuseipdb = abuseData;
    visit.ipqs = ipqsData;
    visit.isVpn = Boolean(visit.isVpn || ipinfoData?.isVpn || ipqsData?.isVpn);
    visit.isProxy = Boolean(visit.isProxy || ipinfoData?.isProxy || ipqsData?.isProxy);
    visit.isTor = Boolean(visit.isTor || ipinfoData?.isTor || ipqsData?.isTor);
    visit.isHosting = Boolean(visit.isHosting || ipinfoData?.isHosting);
    return visit;
}

async function persistVisit(env, visit) {
    const visitKey = `visit:${visit.visitKey}`;
    await env.CLICKS_KV.put(visitKey, JSON.stringify(visit), { expirationTtl: 30 * 86400 });
    await storeVisitIndex(env, `list:${String(visit.timestamp || visit.createdAt).substring(0, 10)}`, visit.visitKey, 30 * 86400);
}

function normalizeActions(payload) {
    const actions = Array.isArray(payload.actions) ? payload.actions : [];
    const normalized = actions
        .map((item) => normalizeText(item))
        .filter(Boolean);

    if (payload.clickedPhone) normalized.push('phone_click');
    if (payload.clickedMessenger) normalized.push('messenger_click');
    if (payload.submittedForm) normalized.push('form_submit');
    if (payload.scrolled) normalized.push('scroll');
    if (payload.mouseMoved) normalized.push('mouse_move');
    if (payload.honeypot) normalized.push('honeypot');

    return Array.from(new Set(normalized));
}

async function handleUnifiedVisit(payload, env, source) {
    const timestamp = payload.timestamp || new Date().toISOString();
    const ip = normalizeIp(payload.ip);
    const visitBase = {
        ...payload,
        timestamp,
        ip,
        source,
        clickId: normalizeText(payload.clickId || getClickIdentifier(payload)) || null,
        gclid: normalizeText(payload.gclid) || null,
        gbraid: normalizeText(payload.gbraid) || null,
        wbraid: normalizeText(payload.wbraid) || null,
        fingerprint: normalizeText(payload.fingerprint) || null,
        userAgent: normalizeText(payload.userAgent),
        landingPage: normalizeText(payload.landingPage) || null,
        asOrg: payload.asOrg || '',
        isVpn: Boolean(payload.isVpn || isVPNbyASN(payload.asOrg)),
        isProxy: Boolean(payload.isProxy),
        isTor: Boolean(payload.isTor),
        isHosting: Boolean(payload.isHosting),
        honeypot: Boolean(payload.honeypot),
        webdriver: Boolean(payload.webdriver),
        converted: Boolean(payload.converted),
        conversionType: normalizeText(payload.conversionType) || null,
        conversionTypes: payload.conversionType ? [normalizeText(payload.conversionType)] : [],
        actions: normalizeActions(payload),
        timeOnPage: Number(payload.timeOnPage || 0),
        activeTime: Number(payload.activeTime || 0),
        mouseMoved: payload.mouseMoved === true,
        scrolled: payload.scrolled === true,
        clickedPhone: payload.clickedPhone === true,
        clickedMessenger: payload.clickedMessenger === true,
        submittedForm: payload.submittedForm === true,
    };

    if (isGoogleBot(visitBase.userAgent)) {
        return { ok: true, skipped: 'google_bot' };
    }

    const visitKey = buildVisitKey(visitBase);
    const visit = await loadVisit(env, visitKey, visitBase);

    if (source === 'js' || source === 'edge') {
        const ipState = await updateRepeatState(env, `ip:${ip}`, visitKey, timestamp, 86400);
        visit.isRepeat = Boolean(visit.isRepeat || ipState.isRepeat);
        visit.clickCount = Math.max(Number(visit.clickCount || 1), ipState.count);
    }

    if (visitBase.fingerprint) {
        const fpState = await updateRepeatState(env, `fp:${visitBase.fingerprint}`, visitKey, timestamp, 86400);
        visit.fingerprintRepeat = Boolean(visit.fingerprintRepeat || fpState.isRepeat);
    }

    await enrichVisitIfNeeded(env, visit, { fetchExternal: source !== 'edge' || visit.eventsCount > 1 });

    const { score, reasons } = calculateSuspicionScore(visit);
    visit.suspicionScore = score;
    visit.suspicionReasons = reasons;

    const decision = classifyVisit(visit);
    visit.blockDecision = decision.decision;
    visit.blockReason = decision.reason;
    visit.autoBlocked = decision.decision !== 'ignore';

    if (decision.decision !== 'ignore') {
        await upsertBlock(env, ip, decision.decision, decision.reason, decision.ttl, {
            source,
            score,
        });
    }

    await persistVisit(env, visit);

    return {
        ok: true,
        visitKey,
        score,
        reasons,
        decision: decision.decision,
        autoBlocked: decision.decision !== 'ignore',
    };
}

async function markConverted(payload, request, env) {
    const timestamp = new Date().toISOString();
    const clickId = normalizeText(payload.clickId || payload.gclid || payload.gbraid || payload.wbraid || '');
    if (!clickId) {
        return { ok: false, error: 'Missing click identifier' };
    }

    const visitKey = `click:${clickId}`;
    const visit = await loadVisit(env, visitKey, {
        timestamp,
        source: 'conversion',
        ip: request.headers.get('CF-Connecting-IP') || payload.ip || 'unknown',
        userAgent: request.headers.get('User-Agent') || payload.userAgent || '',
        landingPage: payload.landingPage || null,
        clickId,
        gclid: payload.gclid || null,
        gbraid: payload.gbraid || null,
        wbraid: payload.wbraid || null,
        converted: true,
        conversionType: normalizeText(payload.conversionType) || 'conversion',
        conversionTypes: [normalizeText(payload.conversionType) || 'conversion'],
        actions: [normalizeText(payload.conversionType) || 'conversion'],
        clickedPhone: payload.conversionType === 'phone',
        clickedMessenger: payload.conversionType === 'messenger',
        submittedForm: payload.conversionType === 'form',
    });

    visit.converted = true;
    visit.conversionType = normalizeText(payload.conversionType) || visit.conversionType || 'conversion';
    visit.conversionTypes = Array.from(new Set([...(visit.conversionTypes || []), visit.conversionType]));
    visit.actions = Array.from(new Set([...(visit.actions || []), `conversion:${visit.conversionType}`]));
    visit.clickedPhone = Boolean(visit.clickedPhone || payload.conversionType === 'phone');
    visit.clickedMessenger = Boolean(visit.clickedMessenger || payload.conversionType === 'messenger');
    visit.submittedForm = Boolean(visit.submittedForm || payload.conversionType === 'form');
    visit.blockDecision = 'ignore';
    visit.blockReason = 'є конверсія/контакт';
    visit.autoBlocked = false;

    await persistVisit(env, visit);
    return { ok: true, visitKey, converted: true, conversionType: visit.conversionType };
}

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const origin = request.headers.get('Origin') || '';
        const cors = corsHeaders(origin);

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: cors });
        }

        if (request.method === 'POST' && url.pathname === '/log') {
            try {
                const body = await request.json();
                const payload = {
                    ...body,
                    ip: request.headers.get('CF-Connecting-IP') || body.ip || 'unknown',
                    asn: request.cf?.asn || body.asn || null,
                    asOrg: request.cf?.asOrganization || body.asOrg || 'Unknown',
                    country: request.cf?.country || body.country || 'Unknown',
                    city: request.cf?.city || body.city || 'Unknown',
                    region: request.cf?.region || body.region || '',
                    timestamp: new Date().toISOString(),
                };

                const result = await handleUnifiedVisit(payload, env, 'js');
                return new Response(JSON.stringify(result), {
                    headers: jsonHeaders(cors),
                });
            } catch (error) {
                return new Response(JSON.stringify({ ok: false, error: error.message }), {
                    status: 500,
                    headers: jsonHeaders(cors),
                });
            }
        }

        if (request.method === 'POST' && url.pathname === '/log-edge') {
            const edgeSecret = request.headers.get('X-Edge-Secret');
            if (!env.EDGE_SECRET || edgeSecret !== env.EDGE_SECRET) {
                return new Response('Unauthorized', { status: 401 });
            }

            try {
                const body = await request.json();
                const payload = {
                    ...body,
                    timestamp: body.timestamp || new Date().toISOString(),
                };
                const result = await handleUnifiedVisit(payload, env, 'edge');
                return new Response(JSON.stringify(result), {
                    headers: jsonHeaders(),
                });
            } catch (error) {
                return new Response(JSON.stringify({ ok: false, error: error.message }), {
                    status: 500,
                    headers: jsonHeaders(),
                });
            }
        }

        if (request.method === 'POST' && url.pathname === '/honeypot') {
            try {
                const body = await request.json().catch(() => ({}));
                const ip = request.headers.get('CF-Connecting-IP') || body.ip || 'unknown';
                const payload = {
                    ...body,
                    ip,
                    timestamp: new Date().toISOString(),
                    userAgent: request.headers.get('User-Agent') || body.userAgent || '',
                    honeypot: true,
                };

                const result = await handleUnifiedVisit(payload, env, 'honeypot');
                return new Response(JSON.stringify(result), {
                    headers: jsonHeaders(cors),
                });
            } catch (error) {
                return new Response(JSON.stringify({ ok: false, error: error.message }), {
                    status: 500,
                    headers: jsonHeaders(cors),
                });
            }
        }

        if (request.method === 'POST' && url.pathname === '/mark-converted') {
            try {
                const body = await request.json().catch(() => ({}));
                const result = await markConverted(body, request, env);
                const status = result.ok ? 200 : 400;
                return new Response(JSON.stringify(result), {
                    status,
                    headers: jsonHeaders(cors),
                });
            } catch (error) {
                return new Response(JSON.stringify({ ok: false, error: error.message }), {
                    status: 500,
                    headers: jsonHeaders(cors),
                });
            }
        }

        if (request.method === 'GET' && url.pathname === '/api/blocked-ips') {
            if (!buildAuthorized(request, env)) {
                return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                    status: 401,
                    headers: jsonHeaders(cors),
                });
            }

            try {
                const blocks = await getActiveBlockEntries(env);
                const hard = blocks.filter((item) => item.decision === 'hard_block');
                const temp = blocks.filter((item) => item.decision === 'temp_block');
                return new Response(JSON.stringify({ hard, temp, ips: blocks.map((item) => item.ip) }), {
                    headers: jsonHeaders(cors),
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: jsonHeaders(cors),
                });
            }
        }

        if (request.method === 'GET' && url.pathname === '/api/google-ads-ip-list') {
            if (!buildAuthorized(request, env)) {
                return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                    status: 401,
                    headers: jsonHeaders(cors),
                });
            }

            try {
                const format = lower(url.searchParams.get('format') || 'text');
                const blocks = await getActiveBlockEntries(env);
                const ips = Array.from(new Set(blocks.map((item) => item.ip))).sort();

                if (format === 'json') {
                    return new Response(JSON.stringify({
                        ips,
                        count: ips.length,
                        blocks: blocks.map((item) => ({
                            ip: item.ip,
                            decision: item.decision,
                            reason: item.reason,
                            unblockAt: item.unblockAt,
                        })),
                    }), {
                        headers: jsonHeaders(cors),
                    });
                }

                return new Response(ips.join('\n'), {
                    headers: {
                        ...cors,
                        'Content-Type': 'text/plain; charset=utf-8',
                    },
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: jsonHeaders(cors),
                });
            }
        }

        if (request.method === 'GET' && url.pathname === '/api/clicks') {
            if (!buildAuthorized(request, env)) {
                return new Response(JSON.stringify({ error: 'Unauthorized' }), {
                    status: 401,
                    headers: jsonHeaders(cors),
                });
            }

            try {
                const days = Math.min(parseInt(url.searchParams.get('days') || '7', 10), 30);
                const allVisits = [];

                for (let i = 0; i < days; i++) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().substring(0, 10);
                    const keys = parseJsonSafe(await env.CLICKS_KV.get(`list:${dateStr}`), []);

                    for (const visitKey of keys.slice(0, 300)) {
                        const visit = parseJsonSafe(await env.CLICKS_KV.get(`visit:${visitKey}`), null);
        if (visit) allVisits.push(visit);
                    }
                }

                allVisits.sort((a, b) => Date.parse(b.timestamp || b.updatedAt) - Date.parse(a.timestamp || a.updatedAt));

                const stats = {
                    total: allVisits.length,
                    suspicious: allVisits.filter((item) => Number(item.suspicionScore || 0) >= 50).length,
                    vpn: allVisits.filter((item) => item.isVpn || item.isProxy).length,
                    repeats: allVisits.filter((item) => item.isRepeat || item.fingerprintRepeat).length,
                    uniqueIPs: new Set(allVisits.map((item) => item.ip)).size,
                    hardBlocked: allVisits.filter((item) => item.blockDecision === 'hard_block').length,
                    tempBlocked: allVisits.filter((item) => item.blockDecision === 'temp_block').length,
                    edgeOnly: allVisits.filter((item) => (item.sources || []).includes('edge') && !(item.sources || []).includes('js')).length,
                    merged: allVisits.filter((item) => item.merged).length,
                    converted: allVisits.filter((item) => item.converted).length,
                };

                return new Response(JSON.stringify({ clicks: allVisits, stats }), {
                    headers: jsonHeaders(cors),
                });
            } catch (error) {
                return new Response(JSON.stringify({ error: error.message }), {
                    status: 500,
                    headers: jsonHeaders(cors),
                });
            }
        }

        return new Response('Not Found', { status: 404 });
    },
};
