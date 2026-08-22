import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Plus, Check, ThumbsUp, Sparkles, Film } from 'lucide-react';
import { isInWatchlist, toggleWatchlist, getLikedItems, toggleLike } from '../../services/storageService';
import { fetchSeriesDetails } from '../../services/movieCatalogService';
import { CATALOG } from '../../data/mockCatalog';
import gsap from 'gsap';
import './DetailModal.scss';

function resolveImageUrl(url, isBackdrop = true) {
  if (!url) return '';
  if (url.startsWith('/')) {
    return isBackdrop 
      ? `https://image.tmdb.org/t/p/original${url}`
      : `https://image.tmdb.org/t/p/w780${url}`;
  }
  return url;
}

export default function DetailModal({
  item: initialItem,
  onClose,
  onPlay,
  onSelectRelated
}) {
  const [item, setItem] = useState(initialItem);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [inList, setInList] = useState(isInWatchlist(initialItem.id || initialItem.imdb_id));
  const [isLiked, setIsLiked] = useState(getLikedItems()[initialItem.id || initialItem.imdb_id] === 'like');

  const backdropRef = useRef(null);
  const modalRef = useRef(null);
  const heroBackdropRef = useRef(null);
  const bodyContentRef = useRef(null);

  const isTv = item.type === 'tv' || Boolean(item.seasons);

  // Fetch full series episode tree if TV show doesn't have seasons yet
  useEffect(() => {
    setItem(initialItem);
    if (initialItem.type === 'tv' && (!initialItem.seasons || initialItem.seasons.length === 0) && initialItem.imdb_id) {
      fetchSeriesDetails(initialItem.imdb_id).then(details => {
        if (details && details.seasons) {
          setItem(prev => ({ ...prev, ...details }));
        }
      });
    }
  }, [initialItem]);

  // GSAP Ultra Legendary Pop Opening Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Backdrop fade in
      if (backdropRef.current) {
        gsap.fromTo(
          backdropRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.35, ease: 'power2.out' }
        );
      }

      // 2. 3D Pop Perspective Unfold
      if (modalRef.current) {
        gsap.fromTo(
          modalRef.current,
          { scale: 0.82, opacity: 0, y: 45 },
          { scale: 1, opacity: 1, y: 0, duration: 0.48, ease: 'power3.out' }
        );
      }

      // 3. Hero backdrop subtle scale-in
      if (heroBackdropRef.current) {
        gsap.fromTo(
          heroBackdropRef.current,
          { scale: 1.12, opacity: 0.4 },
          { scale: 1, opacity: 1, duration: 0.8, ease: 'power2.out' }
        );
      }

      // 4. Body content slide-in
      if (bodyContentRef.current) {
        gsap.fromTo(
          bodyContentRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.45, delay: 0.15, ease: 'power2.out' }
        );
      }
    });

    // Disable body scroll while modal is active
    document.body.style.overflow = 'hidden';

    return () => {
      ctx.revert();
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleClose = () => {
    if (modalRef.current && backdropRef.current) {
      gsap.to(modalRef.current, {
        scale: 0.85,
        opacity: 0,
        y: 25,
        duration: 0.22,
        ease: 'power2.in'
      });
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.22,
        ease: 'power2.in',
        onComplete: onClose
      });
    } else {
      onClose();
    }
  };

  const handleToggleWatchlist = () => {
    toggleWatchlist(item);
    setInList(!inList);
  };

  const handleToggleLike = () => {
    toggleLike(item.id || item.imdb_id, 'like');
    setIsLiked(!isLiked);
  };

  const currentSeasonData = item.seasons?.find(s => s.season_number === selectedSeason);

  // Recommendations: exclude current item, prioritize shared genres
  const relatedItems = CATALOG.filter(c => (c.id || c.imdb_id) !== (item.id || item.imdb_id)).slice(0, 6);
  const backdropUrl = resolveImageUrl(item.backdrop || item.poster, true);

  return (
    <div ref={backdropRef} className="netflix-modal-backdrop" onClick={handleClose}>
      <div
        ref={modalRef}
        className="netflix-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button className="modal-close-btn" onClick={handleClose} title="Close">
          <X size={22} />
        </button>

        {/* Modal Hero Banner Header */}
        <div className="modal-header-hero">
          <div
            ref={heroBackdropRef}
            className="modal-header-backdrop"
            style={{ backgroundImage: `url(${backdropUrl})` }}
          />

          <div className="modal-hero-gradient" />

          {/* Controls overlay in header */}
          <div className="modal-hero-content">
            <h2 className="modal-title">{item.title}</h2>

            <div className="modal-hero-actions">
              <button className="modal-btn-play" onClick={() => onPlay(item, 1, 1)}>
                <Play size={20} fill="currentColor" />
                <span>Play Now</span>
              </button>

              <button
                className={`modal-circle-btn ${inList ? 'in-list' : ''}`}
                onClick={handleToggleWatchlist}
                title={inList ? 'In My List (Click to Remove)' : 'Add to My List'}
              >
                {inList ? <Check size={20} strokeWidth={3} /> : <Plus size={20} />}
              </button>

              <button
                className={`modal-circle-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleToggleLike}
                title={isLiked ? 'Liked (Click to Unlike)' : 'Rate this'}
              >
                <ThumbsUp size={18} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body Details */}
        <div ref={bodyContentRef} className="modal-body-content">
          <div className="modal-meta-grid">
            <div className="meta-left-col">
              <div className="modal-badges-row">
                <span className="match-tag">{item.match || '98% Match'}</span>
                <span className="year-tag">{item.year || '2025'}</span>
                <span className="rating-tag">{item.rating || 'PG-13'}</span>
                <span className="duration-tag">{item.duration || (isTv ? 'Series' : '2h 15m')}</span>
                <span className="quality-tag">{item.quality || '4K Ultra HD'}</span>
                <span className="audio-tag">{item.audio || 'Dolby Atmos'}</span>
              </div>

              <p className="modal-synopsis">{item.overview}</p>
            </div>

            <div className="meta-right-col">
              {item.cast && (
                <div className="meta-row-info">
                  <span className="label">Cast: </span>
                  <span className="value">{item.cast.join(', ')}</span>
                </div>
              )}
              {item.genres && (
                <div className="meta-row-info">
                  <span className="label">Genres: </span>
                  <span className="value">{item.genres.join(', ')}</span>
                </div>
              )}
              {item.director && (
                <div className="meta-row-info">
                  <span className="label">Director: </span>
                  <span className="value">{item.director}</span>
                </div>
              )}
            </div>
          </div>

          {/* Episode List Section (If TV Series) */}
          {isTv && (
            <div className="modal-episodes-section">
              <div className="episodes-header">
                <h3>Episodes</h3>
                {item.seasons && item.seasons.length > 1 && (
                  <select
                    className="season-dropdown"
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                  >
                    {item.seasons.map((s) => (
                      <option key={s.season_number} value={s.season_number}>
                        Season {s.season_number} ({s.episodes?.length || 8} Episodes)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="episodes-cards-list">
                {currentSeasonData?.episodes ? (
                  currentSeasonData.episodes.map((ep) => (
                    <div
                      key={ep.episode_number}
                      className="episode-row-card"
                      onClick={() => onPlay(item, selectedSeason, ep.episode_number)}
                    >
                      <div className="ep-num-cell">{ep.episode_number}</div>
                      <div
                        className="ep-image-cell"
                        style={{
                          backgroundImage: `url(${ep.thumbnail || backdropUrl})`
                        }}
                      >
                        <div className="ep-play-circle">
                          <Play size={18} fill="#ffffff" />
                        </div>
                      </div>
                      <div className="ep-details-cell">
                        <div className="ep-title-bar">
                          <span className="ep-name">{ep.title}</span>
                          <span className="ep-runtime">{ep.duration}</span>
                        </div>
                        <p className="ep-synopsis">{ep.overview}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i + 1}
                      className="episode-row-card"
                      onClick={() => onPlay(item, selectedSeason, i + 1)}
                    >
                      <div className="ep-num-cell">{i + 1}</div>
                      <div
                        className="ep-image-cell"
                        style={{ backgroundImage: `url(${backdropUrl})` }}
                      >
                        <div className="ep-play-circle">
                          <Play size={18} fill="#ffffff" />
                        </div>
                      </div>
                      <div className="ep-details-cell">
                        <div className="ep-title-bar">
                          <span className="ep-name">Episode {i + 1}</span>
                          <span className="ep-runtime">45m</span>
                        </div>
                        <p className="ep-synopsis">Stream Episode {i + 1} on KMOVIZ Universal Player.</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* More Like This (Related Recommendations) */}
          <div className="modal-recommendations-section">
            <h3>More Like This</h3>
            <div className="recommendations-grid">
              {relatedItems.map((rel) => {
                const relImage = resolveImageUrl(rel.backdrop || rel.poster, true);
                return (
                  <div
                    key={rel.id || rel.imdb_id}
                    className="recommendation-card"
                    onClick={() => {
                      setItem(rel);
                      if (onSelectRelated) onSelectRelated(rel);
                    }}
                  >
                    <div
                      className="rec-thumb"
                      style={{ backgroundImage: `url(${relImage})` }}
                    >
                      <span className="rec-match">{rel.match || '95% Match'}</span>
                      <div className="rec-play-overlay">
                        <Play size={20} fill="#ffffff" />
                      </div>
                    </div>
                    <div className="rec-body">
                      <div className="rec-title-row">
                        <span className="rec-title">{rel.title}</span>
                        <span className="rec-year">{rel.year}</span>
                      </div>
                      <p className="rec-overview">{rel.overview}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
