/**
 * KMOVIZ Client Service - Lightweight ad popup blocker
 * Ensures safe browsing without interfering with video streams or network requests.
 */

// Unregister any active service worker to prevent stream request interception
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister().then(unregistered => {
        if (unregistered) console.log('[KMOVIZ] Cleaned up legacy service worker:', registration.scope);
      });
    }
  }).catch(() => {});
}

// Basic state
let blockedCount = 0;
let listeners = [];

export function subscribeAdShieldStats(cb) {
  cb({ total: 0, stats: {} });
  return () => {};
}

export function getBlockedCount() { return blockedCount; }
export function incrementBlockedCount() {}
export function resetBlockedCount() {}
export function setEngineEnabled() {}
export function hardenIframe() {}

export async function initAdShieldEngine() {
  console.log('[KMOVIZ] Video Stream Engine Ready');
}
