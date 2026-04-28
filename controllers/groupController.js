import Group from "../models/Group.js";
import Student from "../models/Student.js";
import { sendResponse } from "../utils/responseHandler.js";

// @route POST /api/groups
// @desc Create a new group (Team Leader only)
export const createGroup = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return sendResponse(res, 400, false, "Group name is required");
    }

    const group = await Group.create({
      name,
      leaderId: req.user._id,
      members: [],
    });

    return sendResponse(res, 201, true, "Group created successfully", group);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/groups/join
// @desc Join a group (Student only)
export const joinGroup = async (req, res, next) => {
  try {
    const { groupId } = req.body;

    if (!groupId) {
      return sendResponse(res, 400, false, "Group ID is required");
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return sendResponse(res, 404, false, "Group not found");
    }

    if (group.members.includes(req.user._id)) {
      return sendResponse(res, 400, false, "Already a member of this group");
    }

    group.members.push(req.user._id);
    await group.save();

    // Update student's groupId
    const student = await Student.findOne({ userId: req.user._id });
    if (student) {
      student.groupId = group._id;
      await student.save();
    }

    return sendResponse(res, 200, true, "Successfully joined group", group);
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/groups/:id/member
// @desc Remove a member from the group (Team Leader only)
export const removeMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(id);
    if (!group) {
      return sendResponse(res, 404, false, "Group not found");
    }

    if (group.leaderId.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, "Not authorized to manage this group");
    }

    if (!group.members.includes(userId)) {
      return sendResponse(res, 400, false, "User is not a member of this group");
    }

    group.members = group.members.filter(
      (memberId) => memberId.toString() !== userId
    );
    await group.save();

    const student = await Student.findOne({ userId });
    if (student) {
      student.groupId = null;
      await student.save();
    }

    return sendResponse(res, 200, true, "Member removed successfully", group);
  } catch (error) {
    next(error);
  }
};

// @route GET /api/groups/:id
// @desc Get group details
export const getGroup = async (req, res, next) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id)
      .populate("members", "name email role")
      .populate("leaderId", "name email");
    if (!group) {
      return sendResponse(res, 404, false, "Group not found");
    }

    return sendResponse(res, 200, true, "Group fetched successfully", group);
  } catch (error) {
    next(error);
  }
};
export const getLeaderGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ leaderId: req.user._id }).populate("members", "name email");
    return sendResponse(res, 200, true, "Leader groups fetched", groups);
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/groups/:id
// @desc Delete a group (Team Leader only)
export const deleteGroup = async (req, res, next) => {
  try {
    const { id } = req.params;

    const group = await Group.findById(id);
    if (!group) {
      return sendResponse(res, 404, false, "Group not found");
    }

    if (group.leaderId.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, "Not authorized to delete this group");
    }

    // Remove group reference from students
    await Student.updateMany({ groupId: id }, { $set: { groupId: null } });

    await Group.findByIdAndDelete(id);

    return sendResponse(res, 200, true, "Group deleted successfully");
  } catch (error) {
    next(error);
  }
};
