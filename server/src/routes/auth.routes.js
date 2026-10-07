import express from "express";

import {
  register,
  login,
  verifyEmailOTP,
  resendEmailOTP,
  logout,
  deleteAccount,
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";


const router = express.Router();


// ==================== AUTH ====================

router.post( "/register",register);

router.post("/verify-email",verifyEmailOTP);

router.post("/resend-otp",resendEmailOTP);

router.post("/login",login);


// ==================== PROTECTED ====================

router.post("/logout",protect,logout);

router.delete("/delete",protect,deleteAccount);


export default router;