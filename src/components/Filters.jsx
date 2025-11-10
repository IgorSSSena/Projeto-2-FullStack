import { Stack, TextField, MenuItem, InputAdornment, Button } from '@mui/material';
import { useGames } from '../contexts/GameContext';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
export default function Filters() {
  const { state, dispatch, searchAll, searchByGenre, searchByPlatform } = useGames();

  const handleGenreChange = (e) => {
    const genreId = e.target.value;
    dispatch({ type: 'SET_GENRE', payload: genreId });

    if (genreId) {
      searchByGenre();
    } else {
      searchAll();
    }
  };

  const handlePlatformChange = (e) => {
    const platformId = e.target.value;
    dispatch({ type: 'SET_PLATFORM', payload: platformId });

    if (platformId) {
      searchByPlatform();
    } else {
      searchAll();
    }
  };

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
      <TextField
        select
        label="Gênero"
        value={state.genreId}
        size="small"
        onChange={handleGenreChange}
        sx={{ minWidth: 220 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <FilterAltIcon />
            </InputAdornment>
          ),
        }}
      >
        <MenuItem value="">(Any)</MenuItem>
        {state.genres.map((g) => (
          <MenuItem key={g.id} value={String(g.id)}>
            {g.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Plataforma"
        value={state.platformId}
        size="small"
        onChange={handlePlatformChange}
        sx={{ minWidth: 220 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SportsEsportsIcon />
            </InputAdornment>
          ),
        }}
      >
        <MenuItem value="">(Any)</MenuItem>
        {state.platforms.map((p) => (
          <MenuItem key={p.id} value={String(p.id)}>
            {p.name}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
