-- ZephWrites Database Update Script #008
-- Clean up sample/demo blog posts from database
-- Date: October 17, 2025
-- Purpose: Remove any hardcoded sample posts that might be showing on homepage

-- Remove sample posts by title patterns (uncomment to execute)
-- DELETE FROM blogs WHERE title LIKE '%Welcome to ZephWrites%';
-- DELETE FROM blogs WHERE title LIKE '%Building Modern Web Applications%';
-- DELETE FROM blogs WHERE title LIKE '%Art of Technical Writing%';

-- Alternative: Remove posts by common sample slugs
-- DELETE FROM blogs WHERE slug IN (
--     'welcome-to-zephwrites',
--     'building-modern-web-applications-with-react',
--     'the-art-of-technical-writing'
-- );

-- Alternative: Remove all posts if you want a completely fresh start (BE CAREFUL!)
-- DELETE FROM blogs;

-- View current posts to see what's in the database
SELECT 
    id,
    title,
    slug,
    author_name,
    category,
    is_published,
    is_featured,
    created_at
FROM blogs 
ORDER BY created_at DESC;

-- Check for any posts that might be sample data
SELECT 
    id,
    title,
    LEFT(content, 100) as content_preview,
    author_name,
    created_at
FROM blogs 
WHERE 
    title ILIKE '%welcome%' 
    OR title ILIKE '%sample%' 
    OR title ILIKE '%test%'
    OR title ILIKE '%demo%'
    OR content ILIKE '%this is a sample%'
ORDER BY created_at DESC;