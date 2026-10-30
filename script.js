/* =====================================================
   PROPOOL — script.js (Home page)
   -----------------------------------------------------
    1. Config + safe storage + data
    2. Gallery render
    3. FAQ (+ FAQPage schema)
    4. Language (AR / EN)
    5. Theme (light / dark)
    6. Nav + scroll + back-to-top
    7. Mobile menu
    8. Reveal on scroll
    9. Pricing plans → WhatsApp
   10. Counters
   11. Before / after slider
   12. Lightbox
   13. Button ripple
   14. Forms → Google Sheet + WhatsApp
   15. About slider
   16. Preloader
   17. Init
   ===================================================== */
/* =====================================================
   1. CONFIG + SAFE STORAGE + DATA
   ===================================================== */
// WhatsApp number that receives the form messages
const WHATSAPP_NUMBER = '96555571687';
// Google Apps Script URL that logs messages into the sheet
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwOGESaRMaBJdEWOrFyzqO1BcMTMMpL_uKcxEpIsEshk4bAMblXf-Rmdr7739ii9qvG/exec';
// localStorage can throw (e.g. Safari private mode), so every call is wrapped
const store = {
  get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
  set(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* ignore */ } }
};
const galleryImgs = [
  'image/pool-1.webp',
  'image/pool-2.webp',
  'image/pool-3.webp',
  'image/pool-4.webp',
  'image/pool-5.webp',
  'image/pool-6.webp',
  'image/pool-7.webp',
  'image/pool-8.webp',
  'image/pool-9.webp'
];
let currentLang = document.documentElement.lang || 'ar';
/* =====================================================
   2. GALLERY RENDER
   ===================================================== */
function svgIcon(path) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`;
}
function renderGallery() {
  const grid = document.getElementById('masonryGrid');
  if (!grid) return;
  const altBase = currentLang === 'ar' ? 'صورة من أعمال بروبول' : 'PROPOOL project photo';
  grid.innerHTML = galleryImgs.map((src, i) => `
    <div class="g-item reveal" data-idx="${i}">
      <img src="${src}" alt="${altBase} ${i + 1}" loading="lazy">
      <div class="g-overlay">${svgIcon('M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z')}</div>
    </div>`).join('');
}
// re-draws the dynamic sections (called again after a language change)
function renderAll() {
  renderGallery();
  observeReveal();
  bindLightbox();
}
/* =====================================================
   3. FAQ (questions live in the HTML for SEO)
   ===================================================== */
// open / close (event delegation: one listener for the whole list)
function bindFaq() {
  const list = document.getElementById('faqList');
  if (!list) return;
  list.addEventListener('click', (e) => {
    const q = e.target.closest('.faq-q');
    if (!q) return;
    const item = q.parentElement;
    const wasOpen = item.classList.contains('open');
    list.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
}
// builds a FAQPage schema from the Arabic questions on the page
function injectFaqSchema() {
  const items = [...document.querySelectorAll('#faqList .faq-item')].map((item) => ({
    '@type': 'Question',
    name: item.querySelector('.faq-q span').getAttribute('data-ar'),
    acceptedAnswer: { '@type': 'Answer', text: item.querySelector('.faq-a p').getAttribute('data-ar') }
  }));
  if (!items.length) return;
  const s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': 'https://propool-kw.com/#faq',
    inLanguage: 'ar',
    mainEntity: items
  });
  document.head.appendChild(s);
}
/* =====================================================
   4. LANGUAGE (AR / EN)
   ===================================================== */
function applyLang(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-ar]').forEach((el) => {
    const val = el.getAttribute(lang === 'ar' ? 'data-ar' : 'data-en');
    if (val !== null) el.textContent = val;
  });
  document.querySelectorAll('[data-ar-ph]').forEach((el) => {
    const val = el.getAttribute(lang === 'ar' ? 'data-ar-ph' : 'data-en-ph');
    if (val !== null) el.setAttribute('placeholder', val);
  });
  renderAll();
  store.set('propool-lang', lang);
}
const langToggle = document.getElementById('langToggle');
if (langToggle) {
  langToggle.addEventListener('click', () => {
    applyLang(currentLang === 'ar' ? 'en' : 'ar');
  });
}
/* =====================================================
   5. THEME (light / dark)
   ===================================================== */
const ICON_MOON = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>';
const ICON_SUN = '<path d="M12 3v2"/><path d="M12 19v2"/><path d="m4.22 4.22 1.42 1.42"/><path d="m18.36 18.36 1.42 1.42"/><path d="M3 12h2"/><path d="M19 12h2"/><path d="m4.22 19.78 1.42-1.42"/><path d="m18.36 5.64 1.42-1.42"/><circle cx="12" cy="12" r="4"/>';
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const themeIcon = document.getElementById('themeIcon');
  if (themeIcon) themeIcon.innerHTML = theme === 'dark' ? ICON_SUN : ICON_MOON;
  store.set('propool-theme', theme);
}
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    applyTheme(cur === 'dark' ? 'light' : 'dark');
  });
}
/* =====================================================
   6. NAV + SCROLL + BACK-TO-TOP
   ===================================================== */
const mainNav = document.getElementById('mainNav');
const backTop = document.getElementById('backTop');
const heroBg = document.getElementById('heroBg');
const HERO_SCALE = 1.08; // keep equal to the scale in style.css (.hero-bg)
function onScroll() {
  const y = window.scrollY;
  if (mainNav) mainNav.classList.toggle('scrolled', y > 20);
  if (backTop) backTop.classList.toggle('show', y > 500);
  if (heroBg && y < window.innerHeight) {
    heroBg.style.transform = `scale(${HERO_SCALE}) translateY(${y * 0.25}px)`;
  }
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll(); // sets the initial state without a jump on first scroll
if (backTop) {
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
/* =====================================================
   7. MOBILE MENU
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const menu = document.getElementById('menu');
  const navLinks = document.getElementById('navLinks');
  if (!menu || !navLinks) return;
  function closeMobileMenu() {
    if (!navLinks.classList.contains('open')) return;
    navLinks.style.transition = 'none'; // instant close
    navLinks.classList.remove('open');
    menu.classList.remove('active');
    requestAnimationFrame(() => requestAnimationFrame(() => { navLinks.style.transition = ''; }));
  }
  function openMobileMenu() {
    navLinks.style.transition = '';
    navLinks.classList.add('open');
    menu.classList.add('active');
  }
  menu.addEventListener('click', (e) => {
    e.stopPropagation();
    if (navLinks.classList.contains('open')) closeMobileMenu();
    else openMobileMenu();
  });
  document.addEventListener('click', (e) => {
    if (!navLinks.classList.contains('open')) return;
    if (!navLinks.contains(e.target) && !menu.contains(e.target)) closeMobileMenu();
  });
  window.addEventListener('scroll', closeMobileMenu, { passive: true });
  navLinks.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMobileMenu));
});
/* =====================================================
   8. REVEAL ON SCROLL
   ===================================================== */
function observeReveal() {
  const els = document.querySelectorAll('.reveal:not(.in), .reveal-scale:not(.in)');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach((el) => io.observe(el));
}
/* =====================================================
   9. PRICING PLANS → WHATSAPP
   ===================================================== */
document.querySelectorAll('.price-card .price-cta').forEach((btn) => {
  const card = btn.closest('.price-card');
  const nameEl = card.querySelector('.price-name');
  const descEl = card.querySelector('.price-desc span');
  const amount = card.querySelector('.price-amount');
  // the message is always Arabic because it goes to the company team
  const plan = nameEl ? nameEl.getAttribute('data-ar') : '';
  const visits = descEl ? descEl.getAttribute('data-ar') : '';
  const price = (amount && amount.childNodes[0]) ? amount.childNodes[0].textContent.trim() : '';
  const text =
`مرحبًا بروبول، اخترت باقة (${plan})
📅 الزيارات: ${visits}
💰 السعر: يبدأ من ${price} دينار كويتي شهريًا
أرغب في الاشتراك بهذه الباقة، برجاء التواصل معي.`;
  btn.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  btn.target = '_blank';
  btn.rel = 'noopener';
});
/* =====================================================
   10. COUNTERS
   ===================================================== */
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach((el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    let cur = 0;
    const step = Math.max(1, Math.round(target / 60));
    const timer = setInterval(() => {
      cur += step;
      if (cur >= target) {
        cur = target;
        clearInterval(timer);
      }
      el.textContent = cur + suffix;
    }, 20);
  });
}
const statsSection = document.querySelector('.stats');
if (statsSection) {
  const statsIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateCounters();
        statsIO.disconnect();
      }
    });
  }, { threshold: 0.4 });
  statsIO.observe(statsSection);
}
/* =====================================================
   11. BEFORE / AFTER SLIDER
   ===================================================== */
document.querySelectorAll('.ba-wrap').forEach((wrap) => {
  const handle = wrap.querySelector('.ba-handle');
  const after = wrap.querySelector('.ba-after');
  if (!handle || !after) return;
  let dragging = false;
  function move(x) {
    const rect = wrap.getBoundingClientRect();
    let pct = ((x - rect.left) / rect.width) * 100;
    pct = Math.max(2, Math.min(98, pct));
    handle.style.left = pct + '%';
    after.style.clipPath = `inset(0 0 0 ${pct}%)`;
  }
  handle.addEventListener('pointerdown', (e) => {
    dragging = true;
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener('pointermove', (e) => { if (dragging) move(e.clientX); });
  handle.addEventListener('pointerup', () => { dragging = false; });
  handle.addEventListener('pointercancel', () => { dragging = false; });
});
/* =====================================================
   12. LIGHTBOX
   ===================================================== */
let lbIndex = 0;
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
function openLightbox() {
  if (!lightbox || !lbImg) return;
  lbImg.src = galleryImgs[lbIndex];
  lightbox.classList.add('open');
}
function closeLightbox() {
  if (lightbox) lightbox.classList.remove('open');
}
function stepLightbox(dir) {
  lbIndex = (lbIndex + dir + galleryImgs.length) % galleryImgs.length;
  openLightbox();
}
function bindLightbox() {
  document.querySelectorAll('.g-item').forEach((item) => {
    item.addEventListener('click', () => {
      lbIndex = parseInt(item.getAttribute('data-idx'), 10);
      openLightbox();
    });
  });
}
if (lightbox) {
  const lbClose = document.getElementById('lbClose');
  const lbNext = document.getElementById('lbNext');
  const lbPrev = document.getElementById('lbPrev');
  if (lbClose) lbClose.addEventListener('click', closeLightbox);
  if (lbNext) lbNext.addEventListener('click', () => stepLightbox(1));
  if (lbPrev) lbPrev.addEventListener('click', () => stepLightbox(-1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') stepLightbox(1);
    if (e.key === 'ArrowLeft') stepLightbox(-1);
  });
}
/* =====================================================
   13. BUTTON RIPPLE
   ===================================================== */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-ripple]');
  if (!btn) return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const circle = document.createElement('span');
  circle.style.width = circle.style.height = size + 'px';
  circle.style.left = (e.clientX - rect.left - size / 2) + 'px';
  circle.style.top = (e.clientY - rect.top - size / 2) + 'px';
  circle.classList.add('ripple');
  btn.appendChild(circle);
  setTimeout(() => circle.remove(), 700);
});
/* =====================================================
   14. FORMS → GOOGLE SHEET + WHATSAPP
   ===================================================== */
// opens WhatsApp in a new tab; falls back to the same tab if popups are blocked
function openWhatsApp(url) {
  const win = window.open(url, '_blank');
  if (!win) window.location.href = url;
}
// logs the message in the Google Sheet (a failure must not block WhatsApp)
function logToSheet(payload) {
  fetch(SHEET_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
  }).catch((err) => console.log('Sheet error:', err));
}
/* ---------- Contact form ---------- */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('cfName').value.trim();
    const phone = document.getElementById('cfPhone').value.trim();
    const email = document.getElementById('cfEmail').value.trim();
    const message = document.getElementById('cfMessage').value.trim();
    logToSheet({ name, phone, email, message });
    const text =
`مرحبًا بروبول، أنا ${name}
📱 الهاتف: ${phone}
${email ? `✉️ البريد: ${email}\n` : ''}📝 الرسالة: ${message}`;
    openWhatsApp(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`);
  });
}
/* ---------- Plan builder ("صمم باقتك") ---------- */
const planForm = document.getElementById('planForm');
if (planForm) {
  const visitsWrap = document.getElementById('pfVisitsWrap');
  const visitsSelect = document.getElementById('pfVisits');
  // "visits per month" only shows when the user picks multiple visits
  function syncVisits() {
    const type = planForm.querySelector('input[name="visitType"]:checked');
    const multi = !!type && type.value === 'multi';
    visitsWrap.hidden = !multi;
    visitsSelect.required = multi;
    if (!multi) visitsSelect.value = '';
  }
  planForm.querySelectorAll('input[name="visitType"]').forEach((r) => {
    r.addEventListener('change', syncVisits);
  });
  syncVisits();
  // the selected option's Arabic text (the message goes to the Arabic-speaking team)
  function arChoice(name) {
    const el = planForm.querySelector(`input[name="${name}"]:checked`);
    if (!el) return '';
    const span = el.closest('.pf-opt').querySelector('span');
    return span ? span.getAttribute('data-ar') : el.value;
  }
  planForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('pfName').value.trim();
    const phone = document.getElementById('pfPhone').value.trim();
    const size = document.getElementById('pfSize').value.trim();
    const depth = document.getElementById('pfDepth').value.trim();
    const area = document.getElementById('pfArea').value.trim();
    const ownership = arChoice('ownership');
    const cover = arChoice('cover');
    const visitType = arChoice('visitType');
    let visits = '';
    if (!visitsWrap.hidden && visitsSelect.selectedOptions[0]) {
      visits = visitsSelect.selectedOptions[0].getAttribute('data-ar');
    }
    const lines = [
      'مرحبًا بروبول، أرغب في تصميم باقة صيانة مخصصة:',
      `👤 الاسم: ${name}`,
      `📱 الهاتف: ${phone}`,
      `📐 حجم المسبح: ${size} م²`,
      `↕️ عمق المسبح: ${depth} متر`,
      `📍 المنطقة: ${area}`,
      `🏠 نوع العقار: ${ownership}`,
      `☀️ نوع المسبح: ${cover}`,
      `🔁 نوع الخدمة: ${visitType}`
    ];
    if (visits) lines.push(`📅 عدد الزيارات شهريًا: ${visits}`);
    const text = lines.join('\n');
    // same sheet fields as the contact form (name, phone, email, message)
    logToSheet({ name, phone, email: '', message: text });
    openWhatsApp(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`);
  });
}
/* =====================================================
   15. ABOUT SLIDER
   ===================================================== */
(function () {
  const slides = document.querySelectorAll('#aboutSlider img');
  if (slides.length < 2) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
  }, 4000);
})();
/* =====================================================
   16. PRELOADER
   ===================================================== */
// hides as soon as the page is ready (doesn't wait for images / videos)
function hidePreloader() {
  const p = document.getElementById('preloader');
  if (p) p.classList.add('hide');
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(hidePreloader, 400));
} else {
  setTimeout(hidePreloader, 400);
}
setTimeout(hidePreloader, 2500); // safety: hides after 2.5s at most, whatever happens
/* =====================================================
   17. INIT
   ===================================================== */
bindFaq();
injectFaqSchema();
applyLang(store.get('propool-lang') || document.documentElement.lang || 'ar');
applyTheme(store.get('propool-theme') || 'light');
