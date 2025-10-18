import React, { useState, useEffect } from 'react'
import { Save, Upload, Eye, X, Plus, Image as ImageIcon, Edit, Trash2, Calendar, Search } from 'lucide-react'
import { blogService } from '../lib/blogService'

const AdminPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('create')
  const [editingBlog, setEditingBlog] = useState(null)
  const [blogs, setBlogs] = useState([])
  const [loadingBlogs, setLoadingBlogs] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author_name: 'Zephaniah Chizulu',
    category: '',
    tags: [],
    featured_image: '',
    is_published: false,
    is_featured: false
  })
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [imageUploading, setImageUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState('')

  // Load blogs when component mounts or when switching to edit tab
  useEffect(() => {
    if (activeTab === 'edit') {
      loadBlogs()
    }
  }, [activeTab])

  const loadBlogs = async () => {
    try {
      setLoadingBlogs(true)
      const result = await blogService.getAllBlogs(1, 50) // Get first 50 blogs
      setBlogs(result.blogs)
    } catch (error) {
      setError('Failed to load blogs: ' + error.message)
    } finally {
      setLoadingBlogs(false)
    }
  }

  const handleEditBlog = async (blog) => {
    try {
      setEditingBlog(blog)
      setFormData({
        title: blog.title || '',
        content: blog.content || '',
        excerpt: blog.excerpt || '',
        author_name: blog.author_name || 'Zephaniah Chizulu',
        category: blog.blog_topic || '',
        tags: blog.tags || [],
        featured_image: blog.featured_image_url || '',
        is_published: blog.is_published || false,
        is_featured: blog.is_featured || false
      })
      setImagePreview(blog.featured_image_url || '')
      setActiveTab('create') // Switch to form tab for editing
    } catch (error) {
      setError('Failed to load blog for editing: ' + error.message)
    }
  }

  const handleCancelEdit = () => {
    setEditingBlog(null)
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      author_name: 'Zephaniah Chizulu',
      category: '',
      tags: [],
      featured_image: '',
      is_published: false,
      is_featured: false
    })
    setImagePreview('')
    setTagInput('')
  }

  const handleDeleteBlog = async (blogId, blogTitle) => {
    if (!confirm(`Are you sure you want to delete "${blogTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      await blogService.deleteBlog(blogId)
      setSuccess('Blog deleted successfully!')
      loadBlogs() // Refresh the list
    } catch (error) {
      setError('Failed to delete blog: ' + error.message)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    try {
      setImageUploading(true)
      setError('')
      
      const result = await blogService.uploadImage(file)
      const imageUrl = result.publicUrl
      
      setFormData(prev => ({
        ...prev,
        featured_image: imageUrl
      }))
      
      setImagePreview(imageUrl)
      
    } catch (err) {
      setError(err.message || 'Failed to upload image')
    } finally {
      setImageUploading(false)
    }
  }

  const handleImageUrlChange = (e) => {
    const url = e.target.value
    setFormData(prev => ({
      ...prev,
      featured_image: url
    }))
    setImagePreview(url)
  }

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      featured_image: ''
    }))
    setImagePreview('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.title || !formData.content) {
      setError('Title and content are required')
      return
    }

    // Validate title length (database constraint: min 5 characters)
    if (formData.title.length < 5) {
      setError('Title must be at least 5 characters long')
      return
    }

    // Validate content length (database constraint: min 100 characters)
    if (formData.content.length < 100) {
      setError('Content must be at least 100 characters long')
      return
    }

    // Validate category (will become blog_topic which is required)
    if (!formData.category || formData.category.trim().length === 0) {
      setError('Category is required')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const blogData = {
        ...formData,
        slug: formData.title.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 50)
      }

      if (editingBlog) {
        // Update existing blog
        await blogService.updateBlog(editingBlog.id, blogData)
        setSuccess('Blog post updated successfully!')
        handleCancelEdit()
        loadBlogs() // Refresh the blogs list
      } else {
        // Create new blog
        await blogService.createBlog(blogData)
        setSuccess('Blog post created successfully!')
        
        // Reset form
        setFormData({
          title: '',
          content: '',
          excerpt: '',
          author_name: 'Zephaniah Chizulu',
          category: '',
          tags: [],
          featured_image: '',
          is_published: false,
          is_featured: false
        })
        setTagInput('')
        setImagePreview('')
      }
      
    } catch (err) {
      setError(err.message || 'Failed to create blog post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold font-playfair text-foreground">
            Blog Management
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'create'
                ? 'border-b-2 border-primary text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            {editingBlog ? 'Edit Post' : 'Create New'}
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === 'edit'
                ? 'border-b-2 border-primary text-primary bg-primary/5'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Edit className="w-4 h-4 inline mr-2" />
            Manage Posts
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'create' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
              {success}
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Title * <span className="text-xs text-muted-foreground">({formData.title.length}/5 min)</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background ${
                formData.title.length > 0 && formData.title.length < 5 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-border'
              }`}
              placeholder="Enter blog post title (minimum 5 characters)"
              required
            />
            {formData.title.length > 0 && formData.title.length < 5 && (
              <p className="text-xs text-red-600 mt-1">Title must be at least 5 characters long</p>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Excerpt
            </label>
            <textarea
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background resize-none"
              placeholder="Brief description of the blog post"
            />
          </div>

          {/* Category and Author */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Category *
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background ${
                  formData.category.length === 0 ? 'border-red-300 focus:ring-red-500' : 'border-border'
                }`}
                placeholder="e.g., Technology, Design, Writing"
                required
              />
              {formData.category.length === 0 && (
                <p className="text-xs text-red-600 mt-1">Category is required</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Author
              </label>
              <input
                type="text"
                name="author_name"
                value={formData.author_name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-primary/80 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Featured Image
            </label>
            
            {/* Image Upload Section */}
            <div className="space-y-4">
              {/* Upload Button */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> an image
                      </p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, JPEG up to 5MB</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                    />
                  </label>
                  {imageUploading && (
                    <div className="flex items-center justify-center mt-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <span className="ml-2 text-sm text-muted-foreground">Uploading...</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center text-muted-foreground">
                  <span className="text-sm">OR</span>
                </div>
                
                <div className="flex-1">
                  <input
                    type="url"
                    name="featured_image"
                    value={formData.featured_image}
                    onChange={handleImageUrlChange}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                    placeholder="https://example.com/image.jpg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Enter image URL directly</p>
                </div>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <div className="border border-border rounded-lg p-2">
                    <img
                      src={imagePreview}
                      alt="Featured image preview"
                      className="w-full h-48 object-cover rounded"
                      onError={() => setImagePreview('')}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Content * <span className="text-xs text-muted-foreground">({formData.content.length}/100 min)</span>
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={12}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background resize-none font-mono text-sm ${
                formData.content.length > 0 && formData.content.length < 100 
                  ? 'border-red-300 focus:ring-red-500' 
                  : 'border-border'
              }`}
              placeholder="Write your blog post content here... You can use HTML tags for formatting. (minimum 100 characters)"
              required
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-muted-foreground">
                Tip: You can use HTML tags like &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;li&gt;, etc.
              </p>
              {formData.content.length > 0 && formData.content.length < 100 && (
                <p className="text-xs text-red-600">Content must be at least 100 characters long</p>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
              />
              <span className="text-sm text-foreground">Publish immediately</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary focus:ring-primary border-border rounded"
              />
              <span className="text-sm text-foreground">Featured post</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Upload className="w-4 h-4 animate-spin" />
                  {editingBlog ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {editingBlog ? 'Update Post' : 'Create Post'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
        ) : (
          /* Blog List View */
          <div className="p-6">
            {/* Success/Error Messages */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 mb-6">
                {success}
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
                {error}
              </div>
            )}

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Blog List */}
            {loadingBlogs ? (
              <div className="text-center py-8">
                <Upload className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Loading blogs...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blogs
                  .filter(blog => 
                    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    blog.blog_topic?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((blog) => (
                    <div key={blog.id} className="border border-border rounded-lg p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground text-lg">{blog.title}</h3>
                            <div className="flex items-center gap-2">
                              {blog.is_published ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Published</span>
                              ) : (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Draft</span>
                              )}
                              {blog.is_featured && (
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Featured</span>
                              )}
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                            {blog.excerpt || blog.content?.substring(0, 150) + '...'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(blog.created_at).toLocaleDateString()}
                            </span>
                            {blog.blog_topic && (
                              <span className="px-2 py-1 bg-muted rounded-full">{blog.blog_topic}</span>
                            )}
                            <span>{blog.tags?.length || 0} tags</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => handleEditBlog(blog)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit blog"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog.id, blog.title)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete blog"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                
                {blogs.length === 0 && !loadingBlogs && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No blogs found. Create your first blog post!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Edit Mode Actions */}
        {editingBlog && activeTab === 'create' && (
          <div className="px-6 pb-4 border-t border-border bg-muted/20">
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Editing: <strong>{editingBlog.title}</strong>
              </p>
              <button
                onClick={handleCancelEdit}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPanel