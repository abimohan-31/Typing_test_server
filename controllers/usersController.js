import User from "../models/User.js";
import Student from "../models/Student.js";
import TeamLeader from "../models/TeamLeader.js";
import { sendResponse } from "../utils/responseHandler.js";

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    let profile = null;
    if (user.role === "student") {
      profile = await Student.findOne({ userId: user._id }).populate("groupId", "name");
    } else if (user.role === "team-leader") {
      profile = await TeamLeader.findOne({ userId: user._id });
    }

    return sendResponse(res, 200, true, "User profile fetched", {
      user,
      profile,
    });
  } catch (error) {
    next(error);
  }
};
