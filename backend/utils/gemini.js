import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateBlogContent = async (prompt, type = 'content') => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let systemPrompt = "";
        
        switch (type) {
            case 'title':
                systemPrompt = `Generate a compelling, SEO-friendly blog post title based on this topic or idea: "${prompt}". 
                Return only the title, nothing else. Make it engaging and clickable.`;
                break;
                
            case 'content':
                systemPrompt = `Write a comprehensive, well-structured blog post about: "${prompt}". 
                Include:
                - An engaging introduction
                - Well-organized main content with subheadings
                - Practical examples or insights
                - A strong conclusion
                Format it in clean, readable paragraphs. Use HTML tags like <h2>, <h3>, <p>, <ul>, <li> for structure.`;
                break;
                
            case 'summary':
                systemPrompt = `Create a compelling, concise summary (2-3 sentences) for a blog post about: "${prompt}". 
                This will be used as a meta description and preview. Make it engaging and informative.`;
                break;
                
            case 'tags':
                systemPrompt = `Generate 5-8 relevant tags/keywords for a blog post about: "${prompt}". 
                Return them as a comma-separated list. Focus on SEO-friendly, searchable terms.`;
                break;
                
            case 'improve':
                systemPrompt = `Improve and enhance this blog content while maintaining its core message: "${prompt}". 
                Make it more engaging, add better structure, fix grammar, and enhance readability. 
                Use HTML tags like <h2>, <h3>, <p>, <ul>, <li> for proper formatting.`;
                break;
                
            default:
                systemPrompt = prompt;
        }

        const result = await model.generateContent(systemPrompt);
        const response = await result.response;
        const text = response.text();

        return {
            success: true,
            content: text.trim(),
            type: type
        };

    } catch (error) {
        console.error('Gemini AI Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate content',
            type: type
        };
    }
};

export const generateBlogIdeas = async (topic) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `Generate 10 creative and engaging blog post ideas related to: "${topic}".
        Format each idea as:
        1. [Title] - [Brief description]
        
        Make them diverse, interesting, and suitable for different audiences.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return {
            success: true,
            ideas: text.trim()
        };

    } catch (error) {
        console.error('Gemini AI Error:', error);
        return {
            success: false,
            error: error.message || 'Failed to generate blog ideas'
        };
    }
};

export default { generateBlogContent, generateBlogIdeas };
