# Backup zakomentowanego kodu

Tutaj przechowujemy kod, który został zakomentowany w plikach HTML.
Jeśli będzie potrzebny - można go przywrócić w odpowiednim miejscu.

---

## index.html

### 1. Rydki 40 i 96 — link do sekcji #portfolio w nawigacji (mobilne i desktop)
Znajdziesz go w obu listach `<ul>` menu (mobilne i główne).
```html
<!-- <li><a href="#portfolio">Наши работы</a></li> -->
```

---

### 2. Rydki 133–140 — drugi numer telefonu w dropdown kontaktów
Blok z numerem "Dyrektora" w header dropdownie.
```html
<!-- <div class="header-phone">
    <a href="tel:+79876543211">+7(987) 654-32-11</a>

    <div class="header-phone-description">
        Директор
    </div>

</div> -->
```

---

### 3. Rydki 186–190 — przycisk Telegram w header dropdownie (social-nav)
```html
<!-- <li class="telegram-btn">
    <a href="https://telegram.me/telegram_user_name" target="_blank">
        <svg ...Telegram SVG...></svg>
    </a>
</li> -->
```

---

### 4. Rydki 210–214 — przycisk Instagram w header dropdownie (social-nav)
```html
<!-- <li class="inst-btn">
    <a href="https://instagram.com/" target="_blank">
        <svg ...Instagram SVG...></svg>
    </a>
</li> -->
```

---

### 5. Rydki 218–234 — przycisk YouTube w header dropdownie (social-nav)
```html
<!-- <li class="youtube-btn">
    <a href="https://youtube.com/" target="_blank">
        <svg ...YouTube SVG...></svg>
    </a>
</li> -->
```

---

### 6. Rydki 688–695 — 4-ty element w sekcji "Cenimy Twój czas!" (60 minut)
Zakomentowany element listy statystyk — czas dojazdu 60 minut.
```html
<!-- </div><div class="item">
    <div class="item-num">
        60
    </div>
    <div class="item-title">
        minut potrzebujemy aby dotrzeć pod Twój adres
    </div>
</div> -->
```

---

### 7. Rydki 708–750 — sekcja "application-section" (formularz zgłoszeniowy po polsku/rosyjsku)
Cała sekcja z formularzem kontaktowym — tekst mieszany (rosyjski/polski).
Formularz zawiera pola: imię, telefon, przycisk "Оставить заявку", zgoda na policy.html.
```html
<!-- <div class="application-section section pt0">
    <div class="container">
        <div class="application-block rf">
            <div class="col1">
                <h2><span>Nужен ремонт техники?</span></h2>
                <h4>Оставьте заявку, и наши специалисты свяжутся с Вами
                    в течение нескольких минут и проконсультируют по всем вопросам!</h4>
            </div>
            <div class="col2">
                <form class="ajax_form" method="post">
                    <!-- pola: name, phone, submit "Оставить заявку", checkbox zgoda -->
                </form>
            </div>
        </div>
    </div>
</div> -->
```

---

### 8. Rydki 755–1265 — sekcja galerii #portfolio
Duża sekcja z 4 zakładkami ze zdjęciami prac. Nagłówek po rosyjsku.
Sekcja zawiera: zakładki (Бытовая техника, Коммерческая техника + 2 inne),
karuzele zdjęć z fancybox, zdjęcia z katalogu `assets/cache_image/images/galleries/`.
Nawigacyjny link `href="#portfolio"` też jest zakomentowany (patrz punkt 1).
> Uwaga: treść sekcji po rosyjsku — wymaga tłumaczenia przed przywróceniem.

---

### 9. Rydki 1443–1752 — sekcja opinii (recenzji klientów)
Karuzela z 3 opiniami klientów. Wszystkie po rosyjsku.
Klienci: Ирина С. (05 Сентября 2024), Юрий, Мария Власова.
Sekcja zawiera film YouTube i zdjęcia z `assets/cache_image/images/reviews/`.
> Uwaga: treść po rosyjsku — wymaga tłumaczenia i aktualizacji danych przed przywróceniem.

---

### 10. Rydki 1902–1918 — blok "mess-block" (pływające przyciski Messenger/WhatsApp)
Blok wyświetlany nad formularzem kontaktowym z przyciskami WhatsApp i Messenger.
```html
<!-- <div class="mess-block">
    <div class="mess-block-title">
        Lub napisz Nam, jesteśmy online
    </div>
    <div class="mess-buttons">
        <a href="https://api.whatsapp.com/send?phone=48573463323" class="btn whatsapp-btn" target="_blank">
            <svg ...WhatsApp SVG...></svg>
        </a>
        <a href="https://m.me/agdfix24pro" class="btn messenger-btn" target="_blank">
            <svg ...Messenger SVG...></svg>
        </a>
    </div>
</div> -->
```
> Uwaga: numery w tym bloku zostały już zaktualizowane w głównym pliku.

---

### 11. Rydki 1986–1990 — przycisk Instagram w footer (social-nav)
```html
<!-- <li class="inst-btn">
    <a href="https://instagram.com/" target="_blank">
        <svg ...Instagram SVG...></svg>
    </a>
</li> -->
```

---

### 12. Rydki 1993–2009 — przycisk YouTube w footer (social-nav)
```html
<!-- <li class="youtube-btn">
    <a href="https://youtube.com/" target="_blank">
        <svg ...YouTube SVG...></svg>
    </a>
</li> -->
```

---

## index_lodówki.html

### 1. Rydek 71 — przycisk "Proszę o kontakt" w top panelu
```html
<!-- <a class="btn btn-app btn-call text-indent" href="#call" data-modal=""><span>Proszę o kontakt</span></a> -->
```

---

### 2. Rydek 138–140 — przycisk "Перезвонить" w header (mobilny)
```html
<!-- <div class="head-word">
    <a class="btn btn-call-mobile" href="#call" data-modal="">Перезвонить</a>
</div> -->
```

---

### 3. Rydek 154 — przycisk "Proszę o kontakt" w header-buttons
```html
<!-- <a class="btn btn-app btn-call" href="#call" data-modal="">Proszę o kontakt</a> -->
```

---

### 4. Rydek 241 — nagłówek sekcji "Jak działamy?"
```html
<!-- <h3 class="section-title wow fadeInUp">Jak działamy ?</h3> -->
```

---

### 5. Rydki 252, 262, 272, 282 — opisy kroków w sekcji "Jak działamy?"
Cztery akapity opisujące kolejne kroki serwisu (kontakt, diagnoza, wizyta, odbiór).
```html
<!-- <p class="work-text">Skontaktujemy się z Tobą i wyczerpująco odpowiemy na wszystkie pytania.</p> -->
<!-- <p class="work-text">W miarę możliwości diagnozujemy usterkę, określamy koszt naprawy i ustalamy termin wizyty.</p> -->
<!-- <p class="work-text">Przyjeżdżamy w dogodnym dla Państwa terminie i wykonujemy naprawę lub diagnostykę sprzętu.</p> -->
<!-- <p class="work-text">Po zakończeniu naprawy wspólnie z technikiem sprawdzają Państwo poprawność działania sprzętu.</p> -->
```

---

### 6. Rydki 345–346 — nagłówek i akapit w sekcji "ask" (po rosyjsku)
```html
<!-- <h3 class="ask-gossip wow fadeInUp">Остались вопросы?</h3> -->
<!-- <p class="ask-faith wow fadeInUp">Вам срочно понадобился мастер... (tekst rosyjski)</p> -->
```

---

### 7. Rydki 547, 566, 585 — linki z rosyjskim numerem w sekcji "Czemu my?"
Trzy bloki (Szybki czas reakcji, Darmowa diagnostyka, Jasne zasady) — każdy miał link z numerem.
```html
<!-- <a class="sey-item-gossip" href="%2b79876543210.html">
    <img class="sey-item-floor" src="assets/template/img/icons/phone.png" alt="">
    <span class="sey-item-refer">+7 (987) 654-32-10</span>
</a> -->
```

---

### 8. Rydki 643–645 — akapit wprowadzający w sekcji "Dlaczego warto nam zaufać?" (po rosyjsku)
```html
<!-- <p class="why-be wow fadeInUp">
    «AGD.fix24» занимается ремонтом бытовой техники с 2005 года... (tekst rosyjski)
</p> -->
```

---

### 9. Rydki 656–658, 667–669, 679–681, 690–692 — opisy w sekcji "Dlaczego warto?" (po rosyjsku)
Cztery akapity przy kartach: Szybkie naprawy, Atrakcyjne ceny, Oficjalna gwarancja, Naprawa u klienta.
Wszystkie teksty po rosyjsku — do przetłumaczenia przed przywróceniem.

---

### 10. Rydki 707–709 — trzy akapity wprowadzające w sekcji "Serwis w liczbach" (po rosyjsku)
```html
<!-- <p class="facts-shebang wow fadeInUp">Достижения компании не остались незамеченными...</p>
<p class="facts-shebang wow fadeInUp">Поэтому мы стремимся познакомить жителей Москвы...</p>
<p class="facts-shebang wow fadeInUp">Обратите внимание на следующие цифры</p> -->
```

---

### 11. Rydki 848–851 — przycisk "Перезвонить" w footer
```html
<!-- <div class="foot-tie">
    Elements-button-call-mobile start
    <a class="btn btn-call-mobile" href="#call" data-modal="">Перезвонить</a>
    Elements-button-call-mobile end
</div> -->
```

---

### 12. Rydek 860 — przycisk "Proszę o kontakt" w footer-buttons
```html
<!-- <a class="btn btn-app btn-call" href="#call" data-modal="">Proszę o kontakt</a> -->
```
