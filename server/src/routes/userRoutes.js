import express from "express";
import { searchUsers, getProfile } from "../controllers/userController.js";

const router = express.Router();

// Routes for users
router.post("/search-users", searchUsers);
router.post("/get-profile", getProfile);

export default router;