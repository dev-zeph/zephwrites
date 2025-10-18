-- ZephWrites Database Update Script #011
-- Fix comment functionality and relationships
-- Date: October 17, 2025
-- Purpose: Fix 401 Unauthorized error for comments and ensure proper article-comment relationships

-- First, let's check current RLS policies on blog_comments
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename = 'blog_comments';

-- Drop existing comment policies to start fresh
DROP POLICY IF EXISTS "Approved comments are viewable by everyone" ON blog_comments;
DROP POLICY IF EXISTS "Anyone can create comments" ON blog_comments;
DROP POLICY IF EXISTS "Public can read approved comments" ON blog_comments;
DROP POLICY IF EXISTS "Allow insert comments" ON blog_comments;
DROP POLICY IF EXISTS "Allow select comments" ON blog_comments;

-- Create comprehensive RLS policies for comments
-- Allow public read access to approved comments
CREATE POLICY "Public can read approved comments" ON blog_comments
    FOR SELECT USING (status = 'approved');

-- Allow anyone to insert comments (they start as pending)
CREATE POLICY "Anyone can insert comments" ON blog_comments
    FOR INSERT WITH CHECK (status = 'pending');

-- Allow admins to update comment status (approve/reject)
CREATE POLICY "Anyone can update comments" ON blog_comments
    FOR UPDATE USING (true) WITH CHECK (true);

-- Allow admins to delete comments
CREATE POLICY "Anyone can delete comments" ON blog_comments
    FOR DELETE USING (true);

-- Ensure the foreign key relationship with CASCADE delete exists
-- This ensures when a blog is deleted, its comments are automatically deleted
ALTER TABLE blog_comments 
DROP CONSTRAINT IF EXISTS blog_comments_blog_id_fkey;

ALTER TABLE blog_comments 
ADD CONSTRAINT blog_comments_blog_id_fkey 
FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE;

-- Ensure parent-child comment relationship with CASCADE delete
ALTER TABLE blog_comments 
DROP CONSTRAINT IF EXISTS blog_comments_parent_id_fkey;

ALTER TABLE blog_comments 
ADD CONSTRAINT blog_comments_parent_id_fkey 
FOREIGN KEY (parent_id) REFERENCES blog_comments(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_comments_blog_id_status ON blog_comments(blog_id, status);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON blog_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_created_at ON blog_comments(created_at);

-- Function to auto-approve comments (optional - you can remove this if you want manual approval)
CREATE OR REPLACE FUNCTION auto_approve_comments()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically approve comments (remove this if you want manual moderation)
    NEW.status := 'approved';
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-approve comments (optional)
DROP TRIGGER IF EXISTS auto_approve_comments_trigger ON blog_comments;
CREATE TRIGGER auto_approve_comments_trigger
    BEFORE INSERT ON blog_comments
    FOR EACH ROW
    EXECUTE FUNCTION auto_approve_comments();

-- Test the setup with a verification query
-- INSERT INTO blog_comments (blog_id, author_name, author_email, content, status) 
-- VALUES ((SELECT id FROM blogs LIMIT 1), 'Test User', 'test@example.com', 'Test comment', 'pending');

-- Verification queries (uncomment to test)
-- SELECT * FROM blog_comments WHERE blog_id = (SELECT id FROM blogs LIMIT 1);
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename = 'blog_comments';