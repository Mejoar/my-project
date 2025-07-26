import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useRef, useState } from 'react'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import JoditEditor from 'jodit-react';
import { useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { toast } from 'sonner'
import { setBlog } from '@/redux/blogSlice'
import { getMockImage } from '../utils/mockImages'
import { Sparkles, Wand2, RefreshCw, Plus, Loader2 } from 'lucide-react'

const UpdateBlog = () => {
    const editor = useRef(null);
   
    const [loading, setLoading] = useState(false)
    const [publish, setPublish] = useState(false)
    const params = useParams()
    const id = params.blogId
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { blog } = useSelector(store => store.blog)
    const selectBlog = blog.find(blog => blog._id === id)
    const [content, setContent] = useState(selectBlog.description);
    
    // AI Assistant States
    const [aiLoading, setAiLoading] = useState(false)
    const [contentPrompt, setContentPrompt] = useState("")
    const [improvePrompt, setImprovePrompt] = useState("")
    const [showContentDialog, setShowContentDialog] = useState(false)
    const [showImproveDialog, setShowImproveDialog] = useState(false)
    const [generatedContent, setGeneratedContent] = useState("")

    const [blogData, setBlogData] = useState({
        title: selectBlog?.title,
        subtitle: selectBlog?.subtitle,
        description: content,
        category: selectBlog?.category,
    });
    const [previewThumbnail, setPreviewThumbnail] = useState(selectBlog?.thumbnail);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBlogData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const selectCategory = (value) => {
        setBlogData({ ...blogData, category: value });
    };

    const selectThumbnail = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setBlogData({ ...blogData, thumbnail: file });
            const fileReader = new FileReader();
            fileReader.onloadend = () => setPreviewThumbnail(fileReader.result);
            fileReader.readAsDataURL(file);
        }
    };

    const updateBlogHandler = async () => {

        const formData = new FormData();
        formData.append("title", blogData.title);
        formData.append("subtitle", blogData.subtitle);
        formData.append("description", content);
        formData.append("category", blogData.category);
        formData.append("file", blogData.thumbnail);
        try {
            setLoading(true)
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/v1/blog/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                },
                withCredentials: true,
            })
            if (res.data.success) {
                toast.success(res.data.message)
                
                // Update the blog in the Redux store
                const updatedBlogData = blog.map(blogItem => 
                    blogItem._id === id ? res.data.blog : blogItem
                );
                dispatch(setBlog(updatedBlogData));
                
                navigate('/dashboard/your-blog')
            }
        } catch (error) {
            console.log(error);

        } finally {
            setLoading(false)
        }
    }

    const togglePublishUnpublish = async (action) => {
        console.log("action", action);

        try {
            const res = await axios.patch(`${import.meta.env.VITE_API_URL}/api/v1/blog/${id}`, {
                params: {
                    action
                },
                withCredentials: true
            })
            if (res.data.success) {
                setPublish(!publish)
                toast.success(res.data.message)
                navigate(`/dashboard/your-blog`)
            } else {
                toast.error("Failed to update")
            }
        } catch (error) {
            console.log(error);

        }
    }

    const deleteBlog = async () => {
        try {
            const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/v1/blog/delete/${id}`, { withCredentials: true })
            if (res.data.success) {
                const updatedBlogData = blog.filter((blogItem) => blogItem?._id !== id);
                dispatch(setBlog(updatedBlogData))
                toast.success(res.data.message)
                navigate('/dashboard/your-blog')
            }
            console.log(res.data.message);

        } catch (error) {
            console.log(error);
            toast.error("something went error")
        }

    }

    // AI Assistant Functions
    const generateContent = async () => {
        if (!contentPrompt.trim()) {
            toast.error('Please enter a topic for content generation');
            return;
        }

        try {
            setAiLoading(true);
            const response = await axios.post('/api/v1/ai/generate', 
                { prompt: contentPrompt, type: 'content' }, 
                { withCredentials: true }
            );
            
            if (response.data.success) {
                setGeneratedContent(response.data.data);
                toast.success('Content generated successfully!');
            } else {
                toast.error(response.data.message || 'Failed to generate content');
            }
        } catch (error) {
            console.error('Error generating content:', error);
            toast.error('Failed to generate content');
        } finally {
            setAiLoading(false);
        }
    };

    const improveContent = async () => {
        const currentContent = content || blogData.description;
        if (!currentContent || currentContent.trim() === '') {
            toast.error('Please write some content first to improve it');
            return;
        }

        try {
            setAiLoading(true);
            const response = await axios.post('/api/v1/ai/improve', 
                { content: currentContent }, 
                { withCredentials: true }
            );
            
            if (response.data.success) {
                setGeneratedContent(response.data.data);
                toast.success('Content improved successfully!');
                setShowImproveDialog(true);
            } else {
                toast.error(response.data.message || 'Failed to improve content');
            }
        } catch (error) {
            console.error('Error improving content:', error);
            toast.error('Failed to improve content');
        } finally {
            setAiLoading(false);
        }
    };

    const insertGeneratedContent = () => {
        if (editor.current) {
            const currentContent = content || '';
            const newContent = currentContent + '\n\n' + generatedContent;
            setContent(newContent);
            setBlogData(prev => ({ ...prev, description: newContent }));
            
            // Update Jodit editor
            if (editor.current.value !== undefined) {
                editor.current.value = newContent;
            }
        }
        setShowContentDialog(false);
        setShowImproveDialog(false);
        toast.success('Content added to your blog!');
    };

    const replaceWithGeneratedContent = () => {
        setContent(generatedContent);
        setBlogData(prev => ({ ...prev, description: generatedContent }));
        
        // Update Jodit editor
        if (editor.current && editor.current.value !== undefined) {
            editor.current.value = generatedContent;
        }
        
        setShowContentDialog(false);
        setShowImproveDialog(false);
        toast.success('Content replaced!');
    };

    return (
        <div className='pb-10 px-3 pt-20 md:ml-[320px]'>
            <div className='max-w-6xl mx-auto mt-8'>
                <Card className="w-full bg-white dark:bg-gray-800 p-5 space-y-2">
                    <h1 className=' text-4xl font-bold '>Basic Blog Information</h1>
                    <p className=''>Make changes to your blogs here. Click publish when you're done.</p>
                    <div className="space-x-2">
                        <Button onClick={() => togglePublishUnpublish(selectBlog.isPublished ? "false" : "true")}
                        >
                            {selectBlog?.isPublished ? "UnPublish" : "Publish"}
                        </Button>
                        <Button variant="destructive" onClick={deleteBlog}>Remove Course</Button>
                    </div>
                    <div className='pt-10'>
                        <Label>Title</Label>
                        <Input type="text" placeholder="Enter a title" name="title" value={blogData.title} onChange={handleChange} className="dark:border-gray-300" />
                    </div>
                    <div>
                        <Label>Subtitle</Label>
                        <Input type="text" placeholder="Enter a subtitle" name="subtitle" value={blogData.subtitle} onChange={handleChange} className="dark:border-gray-300" />
                    </div>
                    <div>
                        <Label>Description</Label>
                        <JoditEditor
                            ref={editor}
                            value={blogData.description}
                            onChange={newContent => setContent(newContent)}
                            className="jodit_toolbar"

                        />
                        
                        {/* AI Assistant Section */}
                        <div className='mt-4 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600'>
                            <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
                                <Wand2 className='h-5 w-5 text-purple-500' />
                                AI Writing Assistant
                            </h3>
                            <div className='grid md:grid-cols-3 gap-3'>
                                {/* Generate New Content */}
                                <Dialog open={showContentDialog} onOpenChange={setShowContentDialog}>
                                    <DialogTrigger asChild>
                                        <Button variant='outline' className='h-auto p-3 flex flex-col items-start gap-2'>
                                            <div className='flex items-center gap-2'>
                                                <Sparkles className='h-4 w-4 text-blue-500' />
                                                <span className='font-medium text-sm'>Generate Content</span>
                                            </div>
                                            <span className='text-xs text-gray-600 dark:text-gray-400'>Create new content from a topic</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
                                        <DialogHeader>
                                            <DialogTitle className='flex items-center gap-2'>
                                                <Sparkles className='h-5 w-5 text-blue-500' />
                                                Generate Blog Content
                                            </DialogTitle>
                                            <DialogDescription>
                                                Describe what you want to write about, and AI will generate content for you.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className='space-y-4'>
                                            <div>
                                                <Label>Topic or Description</Label>
                                                <Textarea 
                                                    placeholder='e.g., Write about the benefits of modern web development frameworks like React and Vue' 
                                                    value={contentPrompt}
                                                    onChange={(e) => setContentPrompt(e.target.value)}
                                                    rows={3}
                                                />
                                            </div>
                                            <Button 
                                                onClick={generateContent} 
                                                disabled={aiLoading || !contentPrompt.trim()}
                                                className='w-full'
                                            >
                                                {aiLoading ? (
                                                    <><Loader2 className='mr-2 h-4 w-4 animate-spin' />Generating Content...</>
                                                ) : (
                                                    <><Sparkles className='mr-2 h-4 w-4' />Generate Content</>
                                                )}
                                            </Button>
                                            {generatedContent && (
                                                <div className='mt-4'>
                                                    <Label>Generated Content:</Label>
                                                    <div className='mt-2 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 max-h-60 overflow-y-auto'>
                                                        <div className='whitespace-pre-wrap text-sm' dangerouslySetInnerHTML={{ __html: generatedContent }} />
                                                    </div>
                                                    <div className='flex gap-2 mt-3'>
                                                        <Button onClick={insertGeneratedContent} variant='default' size='sm'>
                                                            <Plus className='mr-1 h-4 w-4' />Add to Blog
                                                        </Button>
                                                        <Button onClick={replaceWithGeneratedContent} variant='outline' size='sm'>
                                                            <RefreshCw className='mr-1 h-4 w-4' />Replace Content
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>

                                {/* Improve Existing Content */}
                                <Button 
                                    variant='outline' 
                                    className='h-auto p-3 flex flex-col items-start gap-2'
                                    onClick={improveContent}
                                    disabled={aiLoading || (!content && !blogData.description)}
                                >
                                    <div className='flex items-center gap-2'>
                                        <RefreshCw className='h-4 w-4 text-green-500' />
                                        <span className='font-medium text-sm'>Improve Content</span>
                                    </div>
                                    <span className='text-xs text-gray-600 dark:text-gray-400'>Enhance your existing content</span>
                                </Button>

                                {/* Grammar Check */}
                                <Button 
                                    variant='outline' 
                                    className='h-auto p-3 flex flex-col items-start gap-2'
                                    disabled
                                >
                                    <div className='flex items-center gap-2'>
                                        <Wand2 className='h-4 w-4 text-orange-500' />
                                        <span className='font-medium text-sm'>Grammar Check</span>
                                    </div>
                                    <span className='text-xs text-gray-600 dark:text-gray-400'>Coming soon...</span>
                                </Button>
                            </div>
                        </div>

                        {/* Improve Content Dialog */}
                        <Dialog open={showImproveDialog} onOpenChange={setShowImproveDialog}>
                            <DialogContent className='max-w-3xl max-h-[80vh] overflow-y-auto'>
                                <DialogHeader>
                                    <DialogTitle className='flex items-center gap-2'>
                                        <RefreshCw className='h-5 w-5 text-green-500' />
                                        Improved Content
                                    </DialogTitle>
                                    <DialogDescription>
                                        AI has enhanced your content. Choose how to apply the improvements.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className='space-y-4'>
                                    {generatedContent && (
                                        <div>
                                            <Label>Improved Content:</Label>
                                            <div className='mt-2 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 max-h-60 overflow-y-auto'>
                                                <div className='whitespace-pre-wrap text-sm' dangerouslySetInnerHTML={{ __html: generatedContent }} />
                                            </div>
                                            <div className='flex gap-2 mt-3'>
                                                <Button onClick={replaceWithGeneratedContent} variant='default' size='sm'>
                                                    <RefreshCw className='mr-1 h-4 w-4' />Replace with Improved
                                                </Button>
                                                <Button onClick={insertGeneratedContent} variant='outline' size='sm'>
                                                    <Plus className='mr-1 h-4 w-4' />Add as New Section
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div>
                        <Label>Category</Label>
                        <Select onValueChange={selectCategory} className="dark:border-gray-300">
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Category</SelectLabel>
                                    <SelectItem value="Web Development">Web Development</SelectItem>
                                    <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                                    <SelectItem value="Blogging">Blogging</SelectItem>
                                    <SelectItem value="Photgraphy">Photgraphy</SelectItem>
                                    <SelectItem value="Cooking">Cooking</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label>Thumbnail</Label>
                        <Input
                            id="file"
                            type="file"
                            onChange={selectThumbnail}
                            accept="image/*"
                            className="w-fit dark:border-gray-300"
                        />
                        <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">Preview:</p>
                            <img
                                src={previewThumbnail || getMockImage(blogData.category || selectBlog?.category)}
                                className="w-64 h-40 object-cover rounded-lg border"
                                alt="Blog Thumbnail Preview"
                                onError={(e) => {
                                    e.target.src = getMockImage(blogData.category || selectBlog?.category);
                                }}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {previewThumbnail ? 'Custom thumbnail' : 'Using category mock image'}
                            </p>
                        </div>
                    </div>
                    <div className='flex gap-3'>
                        <Button variant="outline" onClick={()=>navigate(-1)}>Back</Button>
                        <Button onClick={updateBlogHandler}>
                            {
                                loading ? "Please Wait" : "Save"
                            }
                        </Button>
                    </div>

                </Card>
            </div>
        </div>
    )
}

export default UpdateBlog

