import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = express.Router();

/**
 * Generates a JWT for a given user id and email.  Tokens default to a one hour
 * expiration.  The secret is read from the environment or falls back to a
 * default for development.
 */
function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1h' }
  );
}

// Register a new user
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter ao menos 6 caracteres'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email já cadastrado' });
    }
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await User.create({ name, email, passwordHash });
    const token = generateToken(user);
    return res.status(201).json({ token });
  }
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Senha é obrigatória'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ message: 'Credenciais inválidas' });
    }
    const token = generateToken(user);
    return res.json({ token });
  }
);

// Forgot password - generate reset token
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Email inválido')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: 'Se o email estiver cadastrado, enviaremos instruções' });
    }
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1h
    await user.save();
    // Normally you would send email here.  Return the token for demonstration.
    return res.json({ message: 'Token de recuperação gerado', token: resetToken });
  }
);

// Reset password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token é obrigatório'),
    body('password').isLength({ min: 6 }).withMessage('Senha deve ter ao menos 6 caracteres'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { token, password } = req.body;
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Token inválido ou expirado' });
    }
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.json({ message: 'Senha atualizada com sucesso' });
  }
);

export default router;