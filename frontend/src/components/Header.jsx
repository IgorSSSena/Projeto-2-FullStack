import {
  Typography,
  Stack,
  Button,
  AppBar, // ⬅️ Importe AppBar
  Toolbar, // ⬅️ Importe Toolbar (para padding interno)
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import Logo from "../components/logo";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <AppBar position="fixed">
      <Toolbar variant="dense">
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: "100%" }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Logo />
            {isAuthenticated && (
              <>
               <Button component={Link} to="/" color="inherit">
                  Buscar Jogos
                </Button>
                <Button component={Link} to="/me/reviews" color="inherit">
                  Minhas Avaliações
                </Button>
                <Button component={Link} to="/me/profile" color="inherit">
                  Meu Perfil
                </Button>
              </>
            )}
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            {isAuthenticated ? (
              <>
                <Typography
                  variant="body2"
                  sx={{ mr: 1, color: "text.primary" }}
                >
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
      </Toolbar>
    </AppBar>
  );
}
