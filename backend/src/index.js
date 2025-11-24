import https from "https";
import fs from "fs";
import path from "path";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import reviewsRoutes from "./routes/reviews.js";
import logger from "./logger.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import compression from "compression";

dotenv.config();
const __dirname = path.resolve();

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "certs", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "certs", "cert.pem")),
};
async function startServer() {
  await connectDB();
  const app = express();
  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(compression());
  app.use(morgan("dev"));

  app.use(apiLimiter);

  // Routes
  app.use("/auth", authRoutes);
  app.use("/reviews", reviewsRoutes);

  // 404 handler
  app.use((req, res) => {
    logger.warn("Rota não encontrada", {
      method: req.method,
      url: req.originalUrl,
    });
    res.status(404).json({ message: "Rota não encontrada" });
  });

  // Error handler central
  app.use((err, req, res, next) => {
    logger.error("Erro interno do servidor", {
      message: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
    });
    res.status(500).json({ message: "Erro interno do servidor" });
  });

  const port = process.env.PORT || 3000;

  https.createServer(httpsOptions, app).listen(port, () => {
    logger.info(`Servidor HTTPS rodando em https://localhost:${port}`);
  });
}

startServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
