-- ZephWrites Blog Database Schema
-- Created for Supabase PostgreSQL
-- Date: October 17, 2025

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create enum types for better data consistency
CREATE TYPE blog_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE blog_type AS ENUM ('article', 'tutorial', 'case_study', 'quick_tip', 'personal');
CREATE TYPE comment_status AS ENUM ('pending', 'approved', 'rejected');

-- Blogs table - Main table for storing blog posts
CREATE TABLE blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    blog_type blog_type NOT NULL DEFAULT 'article',
    blog_topic VARCHAR(100) NOT NULL,
    keywords TEXT[], -- Array of keywords for SEO
    tags VARCHAR(50)[], -- Array of tags for categorization
    featured_image_url TEXT,
    reading_time_minutes INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    status blog_status DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    meta_title VARCHAR(255), -- SEO meta title
    meta_description TEXT, -- SEO meta description
    author_id UUID, -- For future multi-author support
    featured BOOLEAN DEFAULT FALSE,
    
    -- Full-text search
    search_vector TSVECTOR,
    
    -- Constraints
    CONSTRAINT blogs_title_length CHECK (char_length(title) >= 5),
    CONSTRAINT blogs_content_length CHECK (char_length(content) >= 100),
    CONSTRAINT blogs_slug_format CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
    CONSTRAINT blogs_reading_time_positive CHECK (reading_time_minutes >= 0),
    CONSTRAINT blogs_like_count_positive CHECK (like_count >= 0),
    CONSTRAINT blogs_view_count_positive CHECK (view_count >= 0)
);

-- Blog quotes table - For memorable quotes from each blog
CREATE TABLE blog_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    quote_text TEXT NOT NULL,
    author VARCHAR(100), -- Quote author (if different from blog author)
    highlight_color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for highlighting
    position_in_blog INTEGER, -- Order/position within the blog
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT quote_text_length CHECK (char_length(quote_text) >= 10),
    CONSTRAINT quote_color_format CHECK (highlight_color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Blog likes table - Track individual likes (for analytics)
CREATE TABLE blog_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    user_ip INET, -- For anonymous likes tracking
    user_agent TEXT, -- Browser fingerprinting
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate likes from same IP within 24 hours
    UNIQUE(blog_id, user_ip)
);

-- Blog views table - Track page views for analytics
CREATE TABLE blog_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    user_ip INET,
    user_agent TEXT,
    referrer TEXT,
    country VARCHAR(2), -- ISO country code
    city VARCHAR(100),
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments table - For blog discussion section
CREATE TABLE blog_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES blog_comments(id) ON DELETE CASCADE, -- For threaded comments
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(255),
    author_website VARCHAR(255),
    content TEXT NOT NULL,
    status comment_status DEFAULT 'pending',
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT comment_content_length CHECK (char_length(content) >= 5),
    CONSTRAINT comment_author_name_length CHECK (char_length(author_name) >= 2),
    CONSTRAINT comment_like_count_positive CHECK (like_count >= 0)
);

-- Newsletter subscribers table
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    subscription_source VARCHAR(50) DEFAULT 'blog', -- Where they subscribed from
    
    CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Blog categories/topics table (for future expansion)
CREATE TABLE blog_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280', -- Hex color for UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog series table (for multi-part content)
CREATE TABLE blog_series (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for blogs in series
CREATE TABLE blog_series_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    series_id UUID NOT NULL REFERENCES blog_series(id) ON DELETE CASCADE,
    blog_id UUID NOT NULL REFERENCES blogs(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    
    UNIQUE(series_id, blog_id),
    UNIQUE(series_id, position)
);

-- Create indexes for performance
CREATE INDEX idx_blogs_status ON blogs(status);
CREATE INDEX idx_blogs_type ON blogs(blog_type);
CREATE INDEX idx_blogs_topic ON blogs(blog_topic);
CREATE INDEX idx_blogs_published_at ON blogs(published_at DESC);
CREATE INDEX idx_blogs_featured ON blogs(featured);
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_search_vector ON blogs USING GIN(search_vector);
CREATE INDEX idx_blogs_keywords ON blogs USING GIN(keywords);
CREATE INDEX idx_blogs_tags ON blogs USING GIN(tags);

CREATE INDEX idx_blog_quotes_blog_id ON blog_quotes(blog_id);
CREATE INDEX idx_blog_likes_blog_id ON blog_likes(blog_id);
CREATE INDEX idx_blog_views_blog_id ON blog_views(blog_id);
CREATE INDEX idx_blog_views_viewed_at ON blog_views(viewed_at);
CREATE INDEX idx_blog_comments_blog_id ON blog_comments(blog_id);
CREATE INDEX idx_blog_comments_status ON blog_comments(status);
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blogs_updated_at BEFORE UPDATE ON blogs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_comments_updated_at BEFORE UPDATE ON blog_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for updating search vector
CREATE OR REPLACE FUNCTION update_blog_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.keywords, ' '), '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(array_to_string(NEW.tags, ' '), '')), 'B');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_search_vector_trigger BEFORE INSERT OR UPDATE ON blogs
    FOR EACH ROW EXECUTE FUNCTION update_blog_search_vector();

-- Create functions for common operations

-- Function to increment like count
CREATE OR REPLACE FUNCTION increment_blog_likes(blog_uuid UUID, user_ip_addr INET)
RETURNS BOOLEAN AS $$
DECLARE
    like_exists BOOLEAN;
BEGIN
    -- Check if like already exists from this IP in last 24 hours
    SELECT EXISTS(
        SELECT 1 FROM blog_likes 
        WHERE blog_id = blog_uuid 
        AND user_ip = user_ip_addr 
        AND created_at > NOW() - INTERVAL '24 hours'
    ) INTO like_exists;
    
    IF NOT like_exists THEN
        -- Insert new like
        INSERT INTO blog_likes (blog_id, user_ip) VALUES (blog_uuid, user_ip_addr);
        
        -- Update blog like count
        UPDATE blogs SET like_count = like_count + 1 WHERE id = blog_uuid;
        
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ language 'plpgsql';

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_blog_views(
    blog_uuid UUID, 
    user_ip_addr INET, 
    user_agent_str TEXT DEFAULT NULL,
    referrer_url TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Insert view record
    INSERT INTO blog_views (blog_id, user_ip, user_agent, referrer) 
    VALUES (blog_uuid, user_ip_addr, user_agent_str, referrer_url);
    
    -- Update blog view count
    UPDATE blogs SET view_count = view_count + 1 WHERE id = blog_uuid;
END;
$$ language 'plpgsql';

-- Create RLS (Row Level Security) policies for Supabase
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public read access for published blogs
CREATE POLICY "Published blogs are viewable by everyone" ON blogs
    FOR SELECT USING (status = 'published');

-- Public read access for approved comments
CREATE POLICY "Approved comments are viewable by everyone" ON blog_comments
    FOR SELECT USING (status = 'approved');

-- Public read access for blog quotes
CREATE POLICY "Blog quotes are viewable by everyone" ON blog_quotes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM blogs 
            WHERE blogs.id = blog_quotes.blog_id 
            AND blogs.status = 'published'
        )
    );

-- Allow anyone to insert comments (they start as pending)
CREATE POLICY "Anyone can create comments" ON blog_comments
    FOR INSERT WITH CHECK (status = 'pending');

-- Sample data insertion
INSERT INTO blogs (
    title, 
    slug, 
    content, 
    excerpt,
    blog_type, 
    blog_topic, 
    keywords, 
    tags,
    reading_time_minutes,
    status,
    published_at,
    featured
) VALUES 
(
    'Welcome to ZephWrites: A Modern Blog Experience',
    'welcome-to-zephwrites',
    'Welcome to ZephWrites, where technology meets creativity and ideas come to life through words. This blog represents my journey as a developer, writer, and continuous learner in the ever-evolving world of web development and digital creation.

    In this space, you''ll find a diverse collection of content ranging from technical tutorials that break down complex programming concepts into digestible pieces, to personal reflections on the challenges and triumphs of building software in today''s fast-paced digital landscape.

    ## What You Can Expect

    **Technical Deep Dives**: Comprehensive guides on modern web technologies including React, TypeScript, Node.js, and the latest frontend frameworks. Each tutorial is crafted with real-world examples and practical applications that you can implement immediately.

    **Design Philosophy**: Exploration of user experience principles, design systems, and the intersection between beautiful interfaces and functional code. We''ll discuss how good design isn''t just about aesthetics—it''s about creating meaningful experiences for users.

    **Development Workflow**: Tips and techniques for improving your development process, from setting up efficient coding environments to implementing robust testing strategies and deployment pipelines.

    **Career Insights**: Lessons learned from navigating the tech industry, building professional relationships, and continuously evolving as a developer in an field that never stops changing.

    This blog is built with modern web technologies including React, Vite, Tailwind CSS, and is powered by Supabase for data management. Every aspect of the site reflects the principles and practices I write about—clean code, thoughtful design, and user-centered experiences.

    Thank you for joining me on this journey. Whether you''re a seasoned developer or just starting your coding adventure, I hope you find value, inspiration, and practical knowledge in these pages.',
    'Discover how to create beautiful, functional blog experiences with modern web technologies. Join me on a journey through code, design, and digital creativity.',
    'article',
    'Web Development',
    ARRAY['react', 'tailwind', 'blog', 'web development', 'frontend', 'javascript'],
    ARRAY['tutorial', 'frontend', 'design', 'welcome'],
    8,
    'published',
    NOW(),
    TRUE
),
(
    'The Art of Technical Writing: Making Complex Ideas Simple',
    'art-of-technical-writing',
    'Technical writing is both an art and a science—a delicate balance between precision and clarity that can make the difference between frustrated developers and empowered teams. In my years of writing documentation, tutorials, and technical content, I''ve learned that the best technical writing doesn''t just convey information; it transforms complex ideas into actionable insights.

    ## Why Technical Writing Matters

    In our rapidly evolving tech landscape, the ability to communicate complex technical concepts clearly has become as valuable as coding skills themselves. Poor documentation costs companies millions in lost productivity, while great technical writing can accelerate learning, reduce support tickets, and build stronger developer communities.

    Consider the last time you struggled with poorly written documentation. The frustration of incomplete examples, unclear explanations, or missing context can turn a simple task into hours of debugging. Conversely, well-crafted technical content can turn complex topics into "aha!" moments that stick with readers long after they''ve closed the browser tab.

    ## The Foundation: Know Your Audience

    Before writing a single word, successful technical writers invest time in understanding their audience. Are you writing for junior developers who need step-by-step guidance, or experienced engineers looking for quick reference material? The same technical concept requires different approaches depending on the reader''s background and goals.

    ## Structure and Flow

    Great technical writing follows predictable patterns that readers can navigate intuitively. Start with the problem you''re solving, provide context for why it matters, then guide readers through the solution with clear examples and practical applications.

    **The STAR Method**:
    - **Situation**: Set the context and define the problem
    - **Task**: Explain what needs to be accomplished  
    - **Action**: Provide step-by-step guidance with examples
    - **Result**: Show the outcome and next steps

    ## Code Examples That Actually Help

    Nothing frustrates developers more than code examples that don''t work. Every code snippet should be:
    - **Complete**: Include all necessary imports and dependencies
    - **Tested**: Verify that examples actually run as written
    - **Relevant**: Directly related to the concept being explained
    - **Progressive**: Build complexity gradually rather than jumping to advanced concepts

    Remember: your goal isn''t to show how much you know, but to help others understand and apply what they''re learning.',
    'Learn how to communicate complex technical concepts in a clear and engaging way. Discover strategies for creating documentation that developers actually want to read.',
    'article',
    'Technical Writing',
    ARRAY['technical writing', 'communication', 'documentation', 'developer experience'],
    ARRAY['writing', 'skills', 'communication', 'documentation'],
    12,
    'published',
    NOW() - INTERVAL '3 days',
    FALSE
);

-- Insert sample quotes
INSERT INTO blog_quotes (blog_id, quote_text, position_in_blog) VALUES 
(
    (SELECT id FROM blogs WHERE slug = 'welcome-to-zephwrites' LIMIT 1),
    'The best way to learn is by doing, and the best way to teach is by sharing.',
    1
),
(
    (SELECT id FROM blogs WHERE slug = 'art-of-technical-writing' LIMIT 1),
    'Clear writing leads to clear thinking, and clear thinking leads to better code.',
    1
);

-- Insert sample categories
INSERT INTO blog_categories (name, slug, description, color) VALUES 
('Web Development', 'web-development', 'Articles about building modern web applications', '#3B82F6'),
('Technical Writing', 'technical-writing', 'Tips and guides for effective technical communication', '#10B981'),
('Design', 'design', 'UI/UX design principles and best practices', '#8B5CF6'),
('Personal', 'personal', 'Personal thoughts and experiences', '#F59E0B');

COMMENT ON TABLE blogs IS 'Main table storing all blog posts with metadata';
COMMENT ON TABLE blog_quotes IS 'Memorable quotes extracted from blog posts';
COMMENT ON TABLE blog_likes IS 'Individual like records for analytics';
COMMENT ON TABLE blog_views IS 'Page view tracking for analytics';
COMMENT ON TABLE blog_comments IS 'User comments and discussions';
COMMENT ON TABLE newsletter_subscribers IS 'Email subscribers for newsletter';