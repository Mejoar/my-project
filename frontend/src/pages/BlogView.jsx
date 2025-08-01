import React, { useEffect, useState } from 'react'
import {
    Breadcrumb,
    // BreadcrumbEllipsis,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Link, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bookmark, Heart, MessageSquare, Share2 } from 'lucide-react'
import CommentBox from '@/components/CommentBox'
import axios from 'axios'
import { FaHeart, FaRegHeart } from 'react-icons/fa6'
import { setBlog } from '@/redux/blogSlice'
import { toast } from 'sonner'
import { getMockImage } from '../utils/mockImages'

const BlogView = () => {
    const params = useParams()
    const blogId = params.blogId
    const { blog } = useSelector(store => store.blog)
    const { user } = useSelector(store => store.auth)
    const [selectedBlog, setSelectedBlog] = useState(null)
    const [loading, setLoading] = useState(true)
    const [blogLike, setBlogLike] = useState(0)
    const { comment } = useSelector(store => store.comment)
    const [liked, setLiked] = useState(false);
    const dispatch = useDispatch()
    console.log(selectedBlog);

    const likeOrDislikeHandler = async () => {
        if (!user) {
            toast.error('Please login to like this blog');
            return;
        }
        
        try {
            const action = liked ? 'dislike' : 'like';
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/blog/${selectedBlog?._id}/${action}`, { withCredentials: true })
            if (res.data.success) {
                const updatedLikes = liked ? blogLike - 1 : blogLike + 1;
                setBlogLike(updatedLikes);
                setLiked(!liked)

                //apne blog ko update krunga
                const updatedBlogData = blog.map(p =>
                    p._id === selectedBlog._id ? {
                        ...p,
                        likes: liked ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id]
                    } : p
                )
                toast.success(res.data.message);
                dispatch(setBlog(updatedBlogData))
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || 'Failed to like/dislike blog')
        }
    }

    const changeTimeFormat = (isoDate) => {
        const date = new Date(isoDate);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = date.toLocaleDateString('en-GB', options);
        return formattedDate
    }

    // const handleShare = (blogId) => {
    //     const blogUrl = `${window.location.origin}/blogs/${blogId}`;
    //     navigator.clipboard.writeText(blogUrl).then(() => {
    //         toast.success('Blog link copied to clipboard!');
    //     }).catch((err) => {
    //         console.error('Failed to copy:', err);
    //     });
    // };
    const handleShare = (blogId) => {
        const blogUrl = `${window.location.origin}/blogs/${blogId}`;
      
        if (navigator.share) {
          navigator
            .share({
              title: 'Check out this blog!',
              text: 'Read this amazing blog post.',
              url: blogUrl,
            })
            .then(() => console.log('Shared successfully'))
            .catch((err) => console.error('Error sharing:', err));
        } else {
          // fallback: copy to clipboard
          navigator.clipboard.writeText(blogUrl).then(() => {
            toast.success('Blog link copied to clipboard!');
          });
        }
      };

      useEffect(() => {
        const fetchBlogData = async () => {
            try {
                console.log('Fetching blog with ID:', blogId)
                
                // First check if blog is already in Redux store
                const existingBlog = blog.find(b => b._id === blogId)
                console.log('Found existing blog:', existingBlog)
                
                if (existingBlog) {
                    setSelectedBlog(existingBlog)
                    setBlogLike(existingBlog.likes?.length || 0)
                    setLiked(existingBlog.likes?.includes(user?._id) || false)
                    setLoading(false)
                    return
                }

                // If not in store, fetch the specific blog by ID (no authentication required)
                console.log('Blog not found in store, fetching from API...')
                
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/blog/get-blog/${blogId}`)
                console.log('Blog response:', res.data)
                
                if (res.data.success) {
                    const foundBlog = res.data.blog
                    setSelectedBlog(foundBlog)
                    setBlogLike(foundBlog.likes?.length || 0)
                    setLiked(foundBlog.likes?.includes(user?._id) || false)
                } else {
                    console.log('Blog not found with ID:', blogId)
                    toast.error('Blog not found.')
                }
            } catch (error) {
                console.log('Error fetching blog:', error)
                if (error.response?.status === 404) {
                    toast.error('Blog not found or not published.')
                } else {
                    toast.error('Failed to load blog: ' + error.message)
                }
            } finally {
                setLoading(false)
            }
        }

        fetchBlogData()
        window.scrollTo(0,0)
      }, [blogId, user, dispatch])
    // Show loading state
    if (loading) {
        return (
            <div className='pt-14'>
                <div className='max-w-6xl mx-auto p-10 text-center'>
                    <div className='animate-pulse'>
                        <div className='h-8 bg-gray-300 rounded w-3/4 mx-auto mb-4'></div>
                        <div className='h-4 bg-gray-300 rounded w-1/2 mx-auto mb-8'></div>
                        <div className='h-64 bg-gray-300 rounded mb-8'></div>
                        <div className='space-y-4'>
                            <div className='h-4 bg-gray-300 rounded'></div>
                            <div className='h-4 bg-gray-300 rounded'></div>
                            <div className='h-4 bg-gray-300 rounded w-3/4'></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Show error state if blog not found
    if (!selectedBlog) {
        return (
            <div className='pt-14'>
                <div className='max-w-6xl mx-auto p-10 text-center'>
                    <h1 className='text-4xl font-bold mb-4'>Blog Not Found</h1>
                    <p className='text-gray-600 mb-8'>The blog post you're looking for doesn't exist or has been removed.</p>
                    <Link to='/' className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700'>Go Back Home</Link>
                </div>
            </div>
        )
    }

    return (
        <div className='pt-14'>
            <div className='max-w-6xl mx-auto p-10'>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <Link to={'/'}><BreadcrumbLink >Home</BreadcrumbLink></Link>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />


                        <BreadcrumbItem>
                            <Link to={'/blogs'}><BreadcrumbLink >Blogs</BreadcrumbLink></Link>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{selectedBlog.title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                {/* Blog Header */}
                <div className="my-8">
                    <h1 className="text-4xl font-bold tracking-tight mb-4">{selectedBlog.title}</h1>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center space-x-4">
                            <Avatar>
                                <AvatarImage src={selectedBlog.author.photoUrl} alt="Author" />
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{selectedBlog.author.firstName} {selectedBlog.author.lastName}</p>
                                <p className="text-sm text-muted-foreground">{selectedBlog.author.occupation}</p>
                            </div>
                        </div>
                        <div className="text-sm text-muted-foreground">Published on {changeTimeFormat(selectedBlog.createdAt)} • 8 min read</div>
                    </div>
                </div>

                {/* Featured Image */}
                <div className="mb-8 rounded-lg overflow-hidden">
<img
                        src={
                          selectedBlog?.thumbnail && selectedBlog.thumbnail !== ''
                            ? (selectedBlog.thumbnail.startsWith('/')
                              ? `${import.meta.env.VITE_API_URL}${selectedBlog.thumbnail}`
                              : selectedBlog.thumbnail)
                            : getMockImage(selectedBlog.category)
                        }
                        alt={selectedBlog.title}
                        width={1000}
                        height={500}
                        className="w-full h-96 object-cover"
                        onError={(e) => {
                            console.log('Image failed to load:', selectedBlog?.thumbnail);
                            e.target.src = getMockImage(selectedBlog.category);
                        }}
                    />
                    <p className="text-sm text-muted-foreground mt-2 italic">{selectedBlog.subtitle}</p>
                    {/* Debug info - remove in production */}
                    <div className="text-xs text-gray-400 mt-1">
                        {selectedBlog?.thumbnail ? 
                            `Using uploaded image: ${selectedBlog.thumbnail.substring(0, 50)}...` : 
                            `Using ${selectedBlog.category} mock image`
                        }
                    </div>
                </div>

                <p className='' dangerouslySetInnerHTML={{ __html: selectedBlog.description }} />

                <div className='mt-10'>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        <Badge variant="secondary">Next.js</Badge>
                        <Badge variant="secondary">React</Badge>
                        <Badge variant="secondary">Web Development</Badge>
                        <Badge variant="secondary">JavaScript</Badge>
                    </div>

                    {/* Engagement */}
                    <div className="flex items-center justify-between border-y dark:border-gray-800 border-gray-300 py-4 mb-8">
                        <div className="flex items-center space-x-4">
                            <Button onClick={likeOrDislikeHandler} variant="ghost" size="sm" className="flex items-center gap-1">
                                {/* <Heart className="h-4 w-4"/> */}
                                {
                                    liked ? <FaHeart size={'24'} className='cursor-pointer text-red-600' /> : <FaRegHeart size={'24'} className='cursor-pointer hover:text-gray-600 text-white' />
                                }

                                <span>{blogLike}</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                <span>{comment.length} Comments</span>
                            </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                                <Bookmark className="h-4 w-4" />
                            </Button>
                            <Button onClick={()=>handleShare(selectedBlog._id)} variant="ghost" size="sm">
                                <Share2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                </div>
                <CommentBox selectedBlog={selectedBlog} />

                {/* Author Bio */}
                {/* <Card className="mb-12">
                    <CardContent className="flex items-start space-x-4 pt-6">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src="/placeholder.svg?height=48&width=48" alt="Author" />
                            <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold mb-1">About Jane Doe</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                                Jane is a lead developer with over 10 years of experience in web development. She specializes in React and
                                Next.js and has helped numerous companies build modern, performant websites.
                            </p>
                            <Button variant="outline" size="sm">
                                Follow
                            </Button>
                        </div>
                    </CardContent>
                </Card> */}
            </div>
        </div>
    )
}

export default BlogView

