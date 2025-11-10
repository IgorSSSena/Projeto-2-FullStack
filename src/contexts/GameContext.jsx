import { createContext, useContext, useMemo, useReducer, useEffect } from 'react';

const API_BASE = 'https://api.rawg.io/api';
const API_KEY = import.meta.env.VITE_RAWG_KEY;

const initialState = {
  loading: false,
  error: null,
  searchText: '',
  genreId: '',
  platformId: '',
  ordering: '-rating',

  results: [],
  total: 0,
  page: 1,
  pageSize: 12,

  genres: [],
  platforms: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SEARCH_TEXT':
      return { ...state, searchText: action.payload, page: 1 };
    case 'SET_GENRE':
      return { ...state, genreId: action.payload, page: 1 };
    case 'SET_PLATFORM':
      return { ...state, platformId: action.payload, page: 1 };
    case 'SET_ORDERING':
      return { ...state, ordering: action.payload, page: 1 };
    case 'SET_PAGE':
      return { ...state, page: action.payload };
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        results: action.payload.results,
        total: action.payload.count,
      };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_GENRES':
      return { ...state, genres: action.payload };
    case 'SET_PLATFORMS':
      return { ...state, platforms: action.payload };
    default:
      return state;
  }
}

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ---- AJAX ----
  function buildURL(path, paramsObj = {}) {
    const params = new URLSearchParams({ key: API_KEY, ...paramsObj });
    return `${API_BASE}${path}?${params.toString()}`;
  }

  async function getJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
  }

  useEffect(() => {
    (async () => {
      try {
        const [genres, platforms] = await Promise.all([
          getJSON(buildURL('/genres')),
          getJSON(buildURL('/platforms')),
        ]);
        dispatch({ type: 'SET_GENRES', payload: genres.results || [] });
        dispatch({ type: 'SET_PLATFORMS', payload: platforms.results || [] });
      } catch (e) {
        // Soft-fail lookup lists
        console.warn('Lookup load failed:', e);
      }
    })();
  }, []);

  // Core fetcher (shared by all 3 searches)
  async function fetchGames(params) {
    dispatch({ type: 'FETCH_START' });
    try {
      const data = await getJSON(buildURL('/games', params));
      dispatch({ type: 'FETCH_SUCCESS', payload: data });
    } catch (e) {
      dispatch({ type: 'FETCH_ERROR', payload: e.message });
    }
  }

  // --- Search types (your assignment requires these three) ---
  // 1) All games
  function searchAll() {
    // No required input. Still send paging + ordering.
    fetchGames({
      ordering: state.ordering,
      page: state.page,
      page_size: state.pageSize,
    });
  }

  // 2) By genre  (requires genreId)
  function searchByGenre() {
    if (!state.genreId) {
      dispatch({
        type: 'FETCH_ERROR',
        payload: 'Por favor busque um jogo antes de selecionar um gênero.',
      });
      return;
    }
    fetchGames({
      genres: state.genreId, // RAWG expects ids here
      ordering: state.ordering,
      page: state.page,
      page_size: state.pageSize,
    });
  }

  // 3) By platform (requires platformId)
  function searchByPlatform() {
    if (!state.platformId) {
      dispatch({
        type: 'FETCH_ERROR',
        payload: 'Por favor busque um jogo antes de selecionar uma plataforma.',
      });
      return;
    }
    fetchGames({
      platforms: state.platformId, // RAWG expects ids here
      ordering: state.ordering,
      page: state.page,
      page_size: state.pageSize,
    });
  }

  function searchByText(text) {
    const query = text ?? state.searchText;
    if (!query.trim()) {
      dispatch({
        type: 'FETCH_ERROR',
        payload: 'Digite para buscar pelo nome.',
      });
      return;
    }
    fetchGames({
      search: query.trim(),
      search_precise: true,
      ordering: state.ordering,
      page: state.page,
      page_size: state.pageSize,
    });
  }

  const value = useMemo(
    () => ({
      state,
      dispatch,
      searchAll,
      searchByGenre,
      searchByPlatform,
      searchByText,
    }),
    [state]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGames() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGames must be used inside <GameProvider>');
  return ctx;
}
