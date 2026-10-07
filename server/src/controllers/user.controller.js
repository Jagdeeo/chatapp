import User from "../models/User.model.js";

// ==================== GET MY PROFILE ====================
export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get my profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==================== GET USER BY ID ====================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password -email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==================== GET ALL USERS ====================
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({
      _id: { $ne: req.user._id },
    })
      .select("-password -email")
      .sort({ fullname: 1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==================== SEARCH USERS ====================
export const searchUsers = async (req, res) => {
  try {
    const { search } = req.query;

    if (!search || search.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const users = await User.find({
      _id: { $ne: req.user._id },

      $or: [
        {
          fullname: {
            $regex: search,
            $options: "i",
          },
        },
        {
          username: {
            $regex: search,
            $options: "i",
          },
        },
      ],
    })
      .select("-password -email")
      .limit(20);

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Search users error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==================== UPDATE PROFILE ====================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const { fullname, username, bio, profilePic } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update only provided fields
    if (fullname !== undefined) {
      user.fullname = fullname.trim();
    }

    if (username !== undefined) {
      const existingUsername = await User.findOne({
        username: username.toLowerCase().trim(),
        _id: { $ne: userId },
      });

      if (existingUsername) {
        return res.status(409).json({
          success: false,
          message: "Username already exists",
        });
      }

      user.username = username.toLowerCase().trim();
    }

    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    if (profilePic !== undefined) {
      user.profilePic = profilePic;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",

      user: {
        id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        bio: user.bio,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==================== UPDATE ONLINE STATUS ====================
export const updateOnlineStatus = async (req, res) => {
  try {
    const { isOnline } = req.body;

    if (typeof isOnline !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isOnline must be true or false",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        isOnline,
        lastSeen: isOnline ? null : new Date(),
      },
      {
        new: true,
      },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Online status updated",
      user,
    });
  } catch (error) {
    console.error("Update online status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
