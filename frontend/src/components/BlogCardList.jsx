import React from 'react'
import { Button } from './ui/button'
import { useNavigate } from 'react-router-dom'
import { getMockImage } from '../utils/mockImages'

const BlogCardList = ({ blog }) => {
    const navigate = useNavigate()
    const date = new Date(blog.createdAt)
    const formattedDate = date.toLocaleDateString("en-GB");
    return (
        <div className="bg-white dark:bg-gray-700 dark:border-gray-600 flex flex-col md:flex-row md:gap-10 p-5 rounded-2xl mt-6 shadow-lg border  transition-all">
            <div>
            <img 
                src={blog.thumbnail && blog.thumbnail !== '' ? 
                    (blog.thumbnail.startsWith('/') ? `${import.meta.env.VITE_API_URL}${blog.thumbnail}` : blog.thumbnail) : 
                    getMockImage(blog.category)
                } 
                alt={blog.title || 'Blog thumbnail'} 
                className='rounded-lg md:w-[300px] h-[200px] object-cover hover:scale-105 transition-all'
                onError={(e) => {
                    console.log('Image failed to load:', blog.thumbnail);
                    e.target.src = getMockImage(blog.category);
                }}
            />
            {/* <p className="text-xs  mt-2">
                By {blog.author.firstName} | {blog.category} | {formattedDate}
            </p> */}

            </div>
            <div>
                <h2 className="text-2xl font-semibold mt-3 md:mt-1">{blog.title}</h2>
                <h3 className='text-gray-500 mt-1 '>{blog.subtitle}</h3>
                <Button onClick={() => navigate(`/blogs/${blog._id}`)} className="mt-4   px-4 py-2 rounded-lg text-sm ">
                    Read More
                </Button>
            </div>
        </div>
    )
}

export default BlogCardList

