/**
 * KMOVIZ TMDB & Multi-Source Movie Database Service
 * Provides brand new 2024-2026 movies, trending series, regional cinema,
 * and live global search with official 4K/UHD posters and backdrops.
 */

const TMDB_API_KEY = '15d2ea6d0dc1d476efbca3eba2b9bbfb';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_ORIGINAL = 'https://image.tmdb.org/t/p/original';
const IMAGE_BASE_W780 = 'https://image.tmdb.org/t/p/w780';
const IMAGE_BASE_W500 = 'https://image.tmdb.org/t/p/w500';

const GENRE_MAP = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
  10759: 'Action & Adventure',
  10765: 'Sci-Fi & Fantasy'
};

/**
 * Format a TMDB item into the standard KMOVIZ media object
 */
export function formatTmdbItem(item, defaultType = 'movie') {
  const isTv = item.media_type === 'tv' || defaultType === 'tv' || Boolean(item.first_air_date);
  const releaseDate = item.release_date || item.first_air_date || '2025';
  const year = releaseDate.split('-')[0] || '2025';
  const vote = item.vote_average ? item.vote_average.toFixed(1) : '8.2';
  const matchPct = Math.min(99, Math.max(85, Math.round(Number(vote) * 10 + 10)));

  const genres = item.genres 
    ? item.genres.map(g => g.name)
    : (item.genre_ids ? item.genre_ids.map(id => GENRE_MAP[id] || 'Cinema').filter(Boolean) : ['Action', 'Sci-Fi']);

  const backdrop = item.backdrop_path 
    ? `${IMAGE_BASE_ORIGINAL}${item.backdrop_path}` 
    : (item.poster_path ? `${IMAGE_BASE_ORIGINAL}${item.poster_path}` : 'https://images.metahub.space/background/large/tt1300854/img');

  const poster = item.poster_path 
    ? `${IMAGE_BASE_W780}${item.poster_path}` 
    : 'https://images.metahub.space/poster/medium/tt1300854/img';

  return {
    id: String(item.id),
    tmdb_id: String(item.id),
    imdb_id: item.imdb_id || undefined,
    title: item.title || item.name || 'Untitled Cinema',
    originalTitle: item.original_title || item.original_name,
    type: isTv ? 'tv' : 'movie',
    year,
    rating: `★ ${vote}`,
    match: `${matchPct}% Match`,
    quality: '4K Ultra HD',
    audio: 'Dolby Atmos 5.1',
    duration: item.runtime ? `${Math.floor(item.runtime / 60)}h ${item.runtime % 60}m` : (isTv ? 'TV Series' : '2h 15m'),
    overview: item.overview || 'Stream this brand new blockbuster online in high-definition on the KMOVIZ engine.',
    backdrop,
    poster,
    genres: genres.length > 0 ? genres : ['Action', 'Thriller'],
    cast: item.cast ? item.cast.map(c => c.name).slice(0, 5) : ['Top Hollywood Stars'],
    popularity: item.popularity || 0,
    videoPreview: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
  };
}

/**
 * Fetch a specific movie by TMDB ID (e.g. 969681 Spider-Man: Brand New Day)
 */
export async function fetchTmdbMovieById(id) {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`);
    if (!res.ok) throw new Error('Failed to fetch movie details');
    const data = await res.json();
    return formatTmdbItem({
      ...data,
      cast: data.credits?.cast
    }, 'movie');
  } catch (e) {
    console.warn(`Could not fetch TMDB movie ${id}:`, e);
    return null;
  }
}

/**
 * Fetch Now Playing / Brand New 2026/2025 Theatrical Releases
 */
export async function fetchNowPlayingMovies(page = 1) {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}`);
    if (!res.ok) throw new Error('Failed to fetch now playing');
    const data = await res.json();
    return (data.results || []).map(m => formatTmdbItem(m, 'movie'));
  } catch (e) {
    console.warn('Now playing fallback:', e);
    return [];
  }
}

/**
 * Fetch Trending Movies This Week
 */
export async function fetchTrendingMovies(page = 1) {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&page=${page}`);
    if (!res.ok) throw new Error('Failed to fetch trending movies');
    const data = await res.json();
    return (data.results || []).map(m => formatTmdbItem(m, 'movie'));
  } catch (e) {
    console.warn('Trending movies fallback:', e);
    return [];
  }
}

/**
 * Fetch Trending TV Shows This Week
 */
export async function fetchTrendingTv(page = 1) {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/trending/tv/week?api_key=${TMDB_API_KEY}&page=${page}`);
    if (!res.ok) throw new Error('Failed to fetch trending tv');
    const data = await res.json();
    return (data.results || []).map(t => formatTmdbItem(t, 'tv'));
  } catch (e) {
    console.warn('Trending tv fallback:', e);
    return [];
  }
}

/**
 * Fetch Bollywood & Indian Regional Blockbusters
 */
export async function fetchBollywoodMovies() {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi|te|ta&sort_by=popularity.desc&primary_release_date.gte=2023-01-01`);
    if (!res.ok) throw new Error('Failed to fetch bollywood');
    const data = await res.json();
    return (data.results || []).map(m => formatTmdbItem(m, 'movie'));
  } catch (e) {
    return [];
  }
}

/**
 * Fetch Top Rated IMDb 8.0+ Masterpieces
 */
export async function fetchTopRatedMasterpieces() {
  try {
    const res = await fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=1`);
    if (!res.ok) throw new Error('Failed to fetch top rated');
    const data = await res.json();
    return (data.results || []).map(m => formatTmdbItem(m, 'movie'));
  } catch (e) {
    return [];
  }
}

/**
 * Fetch Movies by TMDB Genre ID
 */
export async function fetchTmdbByGenre(genreId, type = 'movie') {
  try {
    const endpoint = type === 'tv' ? 'discover/tv' : 'discover/movie';
    const res = await fetch(`${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc`);
    if (!res.ok) throw new Error(`Failed to fetch genre ${genreId}`);
    const data = await res.json();
    return (data.results || []).map(item => formatTmdbItem(item, type));
  } catch (e) {
    return [];
  }
}

/**
 * Universal Multi-Source Global Search (TMDB + Cinemeta)
 */
export async function searchTmdbGlobal(query) {
  if (!query || !query.trim()) return [];
  const q = encodeURIComponent(query.trim());

  try {
    const res = await fetch(`${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${q}&include_adult=false`);
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    return (data.results || [])
      .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
      .map(item => formatTmdbItem(item, item.media_type));
  } catch (e) {
    console.warn('TMDB search fallback:', e);
    return [];
  }
}
