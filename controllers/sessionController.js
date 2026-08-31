import Session from "../models/Session.js";
import Group from "../models/Group.js";
import { sendResponse } from "../utils/responseHandler.js";
import { generateAIPassage } from "../services/aiService.js";

// @route POST /api/sessions/generate-passage
// @desc Automatically generate typing test passage via AI based on selected time limit
export const generatePassage = async (req, res, next) => {
  try {
    const { duration } = req.body;
    const durationMinutes = Number(duration) || 1;

    const result = await generateAIPassage(durationMinutes);

    return sendResponse(
      res,
      200,
      true,
      "Typing passage generated successfully",
      result
    );
  } catch (error) {
    next(error);
  }
};

// @route POST /api/sessions/start
// @desc Start a new session (Team Leader only)
export const startSession = async (req, res, next) => {
  try {
    let { text, duration, groupId } = req.body;

    if (!duration || !groupId) {
      return sendResponse(
        res,
        400,
        false,
        "Duration and groupId are required"
      );
    }

    // If text is missing or explicitly requested AI, generate passage using AI
    if (!text || text.trim() === "") {
      const aiResult = await generateAIPassage(duration);
      text = aiResult.text;
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return sendResponse(res, 404, false, "Group not found");
    }

    if (group.leaderId.toString() !== req.user._id.toString()) {
      return sendResponse(
        res,
        403,
        false,
        "Only the group leader can start a session"
      );
    }

    // Mark previous active sessions as completed
    await Session.updateMany(
      { groupId, status: "active" },
      { status: "completed" }
    );

    const session = await Session.create({
      groupId,
      text,
      duration,
      startedAt: new Date(),
      status: "active",
      results: [],
    });

    return sendResponse(res, 201, true, "Session started successfully", session);
  } catch (error) {
    next(error);
  }
};

// @route POST /api/sessions/submit
// @desc Submit typing results (Student only)
export const submitSession = async (req, res, next) => {
  try {
    const { sessionId, typedText, timeTakenMinutes } = req.body;

    if (!sessionId || typedText === undefined || timeTakenMinutes == null) {
      return sendResponse(
        res,
        400,
        false,
        "Session ID, typed text, and time taken are required"
      );
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      return sendResponse(res, 404, false, "Session not found");
    }

    if (session.status !== "active") {
      return sendResponse(res, 400, false, "Session is no longer active");
    }

    const originalText = session.text;
    const typedWords = typedText
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;

    let wpm = 0;
    if (typedText.trim().length > 0 && timeTakenMinutes > 0) {
      wpm = Math.round(typedWords / timeTakenMinutes);
    }

    let correctChars = 0;
    const minLen = Math.min(originalText.length, typedText.length);
    for (let i = 0; i < minLen; i++) {
      if (originalText[i] === typedText[i]) {
        correctChars++;
      }
    }

    let accuracy = 0;
    if (typedText.length > 0) {
      accuracy = Math.round((correctChars / typedText.length) * 100);
    }

    const existingResultIndex = session.results.findIndex(
      (r) => r.userId.toString() === req.user._id.toString()
    );

    if (existingResultIndex !== -1) {
      session.results[existingResultIndex].wpm = wpm;
      session.results[existingResultIndex].accuracy = accuracy;
      session.results[existingResultIndex].submittedAt = new Date();
    } else {
      session.results.push({
        userId: req.user._id,
        wpm,
        accuracy,
        submittedAt: new Date(),
      });
    }

    await session.save();

    return sendResponse(res, 200, true, "Session results submitted", {
      wpm,
      accuracy,
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/sessions/:groupId
// @desc Get sessions for a group
export const getSessions = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    const sessions = await Session.find({ groupId }).populate(
      "results.userId",
      "email"
    );

    return sendResponse(
      res,
      200,
      true,
      "Sessions fetched successfully",
      sessions
    );
  } catch (error) {
    next(error);
  }
};
