import React, { useState } from 'react';
import { X, Dices, Play, Info, Sparkles, Flame, Zap, Smile, Heart, ShieldAlert } from 'lucide-react';
import './SurpriseModal.scss';

const MOODS = [
  { id: 'trending', label: '🔥 Hot New Release', icon: Flame },
  { id: 'action', label: '⚡ Adrenaline Action', icon: Zap },
  { id: 'scifi', label: '🚀 Mind-Bending Sci-Fi', icon: Sparkles },
  { id: 'comedy', label: '😂 Laugh Out Loud', icon: Smile },
  { id: 'romance', label: '💖 Drama & Romance', icon: Heart },
  { id: 'thriller', label: '🕵️ Dark Crime & Mystery', icon: ShieldAlert }
];

export default function SurpriseModal({ catalog = [], onClose, onPlay, onOpenDetail }) {
  const [selectedMood, setSelectedMood] = useState('trending');
  const [pickedMovie, setPickedMovie] = useState(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const handlePick = (mood = selectedMood) => {
    setIsSpinning(true);
    setPickedMovie(null);

    setTimeout(() => {
      let pool = catalog;
      if (mood === 'action') {
        pool = catalog.filter(c => c.genres?.some(g => g.toLowerCase().includes('action')));
      } else if (mood === 'scifi') {
        pool = catalog.filter(c => c.genres?.some(g => g.toLowerCase().includes('sci') || g.toLowerCase().includes('fantasy')));
      } else if (mood === 'comedy') {
        pool = catalog.filter(c => c.genres?.some(g => g.toLowerCase().includes('comedy')));
      } else if (mood === 'romance') {
        pool = catalog.filter(c => c.genres?.some(g => g.toLowerCase().includes('drama') || g.toLowerCase().includes('romance')));
      } else if (mood === 'thriller') {
        pool = catalog.filter(c => c.genres?.some(g => g.toLowerCase().includes('thrill') || g.toLowerCase().includes('crime')));
      }

      if (!pool || pool.length === 0) pool = catalog;
      const randomItem = pool[Math.floor(Math.random() * pool.length)];
      setPickedMovie(randomItem);
      setIsSpinning(false);
    }, 600);
  };

  return (
    <div className="surprise-modal-backdrop" onClick={onClose}>
      <div className="surprise-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Floating Close Button */}
        <button className="modal-close-btn" onClick={onClose} title="Close">
          <X size={18} />
        </button>

        {/* Redesigned Sleek Header */}
        <div className="surprise-header">
          <div className="icon-badge">
            <Dices size={28} />
          </div>
          <h2>Can't Decide What to Watch?</h2>
          <p>Tell KMOVIZ your vibe and we'll pick the perfect movie for your night.</p>
        </div>

        {/* Mood Selectors */}
        <div className="moods-grid">
          {MOODS.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                className={`mood-btn ${selectedMood === m.id ? 'active' : ''}`}
                onClick={() => {
                  setSelectedMood(m.id);
                  handlePick(m.id);
                }}
              >
                <Icon size={16} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          type="button"
          className={`spin-wheel-btn ${isSpinning ? 'spinning' : ''}`}
          onClick={() => handlePick(selectedMood)}
          disabled={isSpinning}
        >
          <Dices size={20} className={isSpinning ? 'spin-icon' : ''} />
          <span>{isSpinning ? 'Finding Your Masterpiece...' : 'Surprise Me Now'}</span>
        </button>

        {/* Picked Result Card */}
        {pickedMovie && (
          <div className="picked-result-card">
            <div
              className="picked-thumb"
              style={{ backgroundImage: `url(${pickedMovie.backdrop || pickedMovie.poster})` }}
            >
              <div className="picked-gradient" />
              <div className="picked-badge">
                <Sparkles size={14} /> 99% Vibe Match
              </div>
            </div>

            <div className="picked-info">
              <div className="picked-meta">
                <span className="rating">{pickedMovie.rating || '★ 8.2'}</span>
                <span className="year">{pickedMovie.year || '2026'}</span>
                <span className="quality">{pickedMovie.quality || '4K Ultra HD'}</span>
              </div>
              <h3 className="picked-title">{pickedMovie.title}</h3>
              <p className="picked-overview">{pickedMovie.overview}</p>

              <div className="picked-actions">
                <button
                  type="button"
                  className="btn-play-picked"
                  onClick={() => {
                    onClose();
                    onPlay(pickedMovie);
                  }}
                >
                  <Play size={16} fill="currentColor" />
                  <span>Stream Now</span>
                </button>
                <button
                  type="button"
                  className="btn-details-picked"
                  onClick={() => {
                    onClose();
                    onOpenDetail(pickedMovie);
                  }}
                >
                  <Info size={16} />
                  <span>Details</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
