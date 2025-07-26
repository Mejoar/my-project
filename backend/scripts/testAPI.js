// Quick manual test of our API endpoints
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testAPI = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('🔌 Connected to MongoDB');

        // Test if server is running by making a direct call
        try {
            const testResponse = await fetch('http://localhost:3000/api/v1/user/all-users');
            const testData = await testResponse.json();
            console.log('📋 User API test:', testData);
        } catch (fetchError) {
            console.log('❌ Cannot reach backend server at localhost:3000');
            console.log('   Make sure: cd backend && npm start');
        }

        // Test database directly
        const { User } = await import('../models/user.model.js');
        const users = await User.find({}, 'firstName lastName email role');
        console.log('\n📊 Direct Database Query:');
        console.log(`Found ${users.length} users:`);
        users.forEach(user => {
            console.log(`- ${user.firstName || 'N/A'} ${user.lastName || 'N/A'} (${user.email}) - Role: ${user.role || 'user'}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

testAPI();
