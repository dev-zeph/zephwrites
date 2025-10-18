import { useState, useEffect } from 'react'
import { Mail, Send, Users, TestTube } from 'lucide-react'
import { emailService } from '../lib/emailService'
import { newsletterService } from '../lib/blogService'

const EmailTestPanel = () => {
  const [testEmail, setTestEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [subscriberCount, setSubscriberCount] = useState(0)

  const handleTestEmail = async (e) => {
    e.preventDefault()
    if (!testEmail) return

    try {
      setLoading(true)
      setMessage('')
      await emailService.sendTestEmail(testEmail)
      setMessage('Test email sent successfully! Check your inbox.')
    } catch (error) {
      setMessage('Failed to send test email: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const loadSubscriberCount = async () => {
    try {
      const count = await newsletterService.getSubscriberCount()
      setSubscriberCount(count)
    } catch (error) {
      console.error('Failed to load subscriber count:', error)
    }
  }

  // Load subscriber count on mount
  useEffect(() => {
    loadSubscriberCount()
  }, [])

  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-6">
      <div className="flex items-center gap-3">
        <TestTube className="w-6 h-6 text-primary" />
        <h3 className="text-lg font-semibold">Email System Testing</h3>
      </div>

      {/* Subscriber Stats */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        <span>{subscriberCount} active subscribers</span>
        <button 
          onClick={loadSubscriberCount}
          className="text-primary hover:underline"
        >
          (refresh)
        </button>
      </div>

      {/* Test Email Form */}
      <form onSubmit={handleTestEmail} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Test Email Address
          </label>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Send a test email to verify your Resend integration is working
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !testEmail}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Mail className="w-4 h-4 animate-pulse" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Test Email
            </>
          )}
        </button>
      </form>

      {/* Status Message */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('success') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      {/* Setup Instructions */}
      <div className="bg-muted/30 rounded-lg p-4 text-sm">
        <h4 className="font-medium mb-2">Setup Instructions:</h4>
        <ol className="space-y-1 text-muted-foreground">
          <li>1. Sign up at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">resend.com</a></li>
          <li>2. Get your API key from the dashboard</li>
          <li>3. Add it to your .env.local file as VITE_RESEND_API_KEY</li>
          <li>4. Verify your domain (or use resend.dev for testing)</li>
          <li>5. Test email functionality using the form above</li>
        </ol>
      </div>
    </div>
  )
}

export default EmailTestPanel