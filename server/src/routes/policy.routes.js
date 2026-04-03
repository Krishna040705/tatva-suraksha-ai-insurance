import { Router } from "express";
import {
  createPolicy,
  getQuote,
  listPolicies,
  updatePolicy,
} from "../controllers/policy.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/", listPolicies);
router.post("/quote", getQuote);
router.post("/", createPolicy);
router.patch("/:policyId", updatePolicy);

export default router;
