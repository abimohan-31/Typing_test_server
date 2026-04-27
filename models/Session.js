import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    results: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        wpm: {
          type: Number,
          default: 0,
        },
        accuracy: {
          type: Number,
          default: 0,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
