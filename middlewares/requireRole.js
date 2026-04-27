import { sendResponse } from "../utils/responseHandler.js";

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendResponse(res, 401, false, "Not authorized, user not found");
    }

    if (!roles.includes(req.user.role)) {
      return sendResponse(
        res,
        403,
        false,
        `Forbidden. Required roles: ${roles.join(", ")}`
      );
    }

    next();
  };
};
