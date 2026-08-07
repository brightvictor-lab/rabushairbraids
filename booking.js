/* ============================================================
   BEEGOLD · BOOKING SCRIPT
   Loader · Terms gate · Sign-in · 5-step booking (Booksy-style)
   ============================================================ */

(() => {
  'use strict';

  /* ---------- 0. BACKEND INIT (Supabase) ---------- */
  const CFG = window.RH_CONFIG || {};
  let supabase = null;
  try {
    if (window.supabase && CFG.SUPABASE) {
      supabase = window.supabase.createClient(CFG.SUPABASE.url, CFG.SUPABASE.anonKey, {
        auth: {
          flowType: 'pkce',           // PKCE: more reliable on mobile than implicit
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true,
          storage: window.localStorage
        }
      });
    }
  } catch (e) { console.warn('Supabase init failed:', e); }


  /* ---------- BEEGOLD SERVICES (name, price, hours) ----------
     Prices shown as "$NNN up" — minimum starting price.
     'price' = numeric starting value (used for calculations + emails).
     'priceDisplay' = user-facing label.
     Knotless Braids is offered in 4 sizes, each individually bookable.
  */
  const ALL_SERVICES = [
    // FEATURED (shown on homepage)
    { name: "Knotless Braids — Jumbo",       price: 130, priceDisplay: "$130 up", hours: 5, hoursText: "2–5 hrs", category: "Knotless" },
    { name: "Knotless Braids — Large",       price: 160, priceDisplay: "$160 up", hours: 5, hoursText: "3–5 hrs", category: "Knotless" },
    { name: "Knotless Braids — Medium",      price: 180, priceDisplay: "$180 up", hours: 6, hoursText: "4–6 hrs", category: "Knotless" },
    { name: "Knotless Braids — Small/Medium",price: 200, priceDisplay: "$200 up", hours: 7, hoursText: "4–7 hrs", category: "Knotless" },
    { name: "Box Braids",                    price: 180, priceDisplay: "$180 up", hours: 6, hoursText: "4–6 hrs", category: "Braids" },
    { name: "French Curls",                  price: 180, priceDisplay: "$180 up", hours: 6, hoursText: "4–6 hrs", category: "Braids" },
    { name: "Goddess Braids",                price: 200, priceDisplay: "$200 up", hours: 4, category: "Braids" },
    { name: "Fulani Braids",                 price: 160, priceDisplay: "$160 up", hours: 6, hoursText: "4–6 hrs", category: "Braids" },
    { name: "Senegalese Twists",             price: 200, priceDisplay: "$200 up", hours: 6, hoursText: "4–6 hrs", category: "Twists" },
    { name: "Boho Braids",                   price: 200, priceDisplay: "$200 up", hours: 6, hoursText: "4–6 hrs", category: "Braids" },
    { name: "Crochet",                       price: 100, priceDisplay: "$100 up", hours: 2, hoursText: "2 hrs", category: "Twists" },
    { name: "Lemonade Braids",               price: 160, priceDisplay: "$160 up", hours: 4, hoursText: "2–4 hrs", category: "Braids" },
    { name: "Cornrows",                       price: 60,  priceDisplay: "$60 up",  hours: 2, hoursText: "1–2 hrs", category: "Braids" },
    { name: "Cornrow Braids",                price: 160, priceDisplay: "$160 up", hours: 4, hoursText: "1–4 hrs", category: "Braids" },
    { name: "Feed-In Braids",                 price: 100, priceDisplay: "$100 up", hours: 3, hoursText: "1–3 hrs", category: "Braids" },
    { name: "Stitch Braids",                  price: 120, priceDisplay: "$120 up", hours: 4, hoursText: "1–4 hrs", category: "Braids" },
    { name: "Tribal Braids",                 price: 180, priceDisplay: "$180 up", hours: 6, hoursText: "4–6 hrs", category: "Braids" },
    { name: "Ponytail",                      price: 150, priceDisplay: "$150 up", hours: 3, hoursText: "2–3 hrs", category: "Styling" },
    { name: "Kinky",                          price: 160, priceDisplay: "$160",    hours: 6, hoursText: "4–6 hrs", category: "Twists" },
    { name: "Hair Takedown",                  price: 50,  priceDisplay: "$50 up",  hours: 3, hoursText: "2–3 hrs", category: "Care" },
    { name: "Pre-Parting",                    price: 75,  priceDisplay: "$75 up",  hours: 1, hoursText: "1 hr", category: "Care" },
    { name: "Touch Ups",                      price: 80,  priceDisplay: "$80 up",  hours: 2, hoursText: "2 hrs", category: "Care" },
    { name: "Island Twist",                   price: 180, priceDisplay: "$180 up", hours: 6, hoursText: "4–6 hrs", category: "Twists" },
    { name: "Two Strand Twist",               price: 80,  priceDisplay: "$80 up",  hours: 3, hoursText: "2–3 hrs", category: "Twists" },
    { name: "Bob Box Braids",                 price: 170, priceDisplay: "$170 up", hours: 4, category: "Braids" },
    { name: "Jumbo Boho Knotless",            price: 150, priceDisplay: "$150 up", hours: 4, hoursText: "4 hrs", category: "Knotless" },
    { name: "Boho Knotless Braids",           price: 200, priceDisplay: "$200 up", hours: 6, hoursText: "4–6 hrs", category: "Knotless" },
    { name: "Quick Weave Sew In",             price: 120, priceDisplay: "$120 up", hours: 3, hoursText: "3 hrs", category: "Styling" },
    { name: "Micro Box Braids",               price: 250, priceDisplay: "$250 up", hours: 8, category: "Braids" },
    { name: "Boho Knotless Bob",              price: 200, priceDisplay: "$200 up", hours: 4, hoursText: "4 hrs", category: "Knotless" },
    { name: "Jumbo Knotless",                 price: 150, priceDisplay: "$150 up", hours: 5, hoursText: "2–5 hrs", category: "Knotless" },
    { name: "Miracle Knotless Braids",        price: 160, priceDisplay: "$160 up", hours: 5, category: "Knotless" }
  ];
  const formatHours = (h) => `${h} hrs`;
  // Prefer the explicit range text (e.g. '4\u20136 hrs') when a service has one.
  const durationText = (s) => (s && s.hoursText) ? s.hoursText : formatHours(s && s.hours);

  // Initialise EmailJS ONCE (not on every submit) so sending is instant.
  try {
    const _ek = CFG.EMAILJS && CFG.EMAILJS.salon && CFG.EMAILJS.salon.publicKey;
    if (window.emailjs && _ek && !String(_ek).startsWith('PASTE_')) emailjs.init({ publicKey: _ek });
  } catch (e) {}


  /* ---------- 1. LUXURY LOADER ---------- */
  const loader     = document.getElementById('loader');
  const loaderFill = document.getElementById('loaderFill');
  const loaderPct  = document.getElementById('loaderPercent');
  const LOADER_MS  = 2500;

  // If we're returning from Google OAuth, skip the loader entirely.
  // PKCE flow uses ?code= in query; implicit uses #access_token= in hash.
  // Also skip if there's already a Supabase session in localStorage (returning user).
  function hasStoredSession() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('sb-') && k.endsWith('-auth-token')) return true;
      }
    } catch(e){}
    return false;
  }
  const isOAuthReturn =
    (window.location.search && /[?&](code|error)=/.test(window.location.search)) ||
    (window.location.hash && window.location.hash.includes('access_token')) ||
    hasStoredSession();

  document.body.classList.add('loading');
  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function runLoader() {
    const start = performance.now();
    function tick(now) {
      const elapsed = now - start;
      const p = Math.min(elapsed / LOADER_MS, 1);
      const eased = easeOutCubic(p);
      const pct = Math.floor(eased * 100);
      if (loaderFill) loaderFill.style.width = pct + '%';
      if (loaderPct)  loaderPct.textContent  = pct + '%';
      if (p < 1) requestAnimationFrame(tick);
      else {
        loader.classList.add('is-complete');
        setTimeout(finish, 350);
      }
    }
    requestAnimationFrame(tick);
  }
  function finish() {
    loader.classList.add('is-done');
    document.body.classList.remove('loading');
    document.body.classList.add('is-loaded');
    setTimeout(() => { loader.style.display = 'none'; }, 900);
  }

  if (isOAuthReturn) {
    // Skip loader; we want the OAuth restore to happen as fast as possible.
    if (loader) loader.style.display = 'none';
    document.body.classList.remove('loading');
    document.body.classList.add('is-loaded');
  } else {
    window.addEventListener('load', () => requestAnimationFrame(runLoader));
    setTimeout(() => {
      if (!document.body.classList.contains('is-loaded')) runLoader();
    }, 800);
  }


  /* ---------- 2. STATE ---------- */
  const state = {
    step: 0,
    termsAccepted: false,
    category: null,      // 'adult' | 'kids'
    weave: 'with',       // kids only: 'with' | 'without'
    signedIn: false,
    // captured from Google sign-in (mocked) or empty for guest
    fullName: '',
    email: '',
    // user input
    phone: '',
    service: null,        // service object
    selectedDate: null,   // YYYY-MM-DD
    selectedTime: null    // "10:30 AM"
  };

  const steps     = [...document.querySelectorAll('.bstep')];
  const progress  = document.getElementById('bprogress');
  const progSteps = [...progress.querySelectorAll('.bprogress__step')];
  const progLines = [...progress.querySelectorAll('.bprogress__line')];


  /* ---------- 3. STEP NAVIGATION ---------- */
  /* ---------- KIDS MENU (two-price: with weave / without weave) ---------- */
  const KIDS_SERVICES = [
    { name: "Stitch Braids 6\u20138", withW: 95,  withoutW: 70,  hours: 3 },
    { name: "Freestyle Braids",       withW: 105, withoutW: 95,  hours: 3 },
    { name: "Ponytail",               withW: 110, withoutW: 100, hours: 3, hoursText: "2–3 hrs" },
    { name: "Lemonades",              withW: 115, withoutW: 100, hours: 4 },
    { name: "Knotless Medium",        withW: 140, withoutW: 95,  hours: 5 },
    { name: "Knotless Large",         withW: 115, withoutW: 75,  hours: 4 },
    { name: "Fulani",                 withW: 140, withoutW: 100, hours: 4 }
  ];

  const PROGRESS_FIRST_STEP = 2; // step 2 is "Service" — the first visible booking step
  const PROGRESS_LAST_STEP  = 6; // step 6 is "Success" (post-confirm) — progress hidden here

  function goTo(n) {
    // n may be 2.5 (the service sub-step). Use a numeric ceiling for guards.
    const nn = Math.floor(n);
    if (nn < 0 || nn > 6) return;
    if (nn >= 1 && !state.termsAccepted) return;
    if (nn > 1 && !state.signedIn) return;
    // Can't reach service/anything past category without choosing a category.
    if (n >= 2.5 && !state.category) return;
    state.step = n;

    steps.forEach(s => s.classList.remove('is-active'));
    const tgt = document.querySelector(`.bstep[data-step="${n}"]`);
    if (tgt) {
      tgt.classList.add('is-active');
      tgt.style.animation = 'none';
      void tgt.offsetWidth;
      tgt.style.animation = '';
    }

    // Show progress bar only for visible booking steps (Service..Review). Hide for Terms, SignIn, Success.
    if (nn < PROGRESS_FIRST_STEP || nn >= PROGRESS_LAST_STEP) {
      progress.classList.add('is-hidden');
    } else {
      progress.classList.remove('is-hidden');
      progSteps.forEach(ps => {
        const sn = parseInt(ps.dataset.step, 10);
        ps.classList.remove('is-active', 'is-done');
        if (sn === nn) ps.classList.add('is-active');
        if (sn < nn)   ps.classList.add('is-done');
      });
      // 5 visible steps mapped to data-step 2,3,4,5,6 (but 6 is success — only 4 lines between 2..5)
      // We have 4 lines between 5 visible steps (Service..Confirm)
      progLines.forEach((line, i) => {
        const completedLineIfStep = PROGRESS_FIRST_STEP + i + 1;
        if (nn >= completedLineIfStep) line.classList.add('is-filled');
        else line.classList.remove('is-filled');
      });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }


  /* ---------- 5. STEP 1 · SIGN IN (real Google via Supabase) ---------- */
  const googleBtn = document.getElementById('googleBtn');

  // DEMO MODE — active until the real Supabase + Google OAuth keys are added to
  // config.js. While on, the "Continue with Google" button runs a realistic demo
  // sign-in so the client can preview the full booking flow. It auto-switches OFF
  // the moment real keys are present (no code change needed).
  const DEMO_MODE = !supabase || !CFG.SUPABASE || String((CFG.SUPABASE || {}).url || '').includes('PASTE_');

  // Restore a Google session if the user is returning from the OAuth redirect.
  // Uses BOTH a one-shot getSession() AND onAuthStateChange listener so we never
  // miss the moment Supabase finishes parsing the URL hash (timing varies on mobile).
  let sessionHandled = false;

  function applySession(session, opts) {
    if (sessionHandled) return;
    if (!session || !session.user) return;
    sessionHandled = true;

    const u = session.user;
    state.signedIn = true;
    state.fullName = u.user_metadata?.full_name || u.user_metadata?.name || u.email || 'Client';
    state.email    = u.email || '';

    // Pick an avatar URL from Google profile if available
    const avatarUrl = u.user_metadata?.avatar_url || u.user_metadata?.picture || null;

    // Helper: first initial for avatars
    const initial = (state.fullName || state.email || '?').trim().charAt(0).toUpperCase();
    const firstName = (state.fullName || state.email || '').split(/\s+|@/)[0] || 'You';

    // Light up the Google profile chip in the nav.
    try {
      const navUser = document.getElementById('navUser');
      const navAvatar = document.getElementById('navAvatar');
      const navUserName = document.getElementById('navUserName');
      if (navUser) navUser.classList.remove('is-hidden');
      if (navAvatar) {
        if (avatarUrl) {
          navAvatar.textContent = '';
          navAvatar.style.backgroundImage = `url(${avatarUrl})`;
          navAvatar.style.backgroundSize = 'cover';
          navAvatar.style.backgroundPosition = 'center';
        } else {
          navAvatar.textContent = initial;
        }
      }
      if (navUserName) navUserName.textContent = firstName;
      // Populate menu (the dropdown that opens when the chip is tapped)
      const mAvatar = document.getElementById('navMenuAvatar');
      const mName   = document.getElementById('navMenuName');
      const mEmail  = document.getElementById('navMenuEmail');
      if (mAvatar) {
        if (avatarUrl) {
          mAvatar.textContent = '';
          mAvatar.style.backgroundImage = `url(${avatarUrl})`;
          mAvatar.style.backgroundSize = 'cover';
          mAvatar.style.backgroundPosition = 'center';
        } else {
          mAvatar.textContent = initial;
        }
      }
      if (mName) mName.textContent = state.fullName || firstName;
      if (mEmail) mEmail.textContent = state.email || '';
    } catch(e){}

    // Restore pending booking choices that were saved before the redirect.
    restorePending();

    // Clean the auth params out of the URL so refreshes don't re-process them.
    try {
      const u2 = new URL(window.location.href);
      if (u2.searchParams.has('code') || u2.searchParams.has('error') ||
          (u2.hash && u2.hash.includes('access_token'))) {
        u2.searchParams.delete('code');
        u2.searchParams.delete('state');
        u2.searchParams.delete('error');
        u2.searchParams.delete('error_description');
        history.replaceState(null, '', u2.pathname + (u2.search || '') + '');
      }
    } catch(e){}

    // TERMS GATE IS COMPULSORY ON EVERY VISIT.
    // The only permitted bypass is the Google OAuth round-trip itself:
    // the visitor accepted the terms seconds ago, then the page reloaded
    // on the way back from Google. That is authorised by a SINGLE-USE
    // ticket which is consumed here and never reused.
    var _freshOAuth = !(opts && opts.showWelcome);
    var _ticket = false;
    try { _ticket = sessionStorage.getItem('rc_oauth_ticket') === '1'; } catch (e) {}
    if (_freshOAuth && _ticket) {
      try { sessionStorage.removeItem('rc_oauth_ticket'); } catch (e) {}
      state.termsAccepted = true;
    } else {
      state.termsAccepted = false;   // returning visitor must read + accept again
    }

    // If the loader is still running, fast-forward it.
    try {
      const ld = document.getElementById('loader');
      if (ld && !document.body.classList.contains('is-loaded')) {
        document.body.classList.add('is-loaded');
        document.body.classList.remove('loading');
        ld.style.display = 'none';
      }
    } catch(e){}

    /* Paint the Welcome Back card with the real Google identity.
       Shows the Google profile photo when one exists; if there is no
       photo (or it fails to load) it falls back to the account's first
       letter, exactly like Google's own letter avatars. */
    function paintWelcomeCard() {
      const wb   = document.getElementById('welcomeBack');
      const si   = document.getElementById('signInCard');
      const wbAv = document.getElementById('wbAvatar');
      const wbN  = document.getElementById('wbName');
      const wbE  = document.getElementById('wbEmail');
      const wbF  = document.getElementById('wbFirstName');

      if (wbAv) {
        // Always start from the letter so the circle is never empty.
        wbAv.textContent = initial;
        wbAv.classList.remove('has-photo');
        wbAv.style.backgroundImage = '';
        if (avatarUrl) {
          const probe = new Image();
          probe.referrerPolicy = 'no-referrer';
          probe.onload = function () {
            wbAv.textContent = '';
            wbAv.style.backgroundImage = 'url("' + avatarUrl + '")';
            wbAv.style.backgroundSize = 'cover';
            wbAv.style.backgroundPosition = 'center';
            wbAv.classList.add('has-photo');
          };
          probe.onerror = function () { /* keep the letter */ };
          probe.src = avatarUrl;
        }
      }
      if (wbN) wbN.textContent = state.fullName || firstName || 'Your Google account';
      if (wbE) wbE.textContent = state.email || '';
      if (wbF) wbF.textContent = firstName;
      if (wb) wb.classList.remove('is-hidden');
      if (si) si.classList.add('is-hidden');
    }

    if (opts && opts.showWelcome) {
      // Returning visitor: show the Welcome Back panel on step 1 (NOT step 2).
      paintWelcomeCard();
      // Do NOT advance: the visitor stays on the Terms gate (step 0).
      // Once they accept, goTo(1) shows this Welcome Back card so they
      // never have to sign in with Google again.
    } else if (state.termsAccepted) {
      // Authorised OAuth round-trip: terms were accepted moments ago.
      goTo(2);
    } else {
      // Signed in, but no valid ticket -> gate still required.
      paintWelcomeCard();
    }
  }

  async function restoreSession() {
    if (!supabase) return;

    // Is this load coming from a Google OAuth redirect? (?code= present)
    const isFreshOAuth = new URLSearchParams(window.location.search).has('code') ||
                          (window.location.hash && window.location.hash.includes('access_token'));
    const sessionOpts = isFreshOAuth ? { showWelcome: false } : { showWelcome: true };

    // (a) Subscribe FIRST so we don't miss the SIGNED_IN event when auth completes.
    try {
      supabase.auth.onAuthStateChange((event, session) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session) {
          // SIGNED_IN after exchange = fresh OAuth; INITIAL_SESSION = stored session.
          const opts = (event === 'INITIAL_SESSION' && !isFreshOAuth)
            ? { showWelcome: true }
            : { showWelcome: false };
          applySession(session, opts);
        }
      });
    } catch (e) { console.warn('onAuthStateChange failed:', e); }

    // (b) PKCE: if URL has ?code=..., explicitly exchange it for a session.
    try {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data && data.session) {
          applySession(data.session, { showWelcome: false });
          return;
        }
      }
    } catch (e) { console.warn('exchangeCodeForSession failed:', e); }

    // (c) Poll getSession() as a backup in case the events above missed it.
    for (let i = 0; i < 8; i++) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) { applySession(session, sessionOpts); return; }
      } catch (e) { /* ignore */ }
      await new Promise(r => setTimeout(r, 250));
      if (sessionHandled) return;
    }
  }

  // Persist booking choices across the OAuth redirect (sessionStorage).
  function savePending() {
    try {
      sessionStorage.setItem('rc_pending', JSON.stringify({
        service: state.service,
        phone: state.phone,
        selectedDate: state.selectedDate,
        selectedTime: state.selectedTime
      }));
    } catch (e) {}
  }
  function restorePending() {
    try {
      const raw = sessionStorage.getItem('rc_pending');
      if (!raw) return;
      const p = JSON.parse(raw);
      // termsAccepted is deliberately NOT restored — the gate is compulsory.
      state.service       = p.service ?? state.service;
      state.phone         = p.phone ?? state.phone;
      state.selectedDate  = p.selectedDate ?? state.selectedDate;
      state.selectedTime  = p.selectedTime ?? state.selectedTime;
    } catch (e) {}
  }

  async function signInWithGoogle() {
    if (DEMO_MODE) {
      showDemoGoogle();
      return;
    }
    googleBtn.style.opacity = '0.7';
    googleBtn.style.pointerEvents = 'none';
    const txt = googleBtn.querySelector('.gbtn__text');
    if (txt) txt.textContent = 'Redirecting to Google...';
    savePending();
    // Single-use authorisation for the return trip from Google.
    try { sessionStorage.setItem('rc_oauth_ticket', '1'); } catch (e) {}
    try {
      // Build a clean redirect URL pointing back to booking.html.
      // This MUST exactly match a URL in Supabase -> Authentication -> URL Configuration -> Redirect URLs.
      const base = (CFG.SITE_URL || window.location.origin).replace(/\/$/, '');
      const redirectTo = `${base}/booking.html`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { prompt: 'select_account' }
        }
      });
      if (error) throw error;
      // Browser will redirect to Google now.
    } catch (e) {
      console.error('Google sign-in error:', e);
      alert('Could not start Google sign-in. Please check your internet connection and try again.');
      googleBtn.style.opacity = '';
      googleBtn.style.pointerEvents = '';
      if (txt) txt.textContent = 'Continue with Google';
    }
  }

  /* ---------- 5a. DEMO GOOGLE SIGN-IN (preview only) ---------- */
  function demoFinish(name, email) {
    const cleanName = (name || 'Demo Client').trim();
    const cleanEmail = (email || 'demo.client@gmail.com').trim();
    const modal = document.getElementById('demoGoogle');
    if (modal) modal.remove();
    // Build a fake session shaped like a real Supabase/Google session.
    applySession({
      user: { email: cleanEmail, user_metadata: { full_name: cleanName, name: cleanName } }
    }, { showWelcome: false });
  }

  function showDemoGoogle() {
    if (document.getElementById('demoGoogle')) return;
    const wrap = document.createElement('div');
    wrap.id = 'demoGoogle';
    wrap.innerHTML = `
      <style>
        #demoGoogle{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;
          background:rgba(10,6,8,.62);backdrop-filter:blur(4px);font-family:'Roboto',Arial,system-ui,sans-serif;
          animation:dgFade .25s ease}
        @keyframes dgFade{from{opacity:0}to{opacity:1}}
        #demoGoogle .dg-card{width:min(420px,92vw);background:#fff;border-radius:14px;overflow:hidden;
          box-shadow:0 24px 70px rgba(0,0,0,.45);animation:dgUp .35s cubic-bezier(.22,1,.36,1)}
        @keyframes dgUp{from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1}}
        #demoGoogle .dg-top{padding:26px 28px 6px}
        #demoGoogle .dg-g{display:flex;align-items:center;gap:10px;margin-bottom:18px}
        #demoGoogle .dg-g span{font-size:15px;color:#3c4043;font-weight:500}
        #demoGoogle h2{font-size:22px;font-weight:400;color:#202124;margin:0 0 6px}
        #demoGoogle .dg-sub{font-size:14px;color:#5f6368;margin:0}
        #demoGoogle .dg-sub b{font-weight:500;color:#202124}
        #demoGoogle .dg-list{padding:14px 12px 6px}
        #demoGoogle .dg-acc{display:flex;align-items:center;gap:14px;width:100%;border:none;background:none;
          padding:12px 16px;border-radius:10px;cursor:pointer;text-align:left;transition:background .15s}
        #demoGoogle .dg-acc:hover{background:#f1f3f4}
        #demoGoogle .dg-av{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;
          color:#fff;font-size:17px;font-weight:500;background:linear-gradient(135deg,#b3186a,#c9a86a)}
        #demoGoogle .dg-acc .dg-n{font-size:14px;color:#202124;font-weight:500;line-height:1.3}
        #demoGoogle .dg-acc .dg-e{font-size:13px;color:#5f6368;line-height:1.3}
        #demoGoogle .dg-div{height:1px;background:#e8eaed;margin:6px 16px}
        #demoGoogle .dg-form{padding:6px 24px 10px;display:none}
        #demoGoogle .dg-form.show{display:block}
        #demoGoogle .dg-inp{width:100%;margin:10px 0;padding:13px 14px;border:1px solid #dadce0;border-radius:8px;
          font-size:15px;color:#202124;outline:none}
        #demoGoogle .dg-inp:focus{border-color:#1a73e8;box-shadow:0 0 0 1px #1a73e8}
        #demoGoogle .dg-foot{display:flex;align-items:center;justify-content:space-between;padding:14px 24px 22px}
        #demoGoogle .dg-note{font-size:11px;color:#9aa0a6;padding:0 24px 16px;line-height:1.5}
        #demoGoogle .dg-btn{background:#1a73e8;color:#fff;border:none;border-radius:8px;padding:10px 24px;
          font-size:14px;font-weight:500;cursor:pointer;font-family:inherit}
        #demoGoogle .dg-btn:hover{background:#1765cc}
        #demoGoogle .dg-link{background:none;border:none;color:#1a73e8;font-size:14px;font-weight:500;cursor:pointer;
          padding:10px 0;font-family:inherit}
        #demoGoogle .dg-x{position:absolute;top:18px;right:22px;background:none;border:none;color:#fff;font-size:26px;
          cursor:pointer;line-height:1}
      </style>
      <button class="dg-x" id="dgClose" aria-label="Close">&times;</button>
      <div class="dg-card" role="dialog" aria-modal="true">
        <div class="dg-top">
          <div class="dg-g">
            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.4 5.4 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.27 14.29a7.21 7.21 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09z"/><path fill="#EA4335" d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.77 12 4.77z"/></svg>
            <span>Sign in with Google</span>
          </div>
          <h2>Choose an account</h2>
          <p class="dg-sub">to continue to <b>Rabus Hair Africa Braiding</b></p>
        </div>
        <div class="dg-list">
          <button class="dg-acc" id="dgAcc">
            <span class="dg-av">D</span>
            <span><span class="dg-n">Demo Client</span><br><span class="dg-e">demo.client@gmail.com</span></span>
          </button>
          <div class="dg-div"></div>
          <button class="dg-acc" id="dgOther">
            <span class="dg-av" style="background:#f1f3f4;color:#5f6368">+</span>
            <span><span class="dg-n">Use another account</span></span>
          </button>
          <div class="dg-form" id="dgForm">
            <input class="dg-inp" id="dgName" type="text" placeholder="Your full name" autocomplete="name" />
            <input class="dg-inp" id="dgEmail" type="email" placeholder="you@gmail.com" autocomplete="email" />
            <div class="dg-foot" style="padding-left:0;padding-right:0">
              <span></span>
              <button class="dg-btn" id="dgContinue">Continue</button>
            </div>
          </div>
        </div>
        <p class="dg-note">Demo preview — no real Google account is used. Live sign-in goes on once the salon's Google &amp; Supabase keys are connected.</p>
      </div>`;
    document.body.appendChild(wrap);

    document.getElementById('dgClose').addEventListener('click', () => wrap.remove());
    wrap.addEventListener('click', (e) => { if (e.target === wrap) wrap.remove(); });
    document.getElementById('dgAcc').addEventListener('click', () => demoFinish('Demo Client', 'demo.client@gmail.com'));
    document.getElementById('dgOther').addEventListener('click', () => {
      document.getElementById('dgForm').classList.add('show');
      document.getElementById('dgName').focus();
    });
    document.getElementById('dgContinue').addEventListener('click', () => {
      const n = document.getElementById('dgName').value;
      const em = document.getElementById('dgEmail').value;
      demoFinish(n, em);
    });
  }

  if (googleBtn) googleBtn.addEventListener('click', signInWithGoogle);

  /* ---------- 5b. WELCOME-BACK panel buttons ---------- */
  const continueAsBtn = document.getElementById('continueAsBtn');
  const switchAccountBtn = document.getElementById('switchAccountBtn');
  if (continueAsBtn) {
    continueAsBtn.addEventListener('click', () => { goTo(2); });
  }
  if (switchAccountBtn) {
    switchAccountBtn.addEventListener('click', async () => {
      // Sign out, then show normal sign-in card and start fresh
      try { if (supabase) await supabase.auth.signOut(); } catch(e){}
      try {
        // clear any "approved/rescheduled" client-side locks belonging to old session
        sessionStorage.removeItem('rc_pending');
      } catch(e){}
      sessionHandled = false;
      state.signedIn = false;
      state.fullName = '';
      state.email = '';
      // Toggle UI back to sign-in card
      document.getElementById('welcomeBack')?.classList.add('is-hidden');
      document.getElementById('signInCard')?.classList.remove('is-hidden');
      document.getElementById('navUser')?.classList.add('is-hidden');
      document.getElementById('navMenu')?.classList.add('is-hidden');
    });
  }

  /* ---------- 5c. NAV avatar dropdown menu ---------- */
  const navUserBtn = document.getElementById('navUser');
  const navMenu    = document.getElementById('navMenu');
  const navSignOut = document.getElementById('navSignOut');

  function closeNavMenu() {
    if (navMenu) navMenu.classList.add('is-hidden');
    if (navUserBtn) navUserBtn.setAttribute('aria-expanded', 'false');
  }
  function openNavMenu() {
    if (navMenu) navMenu.classList.remove('is-hidden');
    if (navUserBtn) navUserBtn.setAttribute('aria-expanded', 'true');
  }
  if (navUserBtn) {
    navUserBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu && navMenu.classList.contains('is-hidden')) openNavMenu();
      else closeNavMenu();
    });
  }
  // Click outside to close
  document.addEventListener('click', (e) => {
    if (!navMenu || navMenu.classList.contains('is-hidden')) return;
    if (e.target.closest('#navMenu') || e.target.closest('#navUser')) return;
    closeNavMenu();
  });
  // ESC to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNavMenu();
  });

  if (navSignOut) {
    navSignOut.addEventListener('click', async (e) => {
      e.stopPropagation();
      navSignOut.disabled = true;
      navSignOut.textContent = 'Signing out…';
      try { if (supabase) await supabase.auth.signOut(); } catch(e){ console.warn('signOut failed:', e); }
      try { sessionStorage.removeItem('rc_pending'); } catch(e){}
      // Clear any approval/reschedule locks too so this device starts fresh
      try {
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('rc_approved_') || k.startsWith('rc_resched_'))) {
            localStorage.removeItem(k);
          }
        }
      } catch(e){}
      // Hard reload to a clean booking page
      window.location.href = 'booking.html';
    });
  }


  /* ---------- 6. STEP 2 · CATEGORY (Adult / Kids) + SERVICE PICKER ---------- */
  const bservicesEl = document.getElementById('bservices');
  const toPhone     = document.getElementById('toPhone');
  const toServices  = document.getElementById('toServices');
  const weaveToggle = document.getElementById('weaveToggle');
  const kidsNote    = document.getElementById('kidsNote');
  const catCards    = [...document.querySelectorAll('.bcat__card')];

  // --- category selection ---
  catCards.forEach(card => {
    card.addEventListener('click', () => {
      catCards.forEach(c => c.classList.remove('is-selected'));
      card.classList.add('is-selected');
      state.category = card.dataset.cat;
      if (toServices) toServices.disabled = false;
    });
  });

  if (toServices) {
    toServices.addEventListener('click', () => {
      if (!state.category) return;
      buildServiceList();
      goTo(2.5);
    });
  }

  // Back from service list -> category chooser (reset the service pick)
  const backToCat = document.querySelector('[data-back-to-cat]');
  if (backToCat) {
    backToCat.addEventListener('click', () => {
      state.service = null;
      if (toPhone) toPhone.disabled = true;
      goTo(2);
    });
  }

  function kidsPriceDisplay(s) {
    const p = state.weave === 'without' ? s.withoutW : s.withW;
    return '$' + p;
  }

  // Build the service cards for the chosen category
  function buildServiceList() {
    bservicesEl.innerHTML = '';
    const isKids = state.category === 'kids';

    if (weaveToggle) weaveToggle.classList.toggle('is-hidden', !isKids);
    if (kidsNote)    kidsNote.classList.toggle('is-hidden', !isKids);
    var adultNote = document.getElementById('adultNote');
    if (adultNote)   adultNote.classList.toggle('is-hidden', isKids);
    bservicesEl.classList.toggle('bservices--kids', isKids);

    const list = isKids ? KIDS_SERVICES : ALL_SERVICES;

    list.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bservice';
      btn.dataset.service = s.name;
      const priceText = isKids ? kidsPriceDisplay(s) : (s.priceDisplay || ('$' + s.price));
      btn.innerHTML = `
        <span class="bservice__num">${String(i + 1).padStart(2, '0')}</span>
        <h3 class="bservice__name">${s.name}</h3>
        <div class="bservice__meta">
          <span class="bservice__price" data-price>${priceText}</span>
          <span class="bservice__hours">${durationText(s)}</span>
        </div>
        <span class="bservice__check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg></span>
      `;
      btn.addEventListener('click', () => {
        [...bservicesEl.querySelectorAll('.bservice')].forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        selectService(s, isKids);
        if (toPhone) toPhone.disabled = false;
      });
      bservicesEl.appendChild(btn);
    });
  }

  // Normalise the chosen service into state.service, carrying category + weave.
  function selectService(s, isKids) {
    if (isKids) {
      const price = state.weave === 'without' ? s.withoutW : s.withW;
      const weaveLabel = state.weave === 'without' ? 'Without Weave' : 'With Weave';
      state.service = {
        name: s.name + ' (' + weaveLabel + ')',
        price: price,
        priceDisplay: '$' + price,
        hours: s.hours,
        category: 'Kids',
        menu: 'Kids',
        weave: weaveLabel
      };
    } else {
      state.service = Object.assign({}, s, { menu: 'Adult', weave: null });
    }
  }

  // Kids weave toggle: flip prices live, keep any current selection in sync.
  if (weaveToggle) {
    weaveToggle.querySelectorAll('.bweave__opt').forEach(opt => {
      opt.addEventListener('click', () => {
        state.weave = opt.dataset.weave;
        weaveToggle.querySelectorAll('.bweave__opt').forEach(o => o.classList.remove('is-active'));
        opt.classList.add('is-active');

        // update every visible price
        const cards = [...bservicesEl.querySelectorAll('.bservice')];
        cards.forEach((card, i) => {
          const s = KIDS_SERVICES[i];
          const pr = card.querySelector('[data-price]');
          if (s && pr) pr.textContent = kidsPriceDisplay(s);
        });

        // if a card is selected, re-derive state.service with the new weave/price
        const selIdx = cards.findIndex(c => c.classList.contains('is-selected'));
        if (selIdx > -1) selectService(KIDS_SERVICES[selIdx], true);
      });
    });
  }

  if (toPhone) {
    toPhone.addEventListener('click', () => {
      if (!state.service) return;
      goTo(3);
    });
  }

  // Preselect an ADULT service from URL ?service=... (skips category to Adult)
  function preselectFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const wanted = params.get('service');
    if (!wanted) return;
    const match = ALL_SERVICES.find(s => s.name.toLowerCase() === wanted.toLowerCase());
    if (!match) return;
    state.category = 'adult';
    setTimeout(() => {
      buildServiceList();
      selectService(match, false);
      const target = bservicesEl.querySelector(`.bservice[data-service="${CSS.escape(match.name)}"]`);
      if (target) {
        target.classList.add('is-selected');
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (toPhone) toPhone.disabled = false;
    }, 200);
  }
  preselectFromUrl();


  /* ---------- 7. STEP 3 · PHONE ---------- */
  const phoneForm  = document.getElementById('phoneForm');
  const phoneInput = document.getElementById('phone');

  // Simple US phone mask
  phoneInput.addEventListener('input', (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
    let out = '';
    if (digits.length === 0) out = '';
    else if (digits.length < 4) out = '(' + digits;
    else if (digits.length < 7) out = '(' + digits.slice(0, 3) + ') ' + digits.slice(3);
    else out = '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
    e.target.value = out;
  });

  phoneForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length < 10) {
      phoneInput.style.borderColor = '#b95252';
      setTimeout(() => { phoneInput.style.borderColor = ''; }, 1800);
      return;
    }
    state.phone = phoneInput.value;
    goTo(4);
  });


  /* ---------- 8. STEP 4 · DATE & TIME (open calendar) ---------- */
  const calTitle   = document.getElementById('calTitle');
  const calGrid    = document.getElementById('calGrid');
  const calPrev    = document.getElementById('calPrev');
  const calNext    = document.getElementById('calNext');
  const bdtSlots   = document.getElementById('bdtSlots');
  const bdtSelDate = document.getElementById('bdtSelDate');
  const toPayment  = document.getElementById('toPayment');

  // Open every day, 9 AM – 7 PM (Sundays included). Last appointment start: 5 PM.
  const CLOSED_DAYS = [];
  const TIME_SLOTS = [
    '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
  ];

  const today = new Date();
  today.setHours(0,0,0,0);
  let viewYear  = today.getFullYear();
  let viewMonth = today.getMonth();

  function fmtMonthTitle(y, m) {
    return new Date(y, m, 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  }
  function isoFromYMD(y, m, d) {
    return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  }
  function isClosed(date) {
    return CLOSED_DAYS.includes(date.getDay());
  }
  function isPast(date) {
    return date < today;
  }

  function renderCalendar() {
    calTitle.textContent = fmtMonthTitle(viewYear, viewMonth);
    calGrid.innerHTML = '';
    const first = new Date(viewYear, viewMonth, 1);
    const startWeekday = first.getDay(); // 0 Sun..6 Sat
    const daysInMonth  = new Date(viewYear, viewMonth + 1, 0).getDate();

    // Prev-month padding
    for (let i = 0; i < startWeekday; i++) {
      const el = document.createElement('span');
      el.className = 'bdt__day bdt__day--blank';
      calGrid.appendChild(el);
    }
    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(viewYear, viewMonth, d);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bdt__day';
      btn.textContent = d;
      const iso = isoFromYMD(viewYear, viewMonth, d);

      if (isPast(date)) btn.classList.add('is-past');
      if (isClosed(date)) btn.classList.add('is-closed');
      if (date.getTime() === today.getTime()) btn.classList.add('is-today');

      const disabled = isPast(date) || isClosed(date);
      btn.disabled = disabled;
      btn.dataset.iso = iso;

      if (state.selectedDate === iso) btn.classList.add('is-selected');

      if (!disabled) {
        btn.addEventListener('click', () => selectDate(iso, btn));
      }
      calGrid.appendChild(btn);
    }

    // Disable prev nav when at current month
    const isCurrentMonth = (viewYear === today.getFullYear() && viewMonth === today.getMonth());
    calPrev.disabled = isCurrentMonth;
  }

  function selectDate(iso, btnEl) {
    state.selectedDate = iso;
    state.selectedTime = null;
    [...calGrid.querySelectorAll('.bdt__day.is-selected')].forEach(el => el.classList.remove('is-selected'));
    if (btnEl) btnEl.classList.add('is-selected');

    const d = new Date(iso + 'T00:00:00');
    bdtSelDate.textContent = d.toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric'
    });
    renderSlots();
    toPayment.disabled = true; // until time is picked
  }

  function renderSlots() {
    bdtSlots.innerHTML = '';
    TIME_SLOTS.forEach(t => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'bdt__slot';
      b.textContent = t;
      if (state.selectedTime === t) b.classList.add('is-selected');
      b.addEventListener('click', () => {
        state.selectedTime = t;
        [...bdtSlots.querySelectorAll('.bdt__slot.is-selected')].forEach(el => el.classList.remove('is-selected'));
        b.classList.add('is-selected');
        toPayment.disabled = false;
      });
      bdtSlots.appendChild(b);
    });
  }

  calPrev.addEventListener('click', () => {
    if (calPrev.disabled) return;
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    renderCalendar();
  });
  calNext.addEventListener('click', () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    renderCalendar();
  });

  // Render calendar immediately so it's "open by default"
  renderCalendar();

  toPayment.addEventListener('click', () => {
    if (!state.selectedDate || !state.selectedTime) return;
    paintReview();
    goTo(5);  // straight to Review (Payment step removed)
  });


  /* ---------- 9. STEP 5 · REVIEW ---------- */
  function paintReview() {
    const s = state.service || {};
    document.getElementById('rService').textContent  = s.name || '—';
    document.getElementById('rPrice').textContent    = s.priceDisplay || (s.price ? `$${s.price}` : '—');
    document.getElementById('rDuration').textContent = durationText(s) || '—';
    document.getElementById('rName').textContent     = state.fullName || 'Guest';
    document.getElementById('rEmail').textContent    = state.email || '—';
    document.getElementById('rPhone').textContent    = state.phone || '—';

    let dt = '—';
    if (state.selectedDate) {
      const d = new Date(state.selectedDate + 'T00:00:00');
      const dateStr = d.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
      });
      dt = `${dateStr} · ${state.selectedTime || ''}`;
    }
    document.getElementById('rDateTime').textContent = dt;
  }

  /* ---------- helper: build a reference id ---------- */
  function makeRef() {
    return 'RB-' + Math.random().toString(36).slice(2, 6).toUpperCase()
         + '-' + Math.floor(Math.random() * 9000 + 1000);
  }

  /* ---------- helper: pretty date ---------- */
  function prettyDate(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }

  /* ---------- helper: race a promise against a timeout ---------- */
  function withTimeout(promise, ms, label) {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error((label || 'op') + ' timed out')), ms))
    ]);
  }

  const confirmBtn = document.getElementById('confirmBtn');
  let bookingSubmitting = false;   // in-flight guard
  let bookingSubmitted  = false;   // permanent one-time lock
  confirmBtn.addEventListener('click', () => {
    if (!state.service || !state.selectedDate || !state.selectedTime) return;
    if (bookingSubmitting || bookingSubmitted) return;   // block double-tap / re-fire
    bookingSubmitting = true;
    bookingSubmitted  = true;        // lock immediately — one booking only
    confirmBtn.disabled = true;

    const ref = makeRef();
    const s = state.service;
    const dateNice = prettyDate(state.selectedDate);

    // Show the success screen INSTANTLY — the user never waits on the network.
    document.getElementById('refId').textContent = ref;
    try { sessionStorage.removeItem('rc_pending'); } catch (e) {}
    goTo(6);

    // Fire Supabase + salon email in the BACKGROUND (fire-and-forget).
    // 1) Save booking to Supabase
    if (supabase) {
      supabase.from('bookings').insert({
        reference: ref,
        service: (s.menu ? s.menu + ' \u00b7 ' : '') + s.name,
        price: s.price,
        duration_hrs: s.hours,
        client_name: state.fullName || 'Guest',
        client_email: state.email || null,
        client_phone: state.phone || null,
        booking_date: state.selectedDate,
        booking_time: state.selectedTime,
        status: 'pending'
      }).then(() => {}, (e) => console.warn('Supabase insert failed:', e));
    }

    // 2) Email the salon with Approve + Reschedule links
    try {
      const EJ = CFG.EMAILJS && CFG.EMAILJS.salon;
      if (window.emailjs && EJ && EJ.serviceId && !String(EJ.serviceId).startsWith('PASTE_')) {
        const base = (CFG.SITE_URL || window.location.origin).replace(/\/$/, '');
        const q = new URLSearchParams({
          ref: ref,
          name: state.fullName || 'Guest',
          email: state.email || '',
          service: (s.menu ? s.menu + ' \u00b7 ' : '') + s.name,
          date: dateNice,
          time: state.selectedTime
        }).toString();

        emailjs.send(EJ.serviceId, EJ.salonTemplate, {
          to_email:        EJ.salonEmail,
          salon_email:     EJ.salonEmail,
          reference:       ref,
          menu:            s.menu || 'Adult',
          service:         (s.menu ? s.menu + ' \u00b7 ' : '') + s.name,
          price:           s.priceDisplay || ('$' + s.price),
          duration:        durationText(s),
          client_name:     state.fullName || 'Guest',
          client_email:    state.email || 'not provided',
          client_phone:    state.phone || 'not provided',
          booking_date:    dateNice,
          booking_time:    state.selectedTime,
          approve_link:    base + '/approve.html?' + q,
          reschedule_link: base + '/reschedule.html?' + q
        }).then(() => {}, (e) => console.warn('Salon email failed:', e));
      }
    } catch (e) { console.warn('Salon email failed:', e); }

    bookingSubmitting = false;
  });


  /* ---------- 10. BACK / EDIT ---------- */
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      // Never go back past Step 2 (Service) — Terms+SignIn are gates
      const target = Math.max(2, state.step - 1);
      goTo(target);
    });
  });
  document.querySelectorAll('[data-edit]').forEach(btn => {
    btn.addEventListener('click', () => goTo(2));
  });


  /* ---------- 11. PROGRESS — clickable revisit ---------- */
  progSteps.forEach(ps => {
    ps.style.cursor = 'pointer';
    ps.addEventListener('click', () => {
      const tgt = parseInt(ps.dataset.step, 10);
      if (tgt < state.step && tgt >= PROGRESS_FIRST_STEP) goTo(tgt);
    });
  });


  /* ---------- 13. TERMS & CONDITIONS GATE (Step 0) ---------- */
  (function initTermsGate() {
    // A ticket is ONLY valid on the immediate return trip from Google
    // (that URL carries ?code= / #access_token). Any ticket found on a
    // normal page load is stale and is destroyed here, so it can never
    // be reused to skip the gate on a later visit.
    try {
      const isOAuthReturn = /[?&]code=/.test(location.search) ||
                            (location.hash || '').indexOf('access_token') !== -1;
      if (!isOAuthReturn) sessionStorage.removeItem('rc_oauth_ticket');
    } catch (e) {}

    const box  = document.getElementById('tacScroll');
    const fill = document.getElementById('tacFill');
    const hint = document.getElementById('tacHint');
    const chk  = document.getElementById('tacCheck');
    const go   = document.getElementById('tacContinue');
    const wrap = document.querySelector('.tac');
    if (!box || !chk || !go) return;

    function onScroll() {
      const max = box.scrollHeight - box.clientHeight;
      const p = max > 0 ? Math.min(1, box.scrollTop / max) : 1;
      if (fill) fill.style.width = (p * 100) + '%';
      if (p >= 0.92 && chk.disabled) {
        chk.disabled = false;
        if (wrap) wrap.classList.add('tac--ready');
        if (hint) hint.textContent = 'Thank you for reading — please accept below';
      }
    }
    box.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // handles short viewports where no scroll is needed

    chk.addEventListener('change', () => { go.disabled = !chk.checked; });

    go.addEventListener('click', () => {
      if (!chk.checked) return;
      state.termsAccepted = true;
      goTo(1);
    });
  })();

  /* ---------- 14. ON LOAD ---------- */
  restoreSession();

})();
