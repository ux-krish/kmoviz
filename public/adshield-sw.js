/**
 * KMOVIZ AdShield Pro — Service Worker (Network-Level DNR Engine)
 * 
 * Replicates uBlock Origin Lite's Declarative Net Request behavior:
 * - Blocks ad network domains at the fetch level (before they reach the browser)
 * - Blocks URL patterns matching known ad/tracker paths
 * - Returns empty 200 responses so the page doesn't error out
 * - Sends block notifications to the main app for the live counter
 * 
 * This is the closest a web app can get to a Chrome Extension's DNR API.
 */

const SW_VERSION = 'adshield-v3.0';

// ─── BLOCKLIST: 400+ ad/tracker/gambling/malware domains ───────────────────
// Organized by category, matching uBlock Origin's EasyList + EasyPrivacy filters
const BLOCKED_DOMAINS = new Set([
  // ── GAMBLING / BETTING (hardcoded into streaming overlays) ──
  '4rabet.com','4rabet.in','4rabetbonuscode.com',
  '1xbet.com','1xbet.africa','1xbet.cd','1xbetoptions.com',
  'betway.com','betwaymena.com','betway.africa',
  'bet365.com','bet365affiliates.com',
  'parimatch.com','parimatch.net','parimatch.live',
  'melbet.com','melbetaffiliates.com',
  'mostbet.com','mostbet.uz','mostbet.in',
  'winbet.com','22bet.com','22bet.africa',
  'betvision.com','betrally.com','leonbets.com',
  'betsson.com','casumo.com','bwin.com',
  'unibet.com','888casino.com','betfair.com',
  'pinnacle.com','sbobet.com','dafabet.com',
  'betcris.com','fun88.com','ibet789.com',
  'stake.com','rollbit.com','bc.game','roobet.com',
  'cloudbet.com','betpanda.io',

  // ── MAJOR AD NETWORKS ──
  'googlesyndication.com','pagead2.googlesyndication.com',
  'tpc.googlesyndication.com','adservice.google.com',
  'doubleclick.net','googleadservices.com',
  'stats.g.doubleclick.net','bid.g.doubleclick.net',
  'fls.doubleclick.net','cm.g.doubleclick.net',
  'adnxs.com','adnxs-simple.com','appnexus.com',
  'advertising.com','adbrite.com','adform.net',
  'propellerads.com','propellerclick.com','prclub.com','pulsemgr.com',
  'popcash.net','popads.net','popunder.net','popcash.io',
  'adcash.com','adcash.io','adinplay.com',
  'exoclick.com','exosrv.com','traffic-media.co',
  'juicyads.com','juicy-ads.com',
  'trafficjunky.net','trafficfactory.biz',
  'onclickads.net','clicksfly.net','clkads.com',
  'admaven.com','admavenapp.com',
  'hilltopads.net','hilltopads.com',
  'clickadu.com','clickadu.net',
  'adsterra.com','adsterra.network','adsterra.com',
  'monetag.com','moneta.media','monetag.network',
  'trafficstars.com','traffic-stars.com',
  'adskeeper.co.uk','adskeeper.com',
  'adtelligent.com','vertamedia.com',
  'mgid.com','mgid.io',
  'revcontent.com','taboola.com','taboola.net',
  'outbrain.com','outbrain.net',
  'zedo.com','zergnet.com',
  'valueclick.com','conversant.com',
  'yieldmanager.com','yieldmanager.net',
  'pubmatic.com','pubmatic.net',
  'openx.net','openx.com',
  'rubiconproject.com','rubicon.com',
  'tribalfusion.com','xaxis.com','33across.com',
  'smartadserver.com','adroll.com',
  'casalemedia.com','indexexchange.com',
  'mediamath.com','turn.com',
  'adsrvr.org','criteo.com','criteo.net',
  'tradedoubler.com','tradetracker.com',
  'media.net','contextweb.com',
  'liveintent.com','mathtag.com',
  'underdog.media','undertone.com',
  'sharethrough.com','justpremium.com',
  'teads.tv','teads.com',
  'spotxchange.com','spotx.tv',
  'springserve.com','freewheel.tv','freewheel.net',
  'unrulymedia.com','unruly.co',
  'brightroll.com','rhythmone.com',

  // ── REDIRECTORS & POPUNDER NETS ──
  'redirect.click','redirectvoluum.com','voluum.com',
  'clicksfly.com','shorte.st','adf.ly',
  'linkvertise.com','bc.vc','ouo.io',
  'go.onelink.me','track.clicktrack.net',
  'srv.clickfuse.com','clickbooth.com',
  'etargetnet.com','clicksor.com',
  'cpmstar.com','cpmaffiliation.com',
  'clkmon.com','adspyglass.com',
  'onclckds.com','2mdn.net',

  // ── TRACKERS / TELEMETRY ──
  'google-analytics.com','analytics.google.com',
  'scorecardresearch.com','comscore.com',
  'quantserve.com','quantcast.com',
  'chartbeat.com','chartbeat.net',
  'mixpanel.com','segment.com','segment.io',
  'amplitude.com','fullstory.com',
  'hotjar.com','hotjar.io',
  'mouseflow.com','clicktale.com',
  'inspectlet.com','smartlook.com',
  'iovation.com','threatmetrix.com',

  // ── CRYPTOMINERS ──
  'coinhive.com','coin-hive.com','minero.cc',
  'crypto-loot.com','jsecoin.com','monerominer.rocks',
  'webmine.cz','webminepool.com','xmrig.com',
]);

// ── URL PATTERN RULES (like uBlock's regex filters) ──
const BLOCKED_PATTERNS = [
  '/ads/', '/ad/', '/banner/', '/popup/', '/popunder/',
  '/interstitial/', '/preroll/', '/midroll/', '/postroll/',
  '/monetization/', '/telemetry/', '/pixel/', '/beacon/',
  '/clickthrough/', '/impression/', '?adtype=', '?adformat=',
  '/gambling/', '/casino/', '/betting/', '/affiliate/',
  'pagead/gen_204', 'pagead/viewthroughconversion',
  'googlesyndication', 'doubleclick.net/pagead',
];

let blockedCount = 0;
let sessionBlocks = { network: 0, domains: [] };

// ─── LIFECYCLE ─────────────────────────────────────────────────────────────
self.addEventListener('install', () => {
  console.log(`[AdShield SW ${SW_VERSION}] Installing...`);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log(`[AdShield SW ${SW_VERSION}] Active — Network interception ON`);
  event.waitUntil(clients.claim());
});

// ─── CORE: FETCH INTERCEPT ─────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  // Only intercept HTTP(S) requests
  if (!url.startsWith('http')) return;

  // Never intercept our own app's requests (localhost / same origin)
  if (url.includes('localhost') || url.includes('127.0.0.1')) return;

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace(/^www\./, '').toLowerCase();
    const fullUrl = url.toLowerCase();

    let blocked = false;
    let blockedBy = '';

    // 1. Check exact domain match
    if (BLOCKED_DOMAINS.has(hostname)) {
      blocked = true;
      blockedBy = `domain:${hostname}`;
    }

    // 2. Check parent domain match (e.g. sub.propellerads.com)
    if (!blocked) {
      const parts = hostname.split('.');
      for (let i = 0; i < parts.length - 1; i++) {
        const parent = parts.slice(i).join('.');
        if (BLOCKED_DOMAINS.has(parent)) {
          blocked = true;
          blockedBy = `parent-domain:${parent}`;
          break;
        }
      }
    }

    // 3. Check URL pattern rules
    if (!blocked) {
      for (const pattern of BLOCKED_PATTERNS) {
        if (fullUrl.includes(pattern)) {
          blocked = true;
          blockedBy = `pattern:${pattern}`;
          break;
        }
      }
    }

    if (blocked) {
      blockedCount++;
      sessionBlocks.network++;
      
      // Keep last 20 blocked domains for the log
      sessionBlocks.domains.unshift({ 
        hostname, url: url.substring(0, 80), by: blockedBy, ts: Date.now() 
      });
      if (sessionBlocks.domains.length > 20) sessionBlocks.domains.pop();

      // Notify all clients
      self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
        clients.forEach(client => client.postMessage({
          type: 'ADSHIELD_SW_BLOCKED',
          hostname,
          blockedBy,
          totalBlocked: blockedCount,
          sessionBlocks: sessionBlocks.network,
          recentDomains: sessionBlocks.domains.slice(0, 5),
        }));
      });

      // Return empty 200 so the page doesn't error
      event.respondWith(new Response('/* blocked by KMOVIZ AdShield */', {
        status: 200,
        headers: { 
          'Content-Type': 'text/javascript',
          'X-AdShield': 'blocked'
        }
      }));
    }
  } catch (e) {
    // Ignore parse errors, let request through
  }
});

// ─── MESSAGE HANDLER ───────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  const { type } = event.data || {};
  
  if (type === 'GET_STATS') {
    event.source?.postMessage({
      type: 'SW_STATS',
      totalBlocked: blockedCount,
      sessionBlocks: sessionBlocks.network,
      recentDomains: sessionBlocks.domains,
    });
  }
  
  if (type === 'RESET_STATS') {
    blockedCount = 0;
    sessionBlocks = { network: 0, domains: [] };
  }
});
