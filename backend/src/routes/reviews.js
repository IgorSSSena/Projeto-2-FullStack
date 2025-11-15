import express from 'express';
import { body, validationResult } from 'express-validator';
import Review from '../models/Review.js';
import auth from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /reviews
 * Returns all reviews for the authenticated user.  Optional query
 * parameters allow filtering by game name or slug.  Results are sorted
 * descending by creation date.
 */
router.get('/', auth, async (req, res) => {
  const { search } = req.query;
  const criteria = { userId: req.userId };
  if (search) {
    criteria.$or = [
      { rawg_game_name: { $regex: search, $options: 'i' } },
      { rawg_game_slug: { $regex: search, $options: 'i' } },
    ];
  }
  const reviews = await Review.find(criteria).sort({ createdAt: -1 });
  return res.json(reviews);
});

/**
 * POST /reviews
 * Creates a new review for the authenticated user.  Validates input
 * parameters and ensures the user has not already reviewed the game.
 */
router.post(
  '/',
  auth,
  [
    body('rawg_game_id').isInt().withMessage('ID do jogo inválido'),
    body('rawg_game_slug').notEmpty().withMessage('Slug é obrigatório'),
    body('rawg_game_name').notEmpty().withMessage('Nome do jogo é obrigatório'),
    body('rating').isInt({ min: 1, max: 10 }).withMessage('Nota deve ser entre 1 e 10'),
    body('description').notEmpty().withMessage('Descrição é obrigatória'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      rawg_game_id,
      rawg_game_slug,
      rawg_game_name,
      rating,
      description,
      comment,
    } = req.body;
    try {
      const review = await Review.create({
        userId: req.userId,
        rawg_game_id,
        rawg_game_slug,
        rawg_game_name,
        rating,
        description,
        comment,
      });
      return res.status(201).json(review);
    } catch (err) {
      // Duplicate key indicates the user already reviewed this game
      if (err.code === 11000) {
        return res.status(409).json({ message: 'Você já avaliou este jogo' });
      }
      return res.status(500).json({ message: 'Erro ao criar avaliação' });
    }
  }
);

/**
 * GET /reviews/:id
 * Returns a single review by its identifier if it belongs to the current user.
 */
router.get('/:id', auth, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Avaliação não encontrada' });
  if (review.userId.toString() !== req.userId) {
    return res.status(403).json({ message: 'Acesso não autorizado' });
  }
  return res.json(review);
});

/**
 * PUT /reviews/:id
 * Updates an existing review.  Only fields rating, description and comment
 * may be changed.  The user must own the review.
 */
router.put(
  '/:id',
  auth,
  [
    body('rating').optional().isInt({ min: 1, max: 10 }).withMessage('Nota deve ser entre 1 e 10'),
    body('description').optional().notEmpty().withMessage('Descrição é obrigatória se fornecida'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: 'Avaliação não encontrada' });
    if (review.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Acesso não autorizado' });
    }
    // Update allowed fields
    const { rating, description, comment } = req.body;
    if (rating !== undefined) review.rating = rating;
    if (description !== undefined) review.description = description;
    if (comment !== undefined) review.comment = comment;
    review.updatedAt = new Date();
    await review.save();
    return res.json(review);
  }
);

/**
 * DELETE /reviews/:id
 * Removes a review permanently.  Only the review owner may delete.
 */
router.delete('/:id', auth, async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Avaliação não encontrada' });
  if (review.userId.toString() !== req.userId) {
    return res.status(403).json({ message: 'Acesso não autorizado' });
  }
  await review.remove();
  return res.json({ message: 'Avaliação removida' });
});

export default router;