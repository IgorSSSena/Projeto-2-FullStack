import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  Container,
  Paper,
  Typography,
  Divider,
  Stack,
  Button,
} from "@mui/material";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { GameProvider } from "./contexts/GameContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Logo from "./components/logo";
import Header from "./components/Header";
import SearchBar from "./components/SearchBar";
import Filters from "./components/Filters";
import Loader from "./components/Loader";
import ErrorAlert from "./components/ErrorAlert";
import GameList from "./components/GameList";
import Pager from "./components/Pager";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import UserReviewsPage from "./pages/UserReviewsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import "./App.css";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#7B287D" },
    secondary: { main: "#330C2F" },
  },
  typography: { fontFamily: "Roboto, Arial, sans-serif" },
});

function SearchPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          borderRadius: 2,
          animation: "neonBlink 1.5s infinite alternate",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <Logo/>
          <SearchBar />
          <div
            style={{
              display: "flex",
              gap: "5px",
              justifyContent: "center",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            <span style={{ color: "gray", fontWeight: 300, fontSize: 14 }}>
              Filtrar
            </span>
            <div
              style={{ height: 0.5, backgroundColor: "gray", width: "100%" }}
            ></div>
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
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route
                path="/me/reviews"
                element={
                  <PrivateRoute>
                    <UserReviewsPage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/me/profile"
                element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                }
              />
              <Route
                path="/"
                element={
                    <SearchPage />
                }
              />
            </Routes>
          </BrowserRouter>
        </GameProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
