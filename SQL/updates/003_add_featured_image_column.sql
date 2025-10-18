-- ZephWrites Database Update Script #003
-- Add featured_image column with image upload support
-- Date: October 17, 2025
-- Purpose: Fix "Could not find the 'featured_image' column" error and enable image uploads

-- Add featured_image column (frontend expects this instead of featured_image_url)
ALTER TABLE blogs 
ADD COLUMN IF NOT EXISTS featured_image TEXT;

-- Update existing records to populate featured_image from featured_image_url
UPDATE blogs 
SET featured_image = COALESCE(featured_image, featured_image_url)
WHERE featured_image IS NULL AND featured_image_url IS NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_blogs_featured_image ON blogs(featured_image);

-- Add comment for documentation
COMMENT ON COLUMN blogs.featured_image IS 'Featured image URL or file path for blog post (supports both uploads and external URLs)';

-- Create or update the sync trigger to handle featured_image and featured_image_url sync
CREATE OR REPLACE FUNCTION sync_blog_image_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- When featured_image is updated, update featured_image_url
    IF NEW.featured_image IS DISTINCT FROM OLD.featured_image AND NEW.featured_image IS NOT NULL THEN
        NEW.featured_image_url := NEW.featured_image;
    END IF;
    
    -- When featured_image_url is updated, update featured_image
    IF NEW.featured_image_url IS DISTINCT FROM OLD.featured_image_url AND NEW.featured_image_url IS NOT NULL THEN
        NEW.featured_image := NEW.featured_image_url;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the image sync trigger to blogs table
DROP TRIGGER IF EXISTS sync_blog_image_fields_trigger ON blogs;
CREATE TRIGGER sync_blog_image_fields_trigger 
    BEFORE UPDATE ON blogs
    FOR EACH ROW 
    EXECUTE FUNCTION sync_blog_image_fields();

-- Create storage bucket for blog images (Supabase Storage)
-- Note: This requires Supabase Storage to be enabled in your project
-- You may need to run this separately or create the bucket via Supabase Dashboard

-- Create policy for blog images bucket (allows public read, authenticated upload)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('blog-images', 'blog-images', true) ON CONFLICT DO NOTHING;

-- Create storage policies for blog images
-- CREATE POLICY "Public can view blog images" ON storage.objects FOR SELECT USING (bucket_id = 'blog-images');
-- CREATE POLICY "Authenticated users can upload blog images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Users can update their own blog images" ON storage.objects FOR UPDATE WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');
-- CREATE POLICY "Users can delete their own blog images" ON storage.objects FOR DELETE WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- Verification queries (uncomment to test)
-- SELECT id, title, featured_image, featured_image_url, created_at FROM blogs WHERE featured_image IS NOT NULL OR featured_image_url IS NOT NULL LIMIT 5;
-- SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'blogs' AND column_name IN ('featured_image', 'featured_image_url');