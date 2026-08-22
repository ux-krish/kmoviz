import React, { useState, useEffect, useRef } from 'react';
import MediaCard from '../MediaCard/MediaCard';
import { Search, Film, Tv, SlidersHorizontal, Sparkles, Loader2 } from 'lucide-react';
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

  const allGenres = ['All', 'Action', 'Sci-Fi', 'Drama', 'Adventure', 'Mystery', 'Animation', 'Comedy', 'Horror', 'Thriller'];

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

  const activePool = query.trim() ? searchResults : defaultItems;

  // Filter items by genre and type
  const filteredItems = activePool.filter((item) => {
    // Genre filter
    const matchesGenre = selectedGenre === 'all' || item.genres?.some(g => g.toLowerCase().includes(selectedGenre.toLowerCase()));

    // Type filter
    const matchesType = selectedType === 'all' || item.type === selectedType;

    return matchesGenre && matchesType;
  });

  return (
    <div className="search-overlay-view">
      <div className="search-header-panel">
        <div className="search-title-row">
          <h2>
            {query ? (
              <>
                Results for <span className="query-highlight">"{query}"</span>
              </>
            ) : (
              'Explore All Movies & TV Series'
            )}
          </h2>
          <span className="results-count">
            {isLoading ? (
              <span className="loading-tag">
                <Loader2 size={16} className="spin" /> Searching global catalogue...
              </span>
            ) : (
              `${filteredItems.length} titles found`
            )}
          </span>
        </div>

        {/* Filters bar */}
        <div className="search-filters-bar">
          <div className="genre-pills">
            {allGenres.map((g) => {
              const val = g === 'All' ? 'all' : g;
              return (
                <button
                  key={g}
                  className={`genre-pill ${selectedGenre === val ? 'active' : ''}`}
                  onClick={() => setSelectedGenre(val)}
                >
                  {g}
                </button>
              );
            })}
          </div>

          <div className="type-toggle">
            <button
              className={`type-btn ${selectedType === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedType('all')}
            >
              All
            </button>
            <button
              className={`type-btn ${selectedType === 'movie' ? 'active' : ''}`}
              onClick={() => setSelectedType('movie')}
            >
              Movies
            </button>
            <button
              className={`type-btn ${selectedType === 'tv' ? 'active' : ''}`}
              onClick={() => setSelectedType('tv')}
            >
              TV Shows
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
          <Sparkles size={48} className="empty-icon" />
          <h3>{isLoading ? 'Searching...' : 'No titles found'}</h3>
          <p>
            {isLoading 
              ? 'Fetching titles from the global movie database...' 
              : 'Try searching for another movie name (e.g., Dune, Fallout, Gladiator, Oppenheimer) or an actor.'}
          </p>
        </div>
      )}
    </div>
  );
}
