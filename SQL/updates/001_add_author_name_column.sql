-- ZephWrites Database Update Script #001
-- Add missing author_name column to blogs table
-- Date: October 17, 2025
-- Purpose: Fix "Could not find the 'author_name' column" error in admin dashboard

-- Add author_name column to blogs table
ALTER TABLE blogs 
ADD COLUMN author_name VARCHAR(100) DEFAULT 'Zeph Chizulu';

-- Add index for author_name for better query performance
CREATE INDEX idx_blogs_author_name ON blogs(author_name);

-- Update existing records to have the default author name
UPDATE blogs 
SET author_name = 'Zeph Chizulu' 
WHERE author_name IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN blogs.author_name IS 'Name of the blog post author for display purposes';

-- Verification query (uncomment to test)
-- SELECT id, title, author_name, created_at FROM blogs LIMIT 5;