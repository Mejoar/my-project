import express from 'express';
import { generateContent, generateIdeas, improveContent } from '../controllers/ai.controller.js';
import { isAuthenticated } from '../middleware/isAuthenticated.js';

const router = express.Router();

// Generate blog content (title, content, summary, tags)
router.post('/generate', isAuthenticated, generateContent);

// Generate blog ideas based on topic
router.post('/ideas', isAuthenticated, generateIdeas);

// Improve existing content
router.post('/improve', isAuthenticated, improveContent);

export default router;
