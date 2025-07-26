import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const createSuperAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // You can either:
        // 1. Update an existing user by email
        const email = 'wachirachris1234@gmail.com'; // Your email
        
        const updatedUser = await User.findOneAndUpdate(
            { email: email },
            { role: 'superadmin' },
            { new: true }
        );

        if (updatedUser) {
            console.log(`✅ User ${updatedUser.firstName} ${updatedUser.lastName} (${updatedUser.email}) is now a Super Admin!`);
        } else {
            console.log(`❌ User with email ${email} not found.`);
            console.log('Available users:');
            const users = await User.find({}, 'firstName lastName email role');
            users.forEach(user => {
                console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role || 'user'}`);
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

createSuperAdmin();
