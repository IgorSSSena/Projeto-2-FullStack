import { Typography } from '@mui/material';
import GameCard from './GameCard';
import { useGames } from '../contexts/GameContext';

export default function GameList() {
  const { state } = useGames();

  if (!state.loading && !state.error && state.results.length === 0) {
    return <Typography>Pesquise utilizando os botões acima.</Typography>;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '16px',
        justifyContent: 'flex-start',
      }}
    >
      {state.results.map((g) => (
        <div
          key={g.id}
          style={{
            flex: '0 0 calc(33.333% - 16px)',
            boxSizing: 'border-box',
          }}
        >
          <GameCard game={g} />
        </div>
      ))}
    </div>
  );
}
