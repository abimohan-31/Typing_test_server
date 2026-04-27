import express from "express";
import authRoutes from "./authRoutes.js";
import usersRoutes from "./usersRoutes.js";
import groupsRoutes from "./groupsRoutes.js";
import sessionsRoutes from "./sessionsRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/groups", groupsRoutes);
router.use("/sessions", sessionsRoutes);
router.use("/analytics", analyticsRoutes);

export default router;
