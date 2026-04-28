import User from "../models/User.js";
import Student from "../models/Student.js";
import TeamLeader from "../models/TeamLeader.js";
import jwt from "jsonwebtoken";
import { sendResponse } from "../utils/responseHandler.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "fallbacksecret", {
    expiresIn: "30d",
  });
};

export const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return sendResponse(res, 400, false, "Please provide all required fields");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendResponse(res, 400, false, "User already exists");
    }

    const user = await User.create({
      email,
      password,
      role: "student",
    });

    const studentProfile = await Student.create({
      userId: user._id,
      name,
    });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return sendResponse(res, 201, true, "Student registered successfully", {
      _id: user._id,
      name: studentProfile.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

export const registerTeamLeader = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return sendResponse(res, 400, false, "Please provide all required fields");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return sendResponse(res, 400, false, "User already exists");
    }

    const user = await User.create({
      email,
      password,
      role: "team-leader",
    });

    const leaderProfile = await TeamLeader.create({
      userId: user._id,
      name,
    });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return sendResponse(res, 201, true, "Team Leader registered successfully", {
      _id: user._id,
      name: leaderProfile.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, false, "Please provide email and password");
    }

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      if (!user.isActive) {
        return sendResponse(res, 401, false, "Account is disabled");
      }

      let profileData = {};
      if (user.role === "student") {
        const student = await Student.findOne({ userId: user._id });
        if (student) profileData = { name: student.name, groupId: student.groupId };
      } else if (user.role === "team-leader") {
        const leader = await TeamLeader.findOne({ userId: user._id });
        if (leader) profileData = { name: leader.name };
      } else if (user.role === "admin") {
        profileData = { name: "Admin" };
      }

      const token = generateToken(user._id);

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      return sendResponse(res, 200, true, "Login successful", {
        _id: user._id,
        email: user.email,
        role: user.role,
        ...profileData,
      });
    } else {
      return sendResponse(res, 401, false, "Invalid email or password");
    }
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res) => {
  res.clearCookie("token");
  return sendResponse(res, 200, true, "Logged out successfully");
};
