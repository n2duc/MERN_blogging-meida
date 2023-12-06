import express from "express";
import { signup, signin, googleAuth } from "../controllers/authController.js";

const router = express.Router();

// Routes for authentication
router.post("/signup", signup);
router.post("/signin", signin);
router.post("/google-auth", googleAuth);

export default router;
