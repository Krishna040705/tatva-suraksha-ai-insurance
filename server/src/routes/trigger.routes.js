import { Router } from "express";
import {
  getScenarios,
  getSnapshot,
  simulateTriggers,
} from "../controllers/trigger.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/scenarios", getScenarios);
router.get("/snapshot", getSnapshot);
router.post("/simulate", simulateTriggers);

export default router;
