import express from "express";
import { createBlog, latestBlogs, trendingBlogs } from "../controllers/blogController.js";

const router = express.Router();

// Routes for blogs
router.post("/create-blog", createBlog);
router.post("/latest-blogs", latestBlogs);
router.get("/trending-blogs", trendingBlogs);

export default router;