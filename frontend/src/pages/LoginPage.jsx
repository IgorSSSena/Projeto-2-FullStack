import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChangePasswordModal from '../components/ChangePasswordModal';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
} from '@mui/material';

/**
 * Página de login.
 *
 * Exibe um formulário para email e senha. Ao submeter, chama a função
 * de login do AuthContext. Em caso de sucesso, redireciona o usuário
 * para a rota de origem ou para a página principal ("/").
 */
export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Controla o modal de alteração de senha temporária
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login(email.trim(), password);
      // Se o backend indicar que a senha é temporária, mostra o modal
      if (data.mustChangePassword) {
        setTempPassword(password);
        setShowChangeModal(true);
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          Entrar na conta
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            <Button type="submit" variant="contained" disabled={loading}>
              Entrar
            </Button>
            <Typography variant="body2">
              Não tem conta? <Link to="/signup">Cadastre-se</Link>
            </Typography>
            <Typography variant="body2">
              Esqueceu a senha? <Link to="/forgot-password">Recuperar</Link>
            </Typography>
        {/* Modal para troca de senha quando o backend sinaliza mustChangePassword */}
        <ChangePasswordModal
          open={showChangeModal}
          currentPassword={tempPassword}
          onClose={(changed) => {
            setShowChangeModal(false);
            setTempPassword('');
            if (changed) {
              // Após trocar a senha com sucesso, direciona para a página original
              navigate(from, { replace: true });
            }
          }}
        />
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}