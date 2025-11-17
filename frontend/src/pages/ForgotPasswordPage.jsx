import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Container, TextField, Button, Typography, Paper, Stack } from '@mui/material';

/**
 * Página de solicitação de recuperação de senha.
 *
 * Permite ao usuário informar seu email para gerar um token de recuperação.
 * O token é retornado apenas para fins de demonstração e é exibido ao usuário.
 */
export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setLoading(true);
    try {
      const data = await forgotPassword(email.trim());
      setMessage(data.message || 'Se o email estiver cadastrado, enviaremos instruções');
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
          Esqueci minha senha
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Email cadastrado"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              Enviar instruções
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