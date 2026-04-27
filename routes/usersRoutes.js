import express from "express";
import { getMe, changePassword, updateProfilePicture } from "../controllers/usersController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/me", auth, getMe);
router.put("/change-password", auth, changePassword);
router.post("/profile-picture", auth, updateProfilePicture);

export default router;
