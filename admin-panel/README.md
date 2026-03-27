# Fix24 Admin Panel

Статична адмінка на Tabler для Cloudflare Pages.

## Що це
- Dashboard для кліків, кампаній, IP-кандидатів та конверсій
- Працює без бекенда, тільки через `https://api.fix24.pro`
- Підійде як окремий GitHub repo або як окремий Pages project

## Cloudflare Pages
Рекомендовані налаштування:
- `Root directory`: `admin-panel`
- `Build command`: порожньо
- `Output directory`: `.`

## API
Потрібен доступ до:
- `https://api.fix24.pro/api/clicks`

Авторизація:
- `Authorization: Bearer <ADMIN_PASSWORD>`

## Після деплою
- Відкрити сторінку
- Увійти з адмін-паролем
- Перевірити таблицю кліків, кампанії та блок-список
