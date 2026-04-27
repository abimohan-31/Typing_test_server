import express from "express";
import {
  createGroup,
  joinGroup,
  removeMember,
  getGroup,
  getLeaderGroups,
} from "../controllers/groupController.js";
import { auth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = express.Router();

router.post("/", auth, requireRole(["team-leader"]), createGroup);
router.post("/join", auth, requireRole(["student"]), joinGroup);
router.get("/leader", auth, requireRole(["team-leader"]), getLeaderGroups);
router.delete("/:id/member", auth, requireRole(["team-leader"]), removeMember);
router.get("/:id", auth, getGroup);

export default router;
