/* =====================================================
   PROPOOL — Projects Page
   File: projects.js
   ===================================================== */
(function () {
  'use strict';
  var nav = document.getElementById('mainNav');
  var menu = document.getElementById('menu');
  var links = document.getElementById('navLinks');
  var backTop = document.getElementById('backTop');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* ---------- 1) Mobile menu ---------- */
  function setMenu(open) {
    if (!menu || !links) return;
    menu.classList.toggle('open', open);
    links.classList.toggle('open', open);
    menu.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
  }
  if (menu && links) {
    menu.addEventListener('click', function () {
      setMenu(!links.classList.contains('open'));
    });
    // close when a link is tapped
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    // close when tapping outside the nav
    document.addEventListener('click', function (e) {
      if (nav && !nav.contains(e.target)) setMenu(false);
    });
    // close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }
  /* ---------- 2) Scroll: header shadow + back-to-top ---------- */
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) nav.classList.toggle('scrolled', y > 20);
    if (backTop) backTop.classList.toggle('is-visible', y > 400);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();
  if (backTop) {
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }
  /* ---------- 3) Project videos: play only while visible ---------- */
  var videos = document.querySelectorAll('.prj-media video');
  if (videos.length && 'IntersectionObserver' in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          if (v.preload === 'none') v.preload = 'metadata';
          var p = v.play();
          if (p && p.catch) p.catch(function () {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.35 });
    videos.forEach(function (v) { observer.observe(v); });
  }
})();