-- ZephWrites Database Update Script #014
-- Add comments table for featured articles (hardcoded, not in blogs table)
-- Date: March 13, 2026

-- Featured article comments table
CREATE TABLE featured_article_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_slug VARCHAR(255) NOT NULL,
    parent_id UUID REFERENCES featured_article_comments(id) ON DELETE CASCADE,
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(255),
    content TEXT NOT NULL,
    status comment_status DEFAULT 'approved',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
);

-- Indexes
CREATE INDEX idx_fa_comments_article_slug ON featured_article_comments(article_slug);
CREATE INDEX idx_fa_comments_status ON featured_article_comments(status);

-- Updated_at trigger
CREATE TRIGGER update_fa_comments_updated_at BEFORE UPDATE ON featured_article_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE featured_article_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_all_select_fa" ON featured_article_comments FOR SELECT USING (true);
CREATE POLICY "allow_all_insert_fa" ON featured_article_comments FOR INSERT WITH CHECK (true);
