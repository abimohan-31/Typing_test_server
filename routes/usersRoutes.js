import express from "express";
import { getMe } from "../controllers/usersController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/me", auth, getMe);

export default router;
