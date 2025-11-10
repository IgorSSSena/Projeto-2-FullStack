import { useState } from 'react';
import { Box, TextField, Button, MenuItem, Stack } from '@mui/material';
import { useGames } from '../contexts/GameContext';
import InputAdornment from '@mui/material/InputAdornment';
import ReorderIcon from '@mui/icons-material/Reorder';
import SearchIcon from '@mui/icons-material/Search';
const ORDER_OPTS = [
  { v: '-rating', label: 'Top rated' },
  { v: '-metacritic', label: 'Metacritic' },
  { v: '-released', label: 'Recently released' },
  { v: 'name', label: 'Name (A–Z)' },
];

export default function SearchBar() {
  const { state, dispatch, searchByText } = useGames();
  const [local, setLocal] = useState(state.searchText);

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        dispatch({ type: 'SET_SEARCH_TEXT', payload: local });
        searchByText(local);
      }}
      sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}
    >
      <TextField
        label="Buscar por nome"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
        sx={{ minWidth: 280, flex: 1 }}
      />
      <TextField
        select
        label="Ordering"
        value={state.ordering}
        onChange={(e) => dispatch({ type: 'SET_ORDERING', payload: e.target.value })}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <ReorderIcon />
              </InputAdornment>
            ),
          },
        }}
        sx={{ minWidth: 220 }}
      >
        {ORDER_OPTS.map((o) => (
          <MenuItem key={o.v} value={o.v}>
            {o.label}
          </MenuItem>
        ))}
      </TextField>
      <Button
        type="submit"
        variant="contained"
        sx={{
          width: 150,
          height: 55,
          fontSize: 16,
          fontWeight: 600,
          background: 'linear-gradient(135deg, #7B287D, #330C2F)',
          color: '#fff',
          boxShadow: '0px 4px 12px rgba(0,0,0,0.3)',
          outline: 'none',
          '&:focus': {
            outline: 'none',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.3)',
          },
        }}
      >
        BUSCAR
      </Button>
    </Box>
  );
}
