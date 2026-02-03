# MasterPro - Локальна версія

## Що зроблено:
✅ Видалено Cloudflare Email Protection
✅ Видалено AJAX форми (потребують серверу)
✅ Видалено CSRF токени
✅ Всі стилі і скрипти на місці

## Як запустити:

### Варіант 1: Python HTTP Server
```bash
python3 -m http.server 8000
```
Відкрий: http://localhost:8000/index_clean.html

### Варіант 2: PHP Server
```bash
php -S localhost:8000
```

### Варіант 3: Просто відкрий файл
Подвійний клік на `index_clean.html`

## Що не працює:
❌ Форми відправки (потрібен PHP/ModX бекенд)
❌ Email розшифровка (був Cloudflare)

## Структура:
```
/assets/template/css/  - CSS стилі
/assets/template/js/   - JavaScript
/images/               - Зображення
/favicon.ico           - Іконка сайту
```

