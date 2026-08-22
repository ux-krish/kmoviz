import React, { useState, useEffect, useRef, useMemo } from 'react';
import MediaCard from '../MediaCard/MediaCard';
import { Search, Film, Tv, Sparkles, Loader2, Check, X, Filter } from 'lucide-react';
import { searchGlobalCatalog } from '../../services/movieCatalogService';
import './SearchOverlay.scss';

export default function SearchOverlay({
  query,
  items: defaultItems = [],
  onPlay,
  onOpenDetail,
  onWatchlistChange
}) {
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedType, setSelectedType] = useState('all'); // 'all' | 'movie' | 'tv'
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const debounceTimerRef = useRef(null);

  const allGenres = [
    { id: 'all', label: 'All Genres' },
    { id: 'action', label: 'Action' },
    { id: 'sci-fi', label: 'Sci-Fi' },
    { id: 'drama', label: 'Drama' },
    { id: 'adventure', label: 'Adventure' },
    { id: 'mystery', label: 'Mystery' },
    { id: 'animation', label: 'Animation' },
    { id: 'comedy', label: 'Comedy' },
    { id: 'horror', label: 'Horror' },
    { id: 'thriller', label: 'Thriller' }
  ];

  useEffect(() => {
    if (!query || !query.trim()) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const liveResults = await searchGlobalCatalog(query);
        setSearchResults(liveResults);
      } catch (e) {
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  const activePool = query && query.trim() ? searchResults : defaultItems;

  // Filter items by genre and type robustly
  const filteredItems = useMemo(() => {
    return activePool.filter((item) => {
      // Genre filter
      const matchesGenre = selectedGenre === 'all' || (
        Array.isArray(item.genres) 
          ? item.genres.some(g => String(g).toLowerCase().includes(selectedGenre.toLowerCase()))
          : typeof item.genres === 'string' && item.genres.toLowerCase().includes(selectedGenre.toLowerCase())
      ) || (item.overview && item.overview.toLowerCase().includes(selectedGenre.toLowerCase()));

      // Type filter
      const matchesType = selectedType === 'all' || item.type === selectedType;

      return matchesGenre && matchesType;
    });
  }, [activePool, selectedGenre, selectedType]);

  const handleResetFilters = () => {
    setSelectedGenre('all');
    setSelectedType('all');
  };

  const hasActiveFilters = selectedGenre !== 'all' || selectedType !== 'all';

  return (
    <div className="search-overlay-view">
      <div className="search-header-panel">
        <div className="search-title-row">
          <div className="title-left">
            <h2>
              {query ? (
                <>
                  Results for <span className="query-highlight">"{query}"</span>
                </>
              ) : (
                'Explore All Movies & TV Series'
              )}
            </h2>
            {hasActiveFilters && (
              <span className="active-filter-badge">
                Filtered by {selectedGenre !== 'all' ? selectedGenre.toUpperCase() : ''}{' '}
                {selectedType !== 'all' ? `(${selectedType === 'movie' ? 'Movies' : 'TV Shows'})` : ''}
              </span>
            )}
          </div>

          <div className="title-right">
            <span className="results-count">
              {isLoading ? (
                <span className="loading-tag">
                  <Loader2 size={16} className="spin" /> Searching 10,000+ titles...
                </span>
              ) : (
                <span className="count-pill">{filteredItems.length} titles</span>
              )}
            </span>

            {hasActiveFilters && (
              <button className="reset-filters-btn" onClick={handleResetFilters}>
                <X size={14} />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Interactive Filter Controls */}
        <div className="search-filters-bar">
          {/* Genre Selection Pills */}
          <div className="genre-pills">
            {allGenres.map((g) => {
              const isActive = selectedGenre === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  className={`genre-pill ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedGenre(g.id)}
                >
                  {isActive && <Check size={13} strokeWidth={3} className="pill-check" />}
                  <span>{g.label}</span>
                </button>
              );
            })}
          </div>

          {/* Media Type Segmented Switch */}
          <div className="type-toggle">
            <button
              type="button"
              className={`type-btn ${selectedType === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedType('all')}
            >
              <Sparkles size={14} />
              <span>All</span>
            </button>
            <button
              type="button"
              className={`type-btn ${selectedType === 'movie' ? 'active' : ''}`}
              onClick={() => setSelectedType('movie')}
            >
              <Film size={14} />
              <span>Movies</span>
            </button>
            <button
              type="button"
              className={`type-btn ${selectedType === 'tv' ? 'active' : ''}`}
              onClick={() => setSelectedType('tv')}
            >
              <Tv size={14} />
              <span>TV Shows</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid of results */}
      {filteredItems.length > 0 ? (
        <div className="search-results-grid">
          {filteredItems.map((item) => (
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
        <div className="search-empty-state">
          <div className="empty-icon-box">
            <Search size={44} />
          </div>
          <h3>No titles found for your criteria</h3>
          <p>
            {hasActiveFilters
              ? 'Try resetting the genre or format filters above to see all available movies and series.'
              : 'Try searching for another movie name (e.g., Dune, Fallout, Gladiator, Spider-Man) or actor.'}
          </p>
          {hasActiveFilters && (
            <button className="btn-empty-reset" onClick={handleResetFilters}>
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
