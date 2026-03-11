/**
 * Cloudflare Pages Middleware — AGD.fix24
 * Перехоплює кліки з Google Ads на рівні edge (до завантаження JS)
 * Фіксує Type 1 ботів які клікають але не завантажують сторінку
 *
 * Розміщення: /functions/_middleware.js (корінь проєкту)
 */

const WORKER_URL = 'https://api.fix24.pro/log-edge';
const WORKER_SECRET = 'Rom@n_Mozol@_1987'; // окремий секрет, не ADMIN_PASSWORD

export async function onRequest(context) {
    const { request, next } = context;
    const url = new URL(request.url);

    // Обробляємо тільки GET запити з gclid (кліки з Google Ads)
    const gclid = url.searchParams.get('gclid');
    if (!gclid) {
        return next(); // звичайний трафік — пропускаємо без затримки
    }

    // Збираємо дані на рівні edge (без JS)
    const edgeData = {
        ip: request.headers.get('CF-Connecting-IP') || 'unknown',
        userAgent: request.headers.get('User-Agent') || '',
        gclid: gclid,
        landingPage: url.toString(),
        timestamp: new Date().toISOString(),
        // Cloudflare geo дані
        country: request.cf?.country || null,
        city: request.cf?.city || null,
        region: request.cf?.region || null,
        asn: request.cf?.asn || null,
        asOrg: request.cf?.asOrganization || null,
    };

    // Fire-and-forget — не затримуємо завантаження сторінки
    // context.waitUntil гарантує що запит завершиться навіть якщо бот відключився
    context.waitUntil(
        fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Edge-Secret': WORKER_SECRET,
            },
            body: JSON.stringify(edgeData),
        }).catch(() => { }) // мовчки ігноруємо помилки мережі
    );

    // Сторінка завантажується без затримки
    return next();
}
