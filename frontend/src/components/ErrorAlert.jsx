import { Alert } from '@mui/material';
import { useGames } from '../contexts/GameContext';
export default function ErrorAlert() {
  const { state } = useGames();
  return state.error ? (
    <Alert severity="error" sx={{ my: 2 }}>
      {state.error}
    </Alert>
  ) : null;
}
