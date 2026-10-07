import Chat from "../models/chat.model.js";
import User from "../models/User.model.js";
import Message from "../models/message.model.js";

// ==================== CREATE PRIVATE CHAT ====================
export const createPrivateChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Prevent chatting with yourself
    if (req.user._id.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot create a chat with yourself",
      });
    }

    // Check user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if private chat already exists
    const existingChat = await Chat.findOne({
      chatType: "private",
      participants: {
        $all: [req.user._id, userId],
      },
    }).populate(
      "participants",
      "fullname username profilePic isOnline lastSeen"
    );

    if (existingChat) {
      return res.status(200).json({
        success: true,
        message: "Chat already exists",
        chat: existingChat,
      });
    }

    // Create chat
    const chat = await Chat.create({
      chatType: "private",
      participants: [req.user._id, userId],
    });

    const populatedChat = await Chat.findById(chat._id).populate(
      "participants",
      "fullname username profilePic isOnline lastSeen"
    );

    return res.status(201).json({
      success: true,
      message: "Private chat created",
      chat: populatedChat,
    });
  } catch (error) {
    console.error("Create private chat error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==================== CREATE GROUP CHAT ====================
export const createGroupChat = async (req, res) => {
  try {
    const { groupName, members, groupImage } = req.body;

    if (!groupName || groupName.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Group name is required",
      });
    }

    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one member is required",
      });
    }

    // Remove duplicate members
    const uniqueMembers = [
      ...new Set(members.map((id) => id.toString())),
    ];

    // Add creator
    const participants = [
      req.user._id.toString(),
      ...uniqueMembers.filter(
        (id) => id !== req.user._id.toString()
      ),
    ];

    // Check all users exist
    const users = await User.find({
      _id: { $in: participants },
    });

    if (users.length !== participants.length) {
      return res.status(404).json({
        success: false,
        message: "One or more users were not found",
      });
    }

    // Create group
    const chat = await Chat.create({
      chatType: "group",
      participants,
      groupName: groupName.trim(),
      groupAdmin: req.user._id,
      groupImage: groupImage || "",
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate(
        "participants",
        "fullname username profilePic isOnline lastSeen"
      )
      .populate(
        "groupAdmin",
        "fullname username profilePic"
      );

    return res.status(201).json({
      success: true,
      message: "Group created successfully",
      chat: populatedChat,
    });
  } catch (error) {
    console.error("Create group error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==================== GET MY CHATS ====================
export const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
    })
      .populate(
        "participants",
        "fullname username profilePic isOnline lastSeen"
      )
      .populate(
        "groupAdmin",
        "fullname username profilePic"
      )
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "fullname username profilePic",
        },
      })
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: chats.length,
      chats,
    });
  } catch (error) {
    console.error("Get my chats error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==================== GET CHAT BY ID ====================
export const getChatById = async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await Chat.findById(id)
      .populate(
        "participants",
        "fullname username profilePic isOnline lastSeen"
      )
      .populate(
        "groupAdmin",
        "fullname username profilePic"
      )
      .populate({
        path: "lastMessage",
        populate: {
          path: "sender",
          select: "fullname username profilePic",
        },
      });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Check whether current user belongs to chat
    const isParticipant = chat.participants.some(
      (user) => user._id.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this chat",
      });
    }

    return res.status(200).json({
      success: true,
      chat,
    });
  } catch (error) {
    console.error("Get chat error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==================== ADD MEMBERS ====================
export const addMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const { members } = req.body;

    if (!Array.isArray(members) || members.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Members are required",
      });
    }

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (chat.chatType !== "group") {
      return res.status(400).json({
        success: false,
        message: "Members can only be added to groups",
      });
    }

    // Only group admin can add members
    if (
      chat.groupAdmin.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only group admin can add members",
      });
    }

    // Check users
    const users = await User.find({
      _id: { $in: members },
    });

    if (users.length !== members.length) {
      return res.status(404).json({
        success: false,
        message: "One or more users were not found",
      });
    }

    // Add only users who aren't already members
    const currentMembers = chat.participants.map((id) =>
      id.toString()
    );

    const newMembers = members.filter(
      (id) => !currentMembers.includes(id.toString())
    );

    chat.participants.push(...newMembers);

    await chat.save();

    const updatedChat = await Chat.findById(id)
      .populate(
        "participants",
        "fullname username profilePic isOnline lastSeen"
      )
      .populate(
        "groupAdmin",
        "fullname username profilePic"
      );

    return res.status(200).json({
      success: true,
      message: "Members added successfully",
      chat: updatedChat,
    });
  } catch (error) {
    console.error("Add members error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==================== REMOVE MEMBER ====================
export const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (chat.chatType !== "group") {
      return res.status(400).json({
        success: false,
        message: "This is not a group chat",
      });
    }

    // Only admin can remove members
    if (
      chat.groupAdmin.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Only group admin can remove members",
      });
    }

    // Admin cannot remove himself
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot remove himself",
      });
    }

    chat.participants = chat.participants.filter(
      (member) => member.toString() !== userId
    );

    await chat.save();

    return res.status(200).json({
      success: true,
      message: "Member removed successfully",
    });
  } catch (error) {
    console.error("Remove member error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==================== LEAVE GROUP ====================
export const leaveGroup = async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    if (chat.chatType !== "group") {
      return res.status(400).json({
        success: false,
        message: "This is not a group chat",
      });
    }

    // Admin cannot leave without transferring ownership
    if (
      chat.groupAdmin.toString() ===
      req.user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Admin cannot leave. Transfer admin role first.",
      });
    }

    chat.participants = chat.participants.filter(
      (member) =>
        member.toString() !== req.user._id.toString()
    );

    await chat.save();

    return res.status(200).json({
      success: true,
      message: "You left the group",
    });
  } catch (error) {
    console.error("Leave group error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==================== DELETE CHAT ====================
export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;

    const chat = await Chat.findById(id);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Check membership
    const isParticipant = chat.participants.some(
      (userId) =>
        userId.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this chat",
      });
    }

    // Delete messages belonging to private chat
    if (chat.chatType === "private") {
      const userIds = chat.participants;

      await Message.deleteMany({
        $or: [
          {
            sender: userIds[0],
            receiver: userIds[1],
          },
          {
            sender: userIds[1],
            receiver: userIds[0],
          },
        ],
      });
    }

    await Chat.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("Delete chat error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};