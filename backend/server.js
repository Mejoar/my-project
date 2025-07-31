import express from "express"
import dotenv from "dotenv"
import connectDB from "./database/db.js"
import userRoute from "./routes/user.route.js"
import blogRoute from "./routes/blog.route.js"
import commentRoute from "./routes/comment.route.js"
import superAdminRoute from "./routes/superAdmin.route.js"
import aiRoute from "./routes/ai.route.js"
import cookieParser from 'cookie-parser';
import cors from 'cors'
import path from "path"

dotenv.config()
const app = express()

const PORT = process.env.PORT || 3000


// default middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin: [
        "http://localhost:5173", 
        "http://localhost:3000", 
        "https://my-project-eta-green.vercel.app",
        "https://my-project-vzyy.onrender.com"  // Add backend URL for health checks
    ],
    credentials: true
}))

const _dirname = path.resolve()

// Debug log to check if files are being served
app.use('/uploads', (req, res, next) => {
    console.log('Serving static file:', req.url);
    next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(_dirname, 'backend', 'public', 'uploads')));

// API routes MUST come before static file serving
app.use("/api/v1/user", userRoute)
app.use("/api/v1/blog", blogRoute)
app.use("/api/v1/comment", commentRoute)
app.use("/api/v1/superadmin", superAdminRoute)
app.use("/api/v1/ai", aiRoute)

// Add a test endpoint to verify API is working
app.get('/api/health', (req, res) => {
    res.json({ message: 'API is healthy', timestamp: new Date().toISOString() });
});

// Only serve static files in production - AFTER API routes
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(_dirname,"/frontend/dist")));
    
    // Catch-all handler: send back React's index.html file for non-API routes
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(_dirname, "frontend", "dist", "index.html"));
    });
} else {
    app.get("/", (req, res) => {
        res.json({ message: "API is running in development mode" });
    });
}

app.listen(PORT, ()=>{
    console.log(`Server listen at port ${PORT}`);
    connectDB()
})
