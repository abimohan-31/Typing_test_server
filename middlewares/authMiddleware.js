import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendResponse } from "../utils/responseHandler.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallbacksecret");

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return sendResponse(res, 401, false, "Not authorized, user not found");
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
