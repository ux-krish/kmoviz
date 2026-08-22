import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCard from '../MediaCard/MediaCard';
import Top10Card from '../Top10Card/Top10Card';
import gsap from 'gsap';
import './MediaRow.scss';

export default function MediaRow({
  title,
  items = [],
  isTop10 = false,
  isLarge = false,
  onPlay,
  onOpenDetail,
  onWatchlistChange
}) {
  const rowRef = useRef(null);
  const [isDraggingState, setIsDraggingState] = useState(false);

  // Drag state refs
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  if (!items || items.length === 0) return null;

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
    // If clicking a button or interactive element, don't initiate drag
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

    // Only consider dragging if moved more than 8 pixels
    if (Math.abs(walk) > 8) {
      if (!hasDraggedRef.current) {
        hasDraggedRef.current = true;
        setIsDraggingState(true);
      }
      e.preventDefault();
      rowRef.current.scrollLeft = scrollLeftRef.current - walk;
    }
  };

  const handleMouseUpOrLeave = () => {
    isDownRef.current = false;
    if (isDraggingState) {
      setIsDraggingState(false);
    }
    // Small timeout to clear hasDragged so click handlers don't fire during drag release
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 50);
  };

  // Prevent opening details if the user was genuinely dragging the slide
  const handleCardClickCapture = (e) => {
    if (hasDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div className="netflix-media-row">
      <div className="row-header">
        <h3 className="row-title">
          <span>{title}</span>
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
