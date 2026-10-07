import express from "express";

import {
  createPrivateChat,
  createGroupChat,
  getMyChats,
  getChatById,
  addMembers,
  removeMember,
  leaveGroup,
  deleteChat,
} from "../controllers/chat.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();


// ==================== CREATE PRIVATE CHAT ====================
router.post("/private", protect, createPrivateChat);


// ==================== CREATE GROUP CHAT ====================
router.post("/group", protect, createGroupChat);


// ==================== GET MY CHATS ====================
router.get("/", protect, getMyChats);


// ==================== GET CHAT BY ID ====================
router.get("/:id", protect, getChatById);


// ==================== ADD MEMBERS ====================
router.post("/:id/members", protect, addMembers);


// ==================== REMOVE MEMBER ====================
router.delete("/:id/members/:userId", protect, removeMember);


// ==================== LEAVE GROUP ====================
router.post("/:id/leave", protect, leaveGroup);


// ==================== DELETE CHAT ====================
router.delete("/:id", protect, deleteChat);


export default router;