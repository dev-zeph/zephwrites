import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, to, subject, html, blogData, subscribers } = await req.json()

    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }

    let result

    switch (type) {
      case 'test':
        result = await sendTestEmail(to, subject)
        break
      case 'welcome':
        result = await sendWelcomeEmail(to, subject, html)
        break
      case 'blog_notification':
        result = await sendBlogNotification(blogData, subscribers)
        break
      default:
        throw new Error(`Unknown email type: ${type}`)
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

async function sendTestEmail(to: string, subject: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'ZephWrites <onboarding@resend.dev>',
      to: [to],
      subject: subject || 'Test Email from ZephWrites',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">🎉 Test Email Successful!</h2>
          <p>This is a test email from your ZephWrites blog to verify the Resend integration is working correctly.</p>
          <p>If you receive this, your email system is working perfectly! ✅</p>
          <hr style="margin: 20px 0; border: 1px solid #eee;">
          <p style="color: #666; font-size: 14px;">
            Sent from ZephWrites Edge Function<br>
            <a href="https://zephwrites.vercel.app">Visit ZephWrites</a>
          </p>
        </div>
      `,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Resend API error: ${response.status} - ${error}`)
  }

  return await response.json()
}

async function sendWelcomeEmail(to: string, subject: string, html: string) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'ZephWrites <onboarding@resend.dev>',
      to: [to],
      subject: subject || 'Welcome to ZephWrites Newsletter!',
      html: html,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Resend API error: ${response.status} - ${error}`)
  }

  return await response.json()
}

async function sendBlogNotification(blogData: any, subscribers: any[]) {
  const emailPromises = subscribers.map(async (subscriber) => {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'ZephWrites <onboarding@resend.dev>',
          to: [subscriber.email],
          subject: `New Blog Post: ${blogData.title}`,
          html: generateBlogNotificationHTML(blogData, subscriber),
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Failed to send to ${subscriber.email}: ${error}`)
      }

      return { success: true, email: subscriber.email }
    } catch (error) {
      console.error(`Failed to send email to ${subscriber.email}:`, error)
      return { success: false, email: subscriber.email, error: error.message }
    }
  })

  const results = await Promise.allSettled(emailPromises)
  const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
  const failed = results.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)).length

  return {
    successful,
    failed,
    total: subscribers.length,
    details: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: 'Promise rejected' })
  }
}

function generateBlogNotificationHTML(blog: any, subscriber: any) {
  const siteUrl = 'https://zephwrites.vercel.app'
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
                <strong>📂 Category:</strong> ${blog.blog_topic || 'General'}<br>
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