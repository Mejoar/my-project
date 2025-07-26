import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const register = async (req, res) => {
    try {
        const { firstName, lastName, email,  password } = req.body;
        if (!firstName || !lastName || !email ||  !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        const existingUserByEmail = await User.findOne({ email: email });

        if (existingUserByEmail) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        // const existingUserByUsername = await User.findOne({ userName: userName });

        // if (existingUserByUsername) {
        //     return res.status(400).json({ success: false, message: "Username already exists" });
        // }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword
        })

        return res.status(201).json({
            success: true,
            message: "Account Created Successfully"
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to register"
        })

    }
}

export const login = async(req, res) => {
    try {
        const {email,  password } = req.body;
        if (!email && !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        let user = await User.findOne({email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Incorrect email or password"
            })
        }
       
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(400).json({ 
                success: false, 
                message: "Invalid Credentials" 
            })
        }
        
        const token = await jwt.sign({userId:user._id}, process.env.SECRET_KEY, { expiresIn: '1d' })
        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpsOnly: true, sameSite: "strict" }).json({
            success:true,
            message:`Welcome back ${user.firstName}`,
            user
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to Login",           
        })
    }
  
}

export const logout = async (_, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

export const updateProfile = async(req, res) => {
    try {
        const userId= req.id
        const {firstName, lastName, occupation, bio, instagram, facebook, linkedin, github} = req.body;
        const file = req.file;

        let cloudResponse;
        if (file) {
            try {
                const fileUri = getDataUri(file)
                cloudResponse = await cloudinary.uploader.upload(fileUri)
                console.log("✅ Cloudinary upload successful:", cloudResponse.secure_url);
            } catch (cloudinaryError) {
                console.log("❌ Cloudinary upload failed:", cloudinaryError.message);
                console.log("💡 Falling back to local storage...");
                
                // Save file locally as fallback
                try {
                    const timestamp = Date.now();
                    const fileExtension = path.extname(file.originalname) || '.jpg';
                    const filename = `profile-${userId}-${timestamp}${fileExtension}`;
                    const uploadPath = path.join(__dirname, '../public/uploads', filename);
                    
                    // Write file to local storage
                    await fs.promises.writeFile(uploadPath, file.buffer);
                    
                    cloudResponse = {
                        secure_url: `http://localhost:3000/uploads/${filename}`
                    };
                    console.log("✅ Local file saved:", cloudResponse.secure_url);
                } catch (localError) {
                    console.log("❌ Local file save failed:", localError.message);
                    cloudResponse = null;
                }
            }
        }

        const user = await User.findById(userId).select("-password")
        
        if(!user){
            return res.status(404).json({
                message:"User not found",
                success:false
            })
        }

        // updating data
        if(firstName) user.firstName = firstName
        if(lastName) user.lastName = lastName
        if(occupation) user.occupation = occupation
        if(instagram) user.instagram = instagram
        if(facebook) user.facebook = facebook
        if(linkedin) user.linkedin = linkedin
        if(github) user.github = github
        if(bio) user.bio = bio
        if(file && cloudResponse?.secure_url) user.photoUrl = cloudResponse.secure_url

        await user.save()
        return res.status(200).json({
            message:"profile updated successfully",
            success:true,
            user
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile"
        })
    }
}

export const getProfile = async (req, res) => {
  try {
    const userId = req.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Failed to get profile"
    });
  }
};

export const getAllUsers = async (req, res) => {
    try {
      const users = await User.find().select('-password'); // exclude password field
      res.status(200).json({
        success: true,
        message: "User list fetched successfully",
        total: users.length,
        users
      });
    } catch (error) {
      console.error("Error fetching user list:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch users"
      });
    }
  };

export const createAdminUser = async (req, res) => {
    try {
        // Check if admin user already exists
        const existingAdmin = await User.findOne({ email: 'admin@example.com' });
        
        if (existingAdmin) {
            // Update existing user to be superadmin
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.findOneAndUpdate(
                { email: 'admin@example.com' },
                { 
                    password: hashedPassword,
                    role: 'superadmin',
                    firstName: existingAdmin.firstName || 'Admin',
                    lastName: existingAdmin.lastName || 'User'
                }
            );
            
            return res.status(200).json({
                success: true,
                message: 'Admin user updated successfully',
                admin: {
                    email: 'admin@example.com',
                    password: 'admin123',
                    role: 'superadmin'
                }
            });
        } else {
            // Create new admin user
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            const newAdmin = new User({
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'superadmin'
            });
            
            await newAdmin.save();
            
            return res.status(201).json({
                success: true,
                message: 'Admin user created successfully',
                admin: {
                    email: 'admin@example.com',
                    password: 'admin123',
                    role: 'superadmin'
                }
            });
        }
    } catch (error) {
        console.error('Error creating admin user:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create admin user'
        });
    }
};
