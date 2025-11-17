import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import nodemailer from "nodemailer";
import auth from "../middleware/auth.js";

const router = express.Router();

/**
 * Generates a JWT for a given user id and email.  Tokens default to a one hour
 * expiration.  The secret is read from the environment or falls back to a
 * default for development.
 */

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendResetEmail(user, token) {
  const resetLink = `http://localhost:5173/reset-password?token=${token}`;

  const mailOptions = {
    to: user.email,
    from: process.env.EMAIL_USER,
    subject: "Recuperação de Senha",
    html: `
      <h1>Solicitação de Recuperação de Senha</h1>
      <p>Você solicitou a recuperação de senha. Por favor, clique no link abaixo para redefinir sua senha:</p>
      <a href="${resetLink}">Redefinir Senha</a>
      <p>Este link expira em 1 hora.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

function generateToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET || "secret",
    { expiresIn: "23h" }
  );
}

// Register a new user
router.post(
  "/register",
  [
    body("name").notEmpty().withMessage("Nome é obrigatório"),
    body("email").isEmail().withMessage("Email inválido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Senha deve ter ao menos 6 caracteres"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email já cadastrado" });
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
  "/login",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("password").notEmpty().withMessage("Senha é obrigatória"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Credenciais inválidas" });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(400).json({ message: "Credenciais inválidas" });
    }
    const token = generateToken(user);
    return res.json({ token });
  }
);

// Forgot password - generate reset token
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Email inválido")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({
          message: "Se o email estiver cadastrado, enviaremos instruções",
        });
    }
    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const hashed = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1h
    await user.save();
    try {
      await sendResetEmail(user, resetToken);
      return res.status(200).json({
        message: "E-mail de recuperação enviado com sucesso.",
      });
    } catch (err) {
      console.error("Erro ao enviar e-mail:", err);
      return res
        .status(500)
        .json({ message: "Erro interno ao enviar e-mail de recuperação." });
    }
  }
);

// Reset password
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Token é obrigatório"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Senha deve ter ao menos 6 caracteres"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { token, password } = req.body;
    const hashed = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: "Token inválido ou expirado" });
    }
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return res.json({ message: "Senha atualizada com sucesso" });
  }
);

//User
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    return res.json(user);
  } catch (err) {
    console.error("Erro ao buscar usuário:", err);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

router.put(
  "/me",
  auth,
  [
    body("name").optional().notEmpty().withMessage("Nome não pode ser vazio"),
    body("email").optional().isEmail().withMessage("Email inválido"),
    body("currentPassword")
      .optional()
      .notEmpty()
      .withMessage("Senha atual é obrigatória para trocar a senha"),
    body("newPassword")
      .optional()
      .isLength({ min: 6 })
      .withMessage("Nova senha deve ter ao menos 6 caracteres"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, currentPassword, newPassword } = req.body;

    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Atualizar nome
      if (name) user.name = name;

      // Atualizar email
      if (email) {
        const existingEmail = await User.findOne({ email });
        if (
          existingEmail &&
          existingEmail._id.toString() !== user._id.toString()
        ) {
          return res.status(400).json({ message: "Este email já está em uso" });
        }
        user.email = email;
      }

      // Atualizar senha
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            message: "Você deve informar a senha atual para alterá-la",
          });
        }

        const match = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!match) {
          return res.status(400).json({ msg: "Senha atual incorreta" });
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
      }

      await user.save();

      return res.json({
        message: "Dados atualizados com sucesso!",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
);
export default router;
