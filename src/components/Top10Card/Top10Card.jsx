import React, { useState } from 'react';
import { Play } from 'lucide-react';
import './Top10Card.scss';

function resolveImageUrl(url) {
  if (!url) return '';
  if (url.startsWith('/')) return `https://image.tmdb.org/t/p/w780${url}`;
  return url;
}

export default function Top10Card({ item, rank, onPlay, onOpenDetail }) {
  const [imgError, setImgError] = useState(false);
  const rawImage = item.poster || item.backdrop;
  const fallback = item.imdb_id 
    ? `https://images.metahub.space/poster/medium/${item.imdb_id}/img`
    : 'https://images.metahub.space/poster/medium/tt0468569/img';
  
  const imageUrl = imgError ? fallback : resolveImageUrl(rawImage);

  return (
    <div className="netflix-top10-card" onClick={() => onOpenDetail(item)}>
      {/* 3D Stylized Number Ranking */}
      <div className="rank-number-svg-container">
        <span className="rank-number">{rank}</span>
      </div>

      {/* Vertical Poster Card */}
      <div className="top10-poster-wrapper">
        <img
          src={imageUrl || fallback}
          alt={item.title}
          className="top10-img"
          loading="lazy"
          onError={() => setImgError(true)}
        />
        <div className="top10-overlay">
          <button
            className="top10-play-btn"
            title="Stream Now"
            onClick={(e) => {
              e.stopPropagation();
              onPlay(item);
            }}
          >
            <Play size={18} fill="currentColor" />
          </button>
        </div>
      </div>
    </div>
  );
}
