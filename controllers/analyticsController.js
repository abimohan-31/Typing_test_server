import { sendResponse } from "../utils/responseHandler.js";

export const getAnalytics = async (req, res, next) => {
  return sendResponse(res, 200, true, "Analytics endpoint not implemented yet", {});
};
