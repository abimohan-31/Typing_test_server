import express from "express";
import {
  createGroup,
  joinGroup,
  removeMember,
  getGroup,
} from "../controllers/groupController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { leaderOnly } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/", protect, leaderOnly, createGroup);
router.post("/join", protect, joinGroup);
router.delete("/:id/member", protect, leaderOnly, removeMember);
router.get("/:id", protect, getGroup);

export default router;
