import express from "express";

import {
  getMyProfile,
  getUserById,
  getAllUsers,
  searchUsers,
  updateProfile,
  updateOnlineStatus,
} from "../controllers/user.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();


// ==================== MY PROFILE ====================
router.get("/me", protect, getMyProfile);


// ==================== SEARCH USERS ====================
router.get("/search", protect, searchUsers);


// ==================== GET ALL USERS ====================
router.get("/", protect, getAllUsers);


// ==================== GET USER BY ID ====================
router.get("/:id", protect, getUserById);


// ==================== UPDATE PROFILE ====================
router.put("/profile", protect, updateProfile);


// ==================== UPDATE ONLINE STATUS ====================
router.patch("/online-status", protect, updateOnlineStatus);


export default router;