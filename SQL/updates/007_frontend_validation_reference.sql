-- ZephWrites Database Update Script #007
-- Improve frontend validation to match database constraints
-- Date: October 17, 2025
-- Purpose: Document database constraints for frontend validation reference

-- This file documents the existing database constraints that the frontend should validate against
-- No actual database changes needed - this is for frontend development reference

/*
DATABASE CONSTRAINTS TO VALIDATE IN FRONTEND:

1. Title constraints:
   - Minimum 5 characters (blogs_title_length CHECK)
   - Required field (NOT NULL)

2. Content constraints:
   - Minimum 100 characters (blogs_content_length CHECK)
   - Required field (NOT NULL)

3. Slug constraints:
   - Must match format: lowercase letters, numbers, hyphens only (blogs_slug_format CHECK)
   - Must be unique (UNIQUE constraint)

4. Numeric constraints:
   - reading_time_minutes >= 0 (blogs_reading_time_positive CHECK)
   - like_count >= 0 (blogs_like_count_positive CHECK)
   - view_count >= 0 (blogs_view_count_positive CHECK)

5. Required fields:
   - title (NOT NULL)
   - slug (NOT NULL, UNIQUE)
   - content (NOT NULL)
   - blog_topic (NOT NULL) - auto-populated from category via trigger
   - blog_type (NOT NULL, has default 'article')

FRONTEND VALIDATION RECOMMENDATIONS:
- Add title length validation (min 5 characters)
- Add content length validation (min 100 characters)
- Add slug format validation (or auto-generate valid slugs)
- Show character counters for title and content
- Validate numeric fields are non-negative
*/

-- Query to check current constraint details (uncomment to run)
-- SELECT 
--     conname as constraint_name,
--     pg_get_constraintdef(c.oid) as constraint_definition
-- FROM pg_constraint c 
-- JOIN pg_namespace n ON n.oid = c.connamespace 
-- WHERE conrelid = 'blogs'::regclass 
-- AND contype = 'c';