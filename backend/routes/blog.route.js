import express from "express"

import { isAuthenticated } from "../middleware/isAuthenticated.js"
import { singleUpload } from "../middleware/multer.js"
import {createBlog, deleteBlog, dislikeBlog, getAllBlogs, getBlogById, getMyTotalBlogLikes, getOwnBlogs, getPublishedBlog, likeBlog, togglePublishBlog, updateBlog } from "../controllers/blog.controller.js"

const router = express.Router()

router.route("/").post(isAuthenticated, createBlog)
router.route("/:blogId").put(isAuthenticated, singleUpload, updateBlog)
router.route("/:blogId").patch(togglePublishBlog);
router.route("/get-all-blogs").get(getAllBlogs)
router.route("/get-published-blogs").get(getPublishedBlog)
router.route("/get-blog/:id").get(getBlogById)
router.route("/get-own-blogs").get(isAuthenticated, getOwnBlogs)
router.route("/delete/:id").delete(isAuthenticated, deleteBlog);
router.get("/:id/like", isAuthenticated, likeBlog);
router.get("/:id/dislike", isAuthenticated, dislikeBlog);
router.get('/my-blogs/likes', isAuthenticated, getMyTotalBlogLikes)
router.get('/debug/thumbnails', async (req, res) => {
  try {
    const { Blog } = await import('../models/blog.model.js');
    const blogs = await Blog.find({}, 'title thumbnail').limit(10);
    res.json({ blogs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
