import express from "express";
import cors from "cors";
import helmet from "helmet";
import { healthRouter } from "./routes/health.js";

export function createServer(): express.Express {
  const app = express();

  // Middleware base
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Rutas
  app.use("/api/v1", healthRouter);

  return app;
}