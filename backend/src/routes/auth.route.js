import express from "express";
import {
  checkAuth, login, logout, signup, updateProfile,
  blockUser, unblockUser, muteChat, unmuteChat, savePushSubscription,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);

// Block / Unblock
router.post("/block/:id", protectRoute, blockUser);
router.delete("/block/:id", protectRoute, unblockUser);

// Mute / Unmute
router.post("/mute/:id", protectRoute, muteChat);
router.delete("/mute/:id", protectRoute, unmuteChat);

// Push notification subscription
router.post("/push-subscribe", protectRoute, savePushSubscription);

export default router;
