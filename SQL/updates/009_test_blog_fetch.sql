-- ZephWrites Database Update Script #009
-- Test and verify blog fetch functionality
-- Date: October 17, 2025
-- Purpose: Test queries to ensure blog fetching works correctly

-- Test 1: Check if blogs exist and have proper structure
SELECT 
    id,
    title,
    slug,
    author_name,
    category,
    is_published,
    is_featured,
    created_at,
    CASE 
        WHEN LENGTH(content) > 50 THEN LEFT(content, 50) || '...'
        ELSE content
    END as content_preview
FROM blogs 
WHERE is_published = true
ORDER BY created_at DESC
LIMIT 5;

-- Test 2: Check for the specific slug that failed
SELECT 
    id,
    title,
    slug,
    author_name,
    is_published
FROM blogs 
WHERE slug = 'writing-a-new-test';

-- Test 3: Check blog_quotes relationship
SELECT 
    b.title,
    b.slug,
    bq.quote_text,
    bq.highlight_color
FROM blogs b
LEFT JOIN blog_quotes bq ON b.id = bq.blog_id
WHERE b.is_published = true
LIMIT 5;

-- Test 4: Check blog_comments separately (this was causing the 406 error)
SELECT 
    bc.id,
    bc.author_name,
    bc.content,
    bc.status,
    b.title as blog_title
FROM blog_comments bc
JOIN blogs b ON bc.blog_id = b.id
WHERE bc.status = 'approved' 
AND b.is_published = true
LIMIT 5;

-- Test 5: Verify the fixed query structure (what the frontend should use)
-- This simulates the corrected getBlogBySlug query
SELECT 
    b.*,
    json_agg(
        json_build_object(
            'quote_text', bq.quote_text,
            'author', bq.author,
            'highlight_color', bq.highlight_color,
            'position_in_blog', bq.position_in_blog
        )
    ) FILTER (WHERE bq.id IS NOT NULL) as blog_quotes
FROM blogs b
LEFT JOIN blog_quotes bq ON b.id = bq.blog_id
WHERE b.slug = 'writing-a-new-test' 
AND b.is_published = true
GROUP BY b.id;