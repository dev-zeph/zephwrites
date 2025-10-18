import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { newsletterService } from '../lib/blogService'

const UnsubscribePage = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // 'loading', 'success', 'error'
  const [message, setMessage] = useState('')
  const email = searchParams.get('email')

  useEffect(() => {
    const handleUnsubscribe = async () => {
      if (!email) {
        setStatus('error')
        setMessage('No email address provided.')
        return
      }

      try {
        await newsletterService.unsubscribe(email)
        setStatus('success')
        setMessage('You have been successfully unsubscribed from the ZephWrites newsletter.')
      } catch (error) {
        setStatus('error')
        setMessage('Failed to unsubscribe. Please try again or contact support.')
        console.error('Unsubscribe error:', error)
      }
    }

    handleUnsubscribe()
  }, [email])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Processing...</h2>
            <p className="text-muted-foreground">Unsubscribing you from the newsletter.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">Unsubscribed Successfully</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <p className="text-sm text-muted-foreground">
              We're sorry to see you go! If you change your mind, you can always subscribe again from the main page.
            </p>
            <div className="mt-6">
              <a 
                href="/" 
                className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Back to ZephWrites
              </a>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-5xl mb-4">✗</div>
            <h2 className="text-xl font-semibold mb-2 text-foreground">Unsubscribe Failed</h2>
            <p className="text-muted-foreground mb-6">{message}</p>
            <p className="text-sm text-muted-foreground mb-6">
              If you continue to receive emails, please reply to any newsletter email with "unsubscribe" and we'll take care of it manually.
            </p>
            <div className="space-y-2">
              <a 
                href="/" 
                className="block w-full px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Back to ZephWrites
              </a>
              <a 
                href="mailto:zephchizulu@gmail.com?subject=Unsubscribe Request" 
                className="block w-full px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                Contact Support
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default UnsubscribePage