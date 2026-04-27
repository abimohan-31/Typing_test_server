import express from "express";
import {
  registerStudent,
  registerTeamLeader,
  loginUser,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register/student", registerStudent);
router.post("/register/team-leader", registerTeamLeader);
router.post("/login", loginUser);

export default router;
