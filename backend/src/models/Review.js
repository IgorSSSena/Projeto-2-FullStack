import mongoose from 'mongoose';

/**
 * Review schema stores a user's evaluation of a game fetched from the RAWG
 * service.  Each review references a user, the RAWG game identifier, slug and
 * name.  Ratings must be between 1 and 10.  A unique compound index on
 * (userId, rawg_game_id) enforces the business rule that a user can only
 * review a specific game once.
 */
const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rawg_game_id: {
      type: Number,
      required: true,
    },
    rawg_game_slug: {
      type: String,
      required: true,
    },
    rawg_game_name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    description: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

// Enforce one review per user per game
reviewSchema.index({ userId: 1, rawg_game_id: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);