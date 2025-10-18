-- ZephWrites Database Update Script #002
-- Add missing columns to match frontend expectations
-- Date: October 17, 2025
-- Purpose: Fix column mismatch errors between frontend and database schema

-- Add author_name column to blogs table
ALTER TABLE blogs 
ADD COLUMN IF NOT EXISTS author_name VARCHAR(100) DEFAULT 'Zeph Chizulu';

-- Add category column (frontend expects this instead of blog_topic)
ALTER TABLE blogs 
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Add is_published column (frontend expects this instead of status)
ALTER TABLE blogs 
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

-- Add is_featured column (frontend expects this instead of featured)
ALTER TABLE blogs 
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;

-- Update existing records to populate new columns based on existing data
UPDATE blogs 
SET 
  author_name = COALESCE(author_name, 'Zeph Chizulu'),
  category = COALESCE(category, blog_topic),
  is_published = COALESCE(is_published, (status = 'published')),
  is_featured = COALESCE(is_featured, featured)
WHERE 
  author_name IS NULL 
  OR category IS NULL 
  OR is_published IS NULL 
  OR is_featured IS NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_blogs_author_name ON blogs(author_name);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_is_published ON blogs(is_published);
CREATE INDEX IF NOT EXISTS idx_blogs_is_featured ON blogs(is_featured);

-- Add comments for documentation
COMMENT ON COLUMN blogs.author_name IS 'Name of the blog post author for display purposes';
COMMENT ON COLUMN blogs.category IS 'Blog category for frontend compatibility (mirrors blog_topic)';
COMMENT ON COLUMN blogs.is_published IS 'Boolean flag for published status (frontend expects this format)';
COMMENT ON COLUMN blogs.is_featured IS 'Boolean flag for featured posts (frontend expects this format)';

-- Create trigger to keep category and blog_topic in sync
CREATE OR REPLACE FUNCTION sync_blog_category_and_topic()
RETURNS TRIGGER AS $$
BEGIN
    -- When category is updated, update blog_topic
    IF NEW.category IS DISTINCT FROM OLD.category AND NEW.category IS NOT NULL THEN
        NEW.blog_topic := NEW.category;
    END IF;
    
    -- When blog_topic is updated, update category
    IF NEW.blog_topic IS DISTINCT FROM OLD.blog_topic AND NEW.blog_topic IS NOT NULL THEN
        NEW.category := NEW.blog_topic;
    END IF;
    
    -- When is_published is updated, update status
    IF NEW.is_published IS DISTINCT FROM OLD.is_published THEN
        NEW.status := CASE 
            WHEN NEW.is_published THEN 'published'::blog_status 
            ELSE 'draft'::blog_status 
        END;
        
        -- Set published_at timestamp when publishing
        IF NEW.is_published AND OLD.is_published = FALSE THEN
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
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to blogs table
DROP TRIGGER IF EXISTS sync_blog_fields_trigger ON blogs;
CREATE TRIGGER sync_blog_fields_trigger 
    BEFORE UPDATE ON blogs
    FOR EACH ROW 
    EXECUTE FUNCTION sync_blog_category_and_topic();

-- Verification queries (uncomment to test)
-- SELECT id, title, author_name, category, blog_topic, is_published, status, is_featured, featured, created_at FROM blogs LIMIT 5;
-- SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'blogs' AND column_name IN ('author_name', 'category', 'is_published', 'is_featured');