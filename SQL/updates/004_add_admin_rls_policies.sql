-- ZephWrites Database Update Script #004
-- Add RLS policies for admin blog operations
-- Date: October 17, 2025
-- Purpose: Fix "new row violates row-level security policy" error for blog creation

-- Add policy to allow inserting new blogs (for admin/authenticated users)
-- This allows anyone to create blogs (you can modify this to be more restrictive if needed)
CREATE POLICY "Anyone can create blogs" ON blogs
    FOR INSERT WITH CHECK (true);

-- Add policy to allow updating blogs (for admin operations)
CREATE POLICY "Anyone can update blogs" ON blogs
    FOR UPDATE USING (true) WITH CHECK (true);

-- Add policy to allow deleting blogs (for admin operations)
CREATE POLICY "Anyone can delete blogs" ON blogs
    FOR DELETE USING (true);

-- Alternative: More restrictive policies (commented out)
-- These would require authentication and could be customized further

-- Policy for authenticated users only (uncomment if you want to restrict to authenticated users)
-- CREATE POLICY "Authenticated users can create blogs" ON blogs
--     FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can update blogs" ON blogs
--     FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- CREATE POLICY "Authenticated users can delete blogs" ON blogs
--     FOR DELETE USING (auth.role() = 'authenticated');

-- Policy for specific admin email (uncomment and modify if you want to restrict to specific admin)
-- CREATE POLICY "Admin can create blogs" ON blogs
--     FOR INSERT WITH CHECK (auth.email() = 'zephchizulu@gmail.com');

-- CREATE POLICY "Admin can update blogs" ON blogs
--     FOR UPDATE USING (auth.email() = 'zephchizulu@gmail.com') WITH CHECK (auth.email() = 'zephchizulu@gmail.com');

-- CREATE POLICY "Admin can delete blogs" ON blogs
--     FOR DELETE USING (auth.email() = 'zephchizulu@gmail.com');

-- Verification queries (uncomment to test)
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual FROM pg_policies WHERE tablename = 'blogs';
-- SELECT * FROM blogs WHERE status = 'draft' LIMIT 3;