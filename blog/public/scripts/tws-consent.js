/*
  tws-consent.js: GTM loader + Google Consent Mode v2 + cookie banner.
  One file, shared by tradingwithsidhant.com (Framer), blogs., edge. and
  hitpoint.app. twsgurukulx.com keeps its own public/scripts/gtm-consent.js.

  Consent defaults (decided 2026-09-27, option B):
    - EEA, UK and Switzerland: every tracking storage type starts DENIED.
    - Everywhere else: starts GRANTED.
  Google applies the region-specific default over the global one, whatever
  order they are pushed in. The banner still shows to every visitor, and a
  Reject anywhere updates consent to DENIED and is remembered.

  Non-Google tags (Meta pixel, OpenAI pixel, Clarity) honour this only because
  each one carries a "requires consent" setting in GTM-P3PR2NBT, and the server
  container only forwards to Meta / OpenAI CAPI when x-ga-gcs matches ^G11.

  Ordering rules:
    1. This script must run BEFORE anything requests gtm.js. Load it in <head>,
       synchronously (Next.js: strategy="beforeInteractive"), and remove any
       other GTM snippet from the page.
    2. window.gtag is defined here so page code can call it early.

  The choice is stored in:
    - cookie tws_consent (Domain=.tradingwithsidhant.com on that site and its
      subdomains, so one answer covers the root site, blogs. and edge.;
      host-only elsewhere), 1 year;
    - localStorage cookie_consent (same values as twsgurukulx.com and the old
      blog banner, so existing answers carry over).

  Config (optional), set before this script runs:
    window.TWS_CONSENT = { policyUrl: '/legal/cookie-policy', banner: true, loadGtm: true }
  or as data attributes on the <script> tag: data-policy-url, data-banner="false",
  data-load-gtm="false".
*/
(function () {
  if (window.__twsConsentLoaded) return;
  window.__twsConsentLoaded = true;

  var GTM_ID = 'GTM-P3PR2NBT';
  var COOKIE = 'tws_consent';
  var LS_KEY = 'cookie_consent';
  var SHARED_DOMAIN = 'tradingwithsidhant.com';

  // EU/EEA member states, plus Iceland, Liechtenstein, Norway, the UK and
  // Switzerland.
  var STRICT_REGIONS = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR',
    'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK',
    'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH'
  ];

  var script = document.currentScript;
  var cfg = window.TWS_CONSENT || {};
  var policyUrl = cfg.policyUrl || (script && script.getAttribute('data-policy-url')) || '/privacy';
  var showBanner = cfg.banner !== false && !(script && script.getAttribute('data-banner') === 'false');

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  if (typeof window.gtag !== 'function') window.gtag = gtag;

  var DENIED = {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    personalization_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted'
  };
  var GRANTED = {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
    personalization_storage: 'granted',
    functionality_storage: 'granted',
    security_storage: 'granted'
  };
  function assign(t, s) { for (var k in s) if (Object.prototype.hasOwnProperty.call(s, k)) t[k] = s[k]; return t; }

  function onSharedDomain() {
    var h = location.hostname;
    return h === SHARED_DOMAIN || h.slice(-(SHARED_DOMAIN.length + 1)) === '.' + SHARED_DOMAIN;
  }

  function readChoice() {
    var m = document.cookie.match(new RegExp('(?:^|; )' + COOKIE + '=(accepted|rejected)'));
    if (m) return m[1];
    try {
      var v = localStorage.getItem(LS_KEY);
      if (v === 'accepted' || v === 'rejected') return v;
    } catch (e) { /* storage blocked: treat as unanswered */ }
    return null;
  }

  function saveChoice(choice) {
    var c = COOKIE + '=' + choice + '; Max-Age=31536000; Path=/; SameSite=Lax';
    if (location.protocol === 'https:') c += '; Secure';
    if (onSharedDomain()) c += '; Domain=.' + SHARED_DOMAIN;
    document.cookie = c;
    try { localStorage.setItem(LS_KEY, choice); } catch (e) { /* ignore */ }
  }

  gtag('consent', 'default', assign({ region: STRICT_REGIONS, wait_for_update: 500 }, DENIED));
  gtag('consent', 'default', assign({ wait_for_update: 500 }, GRANTED));

  var stored = readChoice();
  if (stored === 'accepted') gtag('consent', 'update', GRANTED);
  if (stored === 'rejected') gtag('consent', 'update', DENIED);

  window.updateGTMConsent = function (choice) {
    gtag('consent', 'update', choice === 'accepted' ? GRANTED : DENIED);
    saveChoice(choice);
    if (choice === 'accepted' && window.twsAttribution && window.twsAttribution.grant) {
      window.twsAttribution.grant();
    }
  };

  window.loadGTM = function () {
    if (window.__gtmLoaded) return;
    window.__gtmLoaded = true;
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var j = document.createElement('script');
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + GTM_ID;
    var f = document.getElementsByTagName('script')[0];
    if (f && f.parentNode) f.parentNode.insertBefore(j, f); else document.head.appendChild(j);
  };
  // loadGtm:false lets a site keep its own GTM loader (edge. gates GTM by route
  // so it never loads on /journal) while still using these defaults and the banner.
  var autoLoad = cfg.loadGtm !== false && !(script && script.getAttribute('data-load-gtm') === 'false');
  if (autoLoad) window.loadGTM();

  // Banner
  if (!showBanner || stored) return;

  var CSS =
    '#tws-consent{position:fixed;z-index:2147483000;left:16px;right:16px;bottom:16px;max-width:420px;' +
    'margin:0;padding:14px 16px;border:1px solid rgba(127,127,127,.35);border-radius:10px;' +
    'background:#15181d;color:#eef0f3;font:14px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;' +
    'box-shadow:0 8px 28px rgba(0,0,0,.28);display:flex;flex-wrap:wrap;align-items:center;gap:10px 12px}' +
    '#tws-consent p{margin:0;flex:1 1 220px}' +
    '#tws-consent a{color:inherit;text-decoration:underline;text-underline-offset:2px}' +
    '#tws-consent .tws-c-actions{display:flex;gap:8px;margin-left:auto}' +
    '#tws-consent button{min-height:40px;min-width:84px;padding:0 14px;border-radius:8px;font:inherit;font-weight:600;cursor:pointer}' +
    '#tws-consent .tws-c-reject{background:transparent;color:inherit;border:1px solid rgba(238,240,243,.45)}' +
    '#tws-consent .tws-c-accept{background:#eef0f3;color:#15181d;border:1px solid #eef0f3}' +
    '#tws-consent button:focus-visible{outline:2px solid #7fb2ff;outline-offset:2px}' +
    '@media (max-width:480px){#tws-consent{left:12px;right:12px;bottom:12px}}';

  function render() {
    if (document.getElementById('tws-consent')) return;
    var style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    var box = document.createElement('div');
    box.id = 'tws-consent';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', 'Cookie choice');
    function el(tag, cls, text) {
      var n = document.createElement(tag);
      if (cls) n.className = cls;
      if (text) n.textContent = text;
      return n;
    }
    var p = el('p', '', 'We use cookies for analytics and ads. ');
    var link = el('a', '', 'Cookie policy');
    link.setAttribute('href', policyUrl);
    p.appendChild(link);
    var actions = el('div', 'tws-c-actions');
    var reject = el('button', 'tws-c-reject', 'Reject');
    var accept = el('button', 'tws-c-accept', 'Accept');
    reject.type = accept.type = 'button';
    actions.appendChild(reject);
    actions.appendChild(accept);
    box.appendChild(p);
    box.appendChild(actions);

    function answer(choice) {
      window.updateGTMConsent(choice);
      if (box.parentNode) box.parentNode.removeChild(box);
    }
    reject.addEventListener('click', function () { answer('rejected'); });
    accept.addEventListener('click', function () { answer('accepted'); });
    document.body.appendChild(box);
  }

  if (document.body) render();
  else document.addEventListener('DOMContentLoaded', render);
})();
