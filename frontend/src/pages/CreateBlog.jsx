import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { setBlog } from '@/redux/blogSlice'
import { Loader2, Sparkles, Lightbulb, Wand2 } from 'lucide-react'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import API from '../utils/api'

const CreateBlog = () => {
    const [loading, setLoading] = useState(false)
    const [title, setTitle] = useState("")
    const [category, setCategory] = useState("")
    const [aiLoading, setAiLoading] = useState(false)
    const [ideaPrompt, setIdeaPrompt] = useState("")
    const [titlePrompt, setTitlePrompt] = useState("")
    const [showIdeasDialog, setShowIdeasDialog] = useState(false)
    const [showTitleDialog, setShowTitleDialog] = useState(false)
    const [generatedIdeas, setGeneratedIdeas] = useState("")
    const [generatedTitles, setGeneratedTitles] = useState([])
    const {blog} = useSelector(store=>store.blog)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const getSelectedCategory = (value) => {
        setCategory(value)
    }

    // AI Assistant Functions
    const generateBlogIdeas = async () => {
        if (!ideaPrompt.trim()) {
            toast.error('Please enter a topic for blog ideas');
            return;
        }

        try {
            setAiLoading(true);
            const response = await API.post('/api/v1/ai/ideas', 
                { topic: ideaPrompt }
            );
            
            if (response.data.success) {
                setGeneratedIdeas(response.data.data);
                toast.success('Blog ideas generated successfully!');
            } else {
                toast.error(response.data.message || 'Failed to generate ideas');
            }
        } catch (error) {
            console.error('Error generating ideas:', error);
            toast.error('Failed to generate blog ideas');
        } finally {
            setAiLoading(false);
        }
    };

    const generateTitles = async () => {
        if (!titlePrompt.trim()) {
            toast.error('Please enter a topic for title generation');
            return;
        }

        try {
            setAiLoading(true);
            const response = await API.post('/api/v1/ai/generate', 
                { prompt: titlePrompt, type: 'title' }
            );
            
            if (response.data.success) {
                // Split the response into multiple titles if it contains multiple lines
                const titles = response.data.data.split('\n').filter(t => t.trim());
                setGeneratedTitles(titles);
                toast.success('Titles generated successfully!');
            } else {
                toast.error(response.data.message || 'Failed to generate titles');
            }
        } catch (error) {
            console.error('Error generating titles:', error);
            toast.error('Failed to generate titles');
        } finally {
            setAiLoading(false);
        }
    };

    const selectTitle = (selectedTitle) => {
        setTitle(selectedTitle.replace(/^\d+\.\s*/, '').trim()); // Remove numbering
        setShowTitleDialog(false);
        toast.success('Title selected!');
    };

    const createBlogHandler = async () => {
        
        try {
            setLoading(true)
            const res = await API.post('/api/v1/blog/', { title, category })
            if (res.data.success) {
                dispatch(setBlog([...blog, res.data.blog]))
                navigate(`/dashboard/write-blog/${res.data.blog._id}`)
                toast.success(res.data.message)
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }

    }
    return (
        <div className='p-4 md:pr-20 h-screen md:ml-[320px] pt-20'>
            <Card className="md:p-10 p-4 dark:bg-gray-800">
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-bold flex items-center gap-2'>
                        <Sparkles className='h-6 w-6 text-blue-500' />
                        Let's create a blog with AI
                    </h1>
                    <p className='text-gray-600 dark:text-gray-400 mt-2'>Use AI assistance to generate ideas, titles, and content for your blog post</p>
                </div>
            </div>
            
            {/* AI Assistant Section */}
            <div className='mt-8 p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600'>
                <h2 className='text-lg font-semibold mb-4 flex items-center gap-2'>
                    <Wand2 className='h-5 w-5 text-purple-500' />
                    AI Writing Assistant
                </h2>
                <div className='grid md:grid-cols-2 gap-4'>
                    {/* Blog Ideas Generator */}
                    <Dialog open={showIdeasDialog} onOpenChange={setShowIdeasDialog}>
                        <DialogTrigger asChild>
                            <Button variant='outline' className='h-auto p-4 flex flex-col items-start gap-2'>
                                <div className='flex items-center gap-2'>
                                    <Lightbulb className='h-5 w-5 text-yellow-500' />
                                    <span className='font-medium'>Generate Blog Ideas</span>
                                </div>
                                <span className='text-sm text-gray-600 dark:text-gray-400'>Get creative ideas for your next blog post</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
                            <DialogHeader>
                                <DialogTitle className='flex items-center gap-2'>
                                    <Lightbulb className='h-5 w-5 text-yellow-500' />
                                    Generate Blog Ideas
                                </DialogTitle>
                                <DialogDescription>
                                    Enter a topic or theme, and AI will suggest creative blog post ideas for you.
                                </DialogDescription>
                            </DialogHeader>
                            <div className='space-y-4'>
                                <div>
                                    <Label>Topic or Theme</Label>
                                    <Input 
                                        placeholder='e.g., sustainable living, web development, cooking tips' 
                                        value={ideaPrompt}
                                        onChange={(e) => setIdeaPrompt(e.target.value)}
                                    />
                                </div>
                                <Button 
                                    onClick={generateBlogIdeas} 
                                    disabled={aiLoading || !ideaPrompt.trim()}
                                    className='w-full'
                                >
                                    {aiLoading ? (
                                        <><Loader2 className='mr-2 h-4 w-4 animate-spin' />Generating Ideas...</>
                                    ) : (
                                        <><Sparkles className='mr-2 h-4 w-4' />Generate Ideas</>
                                    )}
                                </Button>
                                {generatedIdeas && (
                                    <div className='mt-4'>
                                        <Label>Generated Ideas:</Label>
                                        <div className='mt-2 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700 whitespace-pre-wrap max-h-60 overflow-y-auto'>
                                            {generatedIdeas}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Title Generator */}
                    <Dialog open={showTitleDialog} onOpenChange={setShowTitleDialog}>
                        <DialogTrigger asChild>
                            <Button variant='outline' className='h-auto p-4 flex flex-col items-start gap-2'>
                                <div className='flex items-center gap-2'>
                                    <Wand2 className='h-5 w-5 text-purple-500' />
                                    <span className='font-medium'>Generate Titles</span>
                                </div>
                                <span className='text-sm text-gray-600 dark:text-gray-400'>Create catchy titles for your blog post</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className='max-w-2xl'>
                            <DialogHeader>
                                <DialogTitle className='flex items-center gap-2'>
                                    <Wand2 className='h-5 w-5 text-purple-500' />
                                    Generate Blog Titles
                                </DialogTitle>
                                <DialogDescription>
                                    Describe your blog topic and get SEO-friendly, engaging titles.
                                </DialogDescription>
                            </DialogHeader>
                            <div className='space-y-4'>
                                <div>
                                    <Label>Blog Topic</Label>
                                    <Input 
                                        placeholder='e.g., 10 tips for better productivity' 
                                        value={titlePrompt}
                                        onChange={(e) => setTitlePrompt(e.target.value)}
                                    />
                                </div>
                                <Button 
                                    onClick={generateTitles} 
                                    disabled={aiLoading || !titlePrompt.trim()}
                                    className='w-full'
                                >
                                    {aiLoading ? (
                                        <><Loader2 className='mr-2 h-4 w-4 animate-spin' />Generating Titles...</>
                                    ) : (
                                        <><Sparkles className='mr-2 h-4 w-4' />Generate Titles</>
                                    )}
                                </Button>
                                {generatedTitles.length > 0 && (
                                    <div className='mt-4'>
                                        <Label>Click on a title to use it:</Label>
                                        <div className='mt-2 space-y-2 max-h-60 overflow-y-auto'>
                                            {generatedTitles.map((title, index) => (
                                                <Button
                                                    key={index}
                                                    variant='ghost'
                                                    className='w-full text-left h-auto p-3 hover:bg-blue-50 dark:hover:bg-gray-700 justify-start'
                                                    onClick={() => selectTitle(title)}
                                                >
                                                    {title}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            
            <div className='mt-8 '>
                <div>
                    <Label>Title</Label>
                    <Input type="text" placeholder="Your Blog Name" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-white dark:bg-gray-700" />
                </div>
                <div className='mt-4 mb-5'>
                    <Label>Category</Label>
                    <Select onValueChange={getSelectedCategory}>
                        <SelectTrigger className="w-[180px] bg-white dark:bg-gray-700">
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Category</SelectLabel>
                                <SelectItem value="Web Development">Web Development</SelectItem>
                                <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                                <SelectItem value="Blogging">Blogging</SelectItem>
                                <SelectItem value="Photography">Photography</SelectItem>
                                <SelectItem value="Cooking">Cooking</SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className='flex gap-2'>
                    {/* <Button  variant="outline">Cancel</Button> */}
                    <Button className="" disabled={loading} onClick={createBlogHandler}>
                        {
                            loading ? <><Loader2 className='mr-1 h-4 w-4 animate-spin' />Please wait</> : "Create"
                        }
                    </Button>
                </div>
            </div>
            </Card>
           
        </div>
    )
}

export default CreateBlog

