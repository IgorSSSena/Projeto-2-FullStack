import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Stack,
  Divider,
} from '@mui/material';

/**
 * Página de perfil do usuário.
 *
 * Permite ao usuário visualizar e atualizar seu nome, email e senha.  Os campos
 * de nome e email são preenchidos com os valores atuais.  Para alterar a
 * senha, é necessário informar a senha atual e a nova senha.  Ao atualizar,
 * a API retorna os dados atualizados e o contexto Auth é sincronizado.
 */
export default function ProfilePage() {
  const { getProfile, updateProfile, logout } = useAuth();
  const [loaded, setLoaded] = useState(false);
  const [profile, setProfile] = useState({ name: '', email: '' });
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

useEffect(() => {
  getProfile()
    .then((data) => {
      setProfile(data);
      setName(data.name);
      setEmail(data.email);
      setLoaded(true);
    })
    .catch((err) => {
      if (err.errors && Array.isArray(err.errors)) {
        setError(err.errors[0].msg); 
      }
      else if (err.message) {
        setError(err.message);
      }
      else {
        setError('Erro ao carregar perfil');
      }

      setLoaded(true); 
    });

}, [getProfile]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const updates = {};
      if (name && name !== profile.name) updates.name = name;
      if (email && email !== profile.email) updates.email = email;
      if (newPassword) {
        updates.newPassword = newPassword;
        updates.currentPassword = currentPassword;
      }
      if (Object.keys(updates).length === 0) {
        setSuccess('Nada para atualizar');
        setLoading(false);
        return;
      }
      const data = await updateProfile(updates);
      setProfile(data.user);
      setName(data.user.name);
      setEmail(data.user.email);
      setCurrentPassword('');
      setPassword('');
      setSuccess(data.message || 'Perfil atualizado');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!loaded) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Typography>Carregando perfil...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" gutterBottom>
          MEU PERFIL
        </Typography>
         <Typography variant="h8">
          Atualizar dados
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="Nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle1">Alterar senha</Typography>
            <TextField
              label="Senha atual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <TextField
              label="Nova senha"
              type="password"
              value={newPassword}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
            {success && (
              <Typography color="primary" variant="body2">
                {success}
              </Typography>
            )}
            <Stack direction="row" spacing={2}>
              <Button type="submit" variant="contained" disabled={loading}>
                Salvar alterações
              </Button>
              <Button variant="outlined" onClick={logout}>
                Sair
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}