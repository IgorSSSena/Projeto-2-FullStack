import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

/**
 * Modal para alteração de senha obrigatória.
 *
 * É exibido quando o usuário loga com uma senha temporária e precisa
 * escolher uma nova senha.  Recebe a senha atual (temporária) por
 * parâmetro para autenticar a mudança.  Após a alteração bem sucedida
 * o modal fecha e o callback onClose é chamado com true.
 */
export default function ChangePasswordModal({ open, onClose, currentPassword }) {
  const { changePassword } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (!newPassword || newPassword.length < 6) {
      setError('A nova senha deve ter ao menos 6 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      // Limpa campos e fecha modal indicando sucesso
      setNewPassword('');
      setConfirmPassword('');
      onClose(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    onClose(false);
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="xs" fullWidth>
      <DialogTitle>Alterar senha</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Para continuar, defina uma nova senha (mínimo 6 caracteres).
        </Typography>
        <TextField
          type="password"
          label="Nova senha"
          fullWidth
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          sx={{ mb: 2 }}
          autoFocus
        />
        <TextField
          type="password"
          label="Confirme a nova senha"
          fullWidth
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Alterar senha
        </Button>
      </DialogActions>
    </Dialog>
  );
}