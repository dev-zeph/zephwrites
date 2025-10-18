import React, { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Clock, User, Heart, MessageCircle, Share2, BookOpen, Tag, Loader2 } from 'lucide-react'
import { useBlog, useComments, useBlogLikes } from '../hooks/useBlog'

const BlogPost = ({ blogSlug, onBack }) => {
  const [commentForm, setCommentForm] = useState({
    author_name: '',
    author_email: '',
    content: '',
    parent_id: null
  })
  const [replyingTo, setReplyingTo] = useState(null)

  // Use custom hooks for data fetching
  const { blog, loading: blogLoading, error: blogError, refetchBlog } = useBlog(blogSlug)
  const { comments, loading: commentsLoading, addComment } = useComments(blog?.id)
  const { likeBlog, loading: likingBlog } = useBlogLikes()

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    
    if (!commentForm.author_name || !commentForm.author_email || !commentForm.content) {
      alert('Please fill in all fields')
      return
    }

    if (!blog?.id) {
      alert('Error: Cannot post comment - article not loaded')
      return
    }

    try {
      const success = await addComment(
        commentForm.author_name,
        commentForm.author_email,
        commentForm.content,
        commentForm.parent_id
      )

      if (success) {
        setCommentForm({
          author_name: '',
          author_email: '',
          content: '',
          parent_id: null
        })
        setReplyingTo(null)
        alert('Comment posted successfully!')
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('Failed to post comment. Please try again.')
    }
  }

  const handleReply = (commentId, authorName) => {
    setReplyingTo({ id: commentId, author: authorName })
    setCommentForm(prev => ({ ...prev, parent_id: commentId }))
    // Scroll to comment form
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  // Update like count when blog data changes and check if already liked
  useEffect(() => {
    if (blog?.like_count !== undefined) {
      setLikeCount(blog.like_count)
      
      // Check if user has already liked this post (stored in localStorage)
      const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
      setIsLiked(likedPosts.includes(blog.id))
    }
  }, [blog?.like_count, blog?.id])

  const handleLike = async () => {
    if (blog?.id && !likingBlog) {
      // Optimistic update - update UI immediately
      if (!isLiked) {
        setIsLiked(true)
        setLikeCount(prev => prev + 1)
        
        // Store in localStorage to remember user liked this post
        const likedPosts = JSON.parse(localStorage.getItem('likedPosts') || '[]')
        likedPosts.push(blog.id)
        localStorage.setItem('likedPosts', JSON.stringify(likedPosts))
        
        // Add a subtle animation effect
        const heartElement = document.querySelector('.heart-icon')
        if (heartElement) {
          heartElement.style.transform = 'scale(1.2)'
          setTimeout(() => {
            heartElement.style.transform = 'scale(1)'
          }, 150)
        }
        
        // Call the API
        const success = await likeBlog(blog.id)
        
        // If API call failed, revert the optimistic update
        if (!success) {
          setIsLiked(false)
          setLikeCount(prev => prev - 1)
          
          // Remove from localStorage
          const updatedLikedPosts = likedPosts.filter(id => id !== blog.id)
          localStorage.setItem('likedPosts', JSON.stringify(updatedLikedPosts))
        }
      }
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatReadTime = (content) => {
    if (!content) return '5 min read'
    const words = content.split(' ').length
    const readTime = Math.ceil(words / 200)
    return `${readTime} min read`
  }

  // Loading state
  if (blogLoading) {
    return (
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-center min-h-96">
            <div className="flex items-center space-x-2 text-zinc-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading article...</span>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (blogError || !blog) {
    return (
      <section className="py-16">
        <div className="container">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-primary hover:text-primary/80 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Articles</span>
          </button>
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <p className="text-red-600 mb-2">Error loading article</p>
              <p className="text-zinc-600 text-sm">{blogError || 'Article not found'}</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Organize comments by parent-child relationship
  const organizeComments = (comments) => {
    const commentMap = {}
    const rootComments = []

    // First pass: create a map of all comments
    comments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] }
    })

    // Second pass: organize into tree structure
    comments.forEach(comment => {
      if (comment.parent_id && commentMap[comment.parent_id]) {
        commentMap[comment.parent_id].replies.push(commentMap[comment.id])
      } else {
        rootComments.push(commentMap[comment.id])
      }
    })

    return rootComments
  }

  const organizedComments = organizeComments(comments)

  const CommentComponent = ({ comment, level = 0 }) => (
    <div className={`${level > 0 ? 'ml-8 border-l border-border pl-4' : ''} mb-6`}>
      <div className="border-l-4 border-primary pl-4 py-2">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-semibold text-sm">
            {comment.author_name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-foreground">{comment.author_name}</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(comment.created_at)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {comment.content}
            </p>
            <button
              onClick={() => handleReply(comment.id, comment.author_name)}
              className="text-xs text-primary hover:underline mt-2"
            >
              Reply
            </button>
          </div>
        </div>
      </div>
      
      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map(reply => (
            <CommentComponent key={reply.id} comment={reply} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <section className="py-16">
      <div className="container">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-primary hover:text-primary/80 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </button>

        <div className="flex flex-col gap-12 lg:flex-row lg:gap-24">
          <article className="mx-auto">
            {/* Featured Image */}
            {blog.featured_image && (
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="mb-8 aspect-video w-full max-w-3xl rounded-lg border object-cover"
              />
            )}
            
            <div className="prose dark:prose-invert max-w-none">
              {/* Category Badge */}
              {blog.category && (
                <span className="inline-block px-3 py-1 text-sm font-medium bg-secondary text-secondary-foreground rounded-full mb-4">
                  {blog.category}
                </span>
              )}
              
              <h1 className="font-playfair text-4xl font-bold mb-6">{blog.title}</h1>
              
              {/* Article Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 not-prose">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{blog.author_name || 'Zephaniah Chizulu'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <time>{formatDate(blog.published_at || blog.created_at)}</time>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatReadTime(blog.content)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>{blog.view_count || 0} views</span>
                </div>
              </div>

              {/* Tags */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6 not-prose">
                  {blog.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-muted text-muted-foreground rounded-full"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center space-x-4 border-y border-border py-4 mb-8 not-prose">
                <button
                  onClick={handleLike}
                  disabled={likingBlog}
                  className={`flex items-center space-x-2 transition-colors disabled:opacity-50 ${
                    isLiked 
                      ? 'text-red-500 hover:text-red-600' 
                      : 'text-muted-foreground hover:text-red-500'
                  }`}
                >
                  <Heart 
                    className={`heart-icon w-5 h-5 transition-all duration-150 ${isLiked ? 'fill-current' : ''}`} 
                  />
                  <span>{likeCount}</span>
                </button>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <MessageCircle className="w-5 h-5" />
                  <span>{comments.length} comments</span>
                </div>
                <button className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>
              </div>

              {/* Article Content */}
              {blog.excerpt && (
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {blog.excerpt}
                </p>
              )}
              
              <div 
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />
            </div>
            
            {/* Discussion Section */}
            <div className="mt-16 border-t border-border pt-12">
              <h3 className="text-2xl font-bold mb-6 font-playfair text-foreground">
                Join the Discussion
              </h3>
              <p className="text-muted-foreground mb-8">
                Share your thoughts, questions, or feedback about this article. Let's start a conversation!
              </p>
              
              {/* Comment Form */}
              <div id="comment-form" className="bg-muted/50 rounded-lg p-6 mb-8">
                {replyingTo && (
                  <div className="bg-secondary/50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-muted-foreground">
                      Replying to <span className="font-medium">{replyingTo.author}</span>
                    </p>
                    <button
                      onClick={() => {
                        setReplyingTo(null)
                        setCommentForm(prev => ({ ...prev, parent_id: null }))
                      }}
                      className="text-sm text-primary hover:text-primary/80 mt-1"
                    >
                      Cancel reply
                    </button>
                  </div>
                )}
                
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div className="mb-4">
                    <label htmlFor="comment-name" className="block text-sm font-medium text-foreground mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      id="comment-name"
                      placeholder="Your name"
                      value={commentForm.author_name}
                      onChange={(e) => setCommentForm(prev => ({ ...prev, author_name: e.target.value }))}
                      className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="comment-email" className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="comment-email"
                      placeholder="your.email@example.com"
                      value={commentForm.author_email}
                      onChange={(e) => setCommentForm(prev => ({ ...prev, author_email: e.target.value }))}
                      className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="comment-text" className="block text-sm font-medium text-foreground mb-2">
                      Comment
                    </label>
                    <textarea
                      id="comment-text"
                      rows={4}
                      placeholder={replyingTo ? "Write your reply..." : "What are your thoughts on this article?"}
                      value={commentForm.content}
                      onChange={(e) => setCommentForm(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium"
                  >
                    {replyingTo ? 'Post Reply' : 'Post Comment'}
                  </button>
                </form>
              </div>
              
              {/* Existing Comments */}
              {commentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading comments...</span>
                  </div>
                </div>
              ) : organizedComments.length > 0 ? (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-foreground mb-4">
                    Comments ({comments.length})
                  </h4>
                  
                  {organizedComments.map(comment => (
                    <CommentComponent key={comment.id} comment={comment} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No comments yet</h3>
                  <p className="text-muted-foreground">Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:max-w-[300px]">
            <div className="border-border bg-accent flex flex-col items-start rounded-lg border py-6 md:py-8">
              <div className="mb-8 px-6">
                <div className="text-2xl font-bold font-playfair text-foreground">
                  ZephWrites
                </div>
                <div className="text-sm text-muted-foreground">
                  Personal Blog
                </div>
              </div>
              <div className="mb-5 px-6 last:mb-0">
                <div className="mb-2 text-xs font-semibold">Author</div>
                <div className="text-muted-foreground overflow-hidden text-xs md:text-sm">
                  {blog.author_name || 'Zephaniah Chizulu'}
                </div>
              </div>
              <div className="mb-5 px-6 last:mb-0">
                <div className="mb-2 text-xs font-semibold">Category</div>
                <div className="text-muted-foreground overflow-hidden text-xs md:text-sm">
                  {blog.category || 'General'}
                </div>
              </div>
              <div className="border-border mb-5 w-full border-t px-6 pt-5 last:mb-0">
                <div className="mb-2 text-xs font-semibold">Published</div>
                <div className="text-muted-foreground overflow-hidden text-xs md:text-sm">
                  {formatDate(blog.published_at || blog.created_at)}
                </div>
              </div>
              <div className="mb-5 px-6 last:mb-0">
                <div className="mb-2 text-xs font-semibold">Reading Time</div>
                <div className="text-muted-foreground overflow-hidden text-xs md:text-sm">
                  {formatReadTime(blog.content)}
                </div>
              </div>
              <div className="mb-5 px-6 last:mb-0">
                <div className="mb-2 text-xs font-semibold">Views</div>
                <div className="text-muted-foreground overflow-hidden text-xs md:text-sm">
                  {blog.view_count || 0} views
                </div>
              </div>
              {blog.tags && blog.tags.length > 0 && (
                <div className="mb-5 px-6 last:mb-0">
                  <div className="mb-2 text-xs font-semibold">Tags</div>
                  <div className="text-muted-foreground overflow-hidden text-xs md:text-sm">
                    {blog.tags.join(', ')}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default BlogPost;