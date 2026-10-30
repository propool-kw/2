/* =====================================================
   PROPOOL — Services Page
   File: services.js
   (standalone: no other script needed on this page)
   ===================================================== */
(() => {
  "use strict";
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const nav = $("#mainNav");
  const menu = $("#menu");
  const navLinks = $("#navLinks");
  const backTop = $("#backTop");
  const jumpBar = $("#svcJump .container");
  const mobileQuery = window.matchMedia("(max-width: 1024px)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const scrollBehavior = () => (reduceMotion.matches ? "auto" : "smooth");
  /* ---------- 1) Mobile menu ---------- */
  function setMenu(open) {
    if (!menu || !navLinks) return;
    navLinks.classList.toggle("open", open);
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", open ? "إغلاق القائمة" : "فتح القائمة");
  }
  if (menu && navLinks) {
    menu.addEventListener("click", () => {
      setMenu(!navLinks.classList.contains("open"));
    });
    // close when a link is tapped
    navLinks.addEventListener("click", (e) => {
      if (e.target.closest("a")) setMenu(false);
    });
    // close when tapping outside the nav
    document.addEventListener("click", (e) => {
      if (nav && !nav.contains(e.target)) setMenu(false);
    });
    // close on Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
    });
    // reset when switching to desktop width
    mobileQuery.addEventListener("change", () => setMenu(false));
  }
  /* ---------- 2) Scroll: nav shadow + back-to-top ---------- */
  let ticking = false;
  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle("scrolled", y > 10);
    if (backTop) backTop.classList.toggle("is-visible", y > 400);
    ticking = false;
  }
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();
  if (backTop) {
    backTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: scrollBehavior() });
    });
  }
  /* ---------- 3) Quick-jump bar: highlight the section in view ---------- */
  const jumpLinks = $$('#svcJump a[href^="#"]');
  const sections = $$(".svc-item, #process, #care");
  function centerInJumpBar(link) {
    if (!jumpBar || jumpBar.scrollWidth <= jumpBar.clientWidth) return;
    const c = jumpBar.getBoundingClientRect();
    const l = link.getBoundingClientRect();
    const delta = l.left + l.width / 2 - (c.left + c.width / 2);
    jumpBar.scrollTo({ left: jumpBar.scrollLeft + delta, behavior: scrollBehavior() });
  }
  function setActive(id) {
    jumpLinks.forEach((a) => {
      const on = a.getAttribute("href") === "#" + id;
      a.classList.toggle("active", on);
      if (on) {
        a.setAttribute("aria-current", "true");
        centerInJumpBar(a);
      } else {
        a.removeAttribute("aria-current");
      }
    });
  }
  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -55% 0px" }
    );
    sections.forEach((s) => sectionObserver.observe(s));
  }
  /* ---------- 4) Internal links: smooth scroll (offset via CSS scroll-margin-top) ---------- */
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href").slice(1);
      const target = id && document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
      history.replaceState(null, "", "#" + id);
    });
  });
  /* ---------- 5) Card videos: play only while visible ---------- */
  const cardVideos = $$(".svc-image video");
  if (cardVideos.length && "IntersectionObserver" in window && !reduceMotion.matches) {
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const v = entry.target;
          if (entry.isIntersecting) {
            const play = v.play();
            if (play && play.catch) play.catch(() => {});
          } else {
            v.pause();
          }
        });
      },
      { threshold: 0.35 }
    );
    cardVideos.forEach((v) => videoObserver.observe(v));
  }
  /* ---------- 6) Pause CSS animations while off-screen (saves mobile battery) ---------- */
  if ("IntersectionObserver" in window) {
    const animObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-offscreen", !entry.isIntersecting);
        });
      },
      { rootMargin: "100px 0px" }
    );
    $$(".pool-flow, .svc-item, .svc-care-block").forEach((el) => animObserver.observe(el));
  }
  /* ---------- 7) WhatsApp buttons in service cards: prefill the service name ---------- */
  $$('.svc-item .btn[href*="whatsapp"]').forEach((a) => {
    const card = a.closest(".svc-item");
    const titleEl = card && $("h3", card);
    if (!titleEl) return;
    const fill = () => {
      const title = titleEl.textContent.trim();
      const url = new URL(a.href);
      url.searchParams.set("text", `مرحباً بروبول، أحتاج خدمة: ${title}`);
      a.href = url.toString();
    };
    fill();                            // ready as soon as the page opens
    a.addEventListener("click", fill); // refreshed again on click
  });
})();
/* ================= PROMO POPUP + BUBBLE ================= */
document.addEventListener('DOMContentLoaded', function(){
  const PROMO_KEY = 'propool-promo-seen';
  const PROMO_DELAY = 6000;          // ظهور النافذة (ملي ثانية)
  const BUBBLE_DELAY = 2500;         // ظهور الفقاعة لمن شاف العرض قبل كده
  const RESHOW_EACH_VISIT = false;   // true = النافذة تظهر مع كل زيارة جديدة
  const promo  = document.getElementById('promo');
  const bubble = document.getElementById('promoBubble');
  if(!promo || !bubble) return;
  const msg = 'مرحبًا بروبول، شفت عرض خصم 10% على أول زيارة صيانة وأرغب في الاستفادة منه.';
  document.getElementById('promoCta').href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(msg);
  let sessionSeen = false;
  try{ sessionSeen = !!sessionStorage.getItem(PROMO_KEY); }catch(e){}
  function showBubble(){ bubble.hidden = false; requestAnimationFrame(()=>bubble.classList.add('show')); }
  function hideBubble(){ bubble.classList.remove('show'); setTimeout(()=>{ bubble.hidden = true; }, 400); }
  function openPromo(){
    hideBubble();
    promo.hidden = false;
    requestAnimationFrame(()=>promo.classList.add('show'));
  }
  function closePromo(){
    promo.classList.remove('show');
    setTimeout(()=>{ promo.hidden = true; }, 300);
    store.set(PROMO_KEY, '1');
    try{ sessionStorage.setItem(PROMO_KEY, '1'); }catch(e){}
    showBubble();
  }
  const seenBefore = !!store.get(PROMO_KEY);
  const autoOpen = !seenBefore || (RESHOW_EACH_VISIT && !sessionSeen);
  if(autoOpen) setTimeout(openPromo, PROMO_DELAY);
  else setTimeout(showBubble, BUBBLE_DELAY);
  bubble.addEventListener('click', openPromo);
  document.getElementById('promoClose').addEventListener('click', closePromo);
  document.getElementById('promoCta').addEventListener('click', closePromo);
  promo.addEventListener('click', e=>{ if(e.target === promo) closePromo(); });
  document.addEventListener('keydown', e=>{ if(e.key === 'Escape' && !promo.hidden) closePromo(); });
});