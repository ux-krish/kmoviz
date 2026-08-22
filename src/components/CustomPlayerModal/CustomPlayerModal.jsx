import React, { useState } from 'react';
import { X, Play, Film, Tv, History, Sparkles, HelpCircle } from 'lucide-react';
import { validateMediaId } from '../../services/vsembedApi';
import { getCustomStreamHistory, addCustomStream } from '../../services/storageService';
import './CustomPlayerModal.scss';

export default function CustomPlayerModal({ onClose, onLaunchStream }) {
  const [idInput, setIdInput] = useState('');
  const [mediaType, setMediaType] = useState('movie'); // 'movie' | 'tv'
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState(getCustomStreamHistory());

  const handleLaunch = (e) => {
    e?.preventDefault();
    setError('');

    const validation = validateMediaId(idInput);
    if (!validation.isValid) {
      setError('Please enter a valid IMDB ID (e.g., tt1300854) or numeric TMDB ID (e.g., 68721).');
      return;
    }

    const cleanId = validation.cleanId;
    const isImdb = validation.type === 'imdb';
    const streamItem = {
      id: cleanId,
      imdb_id: isImdb ? cleanId : undefined,
      tmdb_id: !isImdb ? cleanId : undefined,
      title: title.trim() || `Custom Stream (${cleanId})`,
      type: mediaType,
      year: new Date().getFullYear().toString(),
      rating: 'PG-13',
      quality: '1080p / 4K',
      match: '99% Match',
      backdrop: isImdb ? `https://images.metahub.space/background/large/${cleanId}/img` : 'https://images.metahub.space/background/large/tt1300854/img',
      poster: isImdb ? `https://images.metahub.space/poster/medium/${cleanId}/img` : 'https://images.metahub.space/poster/medium/tt1300854/img',
      overview: `Custom direct stream via vsembed.su embed player engine (${cleanId}).`,
      customStream: true
    };

    addCustomStream(streamItem);
    onLaunchStream(streamItem, mediaType === 'tv' ? Number(season) : 1, mediaType === 'tv' ? Number(episode) : 1);
  };

  const handleQuickLoad = (item) => {
    setIdInput(item.imdb_id || item.tmdb_id || item.id);
    setTitle(item.title || '');
    setMediaType(item.type || 'movie');
  };

  const samplePresets = [
    { title: 'The Matrix (1999)', id: 'tt0133093', type: 'movie' },
    { title: 'Interstellar (2014)', id: 'tt0816692', type: 'movie' },
    { title: 'Breaking Bad S1:E1', id: 'tt0903747', type: 'tv', season: 1, episode: 1 },
    { title: 'Arcane S1:E1', id: 'tt11126994', type: 'tv', season: 1, episode: 1 }
  ];

  return (
    <div className="custom-player-backdrop" onClick={onClose}>
      <div className="custom-player-container" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="custom-header">
          <div className="header-icon">
            <Sparkles size={24} />
          </div>
          <h2>Direct Stream Launcher</h2>
          <p>Stream any movie or TV show by IMDB or TMDB ID via the VidSrc / vsembed engine.</p>
        </div>

        <form onSubmit={handleLaunch} className="custom-form">
          <div className="type-toggle-group">
            <button
              type="button"
              className={`toggle-btn ${mediaType === 'movie' ? 'active' : ''}`}
              onClick={() => setMediaType('movie')}
            >
              <Film size={18} />
              <span>Movie</span>
            </button>
            <button
              type="button"
              className={`toggle-btn ${mediaType === 'tv' ? 'active' : ''}`}
              onClick={() => setMediaType('tv')}
            >
              <Tv size={18} />
              <span>TV Series</span>
            </button>
          </div>

          <div className="form-group">
            <label>IMDB ID or TMDB ID *</label>
            <input
              type="text"
              placeholder="e.g. tt1300854 or 68721 or IMDB URL"
              value={idInput}
              onChange={(e) => setIdInput(e.target.value)}
              required
            />
            <span className="input-hint">Accepts IMDB ID (tt...), TMDB numeric ID, or full IMDB link</span>
          </div>

          <div className="form-group">
            <label>Custom Title (Optional)</label>
            <input
              type="text"
              placeholder="e.g. My Favorite Movie"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {mediaType === 'tv' && (
            <div className="form-row-2">
              <div className="form-group">
                <label>Season</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={season}
                  onChange={(e) => setSeason(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Episode</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={episode}
                  onChange={(e) => setEpisode(e.target.value)}
                />
              </div>
            </div>
          )}

          {error && <div className="error-banner">{error}</div>}

          <button type="submit" className="btn-launch-player">
            <Play size={18} fill="currentColor" />
            <span>Launch Player</span>
          </button>
        </form>

        {/* Quick Sample Presets */}
        <div className="sample-presets">
          <div className="presets-title">Quick Try Presets:</div>
          <div className="presets-list">
            {samplePresets.map((p) => (
              <button
                key={p.id}
                className="preset-pill"
                onClick={() => {
                  setIdInput(p.id);
                  setTitle(p.title);
                  setMediaType(p.type);
                  if (p.season) setSeason(p.season);
                  if (p.episode) setEpisode(p.episode);
                }}
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        {/* Recent custom streams history */}
        {history.length > 0 && (
          <div className="custom-history-section">
            <div className="history-header">
              <History size={16} />
              <span>Recent Direct Streams</span>
            </div>
            <div className="history-list">
              {history.slice(0, 4).map((h) => (
                <div key={h.id} className="history-chip" onClick={() => handleQuickLoad(h)}>
                  <span className="h-title">{h.title}</span>
                  <span className="h-id">({h.id})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
