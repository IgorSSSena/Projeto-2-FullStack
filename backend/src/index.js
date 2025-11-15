import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/auth.js';
import reviewsRoutes from './routes/reviews.js';

dotenv.config();

async function startServer() {
  await connectDB();
  const app = express();
  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  // Routes
  app.use('/auth', authRoutes);
  app.use('/reviews', reviewsRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ message: 'Rota não encontrada' });
  });
  // Error handler
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  });

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch((err) => {
  console.error(err);
  process.exit(1);
});