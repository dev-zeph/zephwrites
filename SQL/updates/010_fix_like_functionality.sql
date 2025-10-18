-- ZephWrites Database Update Script #010
-- Fix and enhance like functionality
-- Date: October 17, 2025
-- Purpose: Ensure like functionality works properly with real-time updates

-- First, let's verify the increment_blog_likes function exists and works
-- If it doesn't exist, we'll create a simpler version

-- Check if the function exists
-- SELECT EXISTS (
--     SELECT 1 FROM pg_proc 
--     WHERE proname = 'increment_blog_likes'
-- );

-- Create a simpler like increment function that always works
CREATE OR REPLACE FUNCTION simple_increment_blog_likes(blog_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    new_like_count INTEGER;
BEGIN
    -- Update the like count and return the new value
    UPDATE blogs 
    SET like_count = like_count + 1 
    WHERE id = blog_uuid;
    
    -- Get the updated like count
    SELECT like_count INTO new_like_count
    FROM blogs 
    WHERE id = blog_uuid;
    
    -- Insert a like record for tracking (optional, without IP restrictions for now)
    INSERT INTO blog_likes (blog_id, user_ip) 
    VALUES (blog_uuid, '127.0.0.1'::inet)
    ON CONFLICT DO NOTHING;
    
    RETURN new_like_count;
END;
$$ language 'plpgsql';

-- Test the function
-- SELECT simple_increment_blog_likes((SELECT id FROM blogs LIMIT 1));

-- Alternative: Create a get_blog_with_updated_likes function
CREATE OR REPLACE FUNCTION get_blog_with_stats(blog_slug TEXT)
RETURNS TABLE (
    id UUID,
    title VARCHAR(255),
    slug VARCHAR(255),
    content TEXT,
    excerpt TEXT,
    author_name VARCHAR(100),
    category VARCHAR(100),
    tags VARCHAR(50)[],
    featured_image TEXT,
    like_count INTEGER,
    view_count INTEGER,
    is_published BOOLEAN,
    is_featured BOOLEAN,
    created_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.title,
        b.slug,
        b.content,
        b.excerpt,
        b.author_name,
        b.category,
        b.tags,
        b.featured_image,
        b.like_count,
        b.view_count,
        b.is_published,
        b.is_featured,
        b.created_at,
        b.published_at
    FROM blogs b
    WHERE b.slug = blog_slug 
    AND b.is_published = true;
END;
$$ language 'plpgsql';

-- Verification queries
-- SELECT * FROM get_blog_with_stats('your-blog-slug-here');
-- SELECT id, title, like_count, view_count FROM blogs WHERE is_published = true;