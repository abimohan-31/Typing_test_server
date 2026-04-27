import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/responseHandler.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallbacksecret", {
    expiresIn: "30d",
  });
};

export const loginUser = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendResponse(res, 400, false, "Please provide an email");
    }

    const user = await User.findOne({ email });

    if (!user) {
      return sendResponse(res, 401, false, "Invalid credentials");
    }

    return sendResponse(res, 200, true, "Login successful", {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      groupId: user.groupId,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};
