import express from "express";
import {
  forgotPassword,
    getUserProfile,
  login,
  logout,
  register,
  resetPassword,
  verifyAccount,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/verity-otp", verifyAccount);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.get("/my-profile", isAuthenticated, getUserProfile);
router.post("/password/forgot", forgotPassword);
router.put("/password/reset/:token", resetPassword);

export default router;
