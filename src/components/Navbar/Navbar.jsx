import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, X, Play, Dices, Film, Tv, Sparkles } from 'lucide-react';
import './Navbar.scss';

export default function Navbar({
  activeTab,
  onSelectTab,
  onOpenSearch,
  searchQuery,
  onSearchChange,
  onOpenCustomPlayer,
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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close notifications dropdown on click outside
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
    if (!isSearchOpen) {
      setIsSearchOpen(true);
      setTimeout(() => searchInputRef.current?.focus(), 150);
      onOpenSearch(true);
    } else {
      if (!searchQuery) {
        setIsSearchOpen(false);
        onOpenSearch(false);
      }
    }
  };

  const handleClearSearch = () => {
    onSearchChange('');
    setIsSearchOpen(false);
    onOpenSearch(false);
  };

  return (
    <header className="kmoviz-header-wrapper">
      <nav ref={navRef} className={`kmoviz-navbar ${isScrolled ? 'scrolled' : ''}`}>
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

          {/* Navigation Category Tabs */}
          <ul className="nav-links">
            <li className={activeTab === 'home' ? 'active' : ''} onClick={() => onSelectTab('home')}>
              <span>Home</span>
            </li>
            <li className={activeTab === 'movies' ? 'active' : ''} onClick={() => onSelectTab('movies')}>
              <span>Movies</span>
            </li>
            <li className={activeTab === 'tvshows' ? 'active' : ''} onClick={() => onSelectTab('tvshows')}>
              <span>TV Series</span>
            </li>
            <li className={activeTab === 'regional' ? 'active' : ''} onClick={() => onSelectTab('regional')}>
              <span>Regional & Bollywood</span>
            </li>
            <li className={activeTab === 'mylist' ? 'active' : ''} onClick={() => onSelectTab('mylist')}>
              <span>My List</span>
              {watchlistCount > 0 && <span className="nav-badge">{watchlistCount}</span>}
            </li>
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
            <span>Surprise Me</span>
          </button>

          {/* ▶ Direct Stream / Universal Engine Launcher Button */}
          <button 
            className="custom-stream-btn"
            title="Direct IMDB / TMDB Stream Engine"
            onClick={onOpenCustomPlayer}
          >
            <Play size={14} className="play-icon" />
            <span>Direct Stream</span>
          </button>

          {/* Interactive Search Bar */}
          <div className={`nav-search-container ${isSearchOpen || searchQuery ? 'open' : ''}`}>
            <button className="search-btn" onClick={handleToggleSearch} title="Search 10,000+ movies and series">
              <Search size={18} />
            </button>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search movies, TV shows, actors..."
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
              <div className="notif-dropdown">
                <div className="notif-header">
                  <Sparkles size={14} className="sparkle-icon" />
                  <span>KMOVIZ Cinema Feeds</span>
                </div>
                <div className="notif-items-list">
                  <div className="notif-item">
                    <div 
                      className="notif-img" 
                      style={{ backgroundImage: 'url(https://image.tmdb.org/t/p/w500/iPOn6DinuVyLY17YM9mKuPofV08.jpg)' }}
                    />
                    <div className="notif-text">
                      <p className="title">Spider-Man: Brand New Day</p>
                      <p className="desc">Now streaming in 4K Ultra HD with Dolby Atmos.</p>
                      <span className="time">New Release</span>
                    </div>
                  </div>
                  <div className="notif-item">
                    <div 
                      className="notif-img" 
                      style={{ backgroundImage: 'url(https://image.tmdb.org/t/p/w500/kY9L6iY71Yk49QvYwL1jWl8P4jF.jpg)' }}
                    />
                    <div className="notif-text">
                      <p className="title">Toy Story 5 (2026)</p>
                      <p className="desc">Added to 4K Ultra HD blockbusters catalog.</p>
                      <span className="time">Just added</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
