import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [3, "Name must be at least 3 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },

    profilePic: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
      maxlength: [150, "Bio cannot exceed 150 characters"],
    },

    // ==================== EMAIL VERIFICATION ====================

    emailVerified: {
      type: Boolean,
      default: false,
    },

    emailOtpHash: {
      type: String,
      default: null,
    },

    emailOtpExpiresAt: {
      type: Date,
      default: null,
    },

    emailOtpAttempts: {
      type: Number,
      default: 0,
    },

    emailOtpLastSentAt: {
      type: Date,
      default: null,
    },

    // ==================== ONLINE STATUS ====================

    isOnline: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;