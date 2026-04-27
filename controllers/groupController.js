import Group from "../models/Group.js";
import User from "../models/User.js";
import { sendResponse } from "../utils/responseHandler.js";

// @route POST /api/groups
// @desc Create a new group (Leader only)
export const createGroup = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return sendResponse(res, 400, false, "Group name is required");
    }

    const group = await Group.create({
      name,
      leaderId: req.user._id,
      members: [req.user._id],
    });

    // Update leader's groupId
    req.user.groupId = group._id;
    await req.user.save();

    return sendResponse(res, 201, true, "Group created successfully", group);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/groups/join
// @desc Join a group
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

    req.user.groupId = group._id;
    await req.user.save();

    return sendResponse(res, 200, true, "Successfully joined group", group);
  } catch (error) {
    next(error);
  }
};

// @route DELETE /api/groups/:id/member
// @desc Remove a member from the group (Leader only)
export const removeMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const group = await Group.findById(id);
    if (!group) {
      return sendResponse(res, 404, false, "Group not found");
    }

    if (group.leaderId.toString() !== req.user._id.toString()) {
      return sendResponse(res, 403, false, "Not authorized to remove members from this group");
    }

    if (!group.members.includes(userId)) {
      return sendResponse(res, 400, false, "User is not a member of this group");
    }

    group.members = group.members.filter(
      (memberId) => memberId.toString() !== userId
    );
    await group.save();

    const user = await User.findById(userId);
    if (user) {
      user.groupId = null;
      await user.save();
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

    const group = await Group.findById(id).populate("members", "name email role");
    if (!group) {
      return sendResponse(res, 404, false, "Group not found");
    }

    return sendResponse(res, 200, true, "Group fetched successfully", group);
  } catch (error) {
    next(error);
  }
};
