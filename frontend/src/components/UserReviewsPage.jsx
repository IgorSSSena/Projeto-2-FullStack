import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../contexts/AuthContext';

/**
 * Página de listagem e edição de avaliações do usuário.  Permite visualizar
 * todas as avaliações cadastradas, editar notas e descrições ou remover
 * entradas.  As operações utilizam o token JWT armazenado no contexto
 * para autenticação.
 */
export default function UserReviewsPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ rating: '', description: '', comment: '' });

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

  async function loadReviews() {
    try {
      const res = await fetch(`${API_BASE}/reviews`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Falha ao carregar avaliações');
      }
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    if (token) loadReviews();
  }, [token]);

  const handleEdit = (review) => {
    setEditingId(review._id);
    setForm({ rating: review.rating, description: review.description, comment: review.comment || '' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza de que deseja remover esta avaliação?')) return;
    try {
      const res = await fetch(`${API_BASE}/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error('Falha ao excluir avaliação');
      }
      setReviews(reviews.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/reviews/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        throw new Error('Falha ao atualizar avaliação');
      }
      setEditingId(null);
      setForm({ rating: '', description: '', comment: '' });
      loadReviews();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Minhas Avaliações
      </Typography>
      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}
      {reviews.length === 0 && (
        <Typography variant="body2">Nenhuma avaliação cadastrada.</Typography>
      )}
      {reviews.map((review) => (
        <Paper key={review._id} variant="outlined" sx={{ p: 2, mt: 2 }}>
          {editingId === review._id ? (
            <form onSubmit={submitEdit} noValidate>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  label="Nota"
                  type="number"
                  inputProps={{ min: 1, max: 10 }}
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  required
                />
                <TextField
                  label="Descrição"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  fullWidth
                />
                <TextField
                  label="Comentário"
                  value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  fullWidth
                />
              </Box>
              <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained">
                  Salvar
                </Button>
                <Button variant="outlined" onClick={() => setEditingId(null)}>
                  Cancelar
                </Button>
              </Box>
            </form>
          ) : (
            <>
              <Typography variant="h6">{review.rawg_game_name}</Typography>
              <Typography variant="body2">Nota: {review.rating}</Typography>
              <Typography variant="body2">Descrição: {review.description}</Typography>
              {review.comment && (
                <Typography variant="body2">Comentário: {review.comment}</Typography>
              )}
              <Box sx={{ mt: 1 }}>
                <IconButton size="small" onClick={() => handleEdit(review)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(review._id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </>
          )}
        </Paper>
      ))}
    </Container>
  );
}