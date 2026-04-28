import express from "express";
import {
  registerStudent,
  registerTeamLeader,
  loginUser,
  logoutUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register/student", registerStudent);
router.post("/register/team-leader", registerTeamLeader);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

export default router;
