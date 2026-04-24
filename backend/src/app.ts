import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/categories.routes";
import eventRoutes from "./routes/events.routes";
import registrationRoutes from "./routes/registrations.routes";
import ticketRoutes from "./routes/tickets.routes";
import notificationRoutes from "./routes/notifications.routes";
import reportRoutes from "./routes/reports.routes";
import { errorHandler, notFound } from "./middleware/error";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.corsOrigin === "*" ? true : env.corsOrigin.split(","),
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "campus-events-api" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/events", eventRoutes);
  app.use("/api", registrationRoutes);
  app.use("/api/tickets", ticketRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/reports", reportRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
