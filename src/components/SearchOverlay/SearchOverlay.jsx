import React, { useState, useEffect, useRef, useMemo } from 'react';
import MediaCard from '../MediaCard/MediaCard';
import { Search, Film, Tv, Sparkles, Loader2, Check, X } from 'lucide-react';
import { searchGlobalCatalog } from '../../services/movieCatalogService';
import './SearchOverlay.scss';

// Exact matching rules for genres across TMDB & Metahub catalog
function matchesItemGenre(item, genreId) {
  if (!genreId || genreId === 'all') return true;

  const itemGenres = Array.isArray(item.genres)
    ? item.genres.map((g) => (typeof g === 'object' ? g.name : String(g)).toLowerCase())
    : typeof item.genres === 'string'
    ? [item.genres.toLowerCase()]
    : [];

  if (itemGenres.length === 0) {
    // Fallback check on title or clean category
    const title = (item.title || '').toLowerCase();
    if (genreId === 'animation' && (title.includes('toy story') || title.includes('minion') || title.includes('shrek') || title.includes('inside out') || title.includes('spider-man: across'))) return true;
    return false;
  }

  switch (genreId.toLowerCase()) {
    case 'action':
      return itemGenres.some((g) => g.includes('action') || g.includes('adventure'));
    case 'sci-fi':
      return itemGenres.some((g) => g.includes('sci-fi') || g.includes('science fiction') || g.includes('fantasy'));
    case 'drama':
      return itemGenres.some((g) => g.includes('drama') || g.includes('biography'));
    case 'adventure':
      return itemGenres.some((g) => g.includes('adventure') || g.includes('action'));
    case 'mystery':
      return itemGenres.some((g) => g.includes('mystery') || g.includes('crime') || g.includes('investigation'));
    case 'animation':
      return itemGenres.some((g) => g.includes('animation') || g.includes('anime') || g.includes('cartoon') || g.includes('family'));
    case 'comedy':
      return itemGenres.some((g) => g.includes('comedy'));
    case 'horror':
      return itemGenres.some((g) => g.includes('horror') || g.includes('thriller'));
    case 'thriller':
      return itemGenres.some((g) => g.includes('thriller') || g.includes('crime') || g.includes('suspense'));
    default:
      return itemGenres.some((g) => g.includes(genreId.toLowerCase()));
  }
}

export default function SearchOverlay({
  query = '',
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

  // Debounced search for API results
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

  // If search query is typed, search from live API results + local catalog matches
  const activePool = useMemo(() => {
    if (!query || !query.trim()) return defaultItems;
    
    // Combine live results and local matching titles
    const q = query.toLowerCase().trim();
    const localMatches = defaultItems.filter(
      (item) => item.title?.toLowerCase().includes(q) || item.overview?.toLowerCase().includes(q)
    );

    const combined = [...searchResults, ...localMatches];
    const map = new Map();
    combined.forEach((it) => {
      const k = it.id || it.imdb_id || it.tmdb_id || it.title;
      if (k && !map.has(k)) map.set(k, it);
    });
    return Array.from(map.values());
  }, [query, searchResults, defaultItems]);

  // Filter items strictly and correctly based on active selections
  const filteredItems = useMemo(() => {
    return activePool.filter((item) => {
      // 1. Genre filter check
      const matchesGenre = matchesItemGenre(item, selectedGenre);

      // 2. Type filter check
      const matchesType = selectedType === 'all' || item.type === selectedType;

      return matchesGenre && matchesType;
    });
  }, [activePool, selectedGenre, selectedType]);

  const handleResetFilters = () => {
    setSelectedGenre('all');
    setSelectedType('all');
  };

  const hasActiveFilters = selectedGenre !== 'all' || selectedType !== 'all';
  const activeGenreObj = allGenres.find((g) => g.id === selectedGenre);

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
                Showing: {selectedGenre !== 'all' ? activeGenreObj?.label : 'All Genres'}{' '}
                {selectedType !== 'all' ? `• ${selectedType === 'movie' ? 'Movies Only' : 'TV Shows Only'}` : ''}
              </span>
            )}
          </div>

          <div className="title-right">
            <span className="results-count">
              {isLoading ? (
                <span className="loading-tag">
                  <Loader2 size={16} className="spin" /> Searching...
                </span>
              ) : (
                <span className="count-pill">{filteredItems.length} titles</span>
              )}
            </span>

            {hasActiveFilters && (
              <button className="reset-filters-btn" onClick={handleResetFilters} title="Reset all filters">
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
          <h3>No {activeGenreObj?.label || 'matching'} titles found</h3>
          <p>
            {hasActiveFilters
              ? `No ${selectedType === 'tv' ? 'TV Shows' : selectedType === 'movie' ? 'Movies' : 'titles'} found in the ${activeGenreObj?.label} category. Try switching the filters above.`
              : 'Try searching for another movie name (e.g., Spider-Man, Stranger Things, Toy Story) or actor.'}
          </p>
          {hasActiveFilters && (
            <button className="btn-empty-reset" onClick={handleResetFilters}>
              Reset Filters to All
            </button>
          )}
        </div>
      )}
    </div>
  );
}
