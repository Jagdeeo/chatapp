import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    chatType: {
      type: String,
      enum: ["private", "group"],
      default: "private",
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    groupName: {
      type: String,
      trim: true,
      maxlength: [50, "Group name cannot exceed 50 characters"],
      default: "",
    },

    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    groupImage: {
      type: String,
      default: "",
    },

    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;