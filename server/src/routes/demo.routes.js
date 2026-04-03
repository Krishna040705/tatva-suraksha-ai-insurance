import { Router } from "express";
import { bootstrapDemo } from "../controllers/demo.controller.js";

const router = Router();

router.post("/bootstrap", bootstrapDemo);

export default router;
