import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

const listUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Get all users
        const users = await User.find({}, 'firstName lastName email role createdAt');
        
        console.log('\n📋 All Users in Database:');
        console.log('=====================================');
        
        if (users.length === 0) {
            console.log('No users found. Please register a user first.');
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. ${user.firstName} ${user.lastName}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role || 'user'}`);
                console.log(`   Joined: ${user.createdAt.toDateString()}`);
                console.log('-----------------------------------');
            });
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

listUsers();
