САЙТ ТОКАРЯ — ФАЙЛЫ ДЛЯ ХОСТИНГА

index.html       — страница
css/style.css    — стили (палитра в начале, в блоке :root)
js/main.js       — контакты, кнопка «Написать», искры на первом экране
fonts/           — сюда шрифт Druk Wide Cyr
img/works/       — фото работ (8 шт.)
img/master/      — фото мастера: руки, станок, гараж (3 шт.)
img/reviews/     — скриншоты отзывов (3 шт.)

1. КОНТАКТЫ
   Откройте js/main.js, вверху объект CONTACTS. Впишите телефон, Telegram,
   ссылку на MAX и ссылку на маршрут. Они подставятся во все кнопки сразу.

2. ШРИФТ DRUK WIDE CYR
   Положите в fonts/ два файла с такими именами:
     DrukWideCyr-Bold.woff2
     DrukWideCyr-Super.woff2
   Если файлов нет, заголовки показываются шрифтом Unbounded.

3. ФОТО
   В index.html заглушки выглядят так:
     <div class="img">[фото 1]</div>
   Замените на:
     <div class="img"><img src="img/works/01.jpg" alt="Что за деталь" loading="lazy"></div>
   и в css добавьте один раз: .shot .img img{width:100%;height:100%;object-fit:cover;border-radius:inherit}

4. ТЕКСТОВЫЕ ЗАГЛУШКИ
   В index.html ищите квадратные скобки: [ИМЯ], [Д], [АДРЕС], [ТЕЛЕФОН],
   подписи к фото работ.

5. КАРТА
   Блок <div class="map">…</div> в разделе «Пишите или звоните» заменить
   на код Яндекс Карт (Конструктор карт → iframe) с точкой гаража.
