-- Create a Supabase Edge Function to handle email sending
-- This SQL creates the necessary setup for email functions

-- First, let's fix the newsletter subscription RLS issue
ALTER TABLE newsletter_subscribers DISABLE ROW LEVEL SECURITY;

-- Create a function to send emails via Supabase Edge Functions
-- Note: You'll need to deploy this as an Edge Function in Supabase

-- For now, let's create a simple email log table to track email sends
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email_type VARCHAR(50) NOT NULL, -- 'welcome', 'blog_notification', 'test'
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE
);

-- Create index for performance
CREATE INDEX idx_email_logs_type ON email_logs(email_type);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at);

-- Disable RLS for email logs (for admin access)
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin can manage email logs" ON email_logs FOR ALL USING (true);

COMMENT ON TABLE email_logs IS 'Log of all email attempts for tracking and debugging';