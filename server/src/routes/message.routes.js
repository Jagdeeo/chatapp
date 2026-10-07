import express from "express";

import {
  sendMessage,
  getMessages,
  getMessageById,
  markMessageAsSeen,
  deleteMessage,
} from "../controllers/message.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();


// ==================== SEND MESSAGE ====================
router.post("/", protect, sendMessage);


// ==================== GET CHAT MESSAGES ====================
router.get("/chat/:userId", protect, getMessages);


// ==================== GET SINGLE MESSAGE ====================
router.get("/:id", protect, getMessageById);


// ==================== MARK MESSAGE AS SEEN ====================
router.patch("/:id/seen", protect, markMessageAsSeen);


// ==================== DELETE MESSAGE ====================
router.delete("/:id", protect, deleteMessage);


export default router;