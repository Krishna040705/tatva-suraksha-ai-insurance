import { Router } from "express";
import { listClaims, releaseClaim } from "../controllers/claim.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/", listClaims);
router.post("/:claimId/release", releaseClaim);

export default router;
