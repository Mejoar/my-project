import { generateBlogContent, generateBlogIdeas } from '../utils/gemini.js';

export const generateContent = async (req, res) => {
    try {
        const { prompt, type = 'content' } = req.body;

        if (!prompt) {
            return res.status(400).json({
                success: false,
                message: 'Prompt is required'
            });
        }

        console.log(`🤖 Generating ${type} for prompt: "${prompt.substring(0, 50)}..."`);

        const result = await generateBlogContent(prompt, type);

        if (result.success) {
            console.log(`✅ Successfully generated ${type}`);
            return res.status(200).json({
                success: true,
                message: `${type} generated successfully`,
                data: result.content,
                type: result.type
            });
        } else {
            console.error(`❌ Failed to generate ${type}:`, result.error);
            return res.status(500).json({
                success: false,
                message: result.error || `Failed to generate ${type}`
            });
        }

    } catch (error) {
        console.error('AI Controller Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const generateIdeas = async (req, res) => {
    try {
        const { topic } = req.body;

        if (!topic) {
            return res.status(400).json({
                success: false,
                message: 'Topic is required'
            });
        }

        console.log(`💡 Generating blog ideas for topic: "${topic}"`);

        const result = await generateBlogIdeas(topic);

        if (result.success) {
            console.log('✅ Successfully generated blog ideas');
            return res.status(200).json({
                success: true,
                message: 'Blog ideas generated successfully',
                data: result.ideas
            });
        } else {
            console.error('❌ Failed to generate blog ideas:', result.error);
            return res.status(500).json({
                success: false,
                message: result.error || 'Failed to generate blog ideas'
            });
        }

    } catch (error) {
        console.error('AI Controller Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

export const improveContent = async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: 'Content is required'
            });
        }

        console.log(`🔧 Improving content: "${content.substring(0, 50)}..."`);

        const result = await generateBlogContent(content, 'improve');

        if (result.success) {
            console.log('✅ Successfully improved content');
            return res.status(200).json({
                success: true,
                message: 'Content improved successfully',
                data: result.content
            });
        } else {
            console.error('❌ Failed to improve content:', result.error);
            return res.status(500).json({
                success: false,
                message: result.error || 'Failed to improve content'
            });
        }

    } catch (error) {
        console.error('AI Controller Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
