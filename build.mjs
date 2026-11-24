import { cp, mkdir, readdir, rm, writeFile } from 'node:fs/promises';
import { services, equipment, products, stages, phone, phoneLink, email, mailLink } from './src/content.mjs';

const origin = 'https://kislitsyna01.github.io/gorkilandproduction/';
const source = new URL('./src/', import.meta.url);
const output = new URL('./dist/', import.meta.url);
const video = 'https://rutube.ru/video/ccae65176af3a0a600004ea338a729d5/';
const arrow = (diagonal = false) => diagonal
  ? '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M5 19 19 5M6 5h13v13"/></svg>'
  : '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="M3 12h17m-7-7 7 7-7 7"/></svg>';
const link = (url, label, style = 'text-link', diagonal = false) => `<a class="${style}" href="${url}">${label}${arrow(diagonal)}</a>`;
const primary = 'Отправить чертёж на расчёт';
const nav = [['services', 'Услуги'], ['equipment', 'Оборудование'], ['products', 'Изделия'], ['production', 'Производство']];
const mapUrl = 'https://yandex.ru/maps/org/gorki_lend/227671742217/';
const mapWidget = 'https://yandex.ru/map-widget/v1/?oid=227671742217&amp;ol=biz&amp;z=16';
const directions = 'https://yandex.ru/maps/?rtext=~55.918509%2C36.812987&amp;rtt=auto';
const logo = (root, dark = false) => `<img src="${root}assets/logo-${dark ? 'dark' : 'light'}.svg" width="360" height="89" alt="ГоркиLand — главная">`;

const photoSizes = {
  'hero-laser': [1600, 829], shop: [960, 417], 'lathe-work': [960, 477], series: [960, 735],
  milling: [960, 449], welding: [960, 461], laser: [800, 568], lathe: [800, 488],
  engineering: [800, 477], flanges: [800, 408], cnc: [800, 953],
};

function photo(root, image, alt, { sizes = '(max-width: 680px) 100vw, 50vw', eager = false, className = '' } = {}) {
  const [w, h] = photoSizes[image];
  const widths = image === 'hero-laser' ? [480, 800, 1200, 1600] : [480, w];
  if (['laser', 'lathe', 'milling', 'welding'].includes(image)) widths.unshift(320);
  const path = `${root}assets/${image}`;
  return `<img class="photo ${className}" src="${path}-${widths[1]}.webp"
    srcset="${widths.map((width) => `${path}-${width}.webp ${width}w`).join(', ')}" sizes="${sizes}"
    width="${w}" height="${h}" alt="${alt}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function header(page, root) {
  const menu = nav.map(([slug, label]) => `<a href="${page ? root + slug + '/' : '#' + slug}"${page === slug ? ' aria-current="page"' : ''}>${label}</a>`);
  const location = `<a href="${!page || page === 'contacts' ? '#location' : root + '#location'}">Контакты</a>`;
  const quote = page ? root + 'contacts/' : '#quote';
  return `<a class="skip" href="#main">К содержанию</a>
<header class="site-header">
  <div class="shell header-inner">
    <a class="brand" href="${root}">${logo(root, true)}</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="nav" hidden>Меню <span aria-hidden="true"></span></button>
    <nav class="header-nav" id="nav" aria-label="Основная навигация">
      <div class="nav-group nav-leading">${menu.slice(0, 3).join('')}</div>
      <div class="nav-group nav-trailing">${menu[3]}${location}</div>
    </nav>
    <a class="button button-outline header-quote" href="${quote}"${page === 'contacts' ? ' aria-current="page"' : ''}>Рассчитать заказ${arrow(true)}</a>
  </div>
</header>`;
}

function footer(root) {
  return `<footer class="footer">
  <div class="shell footer-inner">
    <a class="brand" href="${root}">${logo(root, true)}</a>
    <nav aria-label="Навигация в подвале">${[...nav, ['contacts', 'Контакты']].map(([slug, label]) => `<a href="${root}${slug}/">${label}</a>`).join('')}</nav>
    <a href="https://gorkiland.ru/">gorkiland.ru${arrow(true)}</a>
  </div>
</footer>`;
}

const checklist = `<ul class="checks">
  <li>Чертёж, 3D-модель или описание задачи</li>
  <li>Количество, материал и размеры</li>
  <li>Требования к точности и отделке</li>
</ul>`;

function contactBlock(root, standalone = false) {
  const heading = standalone ? 'h1' : 'h2';
  return `<section class="contact-band ${standalone ? 'contact-page' : ''}" aria-labelledby="quote">
    <div class="shell contact-inner"${standalone ? '' : ' data-reveal'}>
      <div><${heading} id="quote">Отправить чертёж<br><span>на расчёт</span></${heading}>
        <p>Приложите чертёж или 3D-модель к письму. Если документации пока нет, опишите изделие и его назначение.</p>
        <div class="contact-actions">${link(mailLink, 'Написать на почту', 'button button-primary', true)}
          <div class="contact-links"><a href="${phoneLink}">${phone}</a><a href="${mailLink}">${email}</a></div>
        </div>
      </div>
      <div class="contact-checks"><h2>Что указать в письме</h2>${checklist}<p>Добавьте имя, компанию и телефон, чтобы мы могли уточнить детали.</p></div>
    </div>
  </section>`;
}

function pageTop(title, description, links = '') {
  return `<section class="page-top ${links ? 'three-col' : ''}"><h1>${title}</h1><p>${description}</p>${links}</section>`;
}

function locationBlock() {
  return `<section class="location" id="location" aria-labelledby="location-heading">
    <div class="shell section location-inner">
      <div class="location-copy" data-reveal>
        <h2 id="location-heading">Где мы находимся</h2>
        <address>Московская область, г. Истра,<br>Красная Горка, ул. Заводская, 14</address>
        ${link(directions, 'Построить маршрут', 'button button-primary', true)}
        ${link(mapUrl, 'Открыть в Яндекс Картах', 'text-link', true)}
      </div>
      <iframe class="location-map" title="ГоркиLand на Яндекс Картах, Заводская улица, 14"
        src="${mapWidget}" width="960" height="480" loading="lazy" allowfullscreen></iframe>
    </div>
  </section>`;
}

function home(root) {
  return `<section class="hero">
    <div class="hero-copy">
      <h1>Комплексная<br>металлообработка</h1>
      <p>От чертежа до готового изделия на одной площадке.</p>
      <div class="hero-actions">
        ${link('#quote', primary, 'button button-primary')}
        ${link('#services', 'Смотреть услуги', 'button button-ghost')}
      </div>
    </div>
    <picture class="hero-media">
      <source media="(max-width: 680px)"
        srcset="${root}assets/hero-laser-mobile-480.webp 480w, ${root}assets/hero-laser-mobile-720.webp 720w"
        sizes="100vw" width="720" height="1059">
      ${photo(root, 'hero-laser', '', { eager: true, className: 'hero-photo', sizes: '100vw' })}
    </picture>
    <p class="hero-caption">Лазерная резка листового металла</p>
  </section>
  <div class="proof-band">
    <ul class="shell proof" aria-label="Возможности производства">
      <li>${link('#equipment', 'Собственный станочный парк')}</li>
      <li>${link(root + 'production/#bureau', 'Конструкторское бюро')}</li>
      <li>${link('#products', 'От одной детали до серии')}</li>
    </ul>
  </div>
  <section class="shell section" id="services">
    <div class="section-head" data-reveal><h2>Производственные операции</h2>${link(root + 'services/', 'Все услуги')}</div>
    <div class="service-cards">
      ${[services[0], services[2], services[1], services[6]].map((service) => `<a class="service-card" href="${root}services/#${service.id}">
          ${photo(root, service.photo, '', { sizes: '(max-width: 500px) calc((100vw - 57px) / 2), (max-width: 850px) 45vw, 23vw' })}
          <span>${service.short}${arrow(true)}</span>
        </a>`).join('')}
    </div>
  </section>
  <section class="feature-band" id="equipment">
    <div class="shell section home-feature reverse">
      ${photo(root, 'lathe-work', 'Оператор у токарного станка', { className: 'feature-photo' })}
      <div class="feature-copy" data-reveal><h2>Станочный парк</h2>
        <p>Лазерный раскрой, токарные и фрезерные станки, пятиосевые центры, электроэрозия и оборудование для чистовой обработки на одной площадке.</p>
        ${link(root + 'equipment/', 'Посмотреть оборудование')}
      </div>
    </div>
  </section>
  <section class="shell section home-feature product-feature" id="products">
    <div class="feature-copy" data-reveal><h2>Что производим</h2>
      <p>Корпусные детали, валы, втулки, фланцы, оснастка, листовые и крупногабаритные изделия. Изготавливаем единичные детали и серийные партии.</p>
      ${link(root + 'products/', 'Типовые изделия')}
    </div>
    ${photo(root, 'flanges', 'Металлические фланцы из презентации производства', { className: 'feature-photo' })}
  </section>
  <section class="feature-band process-band" id="production">
    <div class="shell section home-feature reverse">
      ${photo(root, 'shop', 'Сборка крупной металлоконструкции на производственной площадке', { className: 'feature-photo' })}
      <div class="feature-copy" data-reveal><h2>От чертежа до сборки</h2>
        <p>Работаем с готовой документацией и 3D-моделями. Если чертёж нужно разработать или адаптировать, конструкторское бюро согласует решение с цехом.</p>
        ${link(root + 'production/', 'Как выполняется заказ')}
      </div>
    </div>
  </section>
  ${contactBlock(root)}
  ${locationBlock()}`;
}

function servicesPage(root) {
  return `<div class="shell section interior">
    ${pageTop('Возможности<br>производства', 'Подберите операции под вашу деталь. Для предварительной оценки подготовьте чертёж или 3D-модель и укажите количество.', `<nav class="jump" aria-label="Основные операции">${services.slice(0, 4).map((s) => link('#' + s.id, s.short, 'jump-link')).join('')}</nav>`)}
    <div class="technical-head" aria-hidden="true"><span>Вид обработки</span><span>Операции и параметры</span><span>Что нужно для расчёта</span></div>
    ${services.map((service) => `<section class="technical-row" id="${service.id}" aria-labelledby="${service.id}-name">
      <h2 id="${service.id}-name">${service.name}</h2>
      <div><p>${service.work}</p>
        ${service.specs ? `<dl class="specs">${service.specs.map(([key, value]) => `<div><dt>${key}</dt><dd>${value}</dd></div>`).join('')}</dl>` : ''}</div>
      <div class="technical-quote"><strong class="mobile-label">Что нужно для расчёта</strong><p>${service.quote}</p></div>
    </section>`).join('')}
    <div class="service-bottom">${photo(root, 'milling', 'Обработка металлической заготовки на станке')}<div><h2>Станочный парк</h2><p>Посмотрите, какое оборудование выполняет нужные вам операции.</p>${link(root + 'equipment/', 'К оборудованию')}</div></div>
  </div>${contactBlock(root)}`;
}

function equipmentPage(root) {
  return `<div class="shell section interior">
    ${pageTop('Станочный парк', 'Оборудование для раскроя, механической и чистовой обработки на одной площадке. Станок и оснастку подбираем по чертежу, размерам и массе заготовки.')}
    <div class="equipment-layout">
      <div class="equipment-photos">
        <figure>${photo(root, 'cnc', 'Фрезерный центр GOING C-165', { eager: true })}<figcaption>Фрезерный центр GOING C-165</figcaption></figure>
        <figure>${photo(root, 'lathe-work', 'Оператор у токарного станка')}<figcaption>Токарный участок</figcaption></figure>
      </div>
      <div>
        <table class="equipment-table">
          <caption class="sr-only">Оборудование по видам обработки</caption>
          <thead><tr><th scope="col">Участок</th><th scope="col">Оборудование и операции</th></tr></thead>
          <tbody>${equipment.map((item) => `<tr><th scope="row">${item.name}</th><td><p>${item.detail}</p><div class="table-links">${item.ids.map((id) => link(root + 'services/#' + id, services.find((s) => s.id === id).short)).join('')}</div></td></tr>`).join('')}</tbody>
        </table>
      </div>
    </div>
  </div>${contactBlock(root)}`;
}

function productsPage(root) {
  return `<div class="shell section interior products-page">
    <section class="product-intro">
      <div><h1>Что<br>производим</h1><p>Изготавливаем детали и узлы по чертежам и 3D-моделям. Работаем с единичными заказами и серийными партиями.</p></div>
      ${photo(root, 'flanges', 'Металлические фланцы на производственной площадке', { eager: true, className: 'product-top-photo' })}
    </section>
    <div class="product-layout">
      ${photo(root, 'series', 'Группа однотипных металлических деталей', { className: 'product-side-photo' })}
      <div class="product-list">${products.map((product) => `<section><h2>${product.name}</h2><p>${product.detail}</p></section>`).join('')}</div>
    </div>
  </div>${contactBlock(root)}`;
}

function productionPage(root) {
  return `<div class="shell section interior">
    <h1>От чертежа до <span class="accent">сборки</span></h1>
    <div class="process-layout">
      ${photo(root, 'shop', 'Производственный участок и крупногабаритная рама', { eager: true })}
      <ol class="stages">${stages.map((stage, i) => `<li><span aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><div><h2>${stage.name}</h2><p>${stage.text}</p></div></li>`).join('')}</ol>
    </div>
    <section id="bureau" class="bureau">
      <div><h2>Конструкторское бюро</h2>
        <p>Если у вас есть рабочий чертёж или 3D-модель, изучаем документацию и подбираем операции. Если есть только описание, можем разработать чертёж и адаптировать конструкцию под технологии производства.</p>
        <p>Конструкторы напрямую работают с цехом. Это помогает согласовывать изменения перед запуском изделия.</p>
      </div>
      ${photo(root, 'engineering', 'Конструкторы работают с моделью изделия')}
    </section>
    <section class="video-panel" aria-labelledby="video">
      ${photo(root, 'welding', 'Сварочные работы на производстве')}
      <div><h2 id="video">Производство на видео</h2><p>Посмотрите, как устроена площадка и как в цехе работают с металлом.</p>${link(video, 'Смотреть на Rutube', 'text-link', true)}</div>
    </section>
  </div>${contactBlock(root)}`;
}

function contactsPage(root) {
  return `${contactBlock(root, true)}<section class="shell section contact-extra">
    <h2>Обсудить задачу по телефону</h2><p>Позвоните, если нужно уточнить возможности производства или понять, какие данные подготовить для расчёта.</p>
    <a class="large-link" href="${phoneLink}">${phone} ${arrow(true)}</a>
  </section>${locationBlock()}`;
}

const pages = [
  ['', 'Комплексная металлообработка', 'ГоркиLand выполняет комплексную металлообработку на одной площадке. Изготовление по чертежам и 3D-моделям, единичные и серийные заказы.', home],
  ['services', 'Услуги металлообработки', 'Лазерная резка, фрезерование на ЧПУ, токарная и пятиосевая обработка, электроэрозия, шлифование, гибка, сварка и окраска.', servicesPage],
  ['equipment', 'Оборудование', 'Станочный парк ГоркиLand для раскроя, механической и чистовой обработки, гибки и сборки металлоизделий.', equipmentPage],
  ['products', 'Что производим', 'Корпусные детали, валы, втулки, фланцы, оснастка, листовые и крупногабаритные изделия по чертежам и 3D-моделям.', productsPage],
  ['production', 'Конструкторское бюро и производство', 'Как проходит заказ на металлообработку в ГоркиLand, от разработки чертежа до сварки, окраски и сборки изделия.', productionPage],
  ['contacts', 'Контакты и расчёт заказа', 'Куда отправить чертёж или 3D-модель на расчёт металлообработки. Телефон и электронная почта ГоркиLand.', contactsPage],
];

function render(slug, name, description, content) {
  const root = slug ? '../' : './';
  const url = new URL(slug ? slug + '/' : './', origin);
  const title = `${name} — ГоркиLand`;
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${description}">
  <meta name="theme-color" content="#1f1f1f">
  <title>${title}</title>
  <link rel="canonical" href="${url}">
  <link rel="icon" href="${root}assets/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="${root}assets/inter-cyrillic-800-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="${root}site.css">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="ru_RU">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${new URL('assets/hero-laser-1200.webp', origin)}">
  <script src="${root}site.js" defer></script>
</head>
<body${slug ? '' : ' class="home-page"'}>
${header(slug, root)}
<main id="main" tabindex="-1">${content(root)}</main>
${footer(root)}
</body>
</html>`;
}

await rm(output, { recursive: true, force: true });
await mkdir(new URL('assets/', output), { recursive: true });
await Promise.all(['site.css', 'site.js'].map((name) => cp(new URL(name, source), new URL(name, output))));
const assets = await readdir(new URL('assets/', source));
await Promise.all(assets.filter((name) => /\.(webp|woff2|svg)$|^Inter-LICENSE\.txt$/.test(name))
  .map((name) => cp(new URL('assets/' + name, source), new URL('assets/' + name, output))));
for (const [slug, name, description, content] of pages) {
  const dir = new URL(slug ? slug + '/' : './', output);
  await mkdir(dir, { recursive: true });
  await writeFile(new URL('index.html', dir), render(slug, name, description, content));
}
await writeFile(new URL('sitemap.xml', output), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(([slug]) => `  <url><loc>${origin}${slug ? slug + '/' : ''}</loc></url>`).join('\n')}\n</urlset>\n`);
await writeFile(new URL('robots.txt', output), `User-agent: *\nAllow: /\nSitemap: ${origin}sitemap.xml\n`);
await writeFile(new URL('.nojekyll', output), '');
console.log(`Собрано страниц: ${pages.length}. Готовые файлы в dist/.`);
