import Message from "../models/message.model.js";
import User from "../models/User.model.js";

// ==================== SEND MESSAGE ====================
export const sendMessage = async (req, res) => {
  try {
    const { receiver, message, messageType, fileUrl } = req.body;

    // Check receiver
    if (!receiver) {
      return res.status(400).json({
        success: false,
        message: "Receiver is required",
      });
    }

    // Check message for text messages
    if (
      (!message || message.trim() === "") && (!fileUrl || fileUrl.trim() === "")) {
      return res.status(400).json({
        success: false,
        message: "Message or file is required",
      });
    }

    // Check receiver exists
    const receiverUser = await User.findById(receiver);

    if (!receiverUser) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found",
      });
    }

    // Prevent sending message to yourself
    if (req.user._id.toString() === receiver.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a message to yourself",
      });
    }

    // Create message
    const newMessage = await Message.create({
      sender: req.user._id,
      receiver,
      message: message?.trim() || "",
      messageType: messageType || "text",
      fileUrl: fileUrl || "",
    });

    // Populate sender and receiver
    const populatedMessage = await Message.findById(newMessage._id)
      .populate("sender", "fullname username profilePic")
      .populate("receiver", "fullname username profilePic");

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==================== GET CHAT MESSAGES ====================
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check user exists
    const otherUser = await User.findById(userId);

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get messages between current user and other user
    const messages = await Message.find({
      $or: [
        {
          sender: req.user._id,
          receiver: userId,
        },
        {
          sender: userId,
          receiver: req.user._id,
        },
      ],
    })
      .populate("sender", "fullname username profilePic")
      .populate("receiver", "fullname username profilePic")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Get messages error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==================== GET SINGLE MESSAGE ====================
export const getMessageById = async (req, res) => {
  try {
  
    const { id } = req.params;
    const message = await Message.findById(id)
      .populate("sender", "fullname username profilePic")
      .populate("receiver", "fullname username profilePic");

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if current user belongs to this conversation
    const userId = req.user._id.toString();

    if (
      message.sender._id.toString() !== userId &&
      message.receiver._id.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot access this message",
      });
    }

    return res.status(200).json({
      success: true,
      message,
    });
  } catch (error) {
    console.error("Get message error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==================== MARK MESSAGE AS SEEN ====================
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only receiver can mark message as seen
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Only the receiver can mark this message as seen",
      });
    }

    message.isSeen = true;
    message.seenAt = new Date();

    await message.save();

    return res.status(200).json({
      success: true,
      message: "Message marked as seen",
      data: message,
    });
  } catch (error) {
    console.error("Mark message seen error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==================== DELETE MESSAGE ====================
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only sender can delete message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      });
    }

    await Message.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};