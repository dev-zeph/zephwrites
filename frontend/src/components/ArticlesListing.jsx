import React, { useState } from "react";
import { Search, Calendar, Clock, ArrowRight, Tag, Filter, BookOpen, Heart, MessageCircle, Loader2, Eye } from 'lucide-react'
import { useBlogs, useFeaturedBlogs } from '../hooks/useBlog'
import { blogService } from '../lib/blogService'

const ArticlesListing = ({
  title = "Written Articles",
  onSelectPost
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  // Use custom hooks for data fetching
  const { blogs, loading: blogsLoading, error: blogsError, pagination } = useBlogs(currentPage, 10)
  const { featuredBlogs, loading: featuredLoading } = useFeaturedBlogs(3)

  // Get unique categories from blogs
  const categories = ['all', ...new Set(blogs.map(blog => blog.category).filter(Boolean))]

  // Handle search with debouncing
  const handleSearch = async (term) => {
    setSearchTerm(term)
    if (term.trim() === '') {
      setSearchResults([])
      return
    }

    try {
      setIsSearching(true)
      const results = await blogService.searchBlogs(term)
      setSearchResults(results)
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Determine which posts to display
  const getDisplayPosts = () => {
    if (searchTerm.trim() !== '') {
      return searchResults
    }

    return blogs.filter(blog => {
      const matchesCategory = selectedCategory === 'all' || blog.category === selectedCategory
      return matchesCategory
    })
  }

  const displayPosts = getDisplayPosts()

  // Loading state
  if (blogsLoading || featuredLoading) {
    return (
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-center min-h-96">
              <div className="flex items-center space-x-2 text-zinc-600">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>Loading articles...</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (blogsError) {
    return (
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-12 font-playfair text-4xl font-bold leading-tight md:text-6xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {title}
            </h2>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-8 text-center">
              <h3 className="font-semibold text-amber-800 mb-4 text-xl">Database Setup Required</h3>
              <p className="text-amber-700 mb-4">
                It looks like your Supabase database hasn't been set up yet. Please follow the setup instructions in SUPABASE_SETUP.md
              </p>
              <div className="bg-amber-100 rounded-lg p-4 mb-4">
                <p className="text-amber-800 text-sm font-medium mb-2">Quick Setup Steps:</p>
                <ol className="text-left text-amber-700 text-sm space-y-1 max-w-md mx-auto">
                  <li>1. Go to your Supabase dashboard</li>
                  <li>2. Run the SQL from foundations.sql</li>
                  <li>3. Refresh this page</li>
                </ol>
              </div>
              <p className="text-amber-600 text-xs">Error: {blogsError}</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short',
      day: 'numeric'
    })
  }

  const formatReadTime = (content) => {
    if (!content) return '5 min read'
    const words = content.split(' ').length
    const readTime = Math.ceil(words / 200) // Average reading speed
    return `${readTime} min read`
  }
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 font-playfair text-4xl font-bold leading-tight md:text-6xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {title}
          </h2>

          {/* Search and Filter Controls */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search Results Info */}
            {searchTerm.trim() !== '' && (
              <div className="text-sm text-muted-foreground">
                {searchResults.length > 0 
                  ? `Found ${searchResults.length} article${searchResults.length === 1 ? '' : 's'} for "${searchTerm}"`
                  : `No articles found for "${searchTerm}"`
                }
              </div>
            )}
          </div>

          <div className="space-y-8">
            {displayPosts.map((blog) => (
              <article
                key={blog.id}
                className="border-border border-b pb-8 last:border-b-0 group cursor-pointer hover:bg-muted/20 rounded-lg p-4 transition-all duration-200"
                onClick={() => onSelectPost && onSelectPost(blog)}
              >
                <div className="flex flex-col gap-6 md:flex-row md:items-start">
                  {/* Article Image */}
                  <div className="md:w-1/4">
                    <img
                      src={blog.featured_image || "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/placeholder-1.svg"}
                      alt={`${blog.title} cover image`}
                      className="w-full aspect-video object-cover rounded-lg border group-hover:shadow-md transition-shadow duration-200"
                    />
                  </div>
                  
                  {/* Article Content */}
                  <div className="md:w-2/3">
                    <div className="mb-3">
                      {blog.category && (
                        <span className="inline-block px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full mb-2">
                          {blog.category}
                        </span>
                      )}
                      <h3 className="text-xl font-semibold font-instrumentSerif text-foreground group-hover:text-primary transition-colors duration-200">
                        {blog.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground mb-3 text-sm">
                      {blog.type || 'Blog Post'} • {blog.category || 'General'} • {formatReadTime(blog.content)}
                    </p>
                    <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {blog.excerpt || blog.content?.substring(0, 200) + '...'}
                    </p>
                    
                    {/* Tags */}
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {blog.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-muted text-muted-foreground rounded"
                          >
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                        {blog.tags.length > 3 && (
                          <span className="px-2 py-1 text-xs text-muted-foreground">
                            +{blog.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-4">
                      <span className="text-primary text-sm font-medium group-hover:underline">
                        Read more →
                      </span>
                    </div>
                  </div>
                  
                  {/* Publication Date and Stats */}
                  <div className="md:w-1/6 md:text-right">
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(blog.published_at || blog.created_at)}
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground md:justify-end">
                        <Eye className="w-3 h-3" />
                        <span>{blog.view_count || 0} views</span>
                      </div>
                      {blog.likes_count > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground md:justify-end">
                          <Heart className="w-3 h-3" />
                          <span>{blog.likes_count} likes</span>
                        </div>
                      )}
                      {blog.comments_count > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground md:justify-end">
                          <MessageCircle className="w-3 h-3" />
                          <span>{blog.comments_count} comments</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* No Results */}
          {displayPosts.length === 0 && !blogsLoading && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                {searchTerm.trim() !== '' 
                  ? `Try adjusting your search term or browse all categories.`
                  : `No articles available in this category yet.`
                }
              </p>
            </div>
          )}
          
          {/* Pagination */}
          {searchTerm.trim() === '' && pagination.totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={currentPage === pagination.totalPages}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

          {/* Load More for Search Results */}
          {searchTerm.trim() === '' && pagination.totalPages === 1 && displayPosts.length >= 10 && (
            <div className="mt-12 text-center">
              <button 
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
              >
                Load More Articles
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export { ArticlesListing };