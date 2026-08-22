/**
 * VidSrc / vsembed.su API Service with Official TMDB / Cinemeta Image Enrichment
 * Reference: https://vsembed.su/vidsrc/docs/
 */

export const VSEMBED_BASE_URL = 'https://vsembed.su';

/**
 * Generates official poster image URL for any IMDB ID
 * @param {string} imdbId
 * @returns {string}
 */
export function getOfficialPoster(imdbId) {
  if (!imdbId) return 'https://images.metahub.space/poster/medium/tt1300854/img';
  const clean = imdbId.startsWith('tt') ? imdbId : `tt${imdbId}`;
  return `https://images.metahub.space/poster/medium/${clean}/img`;
}

/**
 * Generates official backdrop/banner image URL for any IMDB ID
 * @param {string} imdbId
 * @returns {string}
 */
export function getOfficialBackdrop(imdbId) {
  if (!imdbId) return 'https://images.metahub.space/background/large/tt1300854/img';
  const clean = imdbId.startsWith('tt') ? imdbId : `tt${imdbId}`;
  return `https://images.metahub.space/background/large/${clean}/img`;
}

/**
 * Generates official episode thumbnail URL
 * @param {string} imdbId
 * @param {number} season
 * @param {number} episode
 * @returns {string}
 */
export function getOfficialEpThumb(imdbId, season = 1, episode = 1) {
  const clean = imdbId.startsWith('tt') ? imdbId : `tt${imdbId}`;
  return `https://episodes.metahub.space/${clean}/${season}/${episode}/w780.jpg`;
}

/**
 * Fetches rich metadata (overview, genres, cast, rating, full backdrop/poster) for an IMDB ID from Cinemeta/TMDB
 * @param {string} imdbId
 * @param {'movie'|'series'} type
 * @returns {Promise<object|null>}
 */
export async function fetchRichMetadata(imdbId, type = 'movie') {
  if (!imdbId || !imdbId.startsWith('tt')) return null;
  try {
    const metaType = type === 'tv' ? 'series' : type;
    const res = await fetch(`https://v3-cinemeta.strem.io/meta/${metaType}/${imdbId}.json`);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.meta || null;
  } catch (e) {
    return null;
  }
}

/**
 * Builds an embed URL for a movie
 * @param {string|number} id - IMDB ID (e.g. 'tt1300854') or TMDB ID (e.g. '68721')
 * @param {object} options - Query parameter options { autoplay, startAt, ds_lang, sub_url, sub_label, sub_lang }
 * @returns {string}
 */
export function buildMovieEmbedUrl(id, options = {}) {
  const isImdb = typeof id === 'string' && id.startsWith('tt');
  const path = `/embed/movie/${id}`;
  const url = new URL(path, VSEMBED_BASE_URL);

  if (options.autoplay !== undefined) {
    url.searchParams.set('autoplay', options.autoplay ? '1' : '0');
  }
  if (options.startAt && Number(options.startAt) > 0) {
    url.searchParams.set('startAt', Math.floor(options.startAt).toString());
  }
  if (options.ds_lang) {
    url.searchParams.set('ds_lang', options.ds_lang);
  }
  if (options.sub_url) {
    url.searchParams.set('sub_url', options.sub_url);
    if (options.sub_label) url.searchParams.set('sub_label', options.sub_label);
    if (options.sub_lang) url.searchParams.set('sub_lang', options.sub_lang);
  }

  return url.toString();
}

/**
 * Builds an embed URL for a TV show or specific episode
 * @param {string|number} id - IMDB ID (e.g. 'tt0944947') or TMDB ID (e.g. '1399')
 * @param {number} [season] - Season number
 * @param {number} [episode] - Episode number
 * @param {object} options - Query parameter options { autoplay, autonext, startAt, ds_lang, sub_url }
 * @returns {string}
 */
export function buildTvEmbedUrl(id, season, episode, options = {}) {
  let path = `/embed/tv/${id}`;
  if (season !== undefined && episode !== undefined) {
    path = `/embed/tv/${id}/${season}/${episode}`;
  }
  
  const url = new URL(path, VSEMBED_BASE_URL);

  if (options.autoplay !== undefined) {
    url.searchParams.set('autoplay', options.autoplay ? '1' : '0');
  }
  if (options.autonext !== undefined) {
    url.searchParams.set('autonext', options.autonext ? '1' : '0');
  }
  if (options.startAt && Number(options.startAt) > 0) {
    url.searchParams.set('startAt', Math.floor(options.startAt).toString());
  }
  if (options.ds_lang) {
    url.searchParams.set('ds_lang', options.ds_lang);
  }

  return url.toString();
}

/**
 * Fetch latest movies from vsembed.su feed with rich official images
 * @param {number} page
 * @returns {Promise<{result: Array, pages: number}>}
 */
export async function fetchLatestMovies(page = 1) {
  try {
    const res = await fetch(`${VSEMBED_BASE_URL}/movies/latest/page-${page}.json`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch latest movies from vsembed feed:', err);
    return { result: [], pages: 1 };
  }
}

/**
 * Fetch latest TV shows from vsembed.su feed with rich official images
 * @param {number} page
 * @returns {Promise<{result: Array, pages: number}>}
 */
export async function fetchLatestTvShows(page = 1) {
  try {
    const res = await fetch(`${VSEMBED_BASE_URL}/tvshows/latest/page-${page}.json`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Could not fetch latest tv shows from vsembed feed:', err);
    return { result: [], pages: 1 };
  }
}

/**
 * Validates whether an ID is an IMDB or TMDB ID
 * @param {string} input
 * @returns {{isValid: boolean, type: 'imdb'|'tmdb'|'unknown', cleanId: string}}
 */
export function validateMediaId(input) {
  if (!input) return { isValid: false, type: 'unknown', cleanId: '' };
  const trimmed = input.trim();
  
  if (trimmed.includes('imdb.com/title/')) {
    const match = trimmed.match(/(tt\d+)/);
    if (match) return { isValid: true, type: 'imdb', cleanId: match[1] };
  }
  if (trimmed.includes('themoviedb.org/movie/') || trimmed.includes('themoviedb.org/tv/')) {
    const match = trimmed.match(/(\d+)/);
    if (match) return { isValid: true, type: 'tmdb', cleanId: match[1] };
  }

  if (/^tt\d{5,10}$/i.test(trimmed)) {
    return { isValid: true, type: 'imdb', cleanId: trimmed.toLowerCase() };
  }

  if (/^\d{1,10}$/.test(trimmed)) {
    return { isValid: true, type: 'tmdb', cleanId: trimmed };
  }

  return { isValid: false, type: 'unknown', cleanId: trimmed };
}
