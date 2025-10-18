-- ZephWrites Database Update Script #006
-- Fix blog_topic NOT NULL constraint issue
-- Date: October 17, 2025
-- Purpose: Ensure blog_topic gets populated when category is provided from frontend

-- First, let's make blog_topic nullable temporarily to avoid constraint violations
ALTER TABLE blogs ALTER COLUMN blog_topic DROP NOT NULL;

-- Update the sync trigger to handle the blog_topic requirement
CREATE OR REPLACE FUNCTION sync_blog_category_and_topic()
RETURNS TRIGGER AS $$
BEGIN
    -- When category is provided but blog_topic is null, set blog_topic from category
    IF NEW.category IS NOT NULL AND NEW.blog_topic IS NULL THEN
        NEW.blog_topic := NEW.category;
    END IF;
    
    -- When blog_topic is provided but category is null, set category from blog_topic
    IF NEW.blog_topic IS NOT NULL AND NEW.category IS NULL THEN
        NEW.category := NEW.blog_topic;
    END IF;
    
    -- When category is updated, update blog_topic
    IF NEW.category IS DISTINCT FROM OLD.category AND NEW.category IS NOT NULL THEN
        NEW.blog_topic := NEW.category;
    END IF;
    
    -- When blog_topic is updated, update category
    IF NEW.blog_topic IS DISTINCT FROM OLD.blog_topic AND NEW.blog_topic IS NOT NULL THEN
        NEW.category := NEW.blog_topic;
    END IF;
    
    -- Ensure blog_topic is never null (set default if both are null)
    IF NEW.blog_topic IS NULL AND NEW.category IS NULL THEN
        NEW.blog_topic := 'General';
        NEW.category := 'General';
    END IF;
    
    -- When is_published is updated, update status
    IF NEW.is_published IS DISTINCT FROM OLD.is_published THEN
        NEW.status := CASE 
            WHEN NEW.is_published THEN 'published'::blog_status 
            ELSE 'draft'::blog_status 
        END;
        
        -- Set published_at timestamp when publishing
        IF NEW.is_published AND (OLD.is_published IS NULL OR OLD.is_published = FALSE) THEN
            NEW.published_at := NOW();
        END IF;
    END IF;
    
    -- When status is updated, update is_published
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        NEW.is_published := (NEW.status = 'published');
    END IF;
    
    -- When is_featured is updated, update featured
    IF NEW.is_featured IS DISTINCT FROM OLD.is_featured THEN
        NEW.featured := NEW.is_featured;
    END IF;
    
    -- When featured is updated, update is_featured
    IF NEW.featured IS DISTINCT FROM OLD.featured THEN
        NEW.is_featured := NEW.featured;
    END IF;
    
    -- Handle featured_image sync
    IF NEW.featured_image IS DISTINCT FROM OLD.featured_image AND NEW.featured_image IS NOT NULL THEN
        NEW.featured_image_url := NEW.featured_image;
    END IF;
    
    IF NEW.featured_image_url IS DISTINCT FROM OLD.featured_image_url AND NEW.featured_image_url IS NOT NULL THEN
        NEW.featured_image := NEW.featured_image_url;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the updated trigger to blogs table
DROP TRIGGER IF EXISTS sync_blog_fields_trigger ON blogs;
DROP TRIGGER IF EXISTS sync_blog_image_fields_trigger ON blogs;
CREATE TRIGGER sync_blog_all_fields_trigger 
    BEFORE INSERT OR UPDATE ON blogs
    FOR EACH ROW 
    EXECUTE FUNCTION sync_blog_category_and_topic();

-- Update any existing records that might have null blog_topic
UPDATE blogs 
SET blog_topic = COALESCE(blog_topic, category, 'General')
WHERE blog_topic IS NULL;

-- Now add the NOT NULL constraint back, but with a default
ALTER TABLE blogs ALTER COLUMN blog_topic SET DEFAULT 'General';
ALTER TABLE blogs ALTER COLUMN blog_topic SET NOT NULL;

-- Verification queries (uncomment to test)
-- SELECT id, title, category, blog_topic, is_published, status, is_featured, featured FROM blogs LIMIT 5;
-- INSERT INTO blogs (title, slug, content, category, author_name, is_published) VALUES ('Test Post', 'test-post-' || extract(epoch from now()), 'Test content for verification', 'Technology', 'Test Author', false);