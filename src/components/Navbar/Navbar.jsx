import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, X, Dices, Film, Tv, Sparkles, Home, Heart, Globe } from 'lucide-react';
import './Navbar.scss';

export default function Navbar({
  activeTab,
  onSelectTab,
  onOpenSearch,
  searchQuery,
  onSearchChange,
  onOpenSurprise,
  watchlistCount = 0
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const searchInputRef = useRef(null);
  const navRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close notifications on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSearch = () => {
    const next = !isSearchOpen;
    setIsSearchOpen(next);
    onOpenSearch(next);
    if (next) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  };

  const handleClearSearch = () => {
    onSearchChange('');
    setIsSearchOpen(false);
    onOpenSearch(false);
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'movies', label: 'Movies' },
    { id: 'tvshows', label: 'TV Series' },
    { id: 'regional', label: 'Regional & Bollywood' },
    { id: 'mylist', label: 'My List', badge: watchlistCount }
  ];

  return (
    <header className="kmoviz-header-wrapper">
      <nav ref={navRef} className={`kmoviz-navbar ${isScrolled ? 'scrolled' : ''}`}>
        {/* Main Navbar Bar */}
        <div className="nav-main-bar">
          <div className="nav-left">
            {/* Futuristic KMOVIZ Brand Logo */}
            <div className="kmoviz-logo" onClick={() => onSelectTab('home')}>
              <div className="logo-icon-wrapper">
                <span className="logo-letter">K</span>
                <div className="play-triangle" />
              </div>
              <span className="logo-text">MOVIZ</span>
              <span className="pro-tag">PRO</span>
            </div>

            {/* Desktop Navigation Links */}
            <ul className="nav-links desktop-only">
              {navItems.map(item => (
                <li
                  key={item.id}
                  className={activeTab === item.id ? 'active' : ''}
                  onClick={() => onSelectTab(item.id)}
                >
                  <span>{item.label}</span>
                  {item.badge > 0 && <span className="nav-badge">{item.badge}</span>}
                </li>
              ))}
            </ul>
          </div>

          <div className="nav-right">
            {/* 🎲 Surprise Me / AI Recommendation Picker Button */}
            <button
              className="surprise-nav-btn"
              onClick={onOpenSurprise}
              title="Can't decide? Pick a movie for me!"
            >
              <Dices size={16} className="dices-icon" />
              <span className="btn-text">Surprise Me</span>
            </button>

            {/* Interactive Search Bar */}
            <div className={`nav-search-container ${isSearchOpen || searchQuery ? 'open' : ''}`}>
              <button className="search-btn" onClick={handleToggleSearch} title="Search movies and series">
                <Search size={18} />
              </button>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search movies, series..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onBlur={() => {
                  if (!searchQuery) setIsSearchOpen(false);
                }}
              />
              {searchQuery && (
                <button className="clear-search-btn" onClick={handleClearSearch} title="Clear search">
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Notifications Center */}
            <div className="nav-notifications" ref={notifRef}>
              <button 
                className="notif-btn" 
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
              >
                <Bell size={18} />
                <span className="notif-dot"></span>
              </button>

              {showNotifications && (
                <div className="notifications-dropdown">
                  <div className="notif-header">
                    <h4>What's New</h4>
                    <span className="badge-new">Live</span>
                  </div>
                  <div className="notif-list">
                    <div className="notif-item unread">
                      <div className="notif-icon">🔥</div>
                      <div className="notif-content">
                        <p className="notif-title">Spider-Man: Brand New Day</p>
                        <p className="notif-desc">Now streaming in 4K Ultra HD Dolby Atmos.</p>
                        <span className="notif-time">Just now</span>
                      </div>
                    </div>
                    <div className="notif-item">
                      <div className="notif-icon">🎬</div>
                      <div className="notif-content">
                        <p className="notif-title">Toy Story 5 Premiered</p>
                        <p className="notif-desc">Pixar's newest adventure is ready to stream.</p>
                        <span className="notif-time">Today</span>
                      </div>
                    </div>
                    <div className="notif-item">
                      <div className="notif-icon">⚡</div>
                      <div className="notif-content">
                        <p className="notif-title">Fast Video Engine Active</p>
                        <p className="notif-desc">High-speed streaming servers ready with auto-resume.</p>
                        <span className="notif-time">Always On</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Horizontal Category Sub-bar (Dedicated scrollable row on small screens) */}
        <div className="mobile-sub-nav">
          {navItems.map(item => (
            <button
              key={item.id}
              type="button"
              className={`mobile-nav-pill ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <span>{item.label}</span>
              {item.badge > 0 && <span className="mobile-pill-badge">{item.badge}</span>}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
