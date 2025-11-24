import rateLimit from 'express-rate-limit';

// Limite geral da API
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 100,            // 100 requisições por minuto por IP
  standardHeaders: true,
  legacyHeaders: false,
});

// Limite específico para login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 3,                  // 10 tentativas de login
  message: {
    message: 'Muitas tentativas de login. Tente novamente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
