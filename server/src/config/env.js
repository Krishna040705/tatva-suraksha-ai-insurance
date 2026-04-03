import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  persistenceMode: process.env.PERSISTENCE_MODE || "demo",
  mongoUri:
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/suraksha",
  jwtSecret: process.env.JWT_SECRET || "suraksha-dev-secret",
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  enableBackgroundJobs: process.env.ENABLE_BACKGROUND_JOBS !== "false",
};
