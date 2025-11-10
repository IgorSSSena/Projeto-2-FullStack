import { Pagination, Stack, Typography } from '@mui/material';
import { useGames } from '../contexts/GameContext';

export default function Pager() {
  const { state, dispatch, searchAll, searchByGenre, searchByPlatform, searchByText } = useGames();
  if (!state.total) return null;

  const totalPages = Math.min(Math.ceil(state.total / state.pageSize), 1000);
  const lastAction = (() => {
    // naive inference: decide which search to repeat based on filled fields
    if (state.searchText) return searchByText;
    if (state.genreId) return searchByGenre;
    if (state.platformId) return searchByPlatform;
    return searchAll;
  })();

  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
      <Typography variant="body2">Total: {state.total.toLocaleString()}</Typography>
      <Pagination
        page={state.page}
        count={totalPages}
        onChange={(_, p) => {
          dispatch({ type: 'SET_PAGE', payload: p });
          lastAction();
        }}
        color="primary"
      />
    </Stack>
  );
}
