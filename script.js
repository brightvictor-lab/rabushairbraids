/* ============================================================
   BEEGOLD · SITE SCRIPT
   Loader · Particles · Scroll · Nav · Reveals
   Works safely on pages with or without the loader.
   ============================================================ */

(() => {
  'use strict';

  /* ---------- 1. LOADER (only runs if loader DOM exists) ---------- */
  const loader      = document.getElementById('loader');
  const loaderFill  = document.getElementById('loaderFill');
  const loaderPct   = document.getElementById('loaderPct') || document.getElementById('loaderPercent');
  const LOADER_MS   = 3500;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function runLoader() {
    if (!loader) {
      document.body.classList.remove('loading');
      document.body.classList.add('is-loaded');
      buildParticles();
      return;
    }
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const p = Math.min(elapsed / LOADER_MS, 1);
      const pct = Math.floor(easeOutCubic(p) * 100);
      if (loaderFill) loaderFill.style.width = pct + '%';
      if (loaderPct)  loaderPct.textContent  = pct + '%';
      if (p < 1) requestAnimationFrame(tick);
      else {
        if (loaderFill) loaderFill.style.width = '100%';
        if (loaderPct)  loaderPct.textContent  = '100%';
        loader.classList.add('is-complete');
        setTimeout(finishLoader, 350);
      }
    }
    requestAnimationFrame(tick);
  }

  function finishLoader() {
    loader.classList.add('is-done');
    document.body.classList.remove('loading');
    document.body.classList.add('is-loaded');
    setTimeout(() => {
      loader.style.display = 'none';
      buildParticles();
    }, 900);
  }

  if (loader) {
    document.body.classList.add('loading');
    window.addEventListener('load', () => requestAnimationFrame(runLoader));
    setTimeout(() => {
      if (!document.body.classList.contains('is-loaded')) runLoader();
    }, 800);
  } else {
    document.body.classList.add('is-loaded');
    window.addEventListener('load', buildParticles);
  }


  /* ---------- 2. HERO PARTICLES (gold dust) ---------- */
  function buildParticles() {
    const host = document.getElementById('particles') || document.getElementById('heroParticles');
    if (!host || host.dataset.built === '1') return;
    host.dataset.built = '1';
    const count = window.innerWidth < 768 ? 18 : 38;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'particle';
      const left = Math.random() * 100;
      const delay = Math.random() * 20;
      const dur = 14 + Math.random() * 16;
      const drift = (Math.random() - 0.5) * 120;
      const size = 1 + Math.random() * 2;
      const op = 0.3 + Math.random() * 0.5;
      p.style.left = left + '%';
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.setProperty('--delay', `-${delay}s`);
      p.style.setProperty('--dur', dur + 's');
      p.style.setProperty('--drift', drift + 'px');
      p.style.setProperty('--maxOp', op);
      frag.appendChild(p);
    }
    host.appendChild(frag);
  }


  /* ---------- 3. SCROLL REVEALS ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal-on-scroll').forEach(el => io.observe(el));

  // stagger groups (auto-set --d if missing)
  document.querySelectorAll('.signature__grid, .services-list__items, .footer__cols, .services-grid, .gallery-grid')
    .forEach(group => {
      [...group.children].forEach((child, i) => {
        const existing = child.style.getPropertyValue('--d');
        if (!existing) child.style.setProperty('--d', ((i % 12) * 0.05) + 's');
      });
    });


  /* ---------- 4. NAV — scroll state & drawer ---------- */
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const drawer = document.getElementById('navDrawer');

  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (burger && drawer) {
    burger.addEventListener('click', () => {
      const open = drawer.classList.toggle('is-open');
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open);
      drawer.setAttribute('aria-hidden', !open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        drawer.classList.remove('is-open');
        burger.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }


  /* ---------- 5. SMOOTH ANCHOR SCROLL ---------- */
  document.querySelectorAll('a[href*="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href) return;
      const hashIndex = href.indexOf('#');
      if (hashIndex < 0) return;
      const id = href.slice(hashIndex);
      if (id.length < 2) return;
      // only intercept same-page anchors
      const before = href.slice(0, hashIndex);
      const isSame = before === '' || before === window.location.pathname.split('/').pop();
      if (!isSame) return;
      const tgt = document.querySelector(id);
      if (tgt) {
        e.preventDefault();
        const y = tgt.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    });
  });


  /* ---------- 6. PARALLAX-LITE on hero particles ---------- */
  const particlesHost = document.getElementById('particles') || document.getElementById('heroParticles');
  if (particlesHost && window.matchMedia('(min-width: 768px)').matches) {
    let raf;
    window.addEventListener('scroll', () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          particlesHost.style.transform = `translateY(${y * 0.25}px)`;
        }
        raf = null;
      });
    }, { passive: true });
  }
})();


/* ============================================================
   BEEGOLD · REVIEWS SLIDESHOW (auto-advances every 5s)
   ============================================================ */
(() => {
  'use strict';
  const slider = document.getElementById('reviewsSlider');
  if (!slider) return;

  const slides = [...slider.querySelectorAll('.review-slide')];
  const dotsHost = document.getElementById('revDots');
  const prevBtn = document.getElementById('revPrev');
  const nextBtn = document.getElementById('revNext');
  if (!slides.length) return;

  const INTERVAL = 5000;
  let current = 0;
  let timer = null;

  // Build dots
  const dots = slides.map((_, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.className = 'reviews__dot' + (i === 0 ? ' is-active' : '');
    d.setAttribute('role', 'tab');
    d.setAttribute('aria-label', `Review ${i + 1}`);
    d.addEventListener('click', () => { go(i); restart(); });
    dotsHost && dotsHost.appendChild(d);
    return d;
  });

  function go(n) {
    current = (n + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
  }
  function next() { go(current + 1); }
  function prev() { go(current - 1); }

  function start() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    timer = setInterval(next, INTERVAL);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function restart() { stop(); start(); }

  nextBtn && nextBtn.addEventListener('click', () => { next(); restart(); });
  prevBtn && prevBtn.addEventListener('click', () => { prev(); restart(); });

  // Pause while the visitor is reading / hovering / focusing
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);
  slider.addEventListener('focusin', stop);
  slider.addEventListener('focusout', start);

  // Pause when the tab is hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else restart();
  });

  start();
})();


/* ============================================================
   BEEGOLD · SERVICES KNOTLESS ACCORDION
   ============================================================ */
(() => {
  'use strict';
  document.querySelectorAll('.svc-acc').forEach(acc => {
    const head = acc.querySelector('.svc-acc__head');
    if (!head) return;
    head.addEventListener('click', () => {
      const open = acc.classList.toggle('is-open');
      head.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
})();

/* ============================================================
   SIGNATURE SHOWCASE · Editorial Runway — pure ambient slider.
   No arrows, no pause, no swipe: it simply flows every 3s.
   ============================================================ */
(function () {
  'use strict';
  var stage = document.getElementById('rwStage');
  if (!stage) return;

  var COUNT = 10;
  var NAMES = ["Large Big Knotless", "Lemonade with Knotless", "Criss-Cross Braids", "Cassie Boho Knotless Braids", "Feed-In Braids to the Back", "Boho Knotless", "Cassie Braids", "Half and Half", "Natural Twist", "Stitch Braids"];
  var WIPE_MS = 950;   // must match the rwWipe animation duration in CSS
  var HOLD_MS = 3000;  // time each slide stays on screen

  var ghost   = document.getElementById('rwGhost');
  var styleEl = document.getElementById('rwStyle');
  var fill    = document.getElementById('rwFill');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- build slides: eager + sync decode so a slide is NEVER
     revealed before its pixels exist (this was the "blink") ---- */
  var imgs = [];
  for (var i = 0; i < COUNT; i++) {
    var im = document.createElement('img');
    im.src = 'image/svc-' + (i + 1) + '.jpg';
    im.alt = NAMES[i] + ' \u2014 Rabus Hair';
    im.loading = 'eager';
    im.decoding = 'sync';
    im.draggable = false;
    imgs.push(im);
    stage.appendChild(im);
  }

  var idx = 0;
  var timer = null;
  var hideTimer = null;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function restartFill() {
    if (!fill) return;
    fill.classList.remove('run');
    void fill.offsetWidth;
    fill.classList.add('run');
  }

  function show(n) {
    var prev = idx;
    idx = ((n % COUNT) + COUNT) % COUNT;
    if (idx === prev) return;

    var incoming = imgs[idx];
    var outgoing = imgs[prev];

    clearTimeout(hideTimer);

    if (reduced) {
      imgs.forEach(function (im) { im.classList.remove('on', 'was'); });
      incoming.classList.add('on');
    } else {
      /* 1. Pin the incoming slide to the CLIPPED start state *before*
            it becomes visible, then force a reflow. Without this the
            browser can paint one un-clipped frame = the flash. */
      incoming.classList.remove('on', 'was');
      incoming.style.clipPath = 'inset(0 0 0 100%)';
      incoming.style.webkitClipPath = 'inset(0 0 0 100%)';
      incoming.style.transform = 'scale(1.08)';
      void incoming.offsetWidth;

      /* 2. Outgoing stays fully visible *underneath* for the whole
            wipe, so there is never a transparent gap. */
      outgoing.classList.remove('on');
      outgoing.classList.add('was');

      /* 3. Hand control to the CSS animation. */
      incoming.style.clipPath = '';
      incoming.style.webkitClipPath = '';
      incoming.style.transform = '';
      incoming.classList.add('on');

      /* 4. Only once the wipe has finished do we drop the old slide. */
      hideTimer = setTimeout(function () {
        for (var j = 0; j < COUNT; j++) {
          if (j !== idx) imgs[j].classList.remove('was', 'on');
        }
      }, WIPE_MS + 40);
    }

    if (ghost) ghost.textContent = pad(idx + 1);

    if (reduced) {
      if (styleEl) styleEl.textContent = NAMES[idx];
    } else if (styleEl) {
      styleEl.classList.add('swap');
      setTimeout(function () {
        styleEl.textContent = NAMES[idx];
        styleEl.classList.remove('swap');
      }, 300);
    }

    restartFill();
  }

  function startRotation() {
    if (timer || reduced) return;
    restartFill();
    timer = setInterval(function () { show(idx + 1); }, HOLD_MS);
  }

  /* ---- wait for every slide to be decoded before the first move,
     so no slide can ever appear blank mid-wipe ---- */
  function whenReady(im) {
    if (im.decode) return im.decode().catch(function () {});
    if (im.complete) return Promise.resolve();
    return new Promise(function (res) {
      im.addEventListener('load', res, { once: true });
      im.addEventListener('error', res, { once: true });
    });
  }

  imgs[0].classList.add('on');
  if (ghost) ghost.textContent = '01';
  if (styleEl) styleEl.textContent = NAMES[0];

  var all = imgs.map(whenReady);
  var kickoff = Promise.all(all);
  // never block longer than 6s on a slow connection
  Promise.race([kickoff, new Promise(function (r) { setTimeout(r, 6000); })])
    .then(startRotation);
})();

/* Reviews: with a large set of slides, swap the dot row for a
   compact counter so it never overflows on mobile. */
(function () {
  'use strict';
  var host = document.getElementById('revDots');
  var slides = document.querySelectorAll('.review-slide');
  if (!host || slides.length <= 8) return;
  var mo = new MutationObserver(sync);
  function sync() {
    var active = document.querySelector('.review-slide.is-active');
    if (!active) return;
    var i = Array.prototype.indexOf.call(slides, active);
    host.innerHTML = '<span style="font-family:\'Cormorant Garamond\',serif;font-style:italic;' +
      'font-size:15px;letter-spacing:.18em;color:var(--c-gold-bright,#e6c989)">' +
      (i + 1) + ' / ' + slides.length + '</span>';
  }
  slides.forEach(function (s) { mo.observe(s, { attributes: true, attributeFilter: ['class'] }); });
  sync();
})();
