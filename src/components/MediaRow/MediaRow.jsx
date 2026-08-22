import React, { useRef, useState, useEffect } from 'react';
import { 
  ChevronLeft, ChevronRight, Flame, Tv, Palette, Globe, 
  Star, Zap, Rocket, Sparkles, Clock, Trophy, Film 
} from 'lucide-react';
import MediaCard from '../MediaCard/MediaCard';
import Top10Card from '../Top10Card/Top10Card';
import gsap from 'gsap';
import './MediaRow.scss';

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

  // Drag state refs
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  // High performance in-view cascading animation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let hasAnimated = false;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          const cards = rowRef.current?.children || [];
          if (cards.length > 0) {
            gsap.fromTo(
              Array.from(cards).slice(0, 8),
              { opacity: 0, y: 22, scale: 0.95 },
              { opacity: 1, y: 0, scale: 1, stagger: 0.04, duration: 0.45, ease: 'power2.out' }
            );
          }
          observer.disconnect();
        }
      });
    }, { threshold: 0.08 });

    observer.observe(el);
    return () => observer.disconnect();
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
      duration: 0.6,
      ease: 'power2.out'
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

    if (Math.abs(x - startXRef.current) > 8) {
      if (!isDraggingState) setIsDraggingState(true);
      hasDraggedRef.current = true;
      rowRef.current.scrollLeft = scrollLeftRef.current - walk;
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
