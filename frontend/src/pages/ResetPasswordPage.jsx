import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container, TextField, Button, Typography, Paper, Stack } from '@mui/material';

/**
 * Página de redefinição de senha.
 *
 * Permite ao usuário informar o token recebido e definir uma nova senha.
 */
export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const data = await resetPassword(token.trim(), password);
      setMessage(data.message || 'Senha redefinida com sucesso');
      setToken('');
      setPassword('');
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
          Redefinir senha
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Token de recuperação"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
            <TextField
              label="Nova senha"
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
            {message && (
              <Typography color="primary" variant="body2">
                {message}
              </Typography>
            )}
            <Button type="submit" variant="contained" disabled={loading}>
              Atualizar senha
            </Button>
            <Typography variant="body2">
              Lembrou a senha?{' '}
              <a href="/login" style={{ color: '#7B287D' }}>
                Voltar ao login
              </a>
            </Typography>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}