import React, { useState } from 'react'
import { Mail, CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { useNewsletter } from '../hooks/useBlog'

const NewsletterSignup = ({ 
  title = "Stay Updated",
  description = "Get notified when I publish new articles about technology, design, and creative writing.",
  className = ""
}) => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const { subscribe, loading, error, success } = useNewsletter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      return
    }

    const result = await subscribe(email, name.trim() || null)
    if (result) {
      setEmail('')
      setName('')
    }
  }

  return (
    <div className={`text-center ${className}`}>
      <div className="mb-6">
        <div className="flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold mb-4 font-playfair text-foreground">
          {title}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      {success ? (
        <div className="max-w-md mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center justify-center mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-green-800 mb-2">Successfully subscribed!</h4>
            <p className="text-green-700 text-sm">
              Thank you for subscribing. You'll receive an email when new articles are published.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="space-y-4">
            {/* Name Field (Optional) */}
            <div>
              <input 
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                disabled={loading}
              />
            </div>

            {/* Email Field */}
            <div>
              <input 
                type="email" 
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Subscribe
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Privacy Note */}
          <p className="mt-4 text-xs text-muted-foreground">
            No spam, unsubscribe at any time. Your email is safe with us.
          </p>
        </form>
      )}
    </div>
  )
}

export default NewsletterSignup