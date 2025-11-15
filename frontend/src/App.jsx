import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Paper, Typography, Divider, Stack, Button } from '@mui/material';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import logotipo from './assets/white-logotipo.svg';
import SearchBar from './components/SearchBar';
import Filters from './components/Filters';
import Loader from './components/Loader';
import ErrorAlert from './components/ErrorAlert';
import GameList from './components/GameList';
import Pager from './components/Pager';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UserReviewsPage from './pages/UserReviewsPage';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#7B287D' },
    secondary: { main: '#330C2F' },
  },
  typography: { fontFamily: 'Roboto, Arial, sans-serif' },
});

function SearchPage() {
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

/**
 * Cabeçalho com navegação. Exibe links de acordo com o estado de
 * autenticação do usuário.
 */
function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      justifyContent="space-between"
      sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Button component={Link} to="/" color="inherit">
          Buscar Jogos
        </Button>
        {isAuthenticated && (
          <Button component={Link} to="/me/reviews" color="inherit">
            Minhas Avaliações
          </Button>
        )}
      </Stack>
      <Stack direction="row" spacing={2} alignItems="center">
        {isAuthenticated ? (
          <>
            <Typography variant="body2" sx={{ mr: 1 }}>
              Olá, {user?.name || user?.email}
            </Typography>
            <Button onClick={logout} color="inherit">
              Sair
            </Button>
          </>
        ) : (
          <>
            <Button component={Link} to="/login" color="inherit">
              Entrar
            </Button>
            <Button component={Link} to="/signup" color="inherit">
              Cadastrar
            </Button>
          </>
        )}
      </Stack>
    </Stack>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <GameProvider>
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/me/reviews"
                element={
                  <PrivateRoute>
                    <UserReviewsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/"
                element={
                  <PrivateRoute>
                    <SearchPage />
                  </PrivateRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </GameProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
