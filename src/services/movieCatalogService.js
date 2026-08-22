/**
 * Dynamic Movie & TV Show Catalog Service
 * Fetches latest 2024-2026 releases, trending titles, genre collections,
 * and live global search with official posters and backdrops.
 */

import { CATALOG, HERO_FEATURED } from '../data/mockCatalog';

const CINEMETA_BASE = 'https://v3-cinemeta.strem.io';

// Helper to format Cinemeta meta to our standard media object
export function formatMetaToMedia(m, defaultType = 'movie') {
  const isTv = m.type === 'series' || defaultType === 'tv';
  const imdbId = m.id || m.imdb_id;

  // Safe poster & backdrop resolution
  const poster = m.poster || (imdbId ? `https://images.metahub.space/poster/medium/${imdbId}/img` : 'https://images.metahub.space/poster/medium/tt1375666/img');
  const backdrop = m.background || (imdbId ? `https://images.metahub.space/background/large/${imdbId}/img` : 'https://images.metahub.space/background/large/tt1375666/img');

  return {
    id: imdbId || m.name,
    imdb_id: imdbId,
    tmdb_id: m.tmdb_id,
    title: m.name || m.title,
    type: isTv ? 'tv' : 'movie',
    year: m.year ? String(m.year) : (m.releaseInfo ? String(m.releaseInfo) : '2024'),
    rating: m.imdbRating ? `★ ${m.imdbRating}` : 'PG-13',
    match: m.imdbRating ? `${Math.min(99, Math.round(Number(m.imdbRating) * 10 + 10))}% Match` : '96% Match',
    quality: '4K Ultra HD',
    audio: 'Dolby Atmos 5.1',
    duration: m.runtime || (isTv ? 'TV Series' : '2h 10m'),
    poster,
    backdrop,
    logoUrl: m.logo || (imdbId ? `https://images.metahub.space/logo/medium/${imdbId}/img` : null),
    overview: m.description || m.overview || `Watch ${m.name || 'this title'} streaming online in high definition on the VidSrc player engine.`,
    genres: m.genres || (m.genre ? [m.genre] : ['Action', 'Drama']),
    cast: m.cast || ['Popular Cast'],
    director: m.director ? (Array.isArray(m.director) ? m.director.join(', ') : m.director) : undefined,
    videos: m.videos || []
  };
}

/**
 * Fetch Top New Movies
 */
export async function fetchTopMovies(skip = 0) {
  try {
    const url = skip > 0 
      ? `${CINEMETA_BASE}/catalog/movie/top/skip=${skip}.json`
      : `${CINEMETA_BASE}/catalog/movie/top.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch movies');
    const data = await res.json();
    return (data.metas || []).map(m => formatMetaToMedia(m, 'movie'));
  } catch (e) {
    console.warn('Fallback to local movies:', e);
    return CATALOG.filter(c => c.type === 'movie');
  }
}

/**
 * Fetch Top New Series
 */
export async function fetchTopSeries(skip = 0) {
  try {
    const url = skip > 0
      ? `${CINEMETA_BASE}/catalog/series/top/skip=${skip}.json`
      : `${CINEMETA_BASE}/catalog/series/top.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch series');
    const data = await res.json();
    return (data.metas || []).map(m => formatMetaToMedia(m, 'tv'));
  } catch (e) {
    console.warn('Fallback to local series:', e);
    return CATALOG.filter(c => c.type === 'tv');
  }
}

/**
 * Fetch Movies by Genre
 */
export async function fetchMoviesByGenre(genre) {
  try {
    const res = await fetch(`${CINEMETA_BASE}/catalog/movie/top/genre=${encodeURIComponent(genre)}.json`);
    if (!res.ok) throw new Error(`Failed to fetch ${genre}`);
    const data = await res.json();
    return (data.metas || []).map(m => formatMetaToMedia(m, 'movie'));
  } catch (e) {
    return CATALOG.filter(c => c.genres?.includes(genre));
  }
}

/**
 * Live Global Search across Cinemeta / IMDb / TMDb
 */
export async function searchGlobalCatalog(query) {
  if (!query || !query.trim()) return [];
  const q = encodeURIComponent(query.trim());

  try {
    const [moviesRes, seriesRes] = await Promise.allSettled([
      fetch(`${CINEMETA_BASE}/catalog/movie/top/search=${q}.json`).then(r => r.json()),
      fetch(`${CINEMETA_BASE}/catalog/series/top/search=${q}.json`).then(r => r.json())
    ]);

    const results = [];
    if (moviesRes.status === 'fulfilled' && moviesRes.value?.metas) {
      results.push(...moviesRes.value.metas.map(m => formatMetaToMedia(m, 'movie')));
    }
    if (seriesRes.status === 'fulfilled' && seriesRes.value?.metas) {
      results.push(...seriesRes.value.metas.map(m => formatMetaToMedia(m, 'tv')));
    }

    // Deduplicate by ID
    const seen = new Set();
    return results.filter(item => {
      if (!item.id || seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
  } catch (e) {
    console.warn('Search fallback to local filter:', e);
    return CATALOG.filter(c => c.title.toLowerCase().includes(query.toLowerCase()));
  }
}

/**
 * Fetch detailed series metadata including full episodes tree
 */
export async function fetchSeriesDetails(imdbId) {
  try {
    const res = await fetch(`${CINEMETA_BASE}/meta/series/${imdbId}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.meta) return null;

    const meta = data.meta;
    const episodesMap = {};

    if (meta.videos && Array.isArray(meta.videos)) {
      meta.videos.forEach(v => {
        const sNum = v.season || 1;
        if (!episodesMap[sNum]) {
          episodesMap[sNum] = {
            season_number: sNum,
            title: `Season ${sNum}`,
            episodes: []
          };
        }
        episodesMap[sNum].episodes.push({
          episode_number: v.episode || v.number || 1,
          title: v.name || v.title || `Episode ${v.episode || v.number || 1}`,
          duration: '45m',
          overview: v.description || v.overview || 'Stream this episode on VidSrc.',
          thumbnail: v.thumbnail || `https://episodes.metahub.space/${imdbId}/${sNum}/${v.episode || v.number || 1}/w780.jpg`
        });
      });
    }

    const seasons = Object.values(episodesMap);
    return {
      ...formatMetaToMedia(meta, 'tv'),
      seasons: seasons.length > 0 ? seasons : undefined
    };
  } catch (e) {
    return null;
  }
}
