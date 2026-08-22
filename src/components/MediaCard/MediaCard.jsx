import React, { useState, useCallback, useRef } from 'react';
import { Play, Plus, Check, ThumbsUp, ChevronDown } from 'lucide-react';
import { isInWatchlist, toggleWatchlist, getPlaybackProgress, getLikedItems, toggleLike } from '../../services/storageService';
import gsap from 'gsap';
import './MediaCard.scss';

// Safe image URL resolver - prioritizes official poster artwork
function resolveImageUrl(url, isBackdrop = false) {
  if (!url) return '';
  if (url.startsWith('/')) {
    return isBackdrop
      ? `https://image.tmdb.org/t/p/original${url}`
      : `https://image.tmdb.org/t/p/w780${url}`;
  }
  return url;
}

export default function MediaCard({
  item,
  onPlay,
  onOpenDetail,
  onWatchlistChange,
  isLarge = false
}) {
  const itemId = item.id || item.imdb_id || item.tmdb_id;
  const [inList, setInList] = useState(() => isInWatchlist(itemId));
  const [isLiked, setIsLiked] = useState(() => getLikedItems()[itemId] === 'like');
  const [imgError, setImgError] = useState(false);

  const cardRef = useRef(null);
  const overlayRef = useRef(null);
  const actionsRef = useRef(null);

  const progress = getPlaybackProgress(itemId);

  // ── GSAP Ultra Smooth Hover Animations ─────────────────────────────────────
  const handleMouseEnter = () => {
    if (window.matchMedia('(hover: hover)').matches && cardRef.current) {
      gsap.killTweensOf([cardRef.current, overlayRef.current, actionsRef.current]);
      
      // Card 3D pop lift
      gsap.to(cardRef.current, {
        scale: 1.07,
        y: -6,
        duration: 0.35,
        ease: 'power3.out',
        overwrite: 'auto'
      });

      // Overlay smooth reveal
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.28,
          ease: 'power2.out'
        });
      }

      // Action buttons stagger pop
      if (actionsRef.current && actionsRef.current.children) {
        gsap.fromTo(
          actionsRef.current.children,
          { scale: 0.75, opacity: 0, y: 8 },
          { scale: 1, opacity: 1, y: 0, stagger: 0.04, duration: 0.28, ease: 'back.out(2)' }
        );
      }
    }
  };

  const handleMouseLeave = () => {
    if (window.matchMedia('(hover: hover)').matches && cardRef.current) {
      gsap.killTweensOf([cardRef.current, overlayRef.current]);

      gsap.to(cardRef.current, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto'
      });

      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 0,
          y: 6,
          duration: 0.22,
          ease: 'power2.in'
        });
      }
    }
  };

  // ── Play ──────────────────────────────────────────────────────────────────
  const handlePlay = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPlay) onPlay(item);
  }, [item, onPlay]);

  // ── Watchlist (+ / ✓) ────────────────────────────────────────────────────
  const handleToggleWatchlist = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !inList;
    toggleWatchlist(item);
    setInList(next);
    if (onWatchlistChange) onWatchlistChange();
  }, [inList, item, onWatchlistChange]);

  // ── Like (👍) ─────────────────────────────────────────────────────────────
  const handleToggleLike = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !isLiked;
    toggleLike(itemId, 'like');
    setIsLiked(next);
  }, [isLiked, itemId]);

  // ── Expand / Details ──────────────────────────────────────────────────────
  const handleOpenDetail = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenDetail) onOpenDetail(item);
  }, [item, onOpenDetail]);

  const stopProp = (e) => {
    e.stopPropagation();
  };

  // Resolve best poster image (vertical 2:3 ratio)
  const rawImage = item.poster || item.backdrop;
  const fallbackImage = item.imdb_id
    ? `https://images.metahub.space/poster/medium/${item.imdb_id}/img`
    : 'https://images.metahub.space/poster/medium/tt1375666/img';
  const imageUrl = imgError ? fallbackImage : resolveImageUrl(rawImage, false) || fallbackImage;

  // Clean rating representation with star
  const getDisplayRating = () => {
    if (!item.rating) return '★ 8.2';
    const num = item.rating.replace('★', '').trim();
    return num.startsWith('PG') || num.startsWith('R') || num.startsWith('TV') ? num : `★ ${num}`;
  };

  // Safe duration formatting (e.g. 135 -> "2h 15m", "2h 15m" -> "2h 15m")
  const getDisplayDuration = () => {
    if (!item.duration) return item.type === 'tv' ? 'Series' : '2h 15m';
    const durStr = String(item.duration).trim();
    if (!isNaN(durStr)) {
      const mins = parseInt(durStr, 10);
      if (mins > 60) {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m > 0 ? `${h}h ${m}m` : `${h}h`;
      }
      return `${mins}m`;
    }
    return durStr;
  };

  return (
    <div
      ref={cardRef}
      className="kmoviz-media-card"
      onClick={handleOpenDetail}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Poster Image Layer */}
      <div className="card-media-layer">
        <img
          src={imageUrl}
          alt={item.title}
          className="card-img"
          loading="lazy"
          onError={() => setImgError(true)}
        />

        {/* Top Badges (Match % & 4K Ultra HD) */}
        <div className="card-top-badges">
          <span className="match-pill">{item.match || '90% Match'}</span>
          <span className="quality-pill">{item.quality || '4K Ultra HD'}</span>
        </div>

        <div className="card-gradient-top" />
        <div className="card-gradient-bottom" />

        {/* Progress bar */}
        {progress && progress.percentage > 0 && (
          <div className="card-progress-bar-container">
            <div className="progress-fill" style={{ width: `${progress.percentage}%` }} />
          </div>
        )}
      </div>

      {/* Title preview in resting state */}
      <div className="card-resting-title">
        <h4 className="resting-name">{item.title}</h4>
      </div>

      {/* Hover Interactive Drawer with GSAP Micro-Stagger */}
      <div 
        ref={overlayRef} 
        className="card-info-overlay" 
        onMouseDown={stopProp} 
        onClick={stopProp}
      >
        {/* Card Title */}
        <h4 className="card-title">{item.title}</h4>

        {/* Action Buttons Row */}
        <div ref={actionsRef} className="card-action-buttons" onMouseDown={stopProp}>
          {/* ▶ Play Button (Solid White with Black Play Icon) */}
          <button
            id={`play-${itemId}`}
            type="button"
            className="card-btn play-btn"
            title="Stream Now"
            onMouseDown={stopProp}
            onClick={handlePlay}
          >
            <Play size={14} fill="currentColor" />
          </button>

          {/* + / ✓ Watchlist Button (Green Tick when active) */}
          <button
            id={`watchlist-${itemId}`}
            type="button"
            className={`card-btn circle-btn watchlist-btn ${inList ? 'in-list' : ''}`}
            title={inList ? 'In My List (Click to Remove)' : 'Add to My List'}
            onMouseDown={stopProp}
            onClick={handleToggleWatchlist}
          >
            {inList ? <Check size={15} strokeWidth={3} /> : <Plus size={15} strokeWidth={2.5} />}
          </button>

          {/* 👍 Like Button (Green Filled Thumbs-Up when active) */}
          <button
            id={`like-${itemId}`}
            type="button"
            className={`card-btn circle-btn like-btn ${isLiked ? 'liked' : ''}`}
            title={isLiked ? 'Liked (Click to Unlike)' : 'I like this'}
            onMouseDown={stopProp}
            onClick={handleToggleLike}
          >
            <ThumbsUp size={13} fill={isLiked ? 'currentColor' : 'none'} />
          </button>

          {/* ⌄ Expand Details Button */}
          <button
            id={`expand-${itemId}`}
            type="button"
            className="card-btn circle-btn expand-btn"
            title="More Details & Episodes"
            onMouseDown={stopProp}
            onClick={handleOpenDetail}
          >
            <ChevronDown size={15} />
          </button>
        </div>

        {/* Metadata Row (Rating with star, year, duration) */}
        <div className="card-metadata-row">
          <span className="rating-tag">{getDisplayRating()}</span>
          <span className="year-tag">{item.year || '2026'}</span>
          <span className="duration-tag">{getDisplayDuration()}</span>
        </div>

        {/* Genres Row */}
        <div className="card-genres-row">
          {item.genres?.slice(0, 3).map((g, i, arr) => (
            <span key={g} className="genre-item">
              {g}{i < arr.length - 1 ? ' • ' : ''}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
