/* ─── GLOBAL APPLICATION STATE ─── */
let tmdbCache = {};
let watchlist = [];
let currentModalMovie = null;
let currentHeroMovie = null;
let currentSurpriseMovie = null;
let spinLock = false;
let activePlatform = 'netflix';
let activeType = 'movies';


/* ─── INIT ─── */
window.addEventListener('DOMContentLoaded', () => {
  // Load watchlist from localStorage
  const savedWL = localStorage.getItem('user_watchlist');
  if (savedWL) {
    try {
      watchlist = JSON.parse(savedWL);
    } catch(e) {
      watchlist = [];
    }
  } else {
    watchlist = [];
  }

  if (!localStorage.getItem('tmdb_api_key')) {
    localStorage.setItem('tmdb_api_key', '572a69a7b33b22b3aaa05c9c9351fbab');
  }

  loadMovieLensDatabase();

  // Initialize UI components
  if (typeof buildPlatforms === 'function') buildPlatforms();
  if (typeof updateWatchlistUI === 'function') updateWatchlistUI();
  if (typeof updateWLCount === 'function') updateWLCount();
  if (typeof initScrollspy === 'function') initScrollspy();

  if (!movieLensData.loaded) {
    renderRows();
    buildTrending();
    if (typeof initHero === 'function') initHero();
  }
});
