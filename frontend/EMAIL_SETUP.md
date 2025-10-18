# ZephWrites Email Newsletter System

## Overview
This email system uses **Resend** to send automated newsletter notifications to subscribers when new blog posts are published. It includes welcome emails for new subscribers and unsubscribe functionality.

## Features
- ✅ Welcome emails for new subscribers
- ✅ Automated notifications when blogs are published
- ✅ Beautiful HTML email templates
- ✅ Unsubscribe functionality
- ✅ Email testing in admin panel
- ✅ Subscriber management

## Setup Instructions

### 1. Sign up for Resend
1. Go to [resend.com](https://resend.com) and create an account
2. Verify your email address
3. Go to the API Keys section in your dashboard
4. Create a new API key (save it securely)

### 2. Configure Environment Variables
Add these to your `.env.local` file:

```bash
# Resend API Configuration
VITE_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxx

# Email Configuration (optional - defaults to resend.dev)
VITE_EMAIL_FROM_DOMAIN=yourdomain.com
VITE_EMAIL_FROM_NAME=ZephWrites
```

### 3. Domain Verification (For Production)
For production use, you'll need to verify your domain in Resend:

1. Go to Domains in your Resend dashboard
2. Add your domain (e.g., `zephwrites.com`)
3. Add the provided DNS records to your domain
4. Wait for verification
5. Update `VITE_EMAIL_FROM_DOMAIN` with your verified domain

**For Testing:** You can use `resend.dev` domain which works immediately without verification.

### 4. Test Email Functionality
1. Go to `/admin` in your application
2. Login to the admin panel
3. Navigate to "Email System" tab
4. Enter your email address
5. Click "Send Test Email"
6. Check your inbox for the test email

## Email Templates

### Welcome Email
Sent automatically when users subscribe to the newsletter. Includes:
- Welcome message
- What to expect from the newsletter
- Link back to the website

### Blog Notification Email
Sent when new blogs are published. Includes:
- Blog title and excerpt
- Publication date and metadata
- "Read Article" button
- Unsubscribe link

## How It Works

### New Subscriber Flow
1. User enters email in newsletter signup form
2. Email is saved to `newsletter_subscribers` table
3. Welcome email is sent automatically
4. User receives confirmation

### Blog Publication Flow
1. Admin publishes a new blog post
2. System checks if blog is being published for first time
3. Gets list of active subscribers
4. Sends notification email to all subscribers
5. Emails are sent in batches for better performance

### Unsubscribe Flow
1. User clicks unsubscribe link in email
2. Redirected to `/unsubscribe?email=user@example.com`
3. Email is marked as `is_active: false` in database
4. User sees confirmation message

## Database Schema

### newsletter_subscribers table
- `email` - Subscriber email address
- `name` - Optional subscriber name
- `is_active` - Whether subscription is active
- `subscribed_at` - When they subscribed
- `unsubscribed_at` - When they unsubscribed (if applicable)
- `subscription_source` - Where they subscribed from

## API Usage

### Email Service Functions
```javascript
import { emailService } from './lib/emailService'

// Send test email
await emailService.sendTestEmail('test@example.com')

// Send welcome email
await emailService.sendWelcomeEmail('new@subscriber.com', 'John Doe')

// Send blog notification
await emailService.sendNewBlogNotification(blogData, subscribers)
```

### Newsletter Service Functions
```javascript
import { newsletterService } from './lib/blogService'

// Subscribe user
await newsletterService.subscribe('user@example.com', 'User Name')

// Get active subscribers
const subscribers = await newsletterService.getActiveSubscribers()

// Unsubscribe user
await newsletterService.unsubscribe('user@example.com')

// Get subscriber count
const count = await newsletterService.getSubscriberCount()
```

## Troubleshooting

### Common Issues

**1. "API key not found" error**
- Make sure `VITE_RESEND_API_KEY` is set in `.env.local`
- Restart your development server after adding environment variables

**2. "Domain not verified" error**
- Use `resend.dev` for testing (no verification needed)
- For production, verify your domain in Resend dashboard

**3. Emails not being sent**
- Check the browser console for error messages
- Verify your Resend API key is correct
- Make sure you have credits in your Resend account

**4. Emails going to spam**
- Verify your domain in Resend
- Set up SPF, DKIM, and DMARC records
- Use a professional "from" address

### Testing Tips
- Use the email test panel in admin dashboard
- Check both inbox and spam folders
- Test with different email providers (Gmail, Outlook, etc.)

## Rate Limits
Resend free tier includes:
- 3,000 emails/month
- 100 emails/day

For higher volumes, upgrade to a paid plan.

## Security Notes
- API keys are exposed in frontend (normal for client-side usage)
- Unsubscribe links contain email addresses (consider tokens for production)
- Email validation prevents malformed addresses

## Future Improvements
- [ ] Email templates customization UI
- [ ] Email analytics and open rates
- [ ] Scheduled newsletter sending
- [ ] Email segmentation by interests
- [ ] A/B testing for email content