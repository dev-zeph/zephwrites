import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, User, Share2, MessageCircle, Loader2 } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { featuredCommentService } from '../lib/blogService'

const ARTICLE_SLUG = 'baghdad-to-tehran'

const FeaturedArticle = () => {
  const navigate = useNavigate()

  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [commentForm, setCommentForm] = useState({
    author_name: '',
    author_email: '',
    content: '',
    parent_id: null
  })
  const [replyingTo, setReplyingTo] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchComments = async () => {
    try {
      setCommentsLoading(true)
      const data = await featuredCommentService.getComments(ARTICLE_SLUG)
      setComments(data)
    } catch (err) {
      console.error('Error fetching comments:', err)
    } finally {
      setCommentsLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [])

  const handleCommentSubmit = async (e) => {
    e.preventDefault()

    if (!commentForm.author_name || !commentForm.author_email || !commentForm.content) {
      alert('Please fill in all fields')
      return
    }

    try {
      setSubmitting(true)
      await featuredCommentService.addComment(
        ARTICLE_SLUG,
        commentForm.author_name,
        commentForm.author_email,
        commentForm.content,
        commentForm.parent_id
      )

      setCommentForm({ author_name: '', author_email: '', content: '', parent_id: null })
      setReplyingTo(null)
      alert('Comment posted successfully!')

      setTimeout(() => fetchComments(), 500)
    } catch (error) {
      console.error('Error submitting comment:', error)
      alert('Failed to post comment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = (commentId, authorName) => {
    setReplyingTo({ id: commentId, author: authorName })
    setCommentForm(prev => ({ ...prev, parent_id: commentId }))
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const organizeComments = (comments) => {
    const commentMap = {}
    const rootComments = []

    comments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] }
    })

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

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map(reply => (
            <CommentComponent key={reply.id} comment={reply} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  )

  const handleBack = () => {
    navigate('/')
  }

  const handleNavigation = (view) => {
    if (view === 'home') {
      navigate('/')
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onNavigation={handleNavigation} />

      <main className="flex-1 bg-background">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-primary hover:text-primary/80 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-white">
              Featured Article
            </span>
          </div>

          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-playfair leading-tight">
              Death in Tehran
            </h1>

            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              Are you running from Baghdad to Tehran?
            </p>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>May 11, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>4 min read</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>By Zeph</span>
              </div>
            </div>
          </header>

          <div className="mb-8">
            <img
              src="Tehran.jpg"
              alt="Death in Tehran"
              className="w-full aspect-video object-cover rounded-lg shadow-lg"
            />
          </div>

          <article className="prose prose-lg prose-gray max-w-none mb-12">
            <p className="text-xl text-gray-700 mb-6 leading-relaxed">
              In an illustration of an old folklore, a master and his slave lived in Baghdad. One night, the slave approached the master, horrified, asking for his fastest horse. The slave claimed he had met Death, and intended to flee to the city of Tehran. The master immediately obliged, granting the slave's request and giving him his fastest horse. The slave mounted the horse and began his journey to Tehran. Later that day, the master himself met Death. The master asked, "What did you do to confront my slave?" Death replied, "I did not confront your slave. I was only surprised to meet him in Baghdad yesterday, when he was destined to meet his inevitable fate in Tehran."
            </p>

            <p className="mb-6">
              This story portrays the futility of life, the inevitability of fate, and the vast randomness of a world in which no one can truly be certain of anything. <strong>In a desperate attempt to save his life, the slave ran from his place of safety, straight toward the very city where he was destined to die.</strong>
            </p>

            <p className="mb-8">
              In retrospect, maybe the things I run from are the very experiences meant to save me, and the things I so desperately believe I need may be what end my life, or cause harm in ways not so evidently seen. In every situation we find ourselves, we must consciously pause to ask whether we are, in fact, running from Baghdad to Tehran. <strong>Maybe where you are already standing holds the salvation you never knew you needed.</strong>
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">A Hand Behind the Scenes</h2>

            <p className="mb-6">
              In the same vein, I believe the uncertainty of life is itself a certain pointer to a hand behind the scenes. For the complexities of life are too vast, the intricacies too deep, that an offset of just a margin can trigger an avalanche of consequences. Yet we humans so desperately try to play God in our own lives — even when we cannot grasp the slightest of things, nor comprehend in any way the consequences of what we desire.
            </p>

            <p className="mb-8">
              <strong>The very fact that life is so uncertain, and that we exist as we are, is a certain pointer that the universe does indeed have a man behind the scenes.</strong>
            </p>

            <p className="text-xl font-bold text-foreground">
              Are you running from Baghdad to Tehran?
            </p>
          </article>

          <div className="border-t border-border pt-8">
            <div className="flex items-start gap-6">
              <img
                src="/MY.png"
                alt="Zeph"
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
              />
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  About Zeph
                </h4>
                <p className="text-muted-foreground mb-4">
                  Software developer, humanitarian, and casual writer.
                </p>
                <a
                  href="https://chizuluzephaniah.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Visit my portfolio →
                </a>
              </div>
            </div>
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
                  disabled={submitting}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium disabled:opacity-50"
                >
                  {submitting ? 'Posting...' : replyingTo ? 'Post Reply' : 'Post Comment'}
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
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default FeaturedArticle
