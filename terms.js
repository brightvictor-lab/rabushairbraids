/* ============================================================
   TERMS & CONDITIONS — page enhancements
   Smooth reveal + nav drawer wiring (shared markup with the site).
   ============================================================ */
(function () {
  'use strict';

  // Reveal the document card on load (no scroll gating here — full read page)
  var doc = document.querySelector('.terms-doc');
  if (doc) requestAnimationFrame(function () { doc.classList.add('is-visible'); });

  // Nav drawer toggle (mirrors the site's hamburger behavior)
  var burger = document.getElementById('navBurger') || document.querySelector('.nav__burger');
  var drawer = document.getElementById('navDrawer');
  var scrim  = document.querySelector('.nav__scrim');
  function openDrawer() { if (drawer) drawer.classList.add('is-open'); if (scrim) scrim.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
  function closeDrawer() { if (drawer) drawer.classList.remove('is-open'); if (scrim) scrim.classList.remove('is-open'); document.body.style.overflow = ''; }
  if (burger) burger.addEventListener('click', openDrawer);
  var closeBtn = document.getElementById('navDrawerClose') || document.querySelector('.nav__drawer-close');
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (scrim) scrim.addEventListener('click', closeDrawer);

  // Solidify nav on scroll
  var nav = document.getElementById('nav') || document.querySelector('.nav');
  if (nav) {
    var onScroll = function () { nav.classList.toggle('is-scrolled', window.scrollY > 20); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
