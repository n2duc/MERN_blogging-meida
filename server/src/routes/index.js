import express from "express";
import authRoute from "./authRoutes.js";
import blogRoute from "./blogRoutes.js";
import userRoute from "./userRoutes.js";

const router = express.Router();

// Routes for authentication
router.use("/auth", authRoute);
router.use("/blog", blogRoute);
router.use("/user", userRoute);

export default router;