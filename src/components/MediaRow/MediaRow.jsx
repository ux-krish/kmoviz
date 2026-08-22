import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, Flame, Tv, Palette, Globe, 
  Star, Zap, Rocket, Sparkles, Clock, Trophy, Film 
} from 'lucide-react';
import MediaCard from '../MediaCard/MediaCard';
import Top10Card from '../Top10Card/Top10Card';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './MediaRow.scss';

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Resolves proper matching Lucide SVG icon for each category row
function getRowIcon(title = '') {
  const t = title.toLowerCase();
  if (t.includes('continue') || t.includes('history')) return <Clock size={19} className="row-svg-icon" />;
  if (t.includes('top 10')) return <Trophy size={19} className="row-svg-icon" />;
  if (t.includes('brand new') || t.includes('trending') || t.includes('blockbuster')) return <Flame size={19} className="row-svg-icon" />;
  if (t.includes('tv series') || t.includes('binge') || t.includes('shows')) return <Tv size={19} className="row-svg-icon" />;
  if (t.includes('animation') || t.includes('anime')) return <Palette size={19} className="row-svg-icon" />;
  if (t.includes('bollywood') || t.includes('regional')) return <Globe size={19} className="row-svg-icon" />;
  if (t.includes('masterpiece') || t.includes('top rated')) return <Star size={19} className="row-svg-icon" />;
  if (t.includes('action') || t.includes('thriller')) return <Zap size={19} className="row-svg-icon" />;
  if (t.includes('sci-fi') || t.includes('cyberpunk')) return <Rocket size={19} className="row-svg-icon" />;
  if (t.includes('fresh') || t.includes('network')) return <Sparkles size={19} className="row-svg-icon" />;
  return <Film size={19} className="row-svg-icon" />;
}

export default function MediaRow({
  title = '',
  icon,
  items = [],
  isTop10 = false,
  isLarge = false,
  onPlay,
  onOpenDetail,
  onWatchlistChange
}) {
  const containerRef = useRef(null);
  const rowRef = useRef(null);
  const [isDraggingState, setIsDraggingState] = useState(false);

  // Drag & wave velocity state refs
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const lastScrollLeftRef = useRef(0);
  const lastScrollTimeRef = useRef(0);
  const waveResetTimerRef = useRef(null);

  // ── GSAP ScrollTrigger Vertical Scrub & Wave Entrance ─────────────────────
  useEffect(() => {
    const el = containerRef.current;
    const rowEl = rowRef.current;
    if (!el || !rowEl) return;

    const cards = rowEl.querySelectorAll('.kmoviz-media-card, .top10-card-wrapper');
    if (!cards || cards.length === 0) return;

    const ctx = gsap.context(() => {
      // Cinematic Wave & Scrub into view as user scrolls down
      gsap.fromTo(
        cards,
        {
          y: 45,
          opacity: 0.15,
          scale: 0.92,
          rotateX: 10,
          filter: 'blur(3px)'
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotateX: 0,
          filter: 'blur(0px)',
          stagger: {
            each: 0.05,
            from: 'start',
            ease: 'power2.out'
          },
          duration: 0.8,
          scrollTrigger: {
            trigger: el,
            start: 'top 94%',
            end: 'top 65%',
            scrub: 0.8,
            toggleActions: 'play reverse play reverse'
          }
        }
      );
    }, el);

    return () => ctx.revert();
  }, [items]);

  // ── Horizontal Slider Kinetic Scrub Wave on Drag / Scroll ────────────────
  const handleScrollWave = useCallback(() => {
    if (!rowRef.current) return;
    const now = performance.now();
    const currentScroll = rowRef.current.scrollLeft;
    const deltaX = currentScroll - (lastScrollLeftRef.current || 0);
    const dt = Math.max(16, now - (lastScrollTimeRef.current || now));
    const velocity = deltaX / dt;

    lastScrollLeftRef.current = currentScroll;
    lastScrollTimeRef.current = now;

    const clampedTilt = Math.max(-12, Math.min(12, velocity * 7));
    const cards = rowRef.current.querySelectorAll('.kmoviz-media-card, .top10-card-wrapper');

    if (cards.length > 0 && Math.abs(clampedTilt) > 0.4) {
      gsap.to(cards, {
        rotateY: clampedTilt,
        skewX: clampedTilt * -0.25,
        scale: 0.98,
        duration: 0.22,
        ease: 'power1.out',
        overwrite: 'auto'
      });

      if (waveResetTimerRef.current) clearTimeout(waveResetTimerRef.current);
      waveResetTimerRef.current = setTimeout(() => {
        gsap.to(cards, {
          rotateY: 0,
          skewX: 0,
          scale: 1,
          duration: 0.5,
          ease: 'elastic.out(1, 0.45)',
          overwrite: 'auto'
        });
      }, 75);
    }
  }, []);

  if (!items || items.length === 0) return null;

  // Clean any emojis from the title string and render pure inline text
  const cleanTitle = title.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}]/gu, '').trim();
  const rowIcon = icon || getRowIcon(title);

  // Arrow button smooth scrolling
  const handleScroll = (direction) => {
    if (!rowRef.current) return;
    const { scrollLeft, clientWidth } = rowRef.current;
    const scrollAmount = clientWidth * 0.75;
    const targetScroll = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;

    gsap.to(rowRef.current, {
      scrollLeft: targetScroll,
      duration: 0.65,
      ease: 'power2.out',
      onUpdate: handleScrollWave
    });
  };

  // Mouse Drag to Scroll Handlers
  const handleMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('.card-action-buttons') || e.target.closest('.card-btn')) {
      return;
    }
    if (!rowRef.current) return;
    isDownRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - rowRef.current.offsetLeft;
    scrollLeftRef.current = rowRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDownRef.current || !rowRef.current) return;
    const x = e.pageX - rowRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;

    if (Math.abs(x - startXRef.current) > 6) {
      if (!isDraggingState) setIsDraggingState(true);
      hasDraggedRef.current = true;
      rowRef.current.scrollLeft = scrollLeftRef.current - walk;
      handleScrollWave();
    }
  };

  const handleMouseUpOrLeave = () => {
    isDownRef.current = false;
    setTimeout(() => {
      setIsDraggingState(false);
      hasDraggedRef.current = false;
    }, 50);
  };

  const handleCardClickCapture = (e) => {
    if (hasDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div ref={containerRef} className="netflix-media-row">
      <div className="row-header">
        <h3 className="row-title">
          {rowIcon}
          <span className="row-text">{cleanTitle}</span>
          <ChevronRight size={18} className="title-chevron" />
        </h3>
      </div>

      <div className="row-slider-container">
        <button
          className="slider-arrow arrow-left"
          onClick={() => handleScroll('left')}
          title="Scroll Left"
        >
          <ChevronLeft size={28} />
        </button>

        <div
          className={`row-items-wrapper ${isDraggingState ? 'is-dragging' : ''}`}
          ref={rowRef}
          onScroll={handleScrollWave}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onClickCapture={handleCardClickCapture}
        >
          {items.map((item, index) =>
            isTop10 ? (
              <Top10Card
                key={item.id || item.imdb_id || index}
                item={item}
                rank={index + 1}
                onPlay={onPlay}
                onOpenDetail={onOpenDetail}
              />
            ) : (
              <MediaCard
                key={item.id || item.imdb_id || index}
                item={item}
                isLarge={isLarge}
                onPlay={onPlay}
                onOpenDetail={onOpenDetail}
                onWatchlistChange={onWatchlistChange}
              />
            )
          )}
        </div>

        <button
          className="slider-arrow arrow-right"
          onClick={() => handleScroll('right')}
          title="Scroll Right"
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
}
