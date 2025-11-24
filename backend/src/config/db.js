import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../logger.js'; // vamos criar esse arquivo no próximo passo

dotenv.config();

/**
 * Conecta no MongoDB usando um pool de conexões compartilhado.
 * maxPoolSize controla quantas conexões simultâneas podem existir.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI not set in environment');
  }
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // <- pool de conexões
    });
    logger.info('MongoDB conectado com sucesso', { maxPoolSize: 10 });
  } catch (err) {
    logger.error('Erro de conexão MongoDB', { error: err.message });
    process.exit(1);
  }
}
