import express from "express";
import cors from "cors";
import helmet from "helmet";
import { healthRouter } from "./routes/health.js";
import authRouter from "./routes/auth.js";
import profileRouter from "./routes/profile.js";
import measurementsRouter from "./routes/measurements.js";
import exercisesRouter from "./routes/exercises.js";
import routinesRouter from "./routes/routines.js";

export function createServer(): express.Express {
  const app = express();

  // Middleware base
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  // Rutas
  app.use("/api/v1", healthRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/profile", profileRouter);
  app.use("/api/v1/measurements", measurementsRouter);
  app.use("/api/v1/exercises", exercisesRouter);
  app.use("/api/v1/routines", routinesRouter);

  return app;
}