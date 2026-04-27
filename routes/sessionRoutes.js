import express from "express";
import {
  startSession,
  submitSession,
  getSessions,
} from "../controllers/sessionController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { leaderOnly } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/start", protect, leaderOnly, startSession);
router.post("/submit", protect, submitSession);
router.get("/:groupId", protect, getSessions);

export default router;
