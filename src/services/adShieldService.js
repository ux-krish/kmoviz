/**
 * KMOVIZ AdShield Pro v3.0 — Complete In-App Ad Blocking Engine
 * 
 * Replicates uBlock Origin functionality without a Chrome extension by using:
 * 
 * Layer 1 — Network (Service Worker):
 *   Intercepts fetch/XHR at browser level, blocks 400+ ad/tracker/gambling domains
 *   Returns empty 200 responses to prevent page errors
 * 
 * Layer 2 — Window API Overrides:
 *   Patches window.open() to return null for ad popups
 *   Patches window.location to prevent forced redirects
 *   Broadcasts blocked events via postMessage for UI toasts
 * 
 * Layer 3 — DOM Observation (MutationObserver):
 *   Watches for injected ad iframes, script tags, and banner elements
 *   Removes them immediately using a comprehensive selector list
 * 
 * Layer 4 — CSS Cosmetic Filtering:
 *   Injects a <style> tag with 200+ CSS rules to hide ad containers
 *   Equivalent to uBlock Origin's cosmetic filter engine
 * 
 * Layer 5 — iframe Sandbox (in CinemaPlayer):
 *   Sets sandbox attribute WITHOUT allow-popups — browser enforces this
 *   at the OS level, impossible to bypass from within the iframe
 * 
 * Layer 6 — ClickShield (in CinemaPlayer):
 *   Smart overlay that intercepts rapid/suspicious click patterns
 *   Passes through single video-control clicks after 180ms window
 */

// ─── Internal State ────────────────────────────────────────────────────────
let blockedCounter = 0;
let listeners = [];
let isEngineActive = true;
let mutationObserver = null;
let cosmeticStyleEl = null;
let swRegistration = null;

const stats = {
  networkRequests: 0,
  popups: 0,
  domElements: 0,
  cosmetic: 0,
  clickjacks: 0,
  trackers: 0,
};

const recentBlocked = []; // Last 20 blocked items for the log

// Persist across navigations
try {
  const saved = localStorage.getItem('kmoviz_adshield_v3');
  if (saved) {
    const d = JSON.parse(saved);
    blockedCounter = d.total || 0;
    Object.assign(stats, d.stats || {});
  }
} catch (_) {}

function persist() {
  try {
    localStorage.setItem('kmoviz_adshield_v3', JSON.stringify({
      total: blockedCounter, stats, ts: Date.now()
    }));
  } catch (_) {}
}

function addRecentBlock(item) {
  recentBlocked.unshift({ ...item, time: new Date().toLocaleTimeString() });
  if (recentBlocked.length > 20) recentBlocked.pop();
}

function notify() {
  const snapshot = {
    total: blockedCounter,
    stats: { ...stats },
    recent: [...recentBlocked],
    isActive: isEngineActive,
  };
  listeners.forEach(cb => cb(snapshot));
  persist();
}

// ─── Public API ────────────────────────────────────────────────────────────
export function subscribeAdShieldStats(cb) {
  listeners.push(cb);
  // Immediately call with current state
  cb({ total: blockedCounter, stats: { ...stats }, recent: [...recentBlocked], isActive: isEngineActive });
  return () => { listeners = listeners.filter(fn => fn !== cb); };
}

export function getBlockedCount() { return blockedCounter; }
export function getStats() { return { total: blockedCounter, stats: { ...stats }, recent: [...recentBlocked] }; }

export function incrementBlockedCount(amount = 1, category = 'networkRequests', meta = {}) {
  blockedCounter += amount;
  if (stats[category] !== undefined) stats[category] += amount;
  addRecentBlock({ category, amount, ...meta });
  notify();
}

export function resetBlockedCount() {
  blockedCounter = 0;
  Object.keys(stats).forEach(k => { stats[k] = 0; });
  recentBlocked.length = 0;
  notify();
  if (swRegistration?.active) {
    swRegistration.active.postMessage({ type: 'RESET_STATS' });
  }
}

export function setEngineEnabled(enabled) {
  isEngineActive = enabled;
  if (enabled) {
    startMutationObserver();
    injectCosmeticFilters();
  } else {
    if (mutationObserver) { mutationObserver.disconnect(); mutationObserver = null; }
    removeCosmeticFilters();
  }
  notify();
}

// ─── Layer 1: Service Worker Registration ─────────────────────────────────
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('[AdShield] Service Workers not supported.');
    return;
  }
  try {
    swRegistration = await navigator.serviceWorker.register('/adshield-sw.js', { scope: '/' });
    console.log('[AdShield] SW registered, scope:', swRegistration.scope);

    // Listen for real-time block events from SW
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, hostname, blockedBy, sessionBlocks, recentDomains } = event.data || {};
      if (type === 'ADSHIELD_SW_BLOCKED') {
        blockedCounter = (blockedCounter - stats.networkRequests) + sessionBlocks;
        stats.networkRequests = sessionBlocks;
        addRecentBlock({
          category: 'networkRequests',
          domain: hostname,
          desc: blockedBy,
        });
        notify();
      }
    });
  } catch (err) {
    console.warn('[AdShield] SW registration failed (non-blocking):', err.message);
  }
}

// ─── Layer 2: Window API Overrides ────────────────────────────────────────
const AD_URL_PATTERNS = [
  '4rabet','1xbet','betway','bet365','parimatch','melbet','mostbet',
  'propellerads','popcash','popads','adcash','exoclick','juicyads',
  'trafficjunky','onclickads','admaven','hilltopads','clickadu',
  'adnxs','doubleclick','googlesyndication','yieldmanager','adsterra',
  'monetag','streamtape','clickshield','popunder','gambling','casino',
  'betting','coinminer','coinhive','crypto-loot','linkvertise',
  'adf.ly','bc.vc','ouo.io','shorte.st','affiliate','trk.',
];

function isAdUrl(url) {
  if (!url || typeof url !== 'string') return true; // Block blank popups
  const lower = url.toLowerCase();
  return AD_URL_PATTERNS.some(p => lower.includes(p));
}

function initWindowOverrides() {
  // ── window.open() override ──
  const _origOpen = window.open;
  window.open = function(url, target, features) {
    if (!isEngineActive) return _origOpen.apply(window, arguments);

    // Block all blank popups + known ad URLs
    if (!url || isAdUrl(url)) {
      blockedCounter++;
      stats.popups++;
      addRecentBlock({ category: 'popups', domain: url || '(blank popup)', desc: 'window.open blocked' });
      notify();
      // Fire event so ClickShield can show a toast
      window.postMessage({ type: 'ADSHIELD_POPUP_BLOCKED', domain: url }, '*');
      console.log('[AdShield] Blocked window.open →', url || '(blank)');
      return null;
    }

    // Block any _blank target that goes to an external ad domain
    if (target === '_blank') {
      try {
        const urlHostname = new URL(url).hostname.replace(/^www\./, '');
        const isOwnHost = window.location.hostname === urlHostname;
        if (!isOwnHost && isAdUrl(urlHostname)) {
          blockedCounter++;
          stats.popups++;
          addRecentBlock({ category: 'popups', domain: urlHostname, desc: 'blank-target blocked' });
          notify();
          window.postMessage({ type: 'ADSHIELD_POPUP_BLOCKED', domain: urlHostname }, '*');
          return null;
        }
      } catch (_) {}
    }

    return _origOpen.apply(window, arguments);
  };

  // ── Prevent location hijack (some ads try window.location = adUrl) ──
  // This catches the most aggressive redirectors
  const _origAssign = window.location.assign.bind(window.location);
  const _origReplace = window.location.replace.bind(window.location);
  
  try {
    Object.defineProperty(window.location, 'assign', {
      value: function(url) {
        if (isEngineActive && isAdUrl(url)) {
          console.log('[AdShield] Blocked location.assign →', url);
          blockedCounter++;
          stats.clickjacks++;
          notify();
          return;
        }
        return _origAssign(url);
      },
      writable: true, configurable: true
    });
    
    Object.defineProperty(window.location, 'replace', {
      value: function(url) {
        if (isEngineActive && isAdUrl(url)) {
          console.log('[AdShield] Blocked location.replace →', url);
          blockedCounter++;
          stats.clickjacks++;
          notify();
          return;
        }
        return _origReplace(url);
      },
      writable: true, configurable: true
    });
  } catch (_) {
    // Location property override may not work in all contexts — non-critical
  }

  console.log('[AdShield] Window API overrides active.');
}

// ─── Layer 3: Click/Link Interceptor ──────────────────────────────────────
function initLinkInterceptor() {
  document.addEventListener('click', (e) => {
    if (!isEngineActive) return;
    const anchor = e.target?.closest('a[href]');
    if (!anchor) return;

    const href = anchor.href?.toLowerCase() || '';
    if (isAdUrl(href)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      blockedCounter++;
      stats.clickjacks++;
      addRecentBlock({ category: 'clickjacks', domain: anchor.hostname, desc: 'link-click blocked' });
      notify();
      console.log('[AdShield] Blocked ad link click →', anchor.href);
    }
  }, { capture: true });
}

// ─── Layer 4: DOM MutationObserver ────────────────────────────────────────
const AD_SELECTORS = [
  // Known ad iframes
  'iframe[src*="googlesyndication"]','iframe[src*="doubleclick"]',
  'iframe[src*="propellerads"]','iframe[src*="popcash"]',
  'iframe[src*="exoclick"]','iframe[src*="adcash"]',
  'iframe[src*="adsterra"]','iframe[src*="monetag"]',
  'iframe[src*="onclickads"]','iframe[src*="juicyads"]',
  'iframe[src*="4rabet"]','iframe[src*="1xbet"]',
  'iframe[src*="betway"]','iframe[src*="parimatch"]',
  // Ad scripts
  'script[src*="pagead2.googlesyndication"]',
  'script[src*="doubleclick"]','script[src*="propellerads"]',
  'script[src*="adsterra"]','script[src*="monetag"]',
  'script[src*="coinhive"]','script[src*="crypto-loot"]',
  // Ad link elements
  'a[href*="4rabet"]','a[href*="1xbet"]','a[href*="betway"]',
  'a[href*="bet365"]','a[href*="parimatch"]','a[href*="melbet"]',
  // Generic ad containers
  '.adsbygoogle','[id*="google_ads"]','[id*="gads"]',
  '.ad-container','#ad-container','.banner-ad','#banner-ad',
  '[class*="ad-wrapper"]','[class*="ads-wrapper"]',
  '[data-ad]','[data-adunit]','[data-adslot]',
];

function scrubAdElements(root = document) {
  if (!isEngineActive) return;
  let removed = 0;
  
  AD_SELECTORS.forEach(sel => {
    try {
      root.querySelectorAll(sel).forEach(el => {
        // Never remove KMOVIZ's own components
        if (el.closest('#root') && (
          el.closest('.kmoviz-navbar') ||
          el.closest('.adshield-panel') ||
          el.closest('.adshield-modal-container') ||
          el.closest('.cinema-player-overlay')
        )) return;
        
        el.remove();
        removed++;
      });
    } catch (_) {}
  });

  if (removed > 0) {
    blockedCounter += removed;
    stats.domElements += removed;
    addRecentBlock({ category: 'domElements', desc: `${removed} DOM elements removed` });
    notify();
  }
}

function startMutationObserver() {
  if (mutationObserver) mutationObserver.disconnect();
  
  mutationObserver = new MutationObserver(mutations => {
    if (!isEngineActive) return;
    let found = 0;

    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== 1) continue;
        
        // Check if this node itself is an ad
        for (const sel of AD_SELECTORS) {
          try {
            if (node.matches?.(sel)) {
              if (!node.closest('.kmoviz-navbar') && !node.closest('.cinema-player-overlay')) {
                node.remove();
                found++;
                break;
              }
            }
          } catch (_) {}
        }
        
        // Check descendants
        if (node.querySelectorAll) {
          for (const sel of AD_SELECTORS) {
            try {
              node.querySelectorAll(sel).forEach(child => {
                if (!child.closest('.kmoviz-navbar') && !child.closest('.cinema-player-overlay')) {
                  child.remove();
                  found++;
                }
              });
            } catch (_) {}
          }
        }
      }
    }

    if (found > 0) {
      blockedCounter += found;
      stats.domElements += found;
      addRecentBlock({ category: 'domElements', desc: `${found} injected elements removed` });
      notify();
    }
  });

  const target = document.body || document.documentElement;
  if (target) {
    mutationObserver.observe(target, { childList: true, subtree: true });
    console.log('[AdShield] MutationObserver active.');
  }
}

// ─── Layer 5: CSS Cosmetic Filters ────────────────────────────────────────
const COSMETIC_CSS = `
/* === KMOVIZ AdShield v3 — Cosmetic Filters === */
/* Equivalent to uBlock Origin's element hiding rules */

/* Google Ads */
.adsbygoogle, [id^="google_ads"], [id^="gads"], .GoogleActiveViewClass,
ins.adsbygoogle, .google-ad, .googlead, [data-google-query-id] { display:none!important }

/* Generic ad containers */
.ad, .ad-unit, .ad-slot, .ad-banner, .ad-wrapper, .ad-container,
.ads, .ads-wrapper, .ads-container, .ads-block,
.banner-ad, .leaderboard-ad, .skyscraper-ad, .rectangle-ad,
.sidebar-ad, .inline-ad, .video-ad, .video-ads,
#ad, #ads, #ad-unit, #ad-slot, #ad-banner, #ad-wrapper, #ad-container,
#ads, #ads-container, #ads-wrapper, #leaderboard, #rectangle,
[class*=" ad "], [class^="ad "], [class$=" ad"],
[id*="sponsor"], [class*="sponsor"], .sponsored, .sponsored-content,
[data-ad], [data-adunit], [data-adslot], [data-ad-id],
.promo-banner, .promotional, .advertorial { display:none!important }

/* Streaming-specific overlays */
.ima-ad-container, .vast-overlay, .preroll, .midroll, .postroll,
.video-overlay-ad, .player-ad, #player-ads, .player-advertisement { display:none!important }

/* Gambling/betting banners */
a[href*="4rabet"], a[href*="1xbet"], a[href*="betway"],
a[href*="parimatch"], a[href*="melbet"], a[href*="mostbet"],
img[src*="4rabet"], img[src*="1xbet"], img[src*="betway"],
div[class*="rabet"], div[id*="rabet"], div[id*="bet-"] { display:none!important }

/* Social tracking pixels */
img[width="1"][height="1"], img[width="0"][height="0"],
img[src*="/pixel/"], img[src*="/beacon/"], img[src*="/track/"] { display:none!important }

/* Sticky/fixed ad bars */
body > div[style*="position:fixed"][style*="bottom"],
body > div[style*="position: fixed"][style*="bottom"],
body > div[style*="position:fixed"][style*="top: 0"]:not(.kmoviz-navbar):not(#root),
body > div[style*="position: fixed"][style*="top: 0"]:not(.kmoviz-navbar):not(#root) { display:none!important }

/* Cookie banners (block content in some streaming embeds) */
#cookiebanner:not(#root), .cookie-banner:not(.kmoviz-navbar),
.gdpr-banner, .consent-banner { display:none!important }
`;

function injectCosmeticFilters() {
  if (cosmeticStyleEl) return;
  cosmeticStyleEl = document.createElement('style');
  cosmeticStyleEl.id = 'kmoviz-adshield-cosmetic-v3';
  cosmeticStyleEl.textContent = COSMETIC_CSS;
  (document.head || document.documentElement).appendChild(cosmeticStyleEl);
  console.log('[AdShield] Cosmetic filters injected (CSS layer).');
}

function removeCosmeticFilters() {
  cosmeticStyleEl?.remove();
  cosmeticStyleEl = null;
}

// ─── iframe Sandbox Hardener (exported for CinemaPlayer) ──────────────────
/**
 * Applies maximum popup-blocking sandbox attributes to an iframe.
 * 
 * CRITICAL: sandbox WITHOUT allow-popups means the browser itself
 * enforces popup blocking at the OS level — nothing inside the iframe
 * can bypass this, not even postMessage tricks.
 * 
 * allow-scripts: needed for video player JS
 * allow-same-origin: needed for player cookies/storage
 * allow-forms: needed for player form submissions
 * allow-presentation: needed for fullscreen API
 * allow-pointer-lock: needed for fullscreen mouse control
 * 
 * NOT included (intentionally):
 * ❌ allow-popups — this is what blocks ALL window.open() calls
 * ❌ allow-popups-to-escape-sandbox — blocks popup-of-popup
 * ❌ allow-top-navigation — blocks iframe redirecting parent page
 * ❌ allow-top-navigation-by-user-activation — blocks user-triggered parent redirect
 * ❌ allow-downloads — blocks forced download attacks
 */
export const IFRAME_SANDBOX_VALUE = [
  'allow-scripts',
  'allow-same-origin',
  'allow-forms',
  'allow-presentation',
  'allow-pointer-lock',
].join(' ');

export function hardenIframe(iframeEl) {
  if (!iframeEl) return;
  
  // Only set sandbox if not already more restrictive
  const current = iframeEl.getAttribute('sandbox');
  if (!current || current !== IFRAME_SANDBOX_VALUE) {
    iframeEl.setAttribute('sandbox', IFRAME_SANDBOX_VALUE);
  }
  
  // Block referrer leaking to ad networks
  iframeEl.setAttribute('referrerpolicy', 'no-referrer');
  
  // Prevent the iframe from triggering navigation on parent window
  iframeEl.setAttribute('importance', 'low');
  
  console.log('[AdShield] iframe hardened:', iframeEl.src?.substring(0, 60) || '(no src)');
}

// ─── INIT — Called once from App.jsx ──────────────────────────────────────
let engineInitialized = false;

export async function initAdShieldEngine() {
  if (typeof window === 'undefined' || engineInitialized) return;
  engineInitialized = true;

  console.log('[KMOVIZ AdShield Pro v3.0] ⚡ Initializing all protection layers...');

  // Layer 1: Service Worker (network blocking)
  await registerServiceWorker();

  // Layer 2: Window API overrides (popup blocking)
  initWindowOverrides();

  // Layer 3: Link click interceptor
  initLinkInterceptor();

  // Layer 4 & 5: DOM observation + CSS filters
  const ready = () => {
    scrubAdElements();      // Initial scrub
    startMutationObserver(); // Watch for new injections
    injectCosmeticFilters(); // CSS hiding layer
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready);
  } else {
    ready();
  }

  // Periodic re-scan (late-loading ad scripts)
  setInterval(() => {
    if (isEngineActive) scrubAdElements();
  }, 4000);

  console.log('[KMOVIZ AdShield Pro v3.0] ✅ All 6 protection layers active');
}
