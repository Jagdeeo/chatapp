import express from "express";

import {
  register,
  login,
  logout,
  deleteAccount,
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();


// ==================== REGISTER ====================
router.post("/register", register);


// ==================== LOGIN ====================
router.post("/login", login);


// ==================== LOGOUT ====================
router.post("/logout", protect, logout);


// ==================== DELETE ACCOUNT ====================
router.delete("/delete", protect, deleteAccount);


export default router;