import mongoose from 'mongoose';
import { User } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const adminAccess = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Check admin@example.com details
        const adminUser = await User.findOne({ email: 'admin@example.com' });
        
        if (adminUser) {
            console.log('\n📋 Admin User Found:');
            console.log('=====================================');
            console.log(`Name: ${adminUser.firstName || 'Not set'} ${adminUser.lastName || 'Not set'}`);
            console.log(`Email: ${adminUser.email}`);
            console.log(`Role: ${adminUser.role}`);
            console.log(`Created: ${adminUser.createdAt}`);
            console.log('Password: [HASHED - Cannot be displayed]');
            
            console.log('\n🔧 Options:');
            console.log('1. Reset password for admin@example.com');
            console.log('2. Create a new super admin account');
            console.log('3. Use an existing account');
            
            // Option 1: Reset password for admin@example.com
            console.log('\n🔑 Resetting password for admin@example.com to "admin123"...');
            
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.findOneAndUpdate(
                { email: 'admin@example.com' },
                { 
                    password: hashedPassword,
                    role: 'superadmin',
                    firstName: adminUser.firstName || 'Admin',
                    lastName: adminUser.lastName || 'User'
                }
            );
            
            console.log('✅ Password reset successful!');
            console.log('📧 Email: admin@example.com');
            console.log('🔐 Password: admin123');
            console.log('👑 Role: superadmin');
            
        } else {
            console.log('❌ Admin user not found.');
            
            // Create new admin user
            console.log('\n🆕 Creating new admin user...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            const newAdmin = new User({
                firstName: 'Admin',
                lastName: 'User', 
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'superadmin'
            });
            
            await newAdmin.save();
            console.log('✅ New admin user created!');
            console.log('📧 Email: admin@example.com');
            console.log('🔐 Password: admin123');
            console.log('👑 Role: superadmin');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        mongoose.connection.close();
    }
};

adminAccess();
