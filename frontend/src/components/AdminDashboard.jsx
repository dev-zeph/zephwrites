import React, { useState } from 'react'
import { PlusCircle, FileText, Users, BarChart3, Settings, LogOut, Edit, Trash2, Eye } from 'lucide-react'
import AdminPanel from './AdminPanel'
import { useBlogs } from '../hooks/useBlog'
import { blogService } from '../lib/blogService'

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview')
  const [showCreatePost, setShowCreatePost] = useState(false)
  
  const { blogs, loading: blogsLoading } = useBlogs(1, 50) // Load more posts for admin view

  const handleLogout = () => {
    sessionStorage.removeItem('zephwrites_admin')
    onLogout()
  }

  const stats = {
    totalPosts: blogs.length,
    publishedPosts: blogs.filter(blog => blog.is_published).length,
    draftPosts: blogs.filter(blog => !blog.is_published).length,
    totalViews: blogs.reduce((sum, blog) => sum + (blog.view_count || 0), 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }



  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold font-playfair bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                ZephWrites Admin
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Eye className="w-4 h-4" />
                View Site
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                Overview
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === 'posts'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <FileText className="w-5 h-5" />
                Posts
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold font-playfair text-foreground">Dashboard Overview</h2>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <PlusCircle className="w-5 h-5" />
                    New Post
                  </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Posts</p>
                        <p className="text-2xl font-bold text-foreground">{stats.totalPosts}</p>
                      </div>
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Published</p>
                        <p className="text-2xl font-bold text-foreground">{stats.publishedPosts}</p>
                      </div>
                      <Eye className="w-8 h-8 text-green-600" />
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Drafts</p>
                        <p className="text-2xl font-bold text-foreground">{stats.draftPosts}</p>
                      </div>
                      <Edit className="w-8 h-8 text-amber-600" />
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Views</p>
                        <p className="text-2xl font-bold text-foreground">{stats.totalViews}</p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </div>

                {/* Recent Posts */}
                <div className="bg-card border border-border rounded-lg">
                  <div className="px-6 py-4 border-b border-border">
                    <h3 className="text-lg font-semibold text-foreground">Recent Posts</h3>
                  </div>
                  <div className="p-6">
                    {blogsLoading ? (
                      <p className="text-muted-foreground">Loading posts...</p>
                    ) : blogs.length > 0 ? (
                      <div className="space-y-4">
                        {blogs.slice(0, 5).map((blog) => (
                          <div key={blog.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground mb-1">{blog.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{formatDate(blog.created_at)}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  blog.is_published 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {blog.is_published ? 'Published' : 'Draft'}
                                </span>
                                <span>{blog.view_count || 0} views</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-muted-foreground hover:text-red-600 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
                        <p className="text-muted-foreground mb-4">Create your first blog post to get started.</p>
                        <div className="flex justify-center">
                          <button
                            onClick={() => setShowCreatePost(true)}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            Create Post
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'posts' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold font-playfair text-foreground">Manage Posts</h2>
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <PlusCircle className="w-5 h-5" />
                    New Post
                  </button>
                </div>

                <div className="bg-card border border-border rounded-lg">
                  <div className="p-6">
                    {blogsLoading ? (
                      <p className="text-muted-foreground">Loading posts...</p>
                    ) : blogs.length > 0 ? (
                      <div className="space-y-4">
                        {blogs.map((blog) => (
                          <div key={blog.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground mb-2">{blog.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                {blog.excerpt || blog.content?.substring(0, 150) + '...'}
                              </p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{formatDate(blog.created_at)}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  blog.is_published 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {blog.is_published ? 'Published' : 'Draft'}
                                </span>
                                <span>{blog.view_count || 0} views</span>
                                {blog.category && <span>#{blog.category}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button className="p-2 text-muted-foreground hover:text-foreground rounded-lg">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-muted-foreground hover:text-red-600 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold text-foreground mb-2">No posts found</h3>
                        <p className="text-muted-foreground mb-6">You haven't created any blog posts yet.</p>
                        <div className="flex justify-center">
                          <button
                            onClick={() => setShowCreatePost(true)}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                          >
                            Create Your First Post
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <AdminPanel onClose={() => setShowCreatePost(false)} />
      )}
    </div>
  )
}

export default AdminDashboard