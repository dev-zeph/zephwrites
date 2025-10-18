import { supabase } from './supabase'

// Blog Services
export const blogService = {
  // Get all published blogs with pagination
  async getPublishedBlogs(page = 1, limit = 10) {
    const start = (page - 1) * limit
    const end = start + limit - 1

    const { data, error, count } = await supabase
      .from('blogs')
      .select(`
        *,
        blog_quotes(quote_text, highlight_color, position_in_blog)
      `, { count: 'exact' })
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .range(start, end)

    if (error) throw error

    return {
      blogs: data,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    }
  },

  // Get a single blog by slug
  async getBlogBySlug(slug) {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        blog_quotes(quote_text, author, highlight_color, position_in_blog)
      `)
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error) throw error
    return data
  },

  // Get all blogs for admin (including drafts)
  async getAllBlogs(page = 1, limit = 20) {
    const start = (page - 1) * limit
    const end = start + limit - 1

    const { data, error, count } = await supabase
      .from('blogs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, end)

    if (error) throw error

    return {
      blogs: data,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    }
  },

  // Get a single blog by ID for editing
  async getBlogById(id) {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // Get featured blogs
  async getFeaturedBlogs(limit = 3) {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('is_published', true)
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Get blogs by category/topic
  async getBlogsByTopic(topic, limit = 10) {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('is_published', true)
      .eq('blog_topic', topic)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Search blogs
  async searchBlogs(query, limit = 10) {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('is_published', true)
      .textSearch('search_vector', query)
      .order('published_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  // Increment blog views
  async incrementViews(blogId, userIP = null) {
    try {
      // Call the database function to increment views
      const { error } = await supabase.rpc('increment_blog_views', {
        blog_uuid: blogId,
        user_ip_addr: userIP,
        user_agent_str: navigator.userAgent,
        referrer_url: document.referrer
      })

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error incrementing views:', error)
      return false
    }
  },

  // Like a blog post
  async likeBlog(blogId, userIP) {
    try {
      // Try the original function first, fallback to simple increment
      let data, error
      
      try {
        const result = await supabase.rpc('increment_blog_likes', {
          blog_uuid: blogId,
          user_ip_addr: userIP
        })
        data = result.data
        error = result.error
      } catch (originalError) {
        // Fallback to simple increment
        const result = await supabase.rpc('simple_increment_blog_likes', {
          blog_uuid: blogId
        })
        data = result.data
        error = result.error
      }

      if (error) throw error
      return data !== null // Returns true if successful
    } catch (error) {
      console.error('Error liking blog:', error)
      return false
    }
  },

  // Create a new blog post
  async createBlog(blogData) {
    const { data, error } = await supabase
      .from('blogs')
      .insert([{
        ...blogData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update an existing blog post
  async updateBlog(id, blogData) {
    const { data, error } = await supabase
      .from('blogs')
      .update({
        ...blogData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Delete a blog post
  async deleteBlog(id) {
    const { error } = await supabase
      .from('blogs')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // Upload image to Supabase Storage
  async uploadImage(file) {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.')
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Please upload an image smaller than 5MB.')
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 15)
      const fileExtension = file.name.split('.').pop()
      const fileName = `${timestamp}-${randomString}.${fileExtension}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        throw new Error('Failed to upload image. Please try again.')
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName)

      return {
        path: data.path,
        publicUrl: publicUrl
      }
    } catch (error) {
      console.error('Image upload error:', error)
      throw error
    }
  }
}

// Comment Services
export const commentService = {
  // Get comments for a blog
  async getComments(blogId) {
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('blog_id', blogId)
      .eq('status', 'approved')
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  },

  // Add a new comment
  async addComment(blogId, authorName, authorEmail, content, parentId = null) {
    console.log('Adding comment:', { blogId, authorName, authorEmail, content, parentId })
    
    // Ensure we have valid data
    if (!blogId || !authorName || !authorEmail || !content) {
      throw new Error('Missing required comment data')
    }
    
    const { data, error } = await supabase
      .from('blog_comments')
      .insert({
        blog_id: blogId,
        parent_id: parentId,
        author_name: authorName.trim(),
        author_email: authorEmail.trim(),
        content: content.trim(),
        status: 'approved' // Set directly to approved to avoid trigger issues
      })
      .select()
      .single()

    if (error) {
      console.error('Comment insertion error:', error)
      // Provide more helpful error message
      if (error.code === '42501') {
        throw new Error('Permission denied. Please try again or contact support.')
      }
      throw error
    }
    
    console.log('Comment added successfully:', data)
    return data
  }
}

// Newsletter Services
export const newsletterService = {
  // Subscribe to newsletter
  async subscribe(email, name = null) {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email: email,
        name: name,
        subscription_source: 'blog'
      })
      .select()
      .single()

    if (error) {
      // Handle duplicate email gracefully
      if (error.code === '23505') {
        throw new Error('This email is already subscribed!')
      }
      throw error
    }
    return data
  },

  // Check if email is already subscribed
  async isSubscribed(email) {
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  }
}

// Analytics Services
export const analyticsService = {
  // Get blog statistics
  async getBlogStats(blogId) {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        id,
        title,
        view_count,
        likes_count,
        comments_count
      `)
      .eq('id', blogId)
      .single()

    if (error) throw error
    return data
  },

  // Get popular blogs
  async getPopularBlogs(limit = 5, timeframe = '30 days') {
    const { data, error } = await supabase
      .from('blogs')
      .select('title, slug, view_count, likes_count')
      .eq('is_published', true)
      .gte('published_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('view_count', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }
}