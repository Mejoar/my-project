import express from "express";
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import {
    isSuperAdmin,
    getAllUsers,
    deleteUser,
    getAllBlogsAdmin,
    deleteBlogAdmin,
    getAllComments,
    deleteCommentAdmin,
    getDashboardStats,
    updateUserRole
} from "../controllers/superAdmin.controller.js";

const router = express.Router();

// All routes require authentication and super admin privileges
router.use(isAuthenticated, isSuperAdmin);

// Dashboard stats
router.get('/dashboard/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.delete('/users/:userId', deleteUser);
router.put('/users/:userId/role', updateUserRole);

// Blog management
router.get('/blogs', getAllBlogsAdmin);
router.delete('/blogs/:blogId', deleteBlogAdmin);

// Comment management
router.get('/comments', getAllComments);
router.delete('/comments/:commentId', deleteCommentAdmin);

export default router;
