import User from "../models/User.model.js";

import bcrypt from "bcryptjs";

import generateToken from "../Utils/generateToken.js";

import { generateOTP, hashOTP } from "../Utils/otp.js";

import { sendOTPEmail } from "../Utils/sendEmail.js";


// ==================== REGISTER ====================

export const register = async (req, res) => {
  try {
    const {
      fullname,
      username,
      email,
      password,
    } = req.body;


    // Check required fields

    if (
      !fullname ||
      !username ||
      !email ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }


    const cleanEmail = email.trim().toLowerCase();

    const cleanUsername =
      username.trim().toLowerCase();


    // Check email

    const existingEmail = await User.findOne({
      email: cleanEmail,
    });


    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }


    // Check username

    const existingUsername = await User.findOne({
      username: cleanUsername,
    });


    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }


    // Hash password

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );


    // Generate OTP

    const otp = generateOTP();

    const otpHash = hashOTP(otp);

    const otpExpiresAt =
      new Date(Date.now() + 5 * 60 * 1000);


    // Create user

    const user = await User.create({
      fullname: fullname.trim(),

      username: cleanUsername,

      email: cleanEmail,

      password: hashedPassword,

      emailVerified: false,

      emailOtpHash: otpHash,

      emailOtpExpiresAt: otpExpiresAt,

      emailOtpAttempts: 0,

      emailOtpLastSentAt: new Date(),
    });


    // Send OTP

    try {
      await sendOTPEmail(
        user.email,
        user.fullname,
        otp
      );
    } catch (emailError) {

      // Remove user if email could not be sent

      await User.findByIdAndDelete(user._id);

      console.error(
        "OTP email error:",
        emailError
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to send verification email. Please try again.",
      });
    }


    return res.status(201).json({
      success: true,

      message:
        "Registration successful. OTP sent to your email.",

      userId: user._id,

      email: user.email,

      requiresVerification: true,
    });

  } catch (error) {

    console.error(
      "Register error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==================== VERIFY EMAIL OTP ====================

export const verifyEmailOTP = async (req, res) => {
  try {
    const {
      email,
      otp,
    } = req.body;


    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }


    const cleanEmail =
      email.trim().toLowerCase();


    const user = await User.findOne({
      email: cleanEmail,
    });


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }


    // Check OTP attempts

    if (user.emailOtpAttempts >= 5) {
      return res.status(429).json({
        success: false,
        message:
          "Too many incorrect attempts. Please request a new OTP.",
      });
    }


    // Check OTP exists

    if (
      !user.emailOtpHash ||
      !user.emailOtpExpiresAt
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP not found. Please request a new OTP.",
      });
    }


    // Check expiration

    if (
      user.emailOtpExpiresAt.getTime() <
      Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP expired. Please request a new OTP.",
      });
    }


    // Compare OTP

    const otpHash = hashOTP(otp.trim());


    if (otpHash !== user.emailOtpHash) {

      user.emailOtpAttempts += 1;

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
        attemptsLeft:
          5 - user.emailOtpAttempts,
      });
    }


    // OTP correct

    user.emailVerified = true;

    user.emailOtpHash = null;

    user.emailOtpExpiresAt = null;

    user.emailOtpAttempts = 0;


    await user.save();


    // Login user after verification

    generateToken(
      user._id.toString(),
      res
    );


    return res.status(200).json({
      success: true,

      message:
        "Email verified successfully",

      user: {
        id: user._id,

        fullname: user.fullname,

        username: user.username,

        email: user.email,

        profilePic: user.profilePic,

      },
    });

  } catch (error) {

    console.error(
      "Verify OTP error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==================== RESEND OTP ====================

export const resendEmailOTP = async (req, res) => {
  try {

    const { email } = req.body;


    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }


    const cleanEmail =
      email.trim().toLowerCase();


    const user = await User.findOne({
      email: cleanEmail,
    });


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }


    // Prevent spam

    if (user.emailOtpLastSentAt) {

      const secondsSinceLastOTP =
        (Date.now() -
          user.emailOtpLastSentAt.getTime()) /
        1000;


      if (secondsSinceLastOTP < 60) {

        return res.status(429).json({
          success: false,

          message:
            `Please wait ${Math.ceil(
              60 - secondsSinceLastOTP
            )} seconds before requesting another OTP.`,
        });
      }
    }


    // Generate new OTP

    const otp = generateOTP();

    const otpHash = hashOTP(otp);

    const expiresAt =
      new Date(Date.now() + 5 * 60 * 1000);


    user.emailOtpHash = otpHash;

    user.emailOtpExpiresAt = expiresAt;

    user.emailOtpAttempts = 0;

    user.emailOtpLastSentAt =
      new Date();


    await user.save();


    // Send email

    try {

      await sendOTPEmail(
        user.email,
        user.fullname,
        otp
      );

    } catch (emailError) {

      console.error(
        "Resend OTP email error:",
        emailError
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to send OTP email",
      });
    }


    return res.status(200).json({
      success: true,
      message: "New OTP sent successfully",
    });

  } catch (error) {

    console.error(
      "Resend OTP error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==================== LOGIN ====================

export const login = async (req, res) => {
  try {

    const {
      email,
      password,
    } = req.body;


    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }


    const cleanEmail =
      email.trim().toLowerCase();


    const user = await User.findOne({
      email: cleanEmail,
    });


    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }


    // Require email verification

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email before logging in.",
        requiresVerification: true,
        email: user.email,
      });
    }


    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );


    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }


    user.isOnline = true;

    user.lastSeen = null;


    await user.save();


    generateToken(
      user._id.toString(),
      res
    );


    return res.status(200).json({
      success: true,

      message: "Login successful",

      user: {
        id: user._id,

        fullname: user.fullname,

        username: user.username,

        email: user.email,

        profilePic: user.profilePic,

        isOnline: user.isOnline,
      },
    });

  } catch (error) {

    console.error(
      "Login error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==================== LOGOUT ====================

export const logout = async (req, res) => {
  try {

    if (req.user) {

      await User.findByIdAndUpdate(
        req.user._id,
        {
          isOnline: false,
          lastSeen: new Date(),
        }
      );
    }


    res.clearCookie("token");


    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });

  } catch (error) {

    console.error(
      "Logout error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==================== DELETE ACCOUNT ====================

export const deleteAccount = async (req, res) => {
  try {

    const userId = req.user._id;


    const user = await User.findById(
      userId
    );


    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }


    await User.findByIdAndDelete(
      userId
    );


    res.clearCookie("token");


    return res.status(200).json({
      success: true,
      message:
        "Account deleted successfully",
    });

  } catch (error) {

    console.error(
      "Delete account error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};