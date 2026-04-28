import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendResponse } from "../utils/responseHandler.js";

export const auth = async (req, res, next) => {
  let token;

  // Check for token in cookies first, then in Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallbacksecret");

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user || !req.user.isActive) {
        return sendResponse(res, 401, false, "Not authorized, user not found or inactive");
      }

      next();
    } catch (error) {
      console.error(error);
      return sendResponse(res, 401, false, "Not authorized, token failed");
    }
  } else {
    return sendResponse(res, 401, false, "Not authorized, no token");
  }
};

export const authOptional = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallbacksecret");

      req.user = await User.findById(decoded.id).select("-password");
    } catch (error) {
      // ignore
    }
  }
  next();
};
