import React, { useState } from 'react';
import MediaCard from '../MediaCard/MediaCard';
import { BookmarkCheck, History, Film, Tv, Sparkles, Trash2 } from 'lucide-react';
import { clearWatchlist, clearWatchHistory } from '../../services/storageService';
import './WatchlistView.scss';

export default function WatchlistView({
  watchlist = [],
  history = [],
  onPlay,
  onOpenDetail,
  onWatchlistChange
}) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'movie' | 'tv'

  const filteredWatchlist = watchlist.filter(item => {
    if (filterType === 'all') return true;
    if (filterType === 'movie') return item.type === 'movie' || !item.seasons;
    if (filterType === 'tv') return item.type === 'tv' || Boolean(item.seasons);
    return true;
  });

  const handleClearWatchlist = () => {
    if (window.confirm('Are you sure you want to clear your saved list?')) {
      clearWatchlist();
      if (onWatchlistChange) onWatchlistChange();
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your watch history?')) {
      clearWatchHistory();
      if (onWatchlistChange) onWatchlistChange();
    }
  };

  return (
    <div className="watchlist-view-container">
      {/* My List Header with Filter Tabs */}
      <div className="section-block">
        <div className="watchlist-header-bar">
          <div className="section-title-row">
            <div className="title-with-badge">
              <BookmarkCheck size={28} className="section-icon red-icon" />
              <h2>My List</h2>
              <span className="count-badge">{filteredWatchlist.length} titles</span>
            </div>
            <p className="section-subtitle">Your personalized library of saved blockbusters & series</p>
          </div>

          {watchlist.length > 0 && (
            <div className="header-actions-row">
              {/* Type Filter Pills */}
              <div className="type-filter-pills">
                <button
                  className={`filter-pill ${filterType === 'all' ? 'active' : ''}`}
                  onClick={() => setFilterType('all')}
                >
                  <Sparkles size={14} />
                  <span>All ({watchlist.length})</span>
                </button>
                <button
                  className={`filter-pill ${filterType === 'movie' ? 'active' : ''}`}
                  onClick={() => setFilterType('movie')}
                >
                  <Film size={14} />
                  <span>Movies</span>
                </button>
                <button
                  className={`filter-pill ${filterType === 'tv' ? 'active' : ''}`}
                  onClick={() => setFilterType('tv')}
                >
                  <Tv size={14} />
                  <span>TV Shows</span>
                </button>
              </div>

              <button className="clear-btn" onClick={handleClearWatchlist} title="Clear all saved titles">
                <Trash2 size={15} />
                <span>Clear List</span>
              </button>
            </div>
          )}
        </div>

        {filteredWatchlist.length > 0 ? (
          <div className="cards-grid">
            {filteredWatchlist.map((item) => (
              <MediaCard
                key={item.id || item.imdb_id}
                item={item}
                onPlay={onPlay}
                onOpenDetail={onOpenDetail}
                onWatchlistChange={onWatchlistChange}
              />
            ))}
          </div>
        ) : (
          <div className="empty-section-banner">
            <div className="empty-icon-wrap">
              <Film size={42} />
            </div>
            <h3>Your list is currently empty</h3>
            <p>Explore newest 2026/2025 blockbusters and click the "+" button on any card to save them here for instant access.</p>
          </div>
        )}
      </div>

      {/* Watch History Section */}
      {history.length > 0 && (
        <div className="section-block history-block">
          <div className="watchlist-header-bar">
            <div className="section-title-row">
              <div className="title-with-badge">
                <History size={26} className="section-icon gold-icon" />
                <h2>Continue Watching & History</h2>
                <span className="count-badge">{history.length} titles</span>
              </div>
              <p className="section-subtitle">Pick up right where you left off</p>
            </div>

            <button className="clear-btn" onClick={handleClearHistory} title="Clear watch history">
              <Trash2 size={15} />
              <span>Clear History</span>
            </button>
          </div>

          <div className="cards-grid">
            {history.map((item) => (
              <MediaCard
                key={`hist-${item.id || item.imdb_id}-${item.timestamp || ''}`}
                item={item}
                onPlay={onPlay}
                onOpenDetail={onOpenDetail}
                onWatchlistChange={onWatchlistChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
