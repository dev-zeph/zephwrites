import { useState, useEffect } from 'react'
import { blogService, commentService, newsletterService } from '../lib/blogService'

// Hook for fetching published blogs
export const useBlogs = (page = 1, limit = 10) => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1
  })

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true)
        const result = await blogService.getPublishedBlogs(page, limit)
        setBlogs(result.blogs)
        setPagination({
          totalCount: result.totalCount,
          totalPages: result.totalPages,
          currentPage: result.currentPage
        })
      } catch (err) {
        console.error('Error fetching blogs:', err)
        setError(err.message)
        // Fallback to empty array
        setBlogs([])
      } finally {
        setLoading(false)
      }
    }

    fetchBlogs()
  }, [page, limit])

  return { blogs, loading, error, pagination }
}

// Hook for fetching a single blog by slug
export const useBlog = (slug) => {
  const [blog, setBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBlog = async () => {
    if (!slug) return

    try {
      setLoading(true)
      const data = await blogService.getBlogBySlug(slug)
      setBlog(data)
      
      // Increment view count (you might want to add IP detection)
      blogService.incrementViews(data.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlog()
  }, [slug])

  const refetchBlog = () => {
    fetchBlog()
  }

  const updateLikeCount = (newCount) => {
    setBlog(prev => prev ? { ...prev, like_count: newCount } : null)
  }

  return { blog, loading, error, refetchBlog, updateLikeCount }
}

// Hook for featured blogs
export const useFeaturedBlogs = (limit = 3) => {
  const [featuredBlogs, setFeaturedBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFeaturedBlogs = async () => {
      try {
        setLoading(true)
        const data = await blogService.getFeaturedBlogs(limit)
        setFeaturedBlogs(data)
      } catch (err) {
        console.error('Error fetching featured blogs:', err)
        setError(err.message)
        // Fallback to empty array
        setFeaturedBlogs([])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedBlogs()
  }, [limit])

  return { featuredBlogs, loading, error }
}

// Hook for blog comments
export const useComments = (blogId) => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchComments = async () => {
    if (!blogId) return

    try {
      setLoading(true)
      const data = await commentService.getComments(blogId)
      setComments(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [blogId])

  const addComment = async (authorName, authorEmail, content, parentId = null) => {
    try {
      console.log('useComments: Adding comment for blogId:', blogId)
      const result = await commentService.addComment(blogId, authorName, authorEmail, content, parentId)
      console.log('useComments: Comment added, refreshing comments')
      
      // Refresh comments after adding - with a small delay to ensure trigger has processed
      setTimeout(async () => {
        await fetchComments()
      }, 500)
      
      return true
    } catch (err) {
      console.error('useComments: Error adding comment:', err)
      setError(err.message)
      alert('Failed to add comment: ' + err.message)
      return false
    }
  }

  return { comments, loading, error, addComment, refetch: fetchComments }
}

// Hook for newsletter subscription
export const useNewsletter = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const subscribe = async (email, name = null) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)
      
      await newsletterService.subscribe(email, name)
      setSuccess(true)
      return true
    } catch (err) {
      setError(err.message)
      return false
    } finally {
      setLoading(false)
    }
  }

  const checkSubscription = async (email) => {
    try {
      return await newsletterService.isSubscribed(email)
    } catch (err) {
      console.error('Error checking subscription:', err)
      return false
    }
  }

  return { subscribe, checkSubscription, loading, error, success }
}

// Hook for liking blogs
export const useBlogLikes = () => {
  const [loading, setLoading] = useState(false)

  const likeBlog = async (blogId) => {
    try {
      setLoading(true)
      // Simple IP simulation - in production you'd get real IP
      const userIP = '127.0.0.1'
      const success = await blogService.likeBlog(blogId, userIP)
      return success
    } catch (err) {
      console.error('Error liking blog:', err)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { likeBlog, loading }
}