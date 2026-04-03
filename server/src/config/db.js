import mongoose from "mongoose";
import { env } from "./env.js";
import { createDemoRepositories } from "../repositories/demo.repositories.js";
import { createMongoRepositories } from "../repositories/mongo.repositories.js";

export async function initialiseRepositories() {
  if (env.persistenceMode !== "mongo") {
    return {
      mode: "demo",
      repositories: createDemoRepositories(),
    };
  }

  try {
    await mongoose.connect(env.mongoUri, {
      autoIndex: true,
    });

    return {
      mode: "mongo",
      repositories: createMongoRepositories(),
    };
  } catch (error) {
    console.warn(
      "[suraksha] Mongo connection failed, falling back to demo mode:",
      error.message,
    );

    return {
      mode: "demo",
      repositories: createDemoRepositories(),
    };
  }
}
