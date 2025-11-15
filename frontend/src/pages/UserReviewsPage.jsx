import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Stack,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  Tooltip,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

/**
 * Página que lista as avaliações do usuário logado. Permite editar ou
 * excluir avaliações. Busca os dados diretamente da API do backend.
 */
export default function UserReviewsPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

  // Carrega as avaliações do usuário
  useEffect(() => {
    let ignore = false;
    async function fetchReviews() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/reviews`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          const { message } = await res.json();
          throw new Error(message || 'Erro ao buscar avaliações');
        }
        const data = await res.json();
        if (!ignore) setReviews(data);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchReviews();
    return () => {
      ignore = true;
    };
  }, [API_BASE, token]);

  // Abre o diálogo para edição
  const handleEdit = (review) => {
    setEditing(review);
  };

  // Remove uma avaliação
  const handleDelete = async (reviewId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta avaliação?')) return;
    setDeletingId(reviewId);
    try {
      const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || 'Erro ao excluir avaliação');
      }
      // Remove do estado local
      setReviews((prev) => prev.filter((r) => r._id !== reviewId));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Atualiza uma avaliação
  const handleUpdate = async (id, updated) => {
    try {
      const res = await fetch(`${API_BASE}/reviews/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message || 'Erro ao atualizar avaliação');
      }
      const newReview = await res.json();
      setReviews((prev) => prev.map((r) => (r._id === id ? newReview : r)));
      setEditing(null);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Minhas Avaliações
      </Typography>
      {loading && <Typography>Carregando...</Typography>}
      {error && <Typography color="error">{error}</Typography>}
      {!loading && reviews.length === 0 && <Typography>Nenhuma avaliação encontrada.</Typography>}
      <Stack spacing={2}>
        {reviews.map((rev) => (
          <Paper
            key={rev._id}
            variant="outlined"
            sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <div>
              <Typography variant="h6">{rev.gameName}</Typography>
              <Typography variant="body2">Nota: {rev.rating}</Typography>
              <Typography variant="body2">{rev.description}</Typography>
              {rev.comment && (
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  {rev.comment}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                Criado em: {new Date(rev.createdAt).toLocaleDateString()}
              </Typography>
            </div>
            <div>
              <Tooltip title="Editar">
                <IconButton onClick={() => handleEdit(rev)}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Excluir">
                <span>
                  <IconButton
                    onClick={() => handleDelete(rev._id)}
                    disabled={deletingId === rev._id}
                  >
                    <DeleteIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </div>
          </Paper>
        ))}
      </Stack>
      {editing && (
        <EditDialog
          review={editing}
          onClose={() => setEditing(null)}
          onSave={(updated) => handleUpdate(editing._id, updated)}
        />
      )}
    </Container>
  );
}

/**
 * Diálogo para editar uma avaliação existente.
 */
function EditDialog({ review, onClose, onSave }) {
  const [rating, setRating] = useState(review.rating);
  const [description, setDescription] = useState(review.description);
  const [comment, setComment] = useState(review.comment || '');
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!description) {
      setError('Descrição é obrigatória');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSave({ rating, description, comment });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Editar avaliação</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="h6">{review.gameName}</Typography>
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
        <Button onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving || !description} variant="contained">
          Salvar
        </Button>
      </DialogActions>
    </Dialog>
  );
}