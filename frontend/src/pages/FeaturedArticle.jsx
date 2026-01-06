import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, User, Share2 } from 'lucide-react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'

const FeaturedArticle = () => {
  const navigate = useNavigate()

  const handleBack = () => {
    navigate('/')
  }

  const handleNavigation = (view) => {
    if (view === 'home') {
      navigate('/')
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onNavigation={handleNavigation} />
      
      <main className="flex-1 bg-background">
        <div className="container mx-auto px-6 py-12 max-w-4xl">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-primary hover:text-primary/80 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          <div className="mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-white">
              Featured Article
            </span>
          </div>

          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 font-playfair leading-tight">
              Identification Through Differentiation
            </h1>
            
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              Understanding who you are requires being surrounded by what you are not.
            </p>

            <div className="flex flex-wrap items-center gap-6 text-muted-foreground text-sm mb-8">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>January 6, 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>4 min read</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>By Zeph</span>
              </div>
            </div>
          </header>

          <div className="mb-8">
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              alt="Identification Through Differentiation"
              className="w-full aspect-video object-cover rounded-lg shadow-lg"
            />
          </div>

          <article className="prose prose-lg prose-gray max-w-none mb-12">
            <p className="text-xl text-gray-700 mb-6 leading-relaxed">
              I never recognized myself as a particularly intelligent child. Throughout my academic life, my performance was fairly average, usually in the seventies across most cumulative results. At the same time, I knew I possessed strong traits of emotional intelligence. I was deeply in tune with my emotions, able to regulate how I felt, and capable of understanding the emotional states of others simply by being present with them or listening closely. Moods were contagious to me; I could often deduce how someone felt about me with very few words spoken.
            </p>
            
            <p className="mb-6">
              As a young teenager, I struggled with this perception of myself. I labeled myself as "too emotional" or soft. My emotional depth often conflicted with my idea of what it meant to be a "strong man." At the time, I did not understand that this sensitivity was my core area of competence, nor did I know how to channel it.
            </p>
            
            <p className="mb-6">
              Emotional intelligence is rarely placed in the spotlight. Children are typically acknowledged for academic achievement, not for subtlety, emotional depth, attunement, or intuition.
            </p>
            
            <p className="mb-8">
              This is understandable, as academics are often what distinguish one child from another; they serve as the conventional measure of "smartness." Parents commonly follow this path, prioritizing academic success over other spheres and comparing children based on grades and academic prowess.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">The Light Within</h2>
            
            <p className="mb-6">
              I attribute the discovery of my emotional intelligence and intuition to the realization that core academics may not have been my primary strength. The dimness around me led me inward, toward the part of myself that shone brightest. I am now learning to hone that light to help others who are still in the dark.
            </p>
            
            <blockquote className="border-l-4 border-primary pl-6 italic text-gray-600 my-8 text-lg">
              "If you ever feel that you do not 'measure up' in one sphere, remember that you likely possess another area in which you are above average; perhaps not where you expect, but certainly within you."
            </blockquote>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">The Power of Contrast</h2>
            
            <p className="mb-6">
              Identification is impossible when a subject is indistinguishable from its surroundings. When there is no contrast, definition becomes difficult. Identification only becomes possible when a subject is surrounded by what it is not.
            </p>
            
            <p className="mb-6">
              In the same way, understanding who you are requires being surrounded by what you are not; circumstances, challenges, and people that contrast with you. To know what you are, you must first distinguish what you are not. The first step toward any desired outcome is recognizing that you are not currently in that state.
            </p>
            
            <p className="mb-8">
              Acknowledging the challenges around you is evidence that, at your core, you know you do not belong there forever; it reflects an understanding that you are capable of something better.
            </p>
            
            <h2 className="text-2xl font-bold mt-8 mb-4">Embracing Your Uniqueness</h2>
            
            <p className="mb-6">
              Therefore, never allow your surrounding circumstances to define your capabilities or your identity. True self-awareness comes from recognizing the contrast between yourself and your environment, and understanding that your potential is not determined solely by external factors, but by your unique qualities and characteristics.
            </p>
            
            <p className="text-lg font-medium">
              By recognizing what you are not, you can more fully understand and embrace what makes you distinct, rather than conforming to limiting beliefs.
            </p>
          </article>

          <div className="border-t border-border pt-8">
            <div className="flex items-start gap-6">
              <img
                src="/MY.png"
                alt="Zeph"
                className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
              />
              <div>
                <h4 className="text-lg font-semibold text-foreground mb-2">
                  About Zeph
                </h4>
                <p className="text-muted-foreground mb-4">
                  Software developer, humanitarian, and casual writer.
                </p>
                <a
                  href="https://chizuluzephaniah.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Visit my portfolio →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

export default FeaturedArticle
