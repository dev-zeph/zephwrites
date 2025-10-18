# ZephWrites - Supabase Integration Setup

## Environment Variables

To connect your blog to Supabase, you need to configure your environment variables.

### 1. Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Go to Settings > API
4. Copy your Project URL and anon key

### 2. Update Environment Variables

Edit the `.env.local` file in your frontend directory and replace the placeholder values:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Setup

Run the SQL commands from `foundations.sql` in your Supabase SQL editor:

1. Go to Supabase Dashboard > SQL Editor
2. Copy the contents of `foundations.sql`
3. Paste and run the SQL commands
4. This will create all necessary tables, policies, and functions

### 4. Test Your Connection

1. Start your development server: `npm run dev`
2. Open your browser and navigate to your blog
3. Check the browser console for any connection errors
4. The articles should load from your Supabase database

### 5. Add Sample Data (Optional)

You can add sample blog posts through the Supabase dashboard or by running INSERT statements in the SQL editor.

Example blog post:

```sql
INSERT INTO blogs (
  title,
  content,
  excerpt,
  author_name,
  category,
  tags,
  featured_image,
  is_published,
  is_featured
) VALUES (
  'Welcome to ZephWrites',
  '<p>This is my first blog post on ZephWrites...</p>',
  'A brief introduction to my new blog.',
  'Zephaniah Chizulu',
  'Personal',
  ARRAY['welcome', 'introduction'],
  'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d',
  true,
  true
);
```

### 6. Security Notes

- Never commit your actual credentials to version control
- Use environment variables for all sensitive data
- The anon key is safe to use in frontend applications
- Row Level Security (RLS) is enabled to protect your data

### 7. Troubleshooting

If you encounter issues:

1. Check that your environment variables are correctly set
2. Verify your Supabase project is active
3. Ensure RLS policies are properly configured
4. Check browser console for detailed error messages

Your blog should now be fully connected to Supabase!