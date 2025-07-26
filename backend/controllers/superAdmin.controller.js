import { Blog } from "../models/blog.model.js";
import { User } from "../models/user.model.js";
import Comment from "../models/comment.model.js";

// Middleware to check if user is super admin
export const isSuperAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.id);
        if (!user || user.role !== 'superadmin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Super admin privileges required."
            });
        }
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error verifying super admin status"
        });
    }
};

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, '-password').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            users,
            totalUsers: users.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching users",
            error: error.message
        });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Don't allow deleting super admin users
        const userToDelete = await User.findById(userId);
        if (userToDelete.role === 'superadmin') {
            return res.status(403).json({
                success: false,
                message: "Cannot delete super admin user"
            });
        }

        // Delete user's blogs
        await Blog.deleteMany({ author: userId });
        
        // Delete user's comments
        await Comment.deleteMany({ userId: userId });
        
        // Delete the user
        await User.findByIdAndDelete(userId);
        
        res.status(200).json({
            success: true,
            message: "User and all their content deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting user",
            error: error.message
        });
    }
};

// Get all blogs (including unpublished)
export const getAllBlogsAdmin = async (req, res) => {
    try {
        const blogs = await Blog.find({})
            .sort({ createdAt: -1 })
            .populate('author', 'firstName lastName email')
            .populate({
                path: 'comments',
                populate: {
                    path: 'userId',
                    select: 'firstName lastName email'
                }
            });
        
        res.status(200).json({
            success: true,
            blogs,
            totalBlogs: blogs.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching blogs",
            error: error.message
        });
    }
};

// Delete blog (admin)
export const deleteBlogAdmin = async (req, res) => {
    try {
        const { blogId } = req.params;
        
        // Delete blog
        await Blog.findByIdAndDelete(blogId);
        
        // Delete related comments
        await Comment.deleteMany({ postId: blogId });
        
        res.status(200).json({
            success: true,
            message: "Blog and related comments deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting blog",
            error: error.message
        });
    }
};

// Get all comments
export const getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find({})
            .sort({ createdAt: -1 })
            .populate('userId', 'firstName lastName email')
            .populate('postId', 'title');
        
        res.status(200).json({
            success: true,
            comments,
            totalComments: comments.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching comments",
            error: error.message
        });
    }
};

// Delete comment (admin)
export const deleteCommentAdmin = async (req, res) => {
    try {
        const { commentId } = req.params;
        
        await Comment.findByIdAndDelete(commentId);
        
        res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting comment",
            error: error.message
        });
    }
};

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalBlogs = await Blog.countDocuments();
        const totalComments = await Comment.countDocuments();
        const publishedBlogs = await Blog.countDocuments({ isPublished: true });
        const unpublishedBlogs = await Blog.countDocuments({ isPublished: false });
        
        // Recent activity
        const recentUsers = await User.find({}, 'firstName lastName createdAt')
            .sort({ createdAt: -1 })
            .limit(5);
        
        const recentBlogs = await Blog.find({}, 'title createdAt')
            .populate('author', 'firstName lastName')
            .sort({ createdAt: -1 })
            .limit(5);
        
        res.status(200).json({
            success: true,
            stats: {
                totalUsers,
                totalBlogs,
                totalComments,
                publishedBlogs,
                unpublishedBlogs
            },
            recentActivity: {
                recentUsers,
                recentBlogs
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching dashboard stats",
            error: error.message
        });
    }
};

// Update user role
export const updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;
        
        if (!['user', 'admin', 'superadmin'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role specified"
            });
        }
        
        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true, select: '-password' }
        );
        
        res.status(200).json({
            success: true,
            message: "User role updated successfully",
            user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating user role",
            error: error.message
        });
    }
};
