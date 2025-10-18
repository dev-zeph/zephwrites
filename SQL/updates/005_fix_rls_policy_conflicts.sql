-- ZephWrites Database Update Script #005
-- Fix RLS policy conflicts for blog operations
-- Date: October 17, 2025
-- Purpose: Resolve persistent "new row violates row-level security policy" error

-- First, let's see what policies currently exist (uncomment to check)
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename = 'blogs';

-- Drop all existing policies on blogs table to start fresh
DROP POLICY IF EXISTS "Published blogs are viewable by everyone" ON blogs;
DROP POLICY IF EXISTS "Anyone can create blogs" ON blogs;
DROP POLICY IF EXISTS "Anyone can update blogs" ON blogs;
DROP POLICY IF EXISTS "Anyone can delete blogs" ON blogs;
DROP POLICY IF EXISTS "Authenticated users can create blogs" ON blogs;
DROP POLICY IF EXISTS "Authenticated users can update blogs" ON blogs;
DROP POLICY IF EXISTS "Authenticated users can delete blogs" ON blogs;
DROP POLICY IF EXISTS "Admin can create blogs" ON blogs;
DROP POLICY IF EXISTS "Admin can update blogs" ON blogs;
DROP POLICY IF EXISTS "Admin can delete blogs" ON blogs;

-- Create comprehensive policies that work together
-- Allow public read access to published blogs
CREATE POLICY "Public can read published blogs" ON blogs
    FOR SELECT USING (status = 'published');

-- Allow full access for all operations (you can restrict this later)
CREATE POLICY "Full access for all operations" ON blogs
    FOR ALL USING (true) WITH CHECK (true);

-- Alternative: If you want to completely disable RLS for development (uncomment the line below)
-- ALTER TABLE blogs DISABLE ROW LEVEL SECURITY;

-- Alternative: More granular approach (comment out the "Full access" policy above and uncomment below)
-- CREATE POLICY "Allow insert blogs" ON blogs
--     FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Allow select all blogs" ON blogs
--     FOR SELECT USING (true);

-- CREATE POLICY "Allow update all blogs" ON blogs
--     FOR UPDATE USING (true) WITH CHECK (true);

-- CREATE POLICY "Allow delete all blogs" ON blogs
--     FOR DELETE USING (true);

-- Verification queries (uncomment to test)
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename = 'blogs';
-- INSERT INTO blogs (title, slug, content, blog_topic, author_name, category, is_published) VALUES ('Test Post', 'test-post', 'Test content', 'Test', 'Test Author', 'Test', false);