/**
 * Local Storage Service for Netflix streaming state:
 * - Playback Progress (for Auto-Resume)
 * - Watchlist ("My List")
 * - Watch History
 * - Liked / Disliked ratings
 */

const KEYS = {
  PROGRESS_PREFIX: 'netflix_progress_',
  WATCHLIST: 'netflix_watchlist',
  HISTORY: 'netflix_history',
  LIKES: 'netflix_likes',
  CUSTOM_HISTORY: 'netflix_custom_streams'
};

// Playback Progress
export function getPlaybackProgress(id) {
  if (!id) return null;
  try {
    const data = localStorage.getItem(`${KEYS.PROGRESS_PREFIX}${id}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to get playback progress', e);
    return null;
  }
}

export function savePlaybackProgress(id, progressSeconds, durationSeconds = 0, extraMeta = {}) {
  if (!id) return;
  try {
    const payload = {
      id,
      progress: progressSeconds,
      duration: durationSeconds,
      percentage: durationSeconds > 0 ? Math.min(100, Math.round((progressSeconds / durationSeconds) * 100)) : 0,
      timestamp: Date.now(),
      ...extraMeta
    };
    localStorage.setItem(`${KEYS.PROGRESS_PREFIX}${id}`, JSON.stringify(payload));
    
    // Also update history
    addToWatchHistory(payload);
  } catch (e) {
    console.error('Failed to save playback progress', e);
  }
}

export function clearPlaybackProgress(id) {
  if (!id) return;
  localStorage.removeItem(`${KEYS.PROGRESS_PREFIX}${id}`);
}

// Watchlist (My List)
export function getWatchlist() {
  try {
    const list = localStorage.getItem(KEYS.WATCHLIST);
    return list ? JSON.parse(list) : [];
  } catch (e) {
    return [];
  }
}

export function toggleWatchlist(item) {
  try {
    const list = getWatchlist();
    const existsIndex = list.findIndex(i => i.id === item.id || (i.imdb_id && i.imdb_id === item.imdb_id));
    let updated;
    if (existsIndex > -1) {
      updated = list.filter((_, idx) => idx !== existsIndex);
    } else {
      updated = [item, ...list];
    }
    localStorage.setItem(KEYS.WATCHLIST, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

export function clearWatchlist() {
  try {
    localStorage.removeItem(KEYS.WATCHLIST);
    return [];
  } catch (e) {
    return [];
  }
}

export function isInWatchlist(id) {
  if (!id) return false;
  const list = getWatchlist();
  return list.some(i => i.id === id || i.imdb_id === id || i.tmdb_id === id);
}

// Watch History
export function getWatchHistory() {
  try {
    const history = localStorage.getItem(KEYS.HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (e) {
    return [];
  }
}

export function addToWatchHistory(item) {
  try {
    const history = getWatchHistory();
    const filtered = history.filter(h => h.id !== item.id);
    const updated = [{ ...item, lastWatched: Date.now() }, ...filtered].slice(0, 30);
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to update watch history', e);
  }
}

export function clearWatchHistory() {
  try {
    localStorage.removeItem(KEYS.HISTORY);
    return [];
  } catch (e) {
    return [];
  }
}

// Liked items
export function getLikedItems() {
  try {
    const liked = localStorage.getItem(KEYS.LIKES);
    return liked ? JSON.parse(liked) : {};
  } catch (e) {
    return {};
  }
}

export function toggleLike(id, status = 'like') { // 'like' | 'dislike' | null
  try {
    const current = getLikedItems();
    if (current[id] === status) {
      delete current[id];
    } else {
      current[id] = status;
    }
    localStorage.setItem(KEYS.LIKES, JSON.stringify(current));
    return current;
  } catch (e) {
    return {};
  }
}

// Custom direct launch stream history
export function getCustomStreamHistory() {
  try {
    const data = localStorage.getItem(KEYS.CUSTOM_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function addCustomStream(streamObj) {
  try {
    const history = getCustomStreamHistory();
    const filtered = history.filter(s => s.id !== streamObj.id);
    const updated = [streamObj, ...filtered].slice(0, 10);
    localStorage.setItem(KEYS.CUSTOM_HISTORY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}
