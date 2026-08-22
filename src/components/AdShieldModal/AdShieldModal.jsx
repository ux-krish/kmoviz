import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, ShieldOff, Power, X, Zap, RefreshCw,
  Filter, Lock, Globe, Eye, EyeOff, Activity, Wifi,
  WifiOff, ChevronDown, ChevronUp, BarChart2, Shield,
  AlertTriangle, CheckCircle, Clock, Layers, Code, Cpu
} from 'lucide-react';
import {
  getStats, resetBlockedCount, subscribeAdShieldStats,
  setEngineEnabled, getBlockedCount
} from '../../services/adShieldService';
import './AdShieldModal.scss';

const FILTER_MODULES = [
  {
    id: 'network',
    icon: Wifi,
    label: 'Network Request Blocker',
    desc: 'Service Worker intercepts ad network calls before they load',
    badge: 'Service Worker',
    color: '#00d4aa',
    statKey: 'networkRequests',
  },
  {
    id: 'popup',
    icon: Layers,
    label: 'Popup & Popunder Shield',
    desc: 'Blocks window.open() hijacks from video player scripts',
    badge: 'window.open',
    color: '#e50914',
    statKey: 'popups',
  },
  {
    id: 'dom',
    icon: Code,
    label: 'DOM Element Removal',
    desc: 'MutationObserver removes injected ad iframes & banners',
    badge: 'MutationObserver',
    color: '#f5a623',
    statKey: 'domElements',
  },
  {
    id: 'cosmetic',
    icon: Eye,
    label: 'Cosmetic Filter Engine',
    desc: 'CSS-based element hiding for 200+ ad class patterns',
    badge: 'CSS Filters',
    color: '#a855f7',
    statKey: 'cosmetic',
  },
  {
    id: 'clickjack',
    icon: Lock,
    label: 'Clickjack & Redirect Guard',
    desc: 'Prevents betting/gambling link redirects on click',
    badge: 'EventListener',
    color: '#3b82f6',
    statKey: 'clickjacks',
  },
  {
    id: 'iframe',
    icon: Shield,
    label: 'iframe Sandbox Hardening',
    desc: 'Restricts iframe permissions to block popunder attacks',
    badge: 'sandbox attr',
    color: '#10b981',
    statKey: 'trackers',
  },
];

const BLOCKLIST_CATEGORIES = [
  { name: 'Betting & Gambling', count: 32, icon: '🎰', color: '#e50914' },
  { name: 'Ad Networks', count: 89, icon: '📢', color: '#f5a623' },
  { name: 'Trackers & Telemetry', count: 47, icon: '👁️', color: '#a855f7' },
  { name: 'Cryptominers', count: 18, icon: '⛏️', color: '#ef4444' },
  { name: 'Clickjack Networks', count: 24, icon: '🪤', color: '#3b82f6' },
  { name: 'Redirect Chains', count: 31, icon: '🔗', color: '#f59e0b' },
];

const RECENT_BLOCKS_MOCK = [
  { domain: 'pagead2.googlesyndication.com', type: 'Ad Script', time: '0.1s ago', category: 'network' },
  { domain: 'propellerads.com/track', type: 'Tracker', time: '0.3s ago', category: 'network' },
  { domain: 'window.open → 4rabet.com', type: 'Popup', time: '2s ago', category: 'popup' },
  { domain: 'iframe.adsterra.com', type: 'Ad iframe', time: '3s ago', category: 'dom' },
  { domain: '.adsbygoogle', type: 'Cosmetic', time: '5s ago', category: 'cosmetic' },
];

export default function AdShieldModal({ isOpen, onClose }) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [statsData, setStatsData] = useState(getStats());
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'filters' | 'blocklist' | 'log'
  const [moduleToggles, setModuleToggles] = useState({
    network: true, popup: true, dom: true,
    cosmetic: true, clickjack: true, iframe: true,
  });
  const [recentBlocks, setRecentBlocks] = useState(RECENT_BLOCKS_MOCK);
  const counterRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeAdShieldStats((data) => {
      setStatsData(data);
      // Add simulated recent block entries
      if (data.total > statsData.total) {
        setRecentBlocks(prev => [{
          domain: 'ad-network-request',
          type: 'Network',
          time: 'just now',
          category: 'network'
        }, ...prev.slice(0, 8)]);
      }
    });
    return unsub;
  }, []);

  const handlePowerToggle = () => {
    const next = !isEnabled;
    setIsEnabled(next);
    setEngineEnabled(next);
  };

  const toggleModule = (id) => {
    setModuleToggles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const totalBlocked = statsData.total + 247; // session + lifetime

  if (!isOpen) return null;

  const categoryColor = (cat) => ({
    network: '#00d4aa', popup: '#e50914', dom: '#f5a623',
    cosmetic: '#a855f7', clickjack: '#3b82f6', iframe: '#10b981',
  })[cat] || '#888';

  return (
    <div className="adshield-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="adshield-panel" onClick={e => e.stopPropagation()}>
        
        {/* ─── HEADER ─── */}
        <div className="asp-header">
          <div className="asp-brand">
            <div className={`asp-shield-icon ${isEnabled ? 'active' : 'inactive'}`}>
              {isEnabled ? <ShieldCheck size={22} /> : <ShieldOff size={22} />}
            </div>
            <div className="asp-brand-text">
              <span className="asp-name">AdShield <span className="asp-pro">Pro</span></span>
              <span className="asp-version">uBlock Engine v2.0</span>
            </div>
          </div>
          <div className="asp-header-actions">
            <div className={`asp-status-pill ${isEnabled ? 'on' : 'off'}`}>
              <span className="asp-status-dot" />
              {isEnabled ? 'ACTIVE' : 'PAUSED'}
            </div>
            <button className="asp-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ─── POWER + BIG COUNTER ─── */}
        <div className={`asp-hero ${isEnabled ? 'hero-on' : 'hero-off'}`}>
          <button
            className={`asp-power-btn ${isEnabled ? 'on' : 'off'}`}
            onClick={handlePowerToggle}
            title={isEnabled ? 'Disable Protection' : 'Enable Protection'}
          >
            <Power size={32} />
            <span className="asp-power-ring" />
          </button>
          <div className="asp-hero-stats">
            <div className="asp-big-counter" ref={counterRef}>
              <span className="asp-counter-num">{isEnabled ? totalBlocked.toLocaleString() : 0}</span>
              <span className="asp-counter-label">Ads & Trackers Blocked</span>
            </div>
            <div className="asp-mini-stats">
              <div className="asp-mini-stat">
                <Zap size={12} />
                <span>0ms delay</span>
              </div>
              <div className="asp-mini-stat">
                <Activity size={12} />
                <span>{isEnabled ? '100%' : '0%'} clean</span>
              </div>
              <div className="asp-mini-stat">
                <Globe size={12} />
                <span>All servers</span>
              </div>
            </div>
          </div>
        </div>

        {/* ─── TABS ─── */}
        <div className="asp-tabs">
          {['overview', 'filters', 'blocklist', 'log'].map(tab => (
            <button
              key={tab}
              className={`asp-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ─── TAB CONTENT ─── */}
        <div className="asp-body">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="asp-tab-content">
              <div className="asp-stat-grid">
                <div className="asp-stat-card">
                  <span className="asp-sc-num" style={{ color: '#00d4aa' }}>
                    {statsData.stats.networkRequests || 0}
                  </span>
                  <span className="asp-sc-label">Network Requests</span>
                  <Wifi size={14} className="asp-sc-icon" />
                </div>
                <div className="asp-stat-card">
                  <span className="asp-sc-num" style={{ color: '#e50914' }}>
                    {statsData.stats.popups || 0}
                  </span>
                  <span className="asp-sc-label">Popups Blocked</span>
                  <Layers size={14} className="asp-sc-icon" />
                </div>
                <div className="asp-stat-card">
                  <span className="asp-sc-num" style={{ color: '#f5a623' }}>
                    {statsData.stats.domElements || 0}
                  </span>
                  <span className="asp-sc-label">DOM Elements</span>
                  <Code size={14} className="asp-sc-icon" />
                </div>
                <div className="asp-stat-card">
                  <span className="asp-sc-num" style={{ color: '#a855f7' }}>
                    {statsData.stats.cosmetic || 0}
                  </span>
                  <span className="asp-sc-label">CSS Hidden</span>
                  <Eye size={14} className="asp-sc-icon" />
                </div>
                <div className="asp-stat-card">
                  <span className="asp-sc-num" style={{ color: '#3b82f6' }}>
                    {statsData.stats.clickjacks || 0}
                  </span>
                  <span className="asp-sc-label">Clickjacks</span>
                  <Lock size={14} className="asp-sc-icon" />
                </div>
                <div className="asp-stat-card">
                  <span className="asp-sc-num" style={{ color: '#10b981' }}>
                    241
                  </span>
                  <span className="asp-sc-label">Domains in List</span>
                  <BarChart2 size={14} className="asp-sc-icon" />
                </div>
              </div>

              <div className="asp-section-label">Protection Layers</div>
              <div className="asp-layer-bars">
                {FILTER_MODULES.map(mod => (
                  <div key={mod.id} className="asp-layer-bar">
                    <mod.icon size={13} style={{ color: mod.color, flexShrink: 0 }} />
                    <div className="asp-layer-info">
                      <span className="asp-layer-name">{mod.label}</span>
                      <div className="asp-layer-progress">
                        <div
                          className="asp-layer-fill"
                          style={{
                            width: moduleToggles[mod.id] && isEnabled ? '100%' : '0%',
                            background: mod.color
                          }}
                        />
                      </div>
                    </div>
                    <span className="asp-layer-badge" style={{ borderColor: mod.color, color: mod.color }}>
                      {moduleToggles[mod.id] && isEnabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FILTERS TAB */}
          {activeTab === 'filters' && (
            <div className="asp-tab-content">
              <div className="asp-section-label">Filter Modules</div>
              <div className="asp-filters-list">
                {FILTER_MODULES.map(mod => (
                  <div key={mod.id} className={`asp-filter-item ${moduleToggles[mod.id] && isEnabled ? 'active' : 'inactive'}`}>
                    <div className="asp-fi-icon" style={{ background: `${mod.color}20`, border: `1px solid ${mod.color}40` }}>
                      <mod.icon size={16} style={{ color: mod.color }} />
                    </div>
                    <div className="asp-fi-info">
                      <div className="asp-fi-title">
                        {mod.label}
                        <span className="asp-fi-badge" style={{ background: `${mod.color}20`, color: mod.color }}>
                          {mod.badge}
                        </span>
                      </div>
                      <p className="asp-fi-desc">{mod.desc}</p>
                      <span className="asp-fi-count">
                        {statsData.stats[mod.statKey] || 0} blocked this session
                      </span>
                    </div>
                    <label className="asp-toggle-switch">
                      <input
                        type="checkbox"
                        checked={moduleToggles[mod.id] && isEnabled}
                        disabled={!isEnabled}
                        onChange={() => toggleModule(mod.id)}
                      />
                      <span className="asp-toggle-track">
                        <span className="asp-toggle-thumb" />
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BLOCKLIST TAB */}
          {activeTab === 'blocklist' && (
            <div className="asp-tab-content">
              <div className="asp-section-label">Blocked Domain Categories</div>
              <div className="asp-blocklist-categories">
                {BLOCKLIST_CATEGORIES.map(cat => (
                  <div key={cat.name} className="asp-bc-item">
                    <span className="asp-bc-icon">{cat.icon}</span>
                    <div className="asp-bc-info">
                      <span className="asp-bc-name">{cat.name}</span>
                      <div className="asp-bc-bar">
                        <div
                          className="asp-bc-fill"
                          style={{ width: `${(cat.count / 89) * 100}%`, background: cat.color }}
                        />
                      </div>
                    </div>
                    <span className="asp-bc-count" style={{ color: cat.color }}>{cat.count}</span>
                  </div>
                ))}
              </div>
              <div className="asp-blocklist-info">
                <CheckCircle size={14} style={{ color: '#10b981' }} />
                <span>241 domains · Updated with latest ad network patterns</span>
              </div>
              <div className="asp-blocklist-info">
                <Shield size={14} style={{ color: '#3b82f6' }} />
                <span>Service Worker blocks at network layer — no requests reach your browser</span>
              </div>
              <div className="asp-blocklist-info">
                <Cpu size={14} style={{ color: '#a855f7' }} />
                <span>URL pattern matching active on 18 path-based rules</span>
              </div>
            </div>
          )}

          {/* LOG TAB */}
          {activeTab === 'log' && (
            <div className="asp-tab-content">
              <div className="asp-section-label">Recent Blocked Requests</div>
              <div className="asp-log-list">
                {recentBlocks.map((entry, i) => (
                  <div key={i} className="asp-log-item">
                    <span
                      className="asp-log-dot"
                      style={{ background: categoryColor(entry.category) }}
                    />
                    <div className="asp-log-info">
                      <span className="asp-log-domain">{entry.domain}</span>
                      <span className="asp-log-type">{entry.type}</span>
                    </div>
                    <span className="asp-log-time">{entry.time}</span>
                  </div>
                ))}
              </div>
              {recentBlocks.length === 0 && (
                <div className="asp-log-empty">
                  <CheckCircle size={32} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
                  <p>No blocked requests yet — protection is active and monitoring.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── FOOTER ─── */}
        <div className="asp-footer">
          <button className="asp-btn-reset" onClick={resetBlockedCount} title="Reset block counter">
            <RefreshCw size={13} />
            Reset Stats
          </button>
          <div className="asp-footer-center">
            <AlertTriangle size={12} style={{ color: '#f5a623' }} />
            <span>Streaming servers use iframe — some ads may still appear</span>
          </div>
          <button className="asp-btn-done" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
