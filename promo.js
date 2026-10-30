/* =====================================================
   PROPOOL — promo.js (نافذة العرض + الفقاعة)
   مستقل بالكامل: سطر واحد بس في أي صفحة (<script src="promo.js" defer></script>) وبيبني الشكل والمحتوى بنفسه
   ===================================================== */
(function () {
  'use strict';

  /* ---------- الإعدادات: عدّل العرض من هنا ---------- */
  var CFG = {
    key: 'propool-promo-seen',
    delay: 6000,              // ظهور النافذة لأول مرة (ملي ثانية)
    bubbleDelay: 2500,        // ظهور الفقاعة لمن شاف العرض قبل كده
    reshowEachVisit: false,   // true = النافذة تظهر مع كل زيارة جديدة
    whatsapp: '96555571687',
    ar: {
      tag: 'عرض خاص',
      title: 'خصم 10% على أول زيارة صيانة',
      text: 'للعملاء الجدد فقط، احجز زيارتك الآن عبر واتساب.',
      cta: 'احصل على الخصم',
      bubble: 'خصم 10%',
      close: 'إغلاق',
      bubbleLabel: 'عرض الخصم',
      msg: 'مرحبًا بروبول، شفت عرض خصم 10% على أول زيارة صيانة وأرغب في الاستفادة منه.'
    },
    en: {
      tag: 'Special Offer',
      title: '10% off your first maintenance visit',
      text: 'New customers only. Book your visit now on WhatsApp.',
      cta: 'Get the discount',
      bubble: '10% OFF',
      close: 'Close',
      bubbleLabel: 'View offer',
      msg: ''
    }
  };

  /* ---------- الشكل (CSS) — مدموج هنا علشان الملف يشتغل لوحده ---------- */
  var CSS = `
.promo{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;background:rgba(0,0,0,.55);opacity:0;transition:opacity .3s}
.promo[hidden]{display:none}
.promo.show{opacity:1}
.promo-box{position:relative;max-width:380px;width:100%;padding:32px 24px 26px;text-align:center;border-radius:20px;background:var(--surface,#fff);color:var(--text,#0a141d);box-shadow:0 30px 80px -20px rgba(0,0,0,.6);transform:translateY(16px);transition:transform .3s;font-family:inherit}
.promo.show .promo-box{transform:none}
.promo-close{position:absolute;top:8px;inset-inline-start:10px;width:44px;height:44px;border:0;background:none;font-size:28px;line-height:1;color:inherit;cursor:pointer}
.promo-tag{display:inline-block;padding:4px 14px;margin-bottom:10px;border-radius:999px;background:#c9a24a;color:#fff;font-size:13px;font-weight:700}
.promo-box h3{margin:6px 0 8px;font-size:22px}
.promo-box p{margin:0 0 20px;opacity:.8}
.promo-cta{display:inline-block;padding:13px 30px;border-radius:999px;background:linear-gradient(135deg,#0b4a8a,#00a8d6);color:#fff;font-weight:700;text-decoration:none}

.promo-bubble{position:fixed;left:16px;bottom:150px;z-index:9000;width:74px;height:74px;padding:0;border-radius:50%;border:2px solid rgba(255,255,255,.75);color:#fff;font:800 14px/1.2 inherit;font-family:inherit;cursor:pointer;
  background:radial-gradient(circle at 30% 25%,rgba(255,255,255,.55),rgba(255,255,255,0) 38%),linear-gradient(135deg,#0b4a8a,#00a8d6);
  box-shadow:0 10px 25px -8px rgba(0,110,170,.75);opacity:0;scale:.6;transition:opacity .4s,scale .4s;animation:pbFloat 4s ease-in-out infinite}
.promo-bubble[hidden]{display:none}
.promo-bubble.show{opacity:1;scale:1}
.promo-bubble::before,.promo-bubble::after{content:"";position:absolute;inset:-2px;border-radius:50%;border:2px solid rgba(0,168,214,.55);animation:pbRipple 2.8s ease-out infinite;pointer-events:none}
.promo-bubble::after{animation-delay:1.4s}
@keyframes pbFloat{0%,100%{translate:0 0}50%{translate:0 -8px}}
@keyframes pbRipple{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.9);opacity:0}}
@media (prefers-reduced-motion:reduce){.promo-bubble,.promo-bubble::before,.promo-bubble::after{animation:none}}
`;

  function get(s, k) { try { return s.getItem(k); } catch (e) { return null; } }
  function set(s, k, v) { try { s.setItem(k, v); } catch (e) {} }

  function init() {
    if (document.getElementById('promo')) return;           // لو الكود موجود في الصفحة أصلًا
    if (!document.getElementById('promoStyle')) {
      var st = document.createElement('style');
      st.id = 'promoStyle';
      st.textContent = CSS;
      document.head.appendChild(st);
    }
    var lang = document.documentElement.lang === 'en' ? 'en' : 'ar';
    var T = CFG[lang], A = CFG.ar, E = CFG.en;

    var wrap = document.createElement('div');
    wrap.innerHTML =
      '<div class="promo" id="promo" role="dialog" aria-modal="true" aria-labelledby="promoTitle" hidden>' +
        '<div class="promo-box">' +
          '<button class="promo-close" id="promoClose" type="button" aria-label="' + T.close + '">&times;</button>' +
          '<span class="promo-tag" data-ar="' + A.tag + '" data-en="' + E.tag + '">' + T.tag + '</span>' +
          '<h3 id="promoTitle" data-ar="' + A.title + '" data-en="' + E.title + '">' + T.title + '</h3>' +
          '<p data-ar="' + A.text + '" data-en="' + E.text + '">' + T.text + '</p>' +
          '<a class="promo-cta" id="promoCta" href="#" target="_blank" rel="noopener" data-ar="' + A.cta + '" data-en="' + E.cta + '">' + T.cta + '</a>' +
        '</div>' +
      '</div>' +
      '<button class="promo-bubble" id="promoBubble" type="button" hidden aria-label="' + T.bubbleLabel + '">' +
        '<span data-ar="' + A.bubble + '" data-en="' + E.bubble + '">' + T.bubble + '</span>' +
      '</button>';
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);

    var promo = document.getElementById('promo');
    var bubble = document.getElementById('promoBubble');
    document.getElementById('promoCta').href =
      'https://wa.me/' + CFG.whatsapp + '?text=' + encodeURIComponent(A.msg);   // الرسالة بالعربي دايمًا

    function showBubble() { bubble.hidden = false; requestAnimationFrame(function () { bubble.classList.add('show'); }); }
    function hideBubble() { bubble.classList.remove('show'); setTimeout(function () { bubble.hidden = true; }, 400); }
    function openPromo() {
      hideBubble();
      promo.hidden = false;
      requestAnimationFrame(function () { promo.classList.add('show'); });
    }
    function closePromo() {
      promo.classList.remove('show');
      setTimeout(function () { promo.hidden = true; }, 300);
      set(localStorage, CFG.key, '1');
      set(sessionStorage, CFG.key, '1');
      showBubble();
    }

    var seenBefore = !!get(localStorage, CFG.key);
    var sessionSeen = !!get(sessionStorage, CFG.key);
    var autoOpen = !seenBefore || (CFG.reshowEachVisit && !sessionSeen);
    if (autoOpen) setTimeout(openPromo, CFG.delay);
    else setTimeout(showBubble, CFG.bubbleDelay);

    bubble.addEventListener('click', openPromo);
    document.getElementById('promoClose').addEventListener('click', closePromo);
    document.getElementById('promoCta').addEventListener('click', closePromo);
    promo.addEventListener('click', function (e) { if (e.target === promo) closePromo(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !promo.hidden) closePromo(); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
