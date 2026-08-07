/* ============================================================
   BEEGOLD · GALLERY SCRIPT
   - Reveal-on-scroll for each frame
   - Filter tab (segmented + live counts) by style name
   - Full-screen lightbox with prev/next/close, swipe, keyboard
   - Hairstyle name shown ONLY in the lightbox (nameplate + bar)
   ============================================================ */

(() => {
  'use strict';

  document.body.classList.add('is-loaded');
  document.body.classList.remove('loading');

  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  const allFrames = () => Array.from(grid.querySelectorAll('.gframe'));

  /* ---------- 1. REVEAL ON SCROLL ---------- */
  let io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });
    allFrames().forEach(el => io.observe(el));
  } else {
    allFrames().forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- 2. FILTER TAB ---------- */
  // key -> substring to match in the style name (null = show everything)
  const FILTERS = { all: null, knotless: 'knotless', boho: 'boho', fulani: 'fulani', twist: 'twist', feedin: 'feed-in', french: 'french', ponytail: 'ponytail' };
  const styleOf = (fr) => (fr.dataset.style || '').toLowerCase();
  const matches = (fr, key) => key === 'all' || styleOf(fr).includes(FILTERS[key]);

  const chips = Array.from(document.querySelectorAll('.gchip'));

  // Fill live counts
  chips.forEach(chip => {
    const key = chip.dataset.filter;
    const n = allFrames().filter(fr => matches(fr, key)).length;
    const ct = chip.querySelector('.gchip__ct');
    if (ct) ct.textContent = n;
  });

  function applyFilter(key) {
    allFrames().forEach(fr => {
      const show = matches(fr, key);
      fr.style.display = show ? '' : 'none';
      if (show) fr.classList.add('is-visible'); // ensure revealed when shown
    });
    chips.forEach(c => c.classList.toggle('is-active', c.dataset.filter === key));
  }

  chips.forEach(chip => {
    chip.addEventListener('click', () => applyFilter(chip.dataset.filter));
  });

  /* ---------- 3. LIGHTBOX ---------- */
  const lb       = document.getElementById('lightbox');
  const lbImg    = document.getElementById('lbImg');
  const lbPlate  = document.getElementById('lbPlate');
  const lbCap    = document.getElementById('lbCap');
  const lbCount  = document.getElementById('lbCount');
  const lbClose  = document.getElementById('lbClose');
  const lbPrev   = document.getElementById('lbPrev');
  const lbNext   = document.getElementById('lbNext');
  const lbStage  = document.getElementById('lbStage');
  const lbSpinner= document.getElementById('lbSpinner');
  if (!lb || !lbImg) return;

  // Only the currently-visible (filtered) frames are navigable.
  function frames() { return allFrames().filter(fr => fr.style.display !== 'none'); }
  let current = 0;

  function dataFor(i) {
    const fr = frames()[i];
    if (!fr) return null;
    const img = fr.querySelector('img');
    return { src: img ? img.src : '', alt: img ? img.alt : '', name: fr.dataset.style || '' };
  }

  function setStage(i) {
    const d = dataFor(i);
    if (!d) return;
    lbImg.classList.remove('is-in');
    lbImg.style.opacity = '0';
    if (lbSpinner) lbSpinner.style.display = 'block';
    if (lbPlate) lbPlate.textContent = d.name;
    lbCap.textContent = d.name;
    lbCount.textContent = `${i + 1} / ${frames().length}`;

    const probe = new Image();
    probe.onload = () => {
      lbImg.src = d.src; lbImg.alt = d.alt;
      requestAnimationFrame(() => {
        if (lbSpinner) lbSpinner.style.display = 'none';
        lbImg.style.opacity = ''; lbImg.classList.add('is-in');
      });
    };
    probe.onerror = () => {
      if (lbSpinner) lbSpinner.style.display = 'none';
      lbImg.alt = 'Image failed to load'; lbImg.style.opacity = '1';
    };
    probe.src = d.src;
    setTimeout(() => {
      if (lbImg.getAttribute('src') !== d.src) {
        lbImg.src = d.src; lbImg.alt = d.alt;
        if (lbSpinner) lbSpinner.style.display = 'none';
        lbImg.style.opacity = '1'; lbImg.classList.add('is-in');
      }
    }, 250);
  }

  function openLB(i) {
    current = i; setStage(current);
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLB() {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  function next() { const n = frames().length; if (!n) return; current = (current + 1) % n; setStage(current); }
  function prev() { const n = frames().length; if (!n) return; current = (current - 1 + n) % n; setStage(current); }

  grid.addEventListener('click', (e) => {
    const fr = e.target.closest('.gframe');
    if (!fr || fr.style.display === 'none') return;
    const i = frames().indexOf(fr);     // index within the visible set
    if (i >= 0) openLB(i);
  });

  lbClose.addEventListener('click', (e) => { e.stopPropagation(); closeLB(); });
  lbNext.addEventListener('click',  (e) => { e.stopPropagation(); next(); });
  lbPrev.addEventListener('click',  (e) => { e.stopPropagation(); prev(); });

  lb.addEventListener('click', (e) => { if (e.target === lb || e.target === lbStage) closeLB(); });

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('is-open')) return;
    if (e.key === 'Escape')          closeLB();
    else if (e.key === 'ArrowRight') next();
    else if (e.key === 'ArrowLeft')  prev();
  });

  let touchX = 0;
  lbStage.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
  lbStage.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) { dx < 0 ? next() : prev(); }
  }, { passive: true });
})();
