import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ShieldCheck, ShieldOff, Zap } from 'lucide-react';
import { incrementBlockedCount } from '../../services/adShieldService';
import './ClickShield.scss';

/**
 * AdShield ClickShield — The most critical ad-blocking component.
 * 
 * Problem: Video embed iframes (vidsrc, vsembed, etc.) have invisible ad overlay 
 * divs that trigger window.open() / popunders on EVERY click, BEFORE the video 
 * controls respond. This is how streaming ad networks make money.
 * 
 * Solution (same as uBlock Origin content script):
 * 1. Place a transparent shield div OVER the iframe
 * 2. On click: record the click, make shield transparent (pointer-events:none) 
 *    for exactly 180ms so the click passes through to video controls
 * 3. The iframe's popup-triggering code runs but is blocked by:
 *    a) iframe sandbox="..." without allow-popups (browser enforces this)
 *    b) Our window.open() override in adShieldService.js  
 * 4. Shield goes back to active after 180ms
 * 5. Show "Blocked!" toast if a popup was caught
 * 
 * Additional protection layers active simultaneously:
 * - Right-click context menu is suppressed (stops "open in new tab" on ad links)
 * - Middle mouse click (opens in new tab) is intercepted
 * - Touch events are sanitized to prevent touch-triggered popunders
 */
export default function ClickShield({ children, isActive, onPopupBlocked }) {
  const shieldRef = useRef(null);
  const passThroughTimerRef = useRef(null);
  const [isPassThrough, setIsPassThrough] = useState(false);
  const [blockedToast, setBlockedToast] = useState(null);
  const toastTimerRef = useRef(null);
  const clickCountRef = useRef(0);
  const lastClickTimeRef = useRef(0);

  const showBlockedToast = useCallback((message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setBlockedToast(message);
    toastTimerRef.current = setTimeout(() => setBlockedToast(null), 2500);
  }, []);

  // Listen for window.open blocked events from our adShieldService override
  useEffect(() => {
    const handleMessage = (e) => {
      if (e.data?.type === 'ADSHIELD_POPUP_BLOCKED') {
        showBlockedToast(`Popup blocked: ${e.data.domain || 'ad network'}`);
        incrementBlockedCount(1, 'popups');
        if (onPopupBlocked) onPopupBlocked(e.data.domain);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [showBlockedToast, onPopupBlocked]);

  const handleShieldClick = useCallback((e) => {
    if (!isActive) return;
    
    const now = Date.now();
    const timeSinceLast = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;
    clickCountRef.current++;

    // Rapid successive clicks (< 300ms apart) = likely ad click pattern — block them
    if (timeSinceLast < 300 && clickCountRef.current > 1) {
      e.preventDefault();
      e.stopPropagation();
      showBlockedToast('Ad click pattern blocked');
      incrementBlockedCount(1, 'clickjacks');
      return;
    }

    // First/normal click: let it through to video controls for 180ms
    // The sandbox attribute handles blocking any popup the iframe tries to open
    setIsPassThrough(true);
    if (passThroughTimerRef.current) clearTimeout(passThroughTimerRef.current);
    passThroughTimerRef.current = setTimeout(() => {
      setIsPassThrough(false);
      // Reset click count after a full second of no clicks
      setTimeout(() => { clickCountRef.current = 0; }, 1000);
    }, 180);
  }, [isActive, showBlockedToast]);

  // Block right-click (prevents "Open link in new tab" on ad links)
  const handleContextMenu = useCallback((e) => {
    if (!isActive) return;
    e.preventDefault();
    e.stopPropagation();
  }, [isActive]);

  // Block middle-click (opens in new tab)
  const handleAuxClick = useCallback((e) => {
    if (!isActive) return;
    if (e.button === 1) { // middle button
      e.preventDefault();
      e.stopPropagation();
      showBlockedToast('Middle-click redirect blocked');
      incrementBlockedCount(1, 'clickjacks');
    }
  }, [isActive, showBlockedToast]);

  // Touch: sanitize to prevent touch-triggered popunders
  const handleTouchStart = useCallback((e) => {
    if (!isActive) return;
    const now = Date.now();
    const timeSinceLast = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;

    // Multi-touch (2+ fingers) is sometimes used for popunders
    if (e.touches.length > 1) {
      e.preventDefault();
      return;
    }

    // Pass through single touch
    setIsPassThrough(true);
    if (passThroughTimerRef.current) clearTimeout(passThroughTimerRef.current);
    passThroughTimerRef.current = setTimeout(() => {
      setIsPassThrough(false);
    }, 180);
  }, [isActive]);

  useEffect(() => {
    return () => {
      if (passThroughTimerRef.current) clearTimeout(passThroughTimerRef.current);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  return (
    <div className="click-shield-wrapper">
      {children}

      {/* The Shield Overlay — sits on top of iframe, intercepts clicks */}
      {isActive && (
        <div
          ref={shieldRef}
          className={`click-shield-overlay ${isPassThrough ? 'pass-through' : ''}`}
          onClick={handleShieldClick}
          onContextMenu={handleContextMenu}
          onAuxClick={handleAuxClick}
          onTouchStart={handleTouchStart}
          aria-hidden="true"
        />
      )}

      {/* Blocked Toast Notification */}
      {blockedToast && (
        <div className="adshield-blocked-toast">
          <ShieldCheck size={14} />
          <span>{blockedToast}</span>
        </div>
      )}

      {/* Shield Status Indicator */}
      {isActive && (
        <div className="shield-active-badge">
          <Zap size={10} />
          <span>AdShield Active</span>
        </div>
      )}
    </div>
  );
}
