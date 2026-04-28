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

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user || !(await user.matchPassword(currentPassword))) {
      return sendResponse(res, 401, false, "Invalid current password");
    }

    user.password = newPassword;
    await user.save();

    return sendResponse(res, 200, true, "Password changed successfully");
  } catch (error) {
    next(error);
  }
};

export const updateProfilePicture = async (req, res, next) => {
  try {
    const { pictureUrl } = req.body;
    // In a real app, you'd handle file upload here. 
    // For now, we'll just update the URL.
    
    let profile;
    if (req.user.role === "student") {
      profile = await Student.findOneAndUpdate(
        { userId: req.user._id },
        { pictureUrl },
        { new: true }
      );
    } else if (req.user.role === "team-leader") {
      profile = await TeamLeader.findOneAndUpdate(
        { userId: req.user._id },
        { pictureUrl },
        { new: true }
      );
    }

    return sendResponse(res, 200, true, "Profile picture updated", profile);
  } catch (error) {
    next(error);
  }
};
