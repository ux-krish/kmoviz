import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, Maximize2, Minimize2, List, Settings, RotateCcw, 
  Play, Check, Sparkles, Server, Zap, Globe, Shield, ShieldCheck, Eye, EyeOff
} from 'lucide-react';
import { buildMovieEmbedUrl, buildTvEmbedUrl } from '../../services/vsembedApi';
import { getPlaybackProgress, savePlaybackProgress } from '../../services/storageService';
import './CinemaPlayer.scss';

// Only servers that work without sandbox restrictions
const SERVERS = [
  { id: 'vsembed',   name: 'Server 1 — VidSrc Pro (Fast · 4K)', badge: 'Recommended' },
  { id: 'vidsrc_me', name: 'Server 2 — VidSrc Classic (Clean)', badge: 'Stable' },
];

export default function CinemaPlayer({
  item,
  initialSeason = 1,
  initialEpisode = 1,
  onClose,
  onUpdateHistory
}) {
  const [selectedServer, setSelectedServer] = useState('vsembed');
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resumePrompt, setResumePrompt] = useState(null);
  const [nextEpCountdown, setNextEpCountdown] = useState(null);
  const [autoNext, setAutoNext] = useState(true);
  const [defaultLang, setDefaultLang] = useState('en');
  const [playerKey, setPlayerKey] = useState(Date.now());
  const [activeStartAt, setActiveStartAt] = useState(0);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [cleanShieldActive, setCleanShieldActive] = useState(true); // Masks top watermarks & block ads

  const playerContainerRef = useRef(null);
  const iframeRef = useRef(null);
  const hideControlsTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Subscribe to AdShield stats for live blocked counter in player
  const [adBlockedCount, setAdBlockedCount] = useState(0);
  useEffect(() => {
    const unsub = subscribeAdShieldStats((data) => setAdBlockedCount(data.total));
    return unsub;
  }, []);


  const mediaId = item.imdb_id || item.tmdb_id || item.id;
  const isTv = item.type === 'tv' || Boolean(item.seasons);
  const isImdb = typeof mediaId === 'string' && mediaId.startsWith('tt');

  // Check saved progress on mount
  useEffect(() => {
    const saved = getPlaybackProgress(mediaId);
    if (saved && saved.progress > 30 && saved.duration && saved.progress < saved.duration - 60) {
      setResumePrompt(saved);
    }
  }, [mediaId]);

  // Generate embed URL — Server 1: VidSrc Pro (vsembed), Server 2: VidSrc Classic (vidsrc.me)
  const getEmbedUrl = () => {
    if (selectedServer === 'vidsrc_me') {
      return isTv
        ? `https://vidsrc.me/embed/tv?${isImdb ? `imdb=${mediaId}` : `tmdb=${mediaId}`}&season=${currentSeason}&episode=${currentEpisode}`
        : `https://vidsrc.me/embed/movie?${isImdb ? `imdb=${mediaId}` : `tmdb=${mediaId}`}`;
    }

    // Default: vsembed (Server 1 — VidSrc Pro)
    return isTv
      ? buildTvEmbedUrl(mediaId, currentSeason, currentEpisode, {
          autoplay: 1,
          autonext: autoNext ? 1 : 0,
          startAt: activeStartAt,
          ds_lang: defaultLang
        })
      : buildMovieEmbedUrl(mediaId, {
          autoplay: 1,
          startAt: activeStartAt,
          ds_lang: defaultLang
        });
  };

  const embedUrl = getEmbedUrl();

  // Listen to postMessage player events from vsembed
  useEffect(() => {
    const handlePlayerMessage = (event) => {
      if (!event.data || event.data.type !== 'PLAYER_EVENT') return;

      const { player_info, player_status, player_progress, player_duration } = event.data.data || {};

      if (player_progress !== undefined && player_duration !== undefined) {
        savePlaybackProgress(mediaId, player_progress, player_duration, {
          title: item.title,
          type: item.type || 'movie',
          season: isTv ? currentSeason : undefined,
          episode: isTv ? currentEpisode : undefined,
          backdrop: item.backdrop,
          poster: item.poster
        });
        if (onUpdateHistory) onUpdateHistory();
      }

      // Handle completed status for auto-next episode
      if (player_status === 'completed' && isTv && autoNext) {
        handleTriggerNextEpisode();
      }
    };

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [mediaId, currentSeason, currentEpisode, isTv, autoNext, item]);

  // Hide UI controls after idle
  const handleMouseMove = () => {
    setIsControlsVisible(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    hideControlsTimerRef.current = setTimeout(() => {
      if (!showEpisodeDrawer && !showSettings && !nextEpCountdown) {
        setIsControlsVisible(false);
      }
    }, 3500);
  };

  const handleTriggerNextEpisode = () => {
    const currentSeasonObj = item.seasons?.find(s => s.season_number === currentSeason);
    const nextEpNum = currentEpisode + 1;
    const hasNextInSeason = currentSeasonObj?.episodes?.some(e => e.episode_number === nextEpNum);

    if (hasNextInSeason || !item.seasons) {
      setNextEpCountdown(5);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      
      countdownIntervalRef.current = setInterval(() => {
        setNextEpCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            playNextEpisode();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const playNextEpisode = () => {
    setNextEpCountdown(null);
    setCurrentEpisode((prev) => prev + 1);
    setActiveStartAt(0);
    setPlayerKey(Date.now());
  };

  const handleSelectEpisode = (seasonNum, epNum) => {
    setCurrentSeason(seasonNum);
    setCurrentEpisode(epNum);
    setActiveStartAt(0);
    setPlayerKey(Date.now());
    setShowEpisodeDrawer(false);
  };

  const handleResumeClick = (useSavedTime) => {
    if (useSavedTime && resumePrompt) {
      setActiveStartAt(resumePrompt.progress);
    } else {
      setActiveStartAt(0);
    }
    setResumePrompt(null);
    setPlayerKey(Date.now());
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatSeconds = (sec) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentSeasonData = item.seasons?.find(s => s.season_number === currentSeason);
  const currentEpisodeData = currentSeasonData?.episodes?.find(e => e.episode_number === currentEpisode);

  return (
    <div
      ref={playerContainerRef}
      className={`cinema-player-overlay ${isControlsVisible ? 'controls-active' : 'controls-hidden'} ${cleanShieldActive ? 'shield-on' : ''}`}
      onMouseMove={handleMouseMove}
    >
      {/* Top Floating Control Bar */}
      <div className="player-top-bar">
        <div className="bar-left">
          <button className="back-btn" onClick={onClose} title="Back to KMOVIZ">
            <ArrowLeft size={24} />
          </button>

          <div className="player-title-info">
            <div className="brand-pill">
              <Zap size={13} /> KMOVIZ Cinema
            </div>
            <h2 className="title-text">{item.title}</h2>
            {isTv && (
              <span className="episode-meta">
                S{currentSeason}:E{currentEpisode} {currentEpisodeData?.title ? `— "${currentEpisodeData.title}"` : ''}
              </span>
            )}
          </div>
        </div>

        <div className="bar-right">
          {/* Ad & Watermark Shield Button */}
          <button
            className={`player-tool-btn shield-btn ${cleanShieldActive ? 'active' : ''}`}
            onClick={() => setCleanShieldActive(!cleanShieldActive)}
            title={cleanShieldActive ? 'Ad & Watermark Shield Active — Click to Disable' : 'Enable Ad & Watermark Shield'}
          >
            <ShieldCheck size={18} className="shield-icon" />
            <span>{cleanShieldActive ? `Shield ON · ${adBlockedCount} blocked` : 'Shield OFF'}</span>
          </button>

          {/* Server Switcher Quick Selector */}
          <div className="server-quick-selector">
            <Server size={16} className="server-icon" />
            <select
              value={selectedServer}
              onChange={(e) => {
                setSelectedServer(e.target.value);
                setPlayerKey(Date.now());
              }}
              title="Switch Streaming Server (Clean / Ad-Free / 4K)"
            >
              {SERVERS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {isTv && (
            <button
              className={`player-tool-btn ${showEpisodeDrawer ? 'active' : ''}`}
              onClick={() => setShowEpisodeDrawer(!showEpisodeDrawer)}
              title="Episodes Selector"
            >
              <List size={20} />
              <span>Episodes</span>
            </button>
          )}

          <button
            className={`player-tool-btn ${showSettings ? 'active' : ''}`}
            onClick={() => setShowSettings(!showSettings)}
            title="Audio, Subtitles & Servers"
          >
            <Settings size={20} />
          </button>

          <button className="player-tool-btn" onClick={toggleFullscreen} title="Fullscreen">
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      {/* Embedded Iframe Viewport — Direct 1-Click Playback */}
      <div className="iframe-viewport">
        <iframe
          ref={iframeRef}
          key={playerKey}
          src={embedUrl}
          title={item.title}
          allowFullScreen
          allow="autoplay *; encrypted-media *; fullscreen *; picture-in-picture *"
          className="vsembed-iframe"
          referrerPolicy="no-referrer"
          loading="eager"
        />
      </div>

      {/* Resume playback prompt banner */}
      {resumePrompt && (
        <div className="resume-prompt-modal">
          <div className="resume-content">
            <div className="resume-icon">
              <RotateCcw size={24} />
            </div>
            <div className="resume-text">
              <h4>Resume Watching?</h4>
              <p>You left off at {formatSeconds(resumePrompt.progress)}.</p>
            </div>
            <div className="resume-buttons">
              <button className="btn-resume" onClick={() => handleResumeClick(true)}>
                Resume ({formatSeconds(resumePrompt.progress)})
              </button>
              <button className="btn-restart" onClick={() => handleResumeClick(false)}>
                Start from Beginning
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto Next Episode Countdown Overlay */}
      {nextEpCountdown !== null && (
        <div className="next-episode-overlay">
          <div className="next-ep-card">
            <div className="next-ep-header">
              <Sparkles size={20} className="sparkle-icon" />
              <span>Next Episode in {nextEpCountdown}s</span>
            </div>
            <h3>
              Season {currentSeason}, Episode {currentEpisode + 1}
            </h3>
            <div className="next-ep-actions">
              <button className="btn-play-now" onClick={playNextEpisode}>
                <Play size={18} fill="currentColor" />
                <span>Play Now</span>
              </button>
              <button className="btn-cancel" onClick={() => setNextEpCountdown(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Episode Selector Drawer */}
      {showEpisodeDrawer && isTv && (
        <div className="episodes-drawer">
          <div className="drawer-header">
            <h3>Episodes</h3>
            <select
              className="season-select"
              value={currentSeason}
              onChange={(e) => setCurrentSeason(Number(e.target.value))}
            >
              {item.seasons ? (
                item.seasons.map((s) => (
                  <option key={s.season_number} value={s.season_number}>
                    Season {s.season_number}
                  </option>
                ))
              ) : (
                <option value="1">Season 1</option>
              )}
            </select>
          </div>

          <div className="episodes-list">
            {currentSeasonData?.episodes ? (
              currentSeasonData.episodes.map((ep) => (
                <div
                  key={ep.episode_number}
                  className={`episode-item ${ep.episode_number === currentEpisode ? 'active' : ''}`}
                  onClick={() => handleSelectEpisode(currentSeason, ep.episode_number)}
                >
                  <div className="ep-thumb" style={{ backgroundImage: `url(${ep.thumbnail || item.backdrop})` }}>
                    <span className="ep-num">{ep.episode_number}</span>
                  </div>
                  <div className="ep-info">
                    <div className="ep-title-row">
                      <span className="ep-title">{ep.title}</span>
                      <span className="ep-dur">{ep.duration}</span>
                    </div>
                    <p className="ep-desc">{ep.overview}</p>
                  </div>
                </div>
              ))
            ) : (
              Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i + 1}
                  className={`episode-item ${i + 1 === currentEpisode ? 'active' : ''}`}
                  onClick={() => handleSelectEpisode(currentSeason, i + 1)}
                >
                  <div className="ep-thumb" style={{ backgroundImage: `url(${item.backdrop})` }}>
                    <span className="ep-num">{i + 1}</span>
                  </div>
                  <div className="ep-info">
                    <div className="ep-title-row">
                      <span className="ep-title">Episode {i + 1}</span>
                      <span className="ep-dur">45m</span>
                    </div>
                    <p className="ep-desc">Stream Episode {i + 1} on KMOVIZ Cinema Engine.</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Settings / Subtitles Modal */}
      {showSettings && (
        <div className="player-settings-modal">
          <div className="settings-header">
            <h4>Playback & Server Settings</h4>
            <button className="close-settings" onClick={() => setShowSettings(false)}>
              ✕
            </button>
          </div>

          <div className="settings-body">
            <div className="setting-row">
              <label>Switch Streaming Server</label>
              <select
                value={selectedServer}
                onChange={(e) => {
                  setSelectedServer(e.target.value);
                  setPlayerKey(Date.now());
                }}
              >
                {SERVERS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.badge})
                  </option>
                ))}
              </select>
            </div>

            <div className="setting-row">
              <label>Ad & Watermark Shield</label>
              <div className="shield-toggle-row">
                <button
                  className={`toggle-shield-btn ${cleanShieldActive ? 'on' : ''}`}
                  onClick={() => setCleanShieldActive(!cleanShieldActive)}
                >
                  <ShieldCheck size={16} />
                  <span>{cleanShieldActive ? 'Shield Enabled (Clean View)' : 'Shield Disabled'}</span>
                </button>
              </div>
            </div>

            <div className="setting-row">
              <label>Default Subtitles Language</label>
              <select
                value={defaultLang}
                onChange={(e) => {
                  setDefaultLang(e.target.value);
                  setPlayerKey(Date.now());
                }}
              >
                <option value="en">English (Default)</option>
                <option value="hi">Hindi</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
                <option value="pt">Portuguese</option>
              </select>
            </div>

            <div className="setting-row checkbox-row">
              <label htmlFor="autonext-check">Auto-Play Next Episode</label>
              <input
                id="autonext-check"
                type="checkbox"
                checked={autoNext}
                onChange={(e) => setAutoNext(e.target.checked)}
              />
            </div>

            <div className="engine-info">
              <div className="info-badge">Engine: KMOVIZ Universal Clean Player</div>
              <div className="info-id">Media ID: {mediaId}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
