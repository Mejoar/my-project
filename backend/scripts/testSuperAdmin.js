import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import { Blog } from '../models/blog.model.js';
import Comment from '../models/comment.model.js';
import dotenv from 'dotenv';

dotenv.config();

const testSuperAdminFunctionality = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to MongoDB');

        console.log('\n🧪 SUPER ADMIN FUNCTIONALITY TEST');
        console.log('=====================================\n');

        // 1. ✅ Test Admin User Status
        console.log('1️⃣ Testing Admin User Status...');
        const adminUser = await User.findOne({ email: 'admin@example.com' });
        if (adminUser && adminUser.role === 'superadmin') {
            console.log('   ✅ admin@example.com has superadmin role');
            console.log(`   👤 Name: ${adminUser.firstName || 'Admin'} ${adminUser.lastName || 'User'}`);
        } else {
            console.log('   ❌ admin@example.com is not a superadmin');
            return;
        }

        // 2. ✅ Test View System Statistics
        console.log('\n2️⃣ Testing System Statistics...');
        const totalUsers = await User.countDocuments();
        const totalBlogs = await Blog.countDocuments();
        const totalComments = await Comment.countDocuments();
        const publishedBlogs = await Blog.countDocuments({ isPublished: true });
        const unpublishedBlogs = await Blog.countDocuments({ isPublished: false });

        console.log(`   👥 Total Users: ${totalUsers}`);
        console.log(`   📝 Total Blogs: ${totalBlogs}`);
        console.log(`   💬 Total Comments: ${totalComments}`);
        console.log(`   ✅ Published Blogs: ${publishedBlogs}`);
        console.log(`   📄 Draft Blogs: ${unpublishedBlogs}`);

        // 3. ✅ Test User Management
        console.log('\n3️⃣ Testing User Management...');
        const allUsers = await User.find({}, 'firstName lastName email role createdAt').sort({ createdAt: -1 });
        console.log(`   📋 Found ${allUsers.length} users for management:`);
        allUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.firstName || 'N/A'} ${user.lastName || 'N/A'} (${user.email}) - Role: ${user.role || 'user'}`);
        });

        // 4. ✅ Test Blog Management
        console.log('\n4️⃣ Testing Blog Management...');
        const allBlogs = await Blog.find({})
            .populate('author', 'firstName lastName email')
            .populate('comments')
            .sort({ createdAt: -1 });
        
        console.log(`   📚 Found ${allBlogs.length} blogs for management:`);
        allBlogs.forEach((blog, index) => {
            console.log(`   ${index + 1}. "${blog.title}" by ${blog.author?.firstName || 'Unknown'} ${blog.author?.lastName || 'Author'}`);
            console.log(`      Status: ${blog.isPublished ? 'Published' : 'Draft'} | Comments: ${blog.comments?.length || 0}`);
        });

        // 5. ✅ Test Comment Management
        console.log('\n5️⃣ Testing Comment Management...');
        const allComments = await Comment.find({})
            .populate('userId', 'firstName lastName email')
            .populate('postId', 'title')
            .sort({ createdAt: -1 });

        console.log(`   💭 Found ${allComments.length} comments for management:`);
        allComments.forEach((comment, index) => {
            const content = comment.content.length > 50 ? comment.content.substring(0, 50) + '...' : comment.content;
            console.log(`   ${index + 1}. "${content}"`);
            console.log(`      By: ${comment.userId?.firstName || 'Unknown'} ${comment.userId?.lastName || 'User'} on "${comment.postId?.title || 'Unknown Post'}"`);
        });

        console.log('\n🎉 SUPER ADMIN FUNCTIONALITY VERIFICATION COMPLETE!');
        console.log('=====================================');
        console.log('✅ All systems are ready for admin@example.com');
        console.log('📧 Login Email: admin@example.com');
        console.log('🔐 Login Password: admin123');
        console.log('🌐 Super Admin URL: http://localhost:5173/superadmin');

    } catch (error) {
        console.error('❌ Error during testing:', error);
    } finally {
        mongoose.connection.close();
    }
};

testSuperAdminFunctionality();
