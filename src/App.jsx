import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/Navbar/Navbar';
import HeroBillboard from './components/HeroBillboard/HeroBillboard';
import MediaRow from './components/MediaRow/MediaRow';
import DetailModal from './components/DetailModal/DetailModal';
import CinemaPlayer from './components/CinemaPlayer/CinemaPlayer';
import SearchOverlay from './components/SearchOverlay/SearchOverlay';
import WatchlistView from './components/WatchlistView/WatchlistView';
import SurpriseModal from './components/SurpriseModal/SurpriseModal';
import Footer from './components/Footer/Footer';

import { CATALOG } from './data/mockCatalog';
import { getWatchlist, getWatchHistory } from './services/storageService';
import { initAdShieldEngine, setEngineEnabled } from './services/adShieldService';
import { 
  fetchTmdbMovieById,
  fetchNowPlayingMovies,
  fetchTrendingMovies, 
  fetchTrendingTv, 
  fetchBollywoodMovies,
  fetchTopRatedMasterpieces,
  fetchTmdbByGenre
} from './services/tmdbApi';
import { fetchLatestMovies } from './services/vsembedApi';

import './App.scss';

// Fallback initial Hero Movie: Spider-Man: Brand New Day (TMDB: 969681)
const SPIDERMAN_HERO = {
  id: '969681',
  tmdb_id: '969681',
  imdb_id: 'tt22084616',
  title: 'Spider-Man: Brand New Day',
  type: 'movie',
  year: '2026',
  rating: '★ 8.2',
  match: '99% Match',
  quality: '4K Ultra HD',
  audio: 'Dolby Atmos 5.1',
  duration: '2h 25m',
  backdrop: 'https://image.tmdb.org/t/p/original/7iwUUcKURMT7aKfCwMy6YnGtchD.jpg',
  poster: 'https://image.tmdb.org/t/p/w780/iPOn6DinuVyLY17YM9mKuPofV08.jpg',
  overview: "Fighting crime full-time as Spider-Man in a world that doesn't remember him—and the pressure of seeing his old friends move on without him—sparks a change in Peter Parker he may not have the power to control. But that transformation might also be the only thing that can stop a shocking new threat.",
  genres: ['Action', 'Sci-Fi', 'Adventure'],
  cast: ['Tom Holland', 'Zendaya', 'Jacob Batalon', 'Benedict Cumberbatch'],
  director: 'Destin Daniel Cretton'
};

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'movies' | 'tvshows' | 'regional' | 'mylist'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Modals & Player State
  const [detailItem, setDetailItem] = useState(null);
  const [playerState, setPlayerState] = useState(null); // { item, season, episode }
  const [isSurpriseOpen, setIsSurpriseOpen] = useState(false);

  // Local Storage State
  const [watchlist, setWatchlist] = useState(getWatchlist());
  const [history, setHistory] = useState(getWatchHistory());

  // Dynamic Live Movie Rows State
  const [heroMovie, setHeroMovie] = useState(SPIDERMAN_HERO);
  const [heroTopList, setHeroTopList] = useState([SPIDERMAN_HERO]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingSeries, setTrendingSeries] = useState([]);
  const [bollywoodMovies, setBollywoodMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [scifiMovies, setScifiMovies] = useState([]);
  const [animationMovies, setAnimationMovies] = useState([]);
  const [vsembedFeed, setVsembedFeed] = useState([]);

  // Initialize uBlock AdShield Engine on mount
  useEffect(() => {
    initAdShieldEngine();
  }, []);

  // Refresh storage state
  const refreshStorage = useCallback(() => {
    setWatchlist(getWatchlist());
    setHistory(getWatchHistory());
  }, []);

  // Fetch massive live catalog & Spider-Man Hero movie on load
  useEffect(() => {
    async function loadMassiveCatalog() {
      try {
        fetchTmdbMovieById(969681).then(spidey => {
          if (spidey) {
            setHeroMovie(spidey);
          }
        });

        const [
          nowPlayRes,
          topMovRes,
          topTvRes,
          bollyRes,
          topRatedRes,
          actionRes,
          scifiRes,
          animRes,
          vsembedMovRes
        ] = await Promise.allSettled([
          fetchNowPlayingMovies(1),
          fetchTrendingMovies(1),
          fetchTrendingTv(1),
          fetchBollywoodMovies(),
          fetchTopRatedMasterpieces(),
          fetchTmdbByGenre(28, 'movie'),
          fetchTmdbByGenre(878, 'movie'),
          fetchTmdbByGenre(16, 'movie'),
          fetchLatestMovies(1)
        ]);

        let nowPlayingList = [];
        let trendingMovList = [];

        if (nowPlayRes.status === 'fulfilled' && nowPlayRes.value?.length > 0) {
          nowPlayingList = nowPlayRes.value;
          setNowPlaying(nowPlayingList);
        }
        if (topMovRes.status === 'fulfilled' && topMovRes.value?.length > 0) {
          trendingMovList = topMovRes.value;
          setTrendingMovies(trendingMovList);
        }
        if (topTvRes.status === 'fulfilled' && topTvRes.value?.length > 0) {
          setTrendingSeries(topTvRes.value);
        }
        if (bollyRes.status === 'fulfilled' && bollyRes.value?.length > 0) {
          setBollywoodMovies(bollyRes.value);
        }
        if (topRatedRes.status === 'fulfilled' && topRatedRes.value?.length > 0) {
          setTopRatedMovies(topRatedRes.value);
        }
        if (actionRes.status === 'fulfilled' && actionRes.value?.length > 0) {
          setActionMovies(actionRes.value);
        }
        if (scifiRes.status === 'fulfilled' && scifiRes.value?.length > 0) {
          setScifiMovies(scifiRes.value);
        }
        if (animRes.status === 'fulfilled' && animRes.value?.length > 0) {
          setAnimationMovies(animRes.value);
        }

        const combinedTop = [
          SPIDERMAN_HERO,
          ...nowPlayingList.filter(m => m.id !== '969681'),
          ...trendingMovList.filter(m => m.id !== '969681')
        ].slice(0, 10);
        setHeroTopList(combinedTop);

        if (vsembedMovRes.status === 'fulfilled' && vsembedMovRes.value?.result) {
          const feedItems = vsembedMovRes.value.result.slice(0, 15).map(m => ({
            id: m.imdb_id || m.tmdb_id || m.title,
            imdb_id: m.imdb_id,
            tmdb_id: m.tmdb_id,
            title: m.title,
            type: 'movie',
            quality: m.quality || '1080p',
            year: '2025',
            match: '98% Match',
            rating: 'PG-13',
            backdrop: m.imdb_id ? `https://images.metahub.space/background/large/${m.imdb_id}/img` : 'https://images.metahub.space/background/large/tt1300854/img',
            poster: m.imdb_id ? `https://images.metahub.space/poster/medium/${m.imdb_id}/img` : 'https://images.metahub.space/poster/medium/tt1300854/img',
            overview: `Stream this newly released title on the KMOVIZ Cinema player engine (${m.quality || '1080p'}).`
          }));
          setVsembedFeed(feedItems);
        }
      } catch (err) {
        console.warn('Catalog feed load error:', err);
      }
    }

    loadMassiveCatalog();
  }, []);

  const handlePlayMedia = (item, season = 1, episode = 1) => {
    setPlayerState({ item, season, episode });
    setDetailItem(null);
  };

  const handleOpenDetail = (item) => {
    setDetailItem(item);
  };

  const handleLaunchCustomStream = (streamItem, season = 1, episode = 1) => {
    setIsCustomPlayerOpen(false);
    setPlayerState({ item: streamItem, season, episode });
  };

  const allLoadedCatalog = useMemo(() => {
    const rawList = [
      heroMovie,
      ...nowPlaying,
      ...trendingMovies,
      ...trendingSeries,
      ...bollywoodMovies,
      ...topRatedMovies,
      ...actionMovies,
      ...scifiMovies,
      ...animationMovies,
      ...vsembedFeed,
      ...CATALOG
    ].filter(Boolean);

    const map = new Map();
    rawList.forEach(item => {
      const key = item.id || item.imdb_id || item.tmdb_id || item.title;
      if (key && !map.has(key)) {
        map.set(key, item);
      }
    });
    return Array.from(map.values());
  }, [heroMovie, nowPlaying, trendingMovies, trendingSeries, bollywoodMovies, topRatedMovies, actionMovies, scifiMovies, animationMovies, vsembedFeed]);

  return (
    <div className="app-container">
      {/* Top Navbar with uBlock AdShield Button */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
          setIsSearchOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenSearch={(open) => setIsSearchOpen(open)}
        searchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
        onOpenSurprise={() => setIsSurpriseOpen(true)}
        watchlistCount={watchlist.length}
      />

      <main className="main-content">
        {isSearchOpen || searchQuery.trim() !== '' ? (
          <SearchOverlay
            query={searchQuery}
            items={allLoadedCatalog}
            onPlay={handlePlayMedia}
            onOpenDetail={handleOpenDetail}
            onWatchlistChange={refreshStorage}
          />
        ) : activeTab === 'mylist' ? (
          <WatchlistView
            watchlist={watchlist}
            history={history}
            onPlay={handlePlayMedia}
            onOpenDetail={handleOpenDetail}
            onWatchlistChange={refreshStorage}
          />
        ) : (
          <>
            {/* Main Hero Billboard */}
            <HeroBillboard
              items={heroTopList}
              onPlay={handlePlayMedia}
              onOpenDetail={handleOpenDetail}
            />

            {/* Rows Section with Grab-and-Drag */}
            <div className="netflix-rows-section">
              {history.length > 0 && (
                <MediaRow
                  title="Continue Watching"
                  items={history}
                  onPlay={handlePlayMedia}
                  onOpenDetail={handleOpenDetail}
                  onWatchlistChange={refreshStorage}
                />
              )}

              {(activeTab === 'home' || activeTab === 'movies') && nowPlaying.length > 0 && (
                <MediaRow
                  title="Brand New Blockbusters & In Theaters"
                  items={nowPlaying}
                  isLarge={true}
                  onPlay={handlePlayMedia}
                  onOpenDetail={handleOpenDetail}
                  onWatchlistChange={refreshStorage}
                />
              )}

              <MediaRow
                title="Trending Movies & Shows This Week"
                items={activeTab === 'tvshows' ? trendingSeries : trendingMovies}
                onPlay={handlePlayMedia}
                onOpenDetail={handleOpenDetail}
                onWatchlistChange={refreshStorage}
              />

              {activeTab !== 'tvshows' && (
                <MediaRow
                  title="Top 10 in Movies Today"
                  items={trendingMovies.slice(0, 10)}
                  isTop10={true}
                  onPlay={handlePlayMedia}
                  onOpenDetail={handleOpenDetail}
                  onWatchlistChange={refreshStorage}
                />
              )}

              {activeTab !== 'movies' && (
                <MediaRow
                  title="Top 10 in TV Shows Today"
                  items={trendingSeries.slice(0, 10)}
                  isTop10={true}
                  onPlay={handlePlayMedia}
                  onOpenDetail={handleOpenDetail}
                  onWatchlistChange={refreshStorage}
                />
              )}

              {(activeTab === 'home' || activeTab === 'regional') && bollywoodMovies.length > 0 && (
                <MediaRow
                  title="Bollywood & Regional Blockbusters"
                  items={bollywoodMovies}
                  onPlay={handlePlayMedia}
                  onOpenDetail={handleOpenDetail}
                  onWatchlistChange={refreshStorage}
                />
              )}

              {topRatedMovies.length > 0 && (
                <MediaRow
                  title="All-Time Masterpieces & IMDb Top Rated"
                  items={topRatedMovies}
                  onPlay={handlePlayMedia}
                  onOpenDetail={handleOpenDetail}
                  onWatchlistChange={refreshStorage}
                />
              )}

              {actionMovies.length > 0 && (
                <MediaRow
                  title="Action & High-Octane Thrillers"
                  items={actionMovies}
                  onPlay={handlePlayMedia}
                  onOpenDetail={handleOpenDetail}
                  onWatchlistChange={refreshStorage}
                />
              )}

              {scifiMovies.length > 0 && (
                <MediaRow
                  title="Sci-Fi & Cyberpunk Universes"
                  items={scifiMovies}
                  onPlay={handlePlayMedia}
                  onOpenDetail={handleOpenDetail}
                  onWatchlistChange={refreshStorage}
                />
              )}

              {trendingSeries.length > 0 && (
                <MediaRow
                  title="Binge-Worthy TV Series & Originals"
                  items={trendingSeries}
                  onPlay={handlePlayMedia}
                  onOpenDetail={handleOpenDetail}
                  onWatchlistChange={refreshStorage}
                />
              )}

              {animationMovies.length > 0 && (
                <MediaRow
                  title="Popular Animation & Anime"
                  items={animationMovies}
                  onPlay={handlePlayMedia}
                  onOpenDetail={handleOpenDetail}
                  onWatchlistChange={refreshStorage}
                />
              )}

              {vsembedFeed.length > 0 && (
                <MediaRow
                  title="Fresh Additions on VidSrc Network"
                  items={vsembedFeed}
                  onPlay={handlePlayMedia}
                  onOpenDetail={handleOpenDetail}
                  onWatchlistChange={refreshStorage}
                />
              )}
            </div>
          </>
        )}
      </main>

      <Footer />

      {detailItem && (
        <DetailModal
          item={detailItem}
          onClose={() => setDetailItem(null)}
          onPlay={handlePlayMedia}
          onSelectRelated={(rel) => setDetailItem(rel)}
        />
      )}

      {playerState && (
        <CinemaPlayer
          item={playerState.item}
          initialSeason={playerState.season}
          initialEpisode={playerState.episode}
          onClose={() => setPlayerState(null)}
          onUpdateHistory={refreshStorage}
        />
      )}

      {isSurpriseOpen && (
        <SurpriseModal
          catalog={allLoadedCatalog}
          onClose={() => setIsSurpriseOpen(false)}
          onPlay={handlePlayMedia}
          onOpenDetail={handleOpenDetail}
        />
      )}
    </div>
  );
}
