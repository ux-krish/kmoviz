import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Maximize2, Minimize2, List, RotateCcw, 
  Play, Sparkles, Crop
} from 'lucide-react';
import { buildMovieEmbedUrl, buildTvEmbedUrl } from '../../services/vsembedApi';
import { getPlaybackProgress, savePlaybackProgress } from '../../services/storageService';
import gsap from 'gsap';
import './CinemaPlayer.scss';

export default function CinemaPlayer({
  item,
  initialSeason = 1,
  initialEpisode = 1,
  onClose,
  onUpdateHistory
}) {
  const [currentSeason, setCurrentSeason] = useState(initialSeason);
  const [currentEpisode, setCurrentEpisode] = useState(initialEpisode);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fitMode, setFitMode] = useState('cover'); // 'cover' | 'fit'
  const [resumePrompt, setResumePrompt] = useState(null);
  const [nextEpCountdown, setNextEpCountdown] = useState(null);
  const [autoNext, setAutoNext] = useState(true);
  const [playerKey, setPlayerKey] = useState(Date.now());
  const [activeStartAt, setActiveStartAt] = useState(0);
  const [isControlsVisible, setIsControlsVisible] = useState(true);

  const playerContainerRef = useRef(null);
  const topBarRef = useRef(null);
  const viewportRef = useRef(null);
  const iframeRef = useRef(null);
  const hideControlsTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Extract ID representations
  const rawId = item.id || item.imdb_id || item.tmdb_id;
  const isImdb = typeof rawId === 'string' && rawId.startsWith('tt');
  const imdbId = item.imdb_id || (isImdb ? rawId : null);
  const tmdbId = item.tmdb_id || (!isImdb ? rawId : null);
  const isTv = item.type === 'tv' || Boolean(item.seasons);

  // Check saved progress on mount
  useEffect(() => {
    const saved = getPlaybackProgress(rawId);
    if (saved && saved.progress > 30 && saved.duration && saved.progress < saved.duration - 60) {
      setResumePrompt(saved);
    }
  }, [rawId]);

  // Exclusively use Server 2 (vsembed.su) with instant autoPlay
  const getEmbedUrl = () => {
    const id = imdbId || tmdbId || rawId;
    return isTv
      ? buildTvEmbedUrl(id, currentSeason, currentEpisode, {
          autoplay: 1,
          autonext: autoNext ? 1 : 0,
          startAt: activeStartAt
        })
      : buildMovieEmbedUrl(id, {
          autoplay: 1,
          startAt: activeStartAt
        });
  };

  const embedUrl = getEmbedUrl();

  // Listen to postMessage player events from Server 2
  useEffect(() => {
    const handlePlayerMessage = (event) => {
      if (!event.data || event.data.type !== 'PLAYER_EVENT') return;

      const { player_info, player_status, player_progress, player_duration } = event.data.data || {};

      if (player_progress !== undefined && player_duration !== undefined) {
        savePlaybackProgress(rawId, player_progress, player_duration, {
          title: item.title,
          type: item.type || 'movie',
          season: isTv ? currentSeason : undefined,
          episode: isTv ? currentEpisode : undefined,
          backdrop: item.backdrop,
          poster: item.poster
        });
        if (onUpdateHistory) onUpdateHistory();
      }

      if (player_status === 'completed' && isTv && autoNext) {
        handleTriggerNextEpisode();
      }
    };

    window.addEventListener('message', handlePlayerMessage);
    return () => window.removeEventListener('message', handlePlayerMessage);
  }, [rawId, currentSeason, currentEpisode, isTv, autoNext, item, onUpdateHistory]);

  // Hide UI controls after idle
  const handleMouseMove = () => {
    setIsControlsVisible(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    hideControlsTimerRef.current = setTimeout(() => {
      if (!showEpisodeDrawer && !nextEpCountdown) {
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
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setNextEpCountdown(null);
    setCurrentEpisode(prev => prev + 1);
    setPlayerKey(Date.now());
  };

  const cancelNextEpisode = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setNextEpCountdown(null);
  };

  const handleResumeClick = (resume) => {
    if (resume && resumePrompt) {
      setActiveStartAt(resumePrompt.progress);
    }
    setResumePrompt(null);
    setPlayerKey(Date.now());
  };

  const handleSelectEpisode = (seasonNum, epNum) => {
    setCurrentSeason(seasonNum);
    setCurrentEpisode(epNum);
    setShowEpisodeDrawer(false);
    setPlayerKey(Date.now());
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerContainerRef.current?.requestFullscreen?.({ navigationUI: 'hide' }).catch(() => {
        // Fallback for webkit
        playerContainerRef.current?.webkitRequestFullscreen?.();
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement || document.webkitFullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Keyboard Shortcuts (Esc to close, F for fullscreen)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showEpisodeDrawer) setShowEpisodeDrawer(false);
        else if (document.fullscreenElement) document.exitFullscreen?.();
        else handleClosePlayer();
      }
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showEpisodeDrawer]);

  // Cinematic GSAP Opening Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Zoom and expand video frame smoothly
      if (viewportRef.current) {
        gsap.fromTo(
          viewportRef.current,
          { scale: 0.88, opacity: 0, filter: 'blur(16px)' },
          { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out' }
        );
      }
      // 2. Cascade top control bar
      if (topBarRef.current) {
        gsap.fromTo(
          topBarRef.current,
          { y: -35, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.45, ease: 'power2.out', delay: 0.12 }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const handleClosePlayer = () => {
    if (playerContainerRef.current) {
      gsap.to(playerContainerRef.current, {
        opacity: 0,
        scale: 0.95,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: onClose
      });
    } else {
      onClose();
    }
  };

  const currentSeasonData = item.seasons?.find(s => s.season_number === currentSeason);

  return (
    <div
      ref={playerContainerRef}
      className={`cinema-player-overlay mode-${fitMode} ${isControlsVisible ? 'controls-active' : 'controls-hidden'}`}
      onMouseMove={handleMouseMove}
    >
      {/* Top Floating Control Bar */}
      <div ref={topBarRef} className="player-top-bar">
        <div className="bar-left">
          <button className="back-btn" onClick={handleClosePlayer} title="Back to KMOVIZ (Esc)">
            <ArrowLeft size={22} />
          </button>

          <div className="player-title-info">
            <span className="brand-pill">
              <Sparkles size={12} />
              <span>4K CINEMA</span>
            </span>
            <h3 className="title-text">{item.title}</h3>
            {isTv && (
              <span className="episode-meta">
                Season {currentSeason}, Episode {currentEpisode}
                {currentSeasonData?.episodes?.find(e => e.episode_number === currentEpisode)?.name
                  ? ` — "${currentSeasonData.episodes.find(e => e.episode_number === currentEpisode).name}"`
                  : ''}
              </span>
            )}
          </div>
        </div>

        <div className="bar-right">
          {/* Cover / Fit Ratio Toggle Button */}
          <button
            type="button"
            className={`player-tool-btn ${fitMode === 'cover' ? 'active' : ''}`}
            onClick={() => setFitMode(fitMode === 'cover' ? 'fit' : 'cover')}
            title={fitMode === 'cover' ? 'Switch to Original Fit' : 'Switch to Full Screen Cover'}
          >
            <Crop size={17} />
            <span>{fitMode === 'cover' ? 'Cover' : 'Fit'}</span>
          </button>

          {isTv && (
            <button
              type="button"
              className={`player-tool-btn ${showEpisodeDrawer ? 'active' : ''}`}
              onClick={() => setShowEpisodeDrawer(!showEpisodeDrawer)}
              title="Episodes Selector"
            >
              <List size={18} />
              <span>Episodes</span>
            </button>
          )}

          <button type="button" className="player-tool-btn" onClick={toggleFullscreen} title="Fullscreen (F)">
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* Embedded Iframe Viewport — Server 2 (vsembed.su) Direct 1-Click Stream */}
      <div ref={viewportRef} className="iframe-viewport">
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
              <button type="button" className="btn-resume" onClick={() => handleResumeClick(true)}>
                Resume ({formatSeconds(resumePrompt.progress)})
              </button>
              <button type="button" className="btn-restart" onClick={() => handleResumeClick(false)}>
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
              <button type="button" className="btn-play-now" onClick={playNextEpisode}>
                <Play size={18} fill="currentColor" />
                <span>Play Now</span>
              </button>
              <button type="button" className="btn-cancel" onClick={cancelNextEpisode}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Episode Drawer Sidebar */}
      {isTv && showEpisodeDrawer && (
        <div className="episode-drawer-panel">
          <div className="drawer-header">
            <h3>Episodes</h3>
            <button type="button" className="drawer-close" onClick={() => setShowEpisodeDrawer(false)}>
              &times;
            </button>
          </div>

          {item.seasons && item.seasons.length > 1 && (
            <div className="season-selector-tabs">
              {item.seasons.map(s => (
                <button
                  key={s.season_number}
                  type="button"
                  className={`season-tab ${currentSeason === s.season_number ? 'active' : ''}`}
                  onClick={() => setCurrentSeason(s.season_number)}
                >
                  Season {s.season_number}
                </button>
              ))}
            </div>
          )}

          <div className="episodes-list">
            {currentSeasonData?.episodes && currentSeasonData.episodes.length > 0 ? (
              currentSeasonData.episodes.map(ep => {
                const isCurrent = ep.episode_number === currentEpisode;
                return (
                  <div
                    key={ep.episode_number}
                    className={`episode-item-card ${isCurrent ? 'active' : ''}`}
                    onClick={() => handleSelectEpisode(currentSeason, ep.episode_number)}
                  >
                    <div className="ep-thumb-wrapper">
                      <img
                        src={ep.thumbnail || `https://images.metahub.space/background/medium/tt0944947/img`}
                        alt={ep.name}
                        loading="lazy"
                      />
                      <div className="ep-play-hover">
                        <Play size={16} fill="#ffffff" />
                      </div>
                    </div>
                    <div className="ep-info">
                      <div className="ep-title-row">
                        <span className="ep-number">{ep.episode_number}.</span>
                        <span className="ep-title">{ep.name || `Episode ${ep.episode_number}`}</span>
                      </div>
                      {ep.overview && <p className="ep-overview">{ep.overview}</p>}
                    </div>
                  </div>
                );
              })
            ) : (
              Array.from({ length: 12 }).map((_, idx) => {
                const epNum = idx + 1;
                const isCurrent = epNum === currentEpisode;
                return (
                  <div
                    key={epNum}
                    className={`episode-item-card ${isCurrent ? 'active' : ''}`}
                    onClick={() => handleSelectEpisode(currentSeason, epNum)}
                  >
                    <div className="ep-number-circle">{epNum}</div>
                    <div className="ep-info">
                      <span className="ep-title">Episode {epNum}</span>
                      <span className="ep-duration">45m</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function formatSeconds(secs) {
  if (!secs) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
