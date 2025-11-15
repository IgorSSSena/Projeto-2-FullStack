import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Stack,
  Typography,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

/**
 * Dialog para adicionar uma nova avaliação a um jogo.
 *
 * Recebe o objeto `game` com as propriedades `id`, `slug` e `name`, uma
 * flag `open` para indicar se o dialog está visível e callbacks
 * `onClose` e opcionalmente `onSubmitted` para notificar a criação.
 */
export default function AddReviewDialog({ game, open, onClose, onSubmitted }) {
  const { token } = useAuth();
  const [rating, setRating] = useState(5);
  const [description, setDescription] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

  const handleSubmit = async () => {
    if (!game) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId: game.id,
          gameSlug: game.slug || game.slug || null,
          gameName: game.name,
          rating,
          description,
          comment: comment || null,
        }),
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || 'Erro ao inserir avaliação');
      }
      if (onSubmitted) onSubmitted();
      onClose();
      // Reset form
      setRating(5);
      setDescription('');
      setComment('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Adicionar avaliação</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="h6" gutterBottom>
            {game?.name}
          </Typography>
          <Rating
            name="rating"
            value={rating}
            onChange={(e, newVal) => setRating(newVal)}
            precision={1}
            max={10}
          />
          <TextField
            label="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            required
          />
          <TextField
            label="Comentário (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            multiline
            rows={2}
          />
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={loading || !description} variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}