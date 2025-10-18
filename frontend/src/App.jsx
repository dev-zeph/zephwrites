import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import BlogPost from './components/BlogPost'
import { Navbar } from './components/Navbar'
import { ArticlesListing } from './components/ArticlesListing'
import NewsletterSignup from './components/NewsletterSignup'
import AdminPage from './pages/AdminPage'
import { Footer } from './components/Footer'
import Silk from './components/Silk'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/*" element={<MainSite />} />
      </Routes>
    </Router>
  )
}

// Main site component
function MainSite() {
  const [currentView, setCurrentView] = useState('home') // 'home' or 'post'
  const [selectedBlog, setSelectedBlog] = useState(null)

  // Set light mode as default
  useEffect(() => {
    document.documentElement.className = ''
  }, [])

  const handleNavigation = (view) => {
    setCurrentView(view)
    if (view === 'home') {
      setSelectedBlog(null)
    }
  }

  const handleSelectPost = (blog) => {
    setSelectedBlog(blog)
    setCurrentView('post')
  }

  const handleBackToArticles = () => {
    setSelectedBlog(null)
    setCurrentView('home')
  }

  return (
    <div className="">
      <div className="min-h-screen bg-background text-foreground w-full">
        {/* Navigation */}
        <Navbar 
          onNavigation={handleNavigation}
        />

        {/* Main Content */}
        <main className="max-w-none">
          {currentView === 'home' ? (
            <div>
              {/* Hero Section with Silk Background */}
              <section className="hero-silk relative py-24 min-h-[80vh] border-b border-border overflow-hidden">
                {/* Silk Background */}
                <div className="silk-container absolute inset-0 z-0">
                  <Silk
                    speed={5}
                    scale={1}
                    color="#7B7481"
                    noiseIntensity={1.5}
                    rotation={0}
                  />
                </div>
                
                {/* Light overlay for better text readability */}
                <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10"></div>
                
                {/* Hero Content */}
                <div className="relative z-20 max-w-7xl mx-auto px-8 text-center flex flex-col justify-center min-h-[60vh] pointer-events-none">
                  <h1 className="blog-title mb-8 drop-shadow-sm text-5xl md:text-7xl">ZephWrites.</h1>
                  <p className="blog-subtitle max-w-3xl mx-auto drop-shadow-sm text-xl md:text-2xl leading-relaxed text-gray-700">
                    My thoughts, stories, and ideas about technology, creativity, and life.
                  </p>
                  <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
                    <button 
                      className="backdrop-blur-md bg-primary hover:bg-primary/90 border border-primary/20 hover:border-primary/30 text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                      onClick={() => document.querySelector('.articles-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      Explore Articles
                    </button>
                    <button 
                      className="backdrop-blur-md bg-transparent hover:bg-gray-100/80 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-8 py-4 rounded-lg font-medium transition-all duration-300"
                      onClick={() => document.querySelector('.about-section')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                      About Me
                    </button>
                  </div>
                </div>
              </section>
              {/* About Section */}
              <section className="about-section py-20 bg-gray-50/50">
                <div className="max-w-6xl mx-auto px-8">
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        What's up? 
                      </h2>
                      <p className="text-xl text-muted-foreground leading-relaxed">
                        I'm Zeph, a witty software developer, humanitarian and casual writer. I also like to talk, sometimes. 
                        
                      </p>
                      <p className="text-lg text-muted-foreground leading-relaxed">
                        I created ZephWrites as a means for me to share my thoughts, experiences, and general ideas with my to community to inspire others in the subtle, not so noticable ways.
                        If you like what you read, reach out and say hi!
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">Welcome!</span>           
                      </div>
                    </div>
                    <div className="relative">
                      <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl p-8">
                        <div className="w-full h-full bg-white rounded-xl flex items-center justify-center shadow-inner">
                          <div className="text-center space-y-4">
                            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                              <img 
                                src="/MY.png" 
                                alt="Zeph - Writer & Developer" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="text-2xl font-bold text-gray-800">Zeph</div>
                            <div className="text-gray-600">Writer & Developer</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Featured Content Grid */}
              <section className="py-20 bg-white border-y border-gray-100">
                <div className="max-w-7xl mx-auto px-8">
                  <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Featured Content</h2>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                      Discover the most popular articles and latest insights from ZephWrites
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Featured Card 1 */}
                    <div className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer">
                      <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center">
                        <div className="text-6xl">🚀</div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors text-gray-900">
                        The Future of Web Development
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Exploring emerging trends and technologies shaping the future of web development...
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>5 min read</span>
                        <span>Technology</span>
                      </div>
                    </div>

                    {/* Featured Card 2 */}
                    <div className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer">
                      <div className="w-full h-48 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-4 flex items-center justify-center">
                        <div className="text-6xl">💡</div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-purple-600 transition-colors text-gray-900">
                        Creative Problem Solving
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Techniques and mindsets for approaching complex challenges with creativity...
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>7 min read</span>
                        <span>Creativity</span>
                      </div>
                    </div>

                    {/* Featured Card 3 */}
                    <div className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl hover:border-gray-300 transition-all duration-300 cursor-pointer">
                      <div className="w-full h-48 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg mb-4 flex items-center justify-center">
                        <div className="text-6xl">📚</div>
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-green-600 transition-colors text-gray-900">
                        Learning in Public
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Why sharing your learning journey can accelerate your growth and help others...
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>4 min read</span>
                        <span>Growth</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* Articles Listing */}
              <div className="articles-section bg-gray-50/30">
                <div className="max-w-7xl mx-auto px-8">
                  <ArticlesListing onSelectPost={handleSelectPost} />
                </div>
              </div>
              
              {/* Newsletter Signup */}
              <section className="py-20 bg-gradient-to-r from-blue-50/80 to-purple-50/80">
                <div className="max-w-4xl mx-auto px-8">
                  <NewsletterSignup />
                </div>
              </section>
            </div>
          ) : (
            <BlogPost 
              blogSlug={selectedBlog?.slug} 
              onBack={handleBackToArticles}
            />
          )}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}

export default App
