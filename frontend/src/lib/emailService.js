// Email Service - Using Supabase Edge Functions
import { supabase } from './supabase'

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`

export const emailService = {
  // Send new blog notification via Edge Function
  async sendNewBlogNotification(blog, subscribers) {
    try {
      console.log(`📧 Sending blog notification "${blog.title}" to ${subscribers.length} subscribers`)
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'blog_notification',
          blogData: blog,
          subscribers: subscribers
        }
      })

      if (error) throw error
      
      console.log('✅ Blog notification emails sent successfully:', data)
      return data.data || { successful: subscribers.length, failed: 0, total: subscribers.length }
    } catch (error) {
      console.error('Failed to send blog notifications:', error)
      throw error
    }
  },

  // Send welcome email via Edge Function
  async sendWelcomeEmail(subscriberEmail, subscriberName) {
    try {
      console.log(`📧 Sending welcome email to ${subscriberEmail}`)
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'welcome',
          to: subscriberEmail,
          subject: 'Welcome to ZephWrites Newsletter!',
          html: emailTemplates.generateWelcomeEmailHTML(subscriberName)
        }
      })

      if (error) throw error
      
      console.log('✅ Welcome email sent successfully:', data)
      return data.data
    } catch (error) {
      console.error('Failed to send welcome email:', error)
      throw error
    }
  },

  // Send test email via Edge Function
  async sendTestEmail(toEmail) {
    try {
      console.log(`📧 Sending test email to ${toEmail}`)
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          type: 'test',
          to: toEmail,
          subject: 'Test Email from ZephWrites'
        }
      })

      if (error) throw error
      
      console.log('✅ Test email sent successfully:', data)
      return {
        success: true,
        message: 'Test email sent successfully! Check your inbox.',
        data: data.data
      }
    } catch (error) {
      console.error('Failed to send test email:', error)
      throw error
    }
  },

  // Log email attempt for tracking
  async logEmailAttempt(type, recipient, subject, status = 'sent') {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .insert({
          email_type: type,
          recipient_email: recipient,
          subject: subject,
          status: status,
          sent_at: new Date().toISOString()
        })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Failed to log email attempt:', error)
      // Don't throw here - logging failure shouldn't break email sending
    }
  }
}

// Email template generators (for future Edge Function use)
export const emailTemplates = {
  generateBlogNotificationHTML(blog, subscriber) {
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
              
              <p>I appreciate your interest in my content and hope you enjoy this latest piece.</p>
              
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
  },

  generateWelcomeEmailHTML(subscriberName) {
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
              <h1>Hi There!</h1>
              <p>Thank you for subscribing to my newsletter</p>
          </div>
          
          <div class="content">
              <h2>Hello ${subscriberName ? subscriberName : 'there'}!</h2>
              
              <p>Thank you for subscribing. I'm delighted to have you here.</p>
              
              <p>Here's what you can expect from ZephWrites:</p>
              <ul>
                  <li><strong>General Insights and Ideas:</strong> Thought-provoking write-ups designed to educate and inspire</li>
                  <li><strong>Technical and Career Tips:</strong> Practical advice and best practices from my experience as a Software Developer</li>
                  <li><strong>Curated Resources:</strong> Carefully selected content and open-source materials from across the web</li>
              </ul>
              
              <center>
                  <a href="${siteUrl}" class="button">Explore ZephWrites →</a>
              </center>
              
          
              <p>Best regards,<br>
              <strong>Zephaniah Chizulu</strong><br>
              Creator of ZephWrites</p>
          </div>
          
          <div class="footer">
              <p>Thanks for subscribing to ZephWrites newsletter!</p>
          </div>
      </body>
      </html>
    `
  }
}