import Hero from '@/components/Hero'
import React, { useEffect } from 'react'
import BlogCard from '@/components/BlogCard'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setBlog } from '@/redux/blogSlice'

const Home = () => {
  const dispatch = useDispatch()
  const { blog } = useSelector(store => store.blog)

  useEffect(() => {
    const getAllPublishedBlogs = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/blog/get-published-blogs`)
        if (res.data.success) {
          dispatch(setBlog(res.data.blogs))
        }
      } catch (error) {
        console.log(error);
      }
    }
    getAllPublishedBlogs()
  }, [])

  return (
    <div className='pt-16'>
      <div className='max-w-6xl mx-auto grid gap-10 grid-cols-1 md:grid-cols-3 py-10 px-4 md:px-0'>
        {
          blog?.map((blog, index) => {
            return <BlogCard blog={blog} key={index} />
          })
        }
      </div>
    </div>
  )
}

export default Home

