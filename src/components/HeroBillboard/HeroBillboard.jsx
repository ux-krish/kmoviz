import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Info, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import './HeroBillboard.scss';

const ROTATION_INTERVAL_MS = 120000; // 2 minutes auto-rotate

function resolveBackdrop(url) {
  if (!url) return '';
  if (url.startsWith('/')) return `https://image.tmdb.org/t/p/original${url}`;
  return url;
}

export default function HeroBillboard({ items = [], onPlay, onOpenDetail }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progressKey, setProgressKey] = useState(Date.now());

  const contentRef = useRef(null);
  const titleRef = useRef(null);
  const backdropRef = useRef(null);
  const timerRef = useRef(null);

  const top10List = items.length > 0 ? items.slice(0, 10) : [];
  const currentItem = top10List[currentIndex] || items[0];

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % top10List.length);
    setProgressKey(Date.now());
  }, [top10List.length]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + top10List.length) % top10List.length);
    setProgressKey(Date.now());
  }, [top10List.length]);

  const handleSelectIndex = (idx) => {
    setCurrentIndex(idx);
    setProgressKey(Date.now());
  };

  // 2-Minute auto-rotation timer
  useEffect(() => {
    if (top10List.length <= 1) return;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      handleNext();
    }, ROTATION_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [top10List.length, handleNext, progressKey]);

  // GSAP animation whenever the movie changes
  useEffect(() => {
    if (!currentItem) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0.3, scale: 1.04 },
        { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' }
      );
      gsap.fromTo(
        titleRef.current,
        { opacity: 0, y: 30, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 }
      );
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', delay: 0.2 }
      );
    });

    return () => ctx.revert();
  }, [currentIndex, currentItem]);

  if (!currentItem) return null;

  const backdropUrl = resolveBackdrop(currentItem.backdrop || currentItem.poster);

  return (
    <div className="hero-billboard">
      {/* Background Media (Official Cinematic 4K Backdrop) */}
      <div className="billboard-media-container">
        <div
          ref={backdropRef}
          className="billboard-backdrop"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
        <div className="billboard-gradient-left" />
        <div className="billboard-gradient-bottom" />
      </div>

      {/* Manual Slide Navigation Arrows */}
      {top10List.length > 1 && (
        <div className="billboard-nav-arrows">
          <button className="nav-arrow-btn left" onClick={handlePrev} title="Previous Featured Title">
            <ChevronLeft size={36} />
          </button>
          <button className="nav-arrow-btn right" onClick={handleNext} title="Next Featured Title">
            <ChevronRight size={36} />
          </button>
        </div>
      )}

      {/* Foreground Content */}
      <div className="billboard-content-wrapper">
        <div className="billboard-meta-badge">
          <span className="n-series-badge">TOP 10</span>
          <span className="badge-text">
            #{currentIndex + 1} in {currentItem.type === 'tv' ? 'TV Shows' : 'Movies'} Today
          </span>
          <span className="live-pill">
            <Sparkles size={12} /> Auto-rotates every 2m
          </span>
        </div>

        <h1 ref={titleRef} className="billboard-title">
          {currentItem.title}
        </h1>

        <div ref={contentRef} className="billboard-details">
          <div className="billboard-tags">
            <span className="match-score">{currentItem.match || '99% Match'}</span>
            <span className="rating-pill">{currentItem.rating || '★ 8.2'}</span>
            <span className="year-pill">{currentItem.year || '2026'}</span>
            <span className="quality-pill">{currentItem.quality || '4K Ultra HD'}</span>
            <span className="audio-pill">{currentItem.audio || 'Dolby Atmos 5.1'}</span>
          </div>

          <p className="billboard-overview">{currentItem.overview}</p>

          <div className="billboard-actions">
            <button className="btn-billboard btn-play" onClick={() => onPlay(currentItem)}>
              <Play size={24} fill="currentColor" />
              <span>Stream Now</span>
            </button>

            <button className="btn-billboard btn-info" onClick={() => onOpenDetail(currentItem)}>
              <Info size={24} />
              <span>More Info</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2-Minute Rotation Progress Bar & Slide Dots */}
      {top10List.length > 1 && (
        <div className="billboard-indicators-container">
          <div className="indicators-row">
            {top10List.map((item, idx) => (
              <button
                key={item.id || item.imdb_id || idx}
                className={`indicator-dot ${idx === currentIndex ? 'active' : ''}`}
                onClick={() => handleSelectIndex(idx)}
                title={`#${idx + 1}: ${item.title}`}
              >
                {idx === currentIndex && (
                  <div key={progressKey} className="progress-bar-fill" />
                )}
              </button>
            ))}
          </div>
          <span className="slide-counter">
            {currentIndex + 1} / {top10List.length}
          </span>
        </div>
      )}
    </div>
  );
}
