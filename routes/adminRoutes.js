import express from "express";
import {
  getAnalytics,
  getUsers,
  toggleUserStatus,
  deleteUser,
  getGroups,
} from "../controllers/adminController.js";
import { auth } from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = express.Router();

// Apply auth and admin-only restriction to all routes
router.use(auth);
router.use(requireRole(["admin"]));

router.get("/analytics", getAnalytics);
router.get("/users", getUsers);
router.put("/users/:id/toggle", toggleUserStatus);
router.delete("/users/:id", deleteUser);
router.get("/groups", getGroups);

export default router;
