import { Resend } from 'resend'

// Initialize Resend with API key from environment variables
const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY)

export const emailService = {
  // Send new blog notification to subscribers
  async sendNewBlogNotification(blog, subscribers) {
    try {
      const emailPromises = subscribers.map(subscriber => {
        return resend.emails.send({
          from: 'ZephWrites <noreply@zephwrites.com>', // Replace with your verified domain
          to: subscriber.email,
          subject: `New Blog Post: ${blog.title}`,
          html: generateBlogNotificationHTML(blog, subscriber),
        })
      })

      const results = await Promise.allSettled(emailPromises)
      
      // Count successful sends
      const successful = results.filter(result => result.status === 'fulfilled').length
      const failed = results.filter(result => result.status === 'rejected').length
      
      console.log(`Email notification sent: ${successful} successful, ${failed} failed`)
      
      return { successful, failed, total: subscribers.length }
    } catch (error) {
      console.error('Failed to send blog notifications:', error)
      throw error
    }
  },

  // Send welcome email to new subscriber
  async sendWelcomeEmail(subscriberEmail, subscriberName) {
    try {
      const response = await resend.emails.send({
        from: 'ZephWrites <noreply@zephwrites.com>', // Replace with your verified domain
        to: subscriberEmail,
        subject: 'Welcome to ZephWrites Newsletter!',
        html: generateWelcomeEmailHTML(subscriberName),
      })

      console.log('Welcome email sent successfully:', response)
      return response
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      throw error
    }
  },

  // Test email function
  async sendTestEmail(toEmail) {
    try {
      const response = await resend.emails.send({
        from: 'ZephWrites <noreply@zephwrites.com>', // Replace with your verified domain
        to: toEmail,
        subject: 'Test Email from ZephWrites',
        html: `
          <h2>Test Email</h2>
          <p>This is a test email from your ZephWrites blog to verify Resend integration is working correctly.</p>
          <p>If you receive this, your email system is working! 🎉</p>
        `,
      })

      console.log('Test email sent successfully:', response)
      return response
    } catch (error) {
      console.error('Failed to send test email:', error)
      throw error
    }
  }
}

// Generate HTML for blog notification email
function generateBlogNotificationHTML(blog, subscriber) {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://zephwrites.vercel.app'
  const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Blog Post - ${blog.title}</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .blog-meta { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
            .unsubscribe { color: #666; font-size: 11px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🚀 New Blog Post Published!</h1>
            <p>A fresh article is waiting for you on ZephWrites</p>
        </div>
        
        <div class="content">
            <h2>${blog.title}</h2>
            
            <div class="blog-meta">
                <strong>📅 Published:</strong> ${new Date(blog.published_at || blog.created_at).toLocaleDateString()}<br>
                <strong>📂 Category:</strong> ${blog.blog_topic}<br>
                <strong>⏱️ Reading Time:</strong> ${blog.reading_time_minutes || 5} minutes<br>
                ${blog.tags && blog.tags.length > 0 ? `<strong>🏷️ Tags:</strong> ${blog.tags.join(', ')}` : ''}
            </div>
            
            ${blog.excerpt ? `<p>${blog.excerpt}</p>` : ''}
            
            <p>I've just published a new article that I think you'll find interesting. Click the button below to read the full post:</p>
            
            <center>
                <a href="${siteUrl}/blog/${blog.slug}" class="button">Read Article →</a>
            </center>
            
            <p>Thank you for being a subscriber to ZephWrites! I appreciate your interest in my content and hope you enjoy this latest piece.</p>
            
            <p>Best regards,<br>
            <strong>Zephaniah Chizulu</strong><br>
            ZephWrites</p>
        </div>
        
        <div class="footer">
            <p>You're receiving this email because you subscribed to the ZephWrites newsletter.</p>
            <p class="unsubscribe">
                Don't want to receive these emails anymore? 
                <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe here</a>
            </p>
        </div>
    </body>
    </html>
  `
}

// Generate HTML for welcome email
function generateWelcomeEmailHTML(subscriberName) {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://zephwrites.vercel.app'
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ZephWrites!</title>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 12px; color: #666; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎉 Welcome to ZephWrites!</h1>
            <p>Thank you for subscribing to my newsletter</p>
        </div>
        
        <div class="content">
            <h2>Hello ${subscriberName ? subscriberName : 'there'}! 👋</h2>
            
            <p>Welcome to the ZephWrites community! I'm thrilled to have you on board.</p>
            
            <p>Here's what you can expect from this newsletter:</p>
            <ul>
                <li>🚀 <strong>Technical Deep Dives:</strong> In-depth articles about web development, React, and modern programming</li>
                <li>💡 <strong>Development Tips:</strong> Practical advice and best practices I've learned along the way</li>
                <li>🎯 <strong>Project Insights:</strong> Behind-the-scenes looks at interesting projects and challenges</li>
                <li>📚 <strong>Learning Resources:</strong> Curated tools, books, and resources for developers</li>
            </ul>
            
            <p>I'll only send you emails when I publish new content - no spam, no excessive emails, just quality content when it's ready.</p>
            
            <center>
                <a href="${siteUrl}" class="button">Explore ZephWrites →</a>
            </center>
            
            <p>Feel free to reply to this email if you have any questions or just want to say hello. I love hearing from readers!</p>
            
            <p>Best regards,<br>
            <strong>Zephaniah Chizulu</strong><br>
            Creator of ZephWrites</p>
        </div>
        
        <div class="footer">
            <p>Thanks for subscribing to ZephWrites newsletter!</p>
            <p>If you ever want to unsubscribe, just reply to any email with "unsubscribe" and I'll take care of it.</p>
        </div>
    </body>
    </html>
  `
}