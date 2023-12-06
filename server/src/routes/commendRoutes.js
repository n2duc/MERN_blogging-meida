import express from "express";
import commentController from "../controllers/commentController.js";

const router = express.Router();

// Routes for authentication
router.use("/create", commentController.createComment);
router.use("/delete", commentController.deleteComment);
router.use("/get-comment", commentController.getComments);
router.use("/get-replies", commentController.getReplies);

export default router;