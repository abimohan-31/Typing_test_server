import { sendResponse } from "../utils/responseHandler.js";

export const leaderOnly = (req, res, next) => {
  if (req.user && req.user.role === "leader") {
    next();
  } else {
    return sendResponse(res, 403, false, "Not authorized as team leader");
  }
};
