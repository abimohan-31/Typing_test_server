import express from "express";
import {
  startSession,
  submitSession,
  getSessions,
} from "../controllers/sessionController.js";
import { auth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = express.Router();

router.post("/start", auth, requireRole(["team-leader"]), startSession);
router.post("/submit", auth, requireRole(["student"]), submitSession);
router.get("/:groupId", auth, requireRole(["student", "team-leader", "admin"]), getSessions);

export default router;
