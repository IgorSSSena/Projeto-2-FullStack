import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Paper, Typography, Divider } from '@mui/material';
import { GameProvider } from './contexts/GameContext';
import logotipo from './assets/white-logotipo.svg';
import SearchBar from './components/SearchBar';
import Filters from './components/Filters';
import Loader from './components/Loader';
import ErrorAlert from './components/ErrorAlert';
import GameList from './components/GameList';
import Pager from './components/Pager';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7B287D' },
    secondary: { main: '#330C2F' },
  },
  typography: { fontFamily: 'Roboto, Arial, sans-serif' },
});

function Content() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 2,
          animation: 'neonBlink 1.5s infinite alternate',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <Typography variant="h3" gutterBottom>
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
              <img src={logotipo} style={{ height: 80, color: 'pink', marginRight: 15 }}></img>
              <div
                style={{
                  padding: '0px 5px',
                  color: '#7B287D',
                  backgroundColor: '#330C2F',
                  fontWeight: '600',
                  boxShadow: '-4px 4px 0px #7B287D',
                  height: 55,
                }}
              >
                GAME
              </div>
              <b
                style={{
                  color: '#330C2F',
                  textShadow: `
      0 0 5px #7B287D,
      0 0 10px #7B287D,
      0 0 20px #330C2F,
      0 0 30px #330C2F
    `,
                  fontWeight: 600,
                }}
              >
                SCOPE
              </b>
            </div>
          </Typography>
          <SearchBar />
          <div
            style={{
              display: 'flex',
              gap: '5px',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 10,
            }}
          >
            <span style={{ color: 'gray', fontWeight: 300, fontSize: 14 }}>Filtrar</span>
            <div style={{ height: 0.5, backgroundColor: 'gray', width: '100%' }}></div>
          </div>
          <Filters />
          <Divider sx={{ my: 2 }} />
          <Loader />
          <ErrorAlert />
        </div>
        <GameList />
        <Pager />
      </Paper>
    </Container>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GameProvider>
        <Content />
      </GameProvider>
    </ThemeProvider>
  );
}
