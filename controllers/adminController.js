import User from "../models/User.js";
import Student from "../models/Student.js";
import TeamLeader from "../models/TeamLeader.js";
import Group from "../models/Group.js";
import Session from "../models/Session.js";
import { sendResponse } from "../utils/responseHandler.js";

// @route   GET /api/admin/analytics
// @desc    Get system wide statistics
// @access  Private/Admin
export const getAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentsCount = await User.countDocuments({ role: "student" });
    const leadersCount = await User.countDocuments({ role: "team-leader" });
    const totalGroups = await Group.countDocuments();
    
    // Active sessions are sessions with status "active"
    const activeSessions = await Session.countDocuments({ status: "active" });
    const totalSessions = await Session.countDocuments();

    // Calculate global average WPM
    const sessions = await Session.find({});
    let totalWpm = 0;
    let resultsCount = 0;
    
    sessions.forEach(session => {
      session.results.forEach(result => {
        if (result.wpm) {
          totalWpm += result.wpm;
          resultsCount++;
        }
      });
    });

    const averageWpm = resultsCount > 0 ? Math.round(totalWpm / resultsCount) : 0;

    return sendResponse(res, 200, true, "Admin analytics fetched successfully", {
      totalUsers,
      studentsCount,
      leadersCount,
      totalGroups,
      activeSessions,
      totalSessions,
      averageWpm,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/users
// @desc    Get all users with profile data
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");
    
    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        let profile = null;
        if (user.role === "student") {
          profile = await Student.findOne({ userId: user._id }).populate("groupId", "name");
        } else if (user.role === "team-leader") {
          profile = await TeamLeader.findOne({ userId: user._id });
        }
        return {
          ...user.toObject(),
          profile,
        };
      })
    );

    return sendResponse(res, 200, true, "All users fetched successfully", usersWithProfiles);
  } catch (error) {
    next(error);
  }
};

// @route   PUT /api/admin/users/:id/toggle
// @desc    Toggle user active/inactive status
// @access  Private/Admin
export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return sendResponse(res, 400, false, "You cannot deactivate your own admin account");
    }

    const user = await User.findById(id);
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    user.isActive = !user.isActive;
    await user.save();

    return sendResponse(res, 200, true, `User status updated to ${user.isActive ? "active" : "inactive"}`, {
      userId: user._id,
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
};
// @route   DELETE /api/admin/users/:id
// @desc    Delete user account and associated profile data
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return sendResponse(res, 400, false, "You cannot delete your own admin account");
    }

    const user = await User.findById(id);
    if (!user) {
      return sendResponse(res, 404, false, "User not found");
    }

    if (user.role === "student") {
      await Student.findOneAndDelete({ userId: id });
      await Group.updateMany({ members: id }, { $pull: { members: id } });
    } else if (user.role === "team-leader") {
      await TeamLeader.findOneAndDelete({ userId: id });
      const leaderGroups = await Group.find({ leaderId: id });
      for (const g of leaderGroups) {
        await Student.updateMany({ groupId: g._id }, { $set: { groupId: null } });
        await Session.deleteMany({ groupId: g._id });
        await Group.findByIdAndDelete(g._id);
      }
    }

    await User.findByIdAndDelete(id);

    return sendResponse(res, 200, true, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};

// @route   GET /api/admin/groups
// @desc    Get all groups in system
// @access  Private/Admin
export const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({})
      .populate("leaderId", "email")
      .populate("members", "email");

    const groupsWithLeaderNames = await Promise.all(
      groups.map(async (group) => {
        const leaderProfile = await TeamLeader.findOne({ userId: group.leaderId });
        return {
          ...group.toObject(),
          leaderName: leaderProfile ? leaderProfile.name : "Unknown Leader",
        };
      })
    );

    return sendResponse(res, 200, true, "All groups fetched successfully", groupsWithLeaderNames);
  } catch (error) {
    next(error);
  }
}
