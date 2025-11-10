import { LinearProgress } from "@mui/material";
import { useGames } from "../contexts/GameContext";
export default function Loader() {
  const { state } = useGames();
  return state.loading ? <LinearProgress sx={{ my: 2 }} /> : null;
}
