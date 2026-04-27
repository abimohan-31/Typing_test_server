import express from "express";
import { getAnalytics } from "../controllers/analyticsController.js";
import { auth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = express.Router();

router.get("/", auth, requireRole(["admin", "team-leader"]), getAnalytics);

export default router;
