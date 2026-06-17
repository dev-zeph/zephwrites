import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, User, Share2, MessageCircle, Loader2 } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { featuredCommentService } from '../lib/blogService'

const ARTICLE_SLUG = 'mortality-greatest-treasure'

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
              Gift of Mortality
            </h1>

            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              That I do not know tomorrow makes me cherish today.
            </p>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>June 17, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>2 min read</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>By Zeph</span>
              </div>
            </div>
          </header>

          <div className="mb-8">
            <img
              src="Eternity.webp"
              alt="Gift of Mortality"
              className="w-full aspect-video object-cover rounded-lg shadow-lg"
            />
          </div>

          <article className="prose prose-lg prose-gray max-w-none mb-12">
            <p className="text-xl text-gray-700 mb-6 leading-relaxed">
              Mortality is my greatest treasure. A life where I am excited, or anxious of, or ultimately feel any emotion of anticipation — because I do not know what is next — is a gift.
            </p>

            <p className="mb-6">
              That I do not know tomorrow makes me cherish today, and push towards a cause, as though there is no innate inevitability to life, as though fate is not unchangeable, as though neither time nor death is immutable.
            </p>

            <p className="mb-8">
              That I do not know whether I will stumble and still fail is the very core of my inspiration to try one more time. That I do not know when the cold severance of death strikes is the constant reminder to cherish my time with loved ones. That I know I am mortal is my motivation to live, love, and learn.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">If Eternity Were True</h2>

            <p className="mb-6">
              But even if the opposite were true — if I were eternal — if any form within me, perhaps my soul, were eternal, or if I am guided by a sentient, eternal being, wouldn't it mean that I have never made a "wrong decision"?
            </p>

            <p className="mb-6">
              The only feasible comprehension of eternity is that its time is non-linear — to the point of no beginning or end — an unending circular continuum, where the future is as much of a reference as the past, where I can see both the future and the past right here in the present.
            </p>

            <p className="mb-6">
              It would mean that the eternity hidden somewhere deep in me led me to experience situations fully, knowing the futility of the outcome, just for the honor of having experienced it in the first place.
            </p>

            <p className="mb-6">
              If an eternity exists somewhere, or an eternity has an influence over my life, then there is no difficult circumstance or challenge.
            </p>

            <p className="mb-8">
              Maybe before time began, I — or this sentient, eternal being — saw it all play out and chose it. Maybe my soul chose to love, even knowing one day I surely will lose. Maybe I chose this path of obstruction intentionally, even when I think I am unlucky to stumble.
            </p>

            <p className="mb-8">
              Maybe the true essence is not winning, but being honored to have experienced life, even knowing it will all end someday.
            </p>

            <p className="mb-6">
              The honor is not winning the battle, for death captures all — even the valiant, the mighty, and the witted.
            </p>

            <p className="mb-6">
              The honor is stepping into the arena, marred with sweat, blood, and tears, falling and trying again, listening to the chants of the supporters at the home end and blocking out the noise from the opposing end.
            </p>

            <p className="mb-8">
              The honor is fighting through the dusty battlefield, raising the sword of might even when the battle seems futile.
            </p>

            <p className="text-xl font-bold text-foreground">
              The point has always been that I can claim to have experienced life — its challenges, its love and grief, the joy of the mountain tops and the loneliness in the valleys — not that I may win in the end.
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
