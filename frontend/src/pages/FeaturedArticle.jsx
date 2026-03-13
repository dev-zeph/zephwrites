import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, User, Share2, MessageCircle, Loader2 } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { featuredCommentService } from '../lib/blogService'

const ARTICLE_SLUG = 'true-leadership'

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
              True Leadership
            </h1>

            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              Leadership is nothing more than a call to sacrifice.
            </p>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>March 13, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>6 min read</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>By Zeph</span>
              </div>
            </div>
          </header>

          <div className="mb-8">
            <img
              src="Leader.jpg"
              alt="True Leadership"
              className="w-full aspect-video object-cover rounded-lg shadow-lg"
            />
          </div>

          <article className="prose prose-lg prose-gray max-w-none mb-12">
            <p className="text-xl text-gray-700 mb-6 leading-relaxed">
              Leadership and power are often thought to belong to the courageous and confident, and as long as a person has power, it seems within their right to exert it over their subordinates. I once had a somewhat similar perspective on power and leadership. But the Bible depicts a very different meaning—almost the exact opposite—of what it means to be a leader.
            </p>

            <blockquote className="border-l-4 border-primary pl-6 italic text-gray-600 my-8 text-lg">
              "Now the Lord said to Samuel, 'You have mourned long enough for Saul. I have rejected him as king of Israel, so fill your flask with olive oil and go to Bethlehem. Find a man named Jesse who lives there, for I have selected one of his sons to be my king.' But Samuel asked, 'How can I do that? If Saul hears about it, he will kill me.' 'Take a heifer with you,' the Lord replied, 'and say that you have come to make a sacrifice to the Lord. Invite Jesse to the sacrifice, and I will show you which of his sons to anoint for me.'" —1 Samuel 16:1-3 (NLT)
            </blockquote>

            <p className="mb-6">
              In the passage above, we see an excerpt from the story of David. After Saul was rejected as king of Israel, God told Samuel to prepare his oil and anoint the next king. Samuel feared that the current king, Saul, would try to kill him if he heard Samuel was going to anoint a new king. So God instructed Samuel to take a heifer and say he was going to "make a sacrifice to the Lord."
            </p>

            <p className="mb-6">
              Quite deceptive, isn't it? I always wondered why God was not more straightforward—why He didn't simply tell Samuel to take the horn of oil and boldly declare he was going to anoint the next king, instead of appearing as though he were going to offer a sacrifice.
            </p>

            <p className="mb-4 font-medium text-lg">
              Then it clicked.
            </p>
            <p className="mb-4 font-medium text-lg">
              The sacrifice was not the heifer.
            </p>
            <p className="mb-8 font-bold text-xl text-foreground">
              The sacrifice was the new king—David.
            </p>

            <p className="mb-8">
              David himself would become the offering to God for the people of Israel. True, God-ordained leadership is a call to sacrifice.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">The Example of Jesus</h2>

            <p className="mb-6">
              It makes sense, doesn't it? Jesus demonstrated this same unorthodox idea of leadership:
            </p>

            <blockquote className="border-l-4 border-primary pl-6 italic text-gray-600 my-8 text-lg">
              "Jesus knew that the Father had given him authority over everything and that he had come from God and would return to God. So he got up from the table, took off his robe, wrapped a towel around his waist, and poured water into a basin. Then he began to wash the disciples' feet, drying them with the towel he had around him." —John 13:3-5 (NLT)
            </blockquote>

            <p className="mb-8">
              As Jesus acknowledged that all power in heaven and on earth had been given to Him, He knelt and washed the feet of His disciples. It is absolutely unheard of that the God of all flesh—the most powerful, all-knowing, eternal being—would kneel to wash the feet of those He created. There is no God like Jesus.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">Leadership as Service</h2>

            <p className="mb-6">
              This is precisely what Jesus taught.
            </p>

            <blockquote className="border-l-4 border-primary pl-6 italic text-gray-600 my-8 text-lg">
              "Jesus called them together and said, 'You know that the rulers of the Gentiles lord it over them, and their high officials exercise authority over them. Not so with you. Instead, whoever wants to become great among you must be your servant, and whoever wants to be first must be your slave—just as the Son of Man did not come to be served, but to serve, and to give his life as a ransom for many.'" —Matthew 20:25-28 (NIV)
            </blockquote>

            <p className="mb-8">
              To Jesus, true leadership, power, and greatness are defined by service. Leadership is nothing more than a call to sacrifice. Jesus—the promised Savior, King of the world, the most powerful of all—did not come to conquer the world, but to serve it, ultimately sacrificing His life on the cross for the sins of humanity.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4">A Call to Change</h2>

            <p className="mb-6">
              How much would our world change if our leaders adopted Christ's perspective on power? If they understood that the core of leadership is servitude—not the right to exert power or misuse authority over others.
            </p>

            <p className="mb-6">
              How safe would marriages in Christian families be if wives understood that the husband's leadership means he is called to serve and lay down his life for her? How strong would marriages be if husbands understood that being the "head of the family" does not grant them the right to Lord over their household, but instead calls them to sacrifice daily for those they love? Husbands, not wives, are the true servants in the family.
            </p>

            <p className="mb-6 font-medium text-lg">
              Our perspective has to change.
            </p>

            <p className="mb-6">
              The leaders of tomorrow must see leadership as an opportunity to serve people and improve the lives of those who are struggling. Power should not be desired as a means to steal, control, or accumulate resources, but as an opportunity to positively impact the lives of others.
            </p>

            <p className="text-xl font-bold text-foreground">
              Let the one who desires greatness become a servant first.
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
