import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Check, Film, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import Header from '../Components/Header'
import Sidebar from '../Components/Sidebar'
import { videoService } from '../api/services/video.service'

// New Modular Components
import HeroSection from '../Components/Cinema/HeroSection'
import CategoryTabs from '../Components/Cinema/CategoryTabs'
import VideoCard from '../Components/Cinema/VideoCard'
import { VideoGridSkeleton } from '../Components/Common/Skeleton'
import { formatViews, formatDuration, formatTimeAgo } from '../utils/formatters'

// Categories
// Default categories if nothing stored
const DEFAULT_CATEGORIES = ["All", "For You", "Sci-Fi", "Documentaries", "Tech", "Cinematic", "Gaming", "AI"]

// Main page: CinemaFeed
export default function CinemaFeed() {
  const navigate = useNavigate()
  const { userData } = useSelector((state) => state.auth)
  const [activeCategory, setActiveCategory] = useState("All")

  // State for editable categories
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('cinema-categories')
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES
  })
  const [isEditingCategories, setIsEditingCategories] = useState(false)
  const [newCategory, setNewCategory] = useState("")

  // Handlers for category management
  const handleDeleteCategory = (catToDelete) => {
    const updated = categories.filter(c => c !== catToDelete)
    setCategories(updated)
    localStorage.setItem('cinema-categories', JSON.stringify(updated))
    if (activeCategory === catToDelete) setActiveCategory('All')
    toast.success(`Removed ${catToDelete}`)
  }

  const handleAddCategory = () => {
    const trimmed = newCategory.trim()
    if (!trimmed) return
    if (categories.includes(trimmed)) {
      toast.error('Category already exists')
      return
    }
    const updated = [...categories, trimmed]
    setCategories(updated)
    localStorage.setItem('cinema-categories', JSON.stringify(updated))
    setNewCategory("")
    toast.success(`Added ${trimmed}`)
  }

  // Fetch featured video (highest trendScore with fallback to latest)
  const { data: featuredVideoData } = useQuery({
    queryKey: ['featured-video'],
    queryFn: async () => {
      // Try to get video with highest trendScore first
      const trendingResult = await videoService.getAllVideos({
        page: 1,
        limit: 1,
        sortBy: 'trendScore',
        sortType: 'desc'
      })

      // If found a trending video with positive trendScore, use it
      const trendingVideo = trendingResult?.videos?.[0]
      if (trendingVideo && trendingVideo.trendScore > 0) {
        return trendingVideo
      }

      // Fallback: Get the latest video
      const latestResult = await videoService.getAllVideos({
        page: 1,
        limit: 1,
        sortBy: 'createdAt',
        sortType: 'desc'
      })
      return latestResult?.videos?.[0] || null
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false
  })

  // Fetch videos from backend with category filtering
  const { data: videosData, isLoading } = useQuery({
    queryKey: ['videos', activeCategory],
    queryFn: async () => {
      // For You feed requires authentication
      if (activeCategory === 'For You') {
        return await videoService.getForYouFeed({ page: 1, limit: 20 })
      }

      // All videos - sort by latest (createdAt)
      if (activeCategory === 'All') {
        return await videoService.getAllVideos({
          page: 1,
          limit: 20,
          sortBy: 'createdAt',
          sortType: 'desc'
        })
      }

      // Category-specific search
      const categoryResults = await videoService.getAllVideos({
        page: 1,
        limit: 20,
        sortBy: 'trendScore',
        sortType: 'desc',
        query: activeCategory
      })

      // If category has no videos, fallback to trending videos
      if (!categoryResults?.videos || categoryResults.videos.length === 0) {
        const trendingData = await videoService.getAllVideos({
          page: 1,
          limit: 20,
          sortBy: 'trendScore',
          sortType: 'desc'
        })
        return { ...trendingData, isFallback: true }
      }

      return { ...categoryResults, isFallback: false }
    },
    // Only fetch For You if user is authenticated
    enabled: activeCategory !== 'For You' || !!userData
  })

  const videos = videosData?.videos || []
  const hasVideos = videos.length > 0
  const featuredVideo = featuredVideoData

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-indigo-500/30">

      {/* Header (Cinema Variant) - Sits on top of hero */}
      <Header variant="cinema" />

      {/* Sidebar (Floating) - Sits on top of hero */}
      <Sidebar />

      {/* Hero section (edge-to-edge) */}
      <section className="relative w-full h-[85vh] min-h-screen overflow-hidden">
        <HeroSection
          hasVideos={hasVideos}
          featuredVideo={featuredVideo}
          userData={userData}
        />
      </section>

      {/* Main content (grid) */}
      <div className="relative z-10 -mt-20 px-6 md:px-12 lg:pl-[300px] pb-24">

        {/* Category Filters */}
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          isEditingCategories={isEditingCategories}
          setIsEditingCategories={setIsEditingCategories}
          newCategory={newCategory}
          setNewCategory={setNewCategory}
          handleAddCategory={handleAddCategory}
          handleDeleteCategory={handleDeleteCategory}
        />

        {/* Helper text during edit mode */}
        {isEditingCategories && (
          <p className="text-zinc-500 text-xs text-center -mt-6 mb-8 animate-pulse">
            Manage your shortcut tabs. Tap {<Check className="w-3 h-3 inline" />} to save.
          </p>
        )}

        {/* Section Title */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-500 rounded-full" />
            {activeCategory === 'All' ? 'Recommended For You' : activeCategory}
          </h2>

          {/* Build Your Feed Button - Only for 'For You' category */}
          {activeCategory === 'For You' && (
            <button
              onClick={() => navigate('/build-feed')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-400/50 hover:from-purple-600/30 hover:to-indigo-600/30 transition-all duration-300 text-sm font-bold group"
              title="Customize your For You feed"
            >
              <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
              Build Your Feed
            </button>
          )}
        </div>

        {/* Video Grid */}
        {isLoading ? (
          <VideoGridSkeleton count={8} />
        ) : hasVideos ? (
          <>
            {/* Empty Category Message - Match Screenshot UI */}
            {videosData?.isFallback && (
              <div className="flex flex-col items-center justify-center py-16 mb-8 mt-4">
                <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
                  <Film className="w-10 h-10 text-indigo-400" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-2 text-center">
                  No {activeCategory} Videos Found
                </h3>

                <p className="text-zinc-500 text-center max-w-md mb-8">
                  We couldn't find videos matching "{activeCategory}".<br />
                  Check out trending content instead!
                </p>

                <button
                  onClick={() => navigate('/trending?tab=videos')}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg transition-colors"
                >
                  View Trending Videos
                </button>
              </div>
            )}

            {!videosData?.isFallback && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {videos.map((video) => (
                  <VideoCard
                    key={video._id}
                    video={video}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-md"
            >
              <div className="relative mb-8">
                <div className="w-32 h-32 mx-auto rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Film className="w-14 h-14 text-indigo-400" />
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-indigo-500/20"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              {/* Special handling for For You category */}
              {activeCategory === 'For You' ? (
                !userData ? (
                  <>
                    <h3 className="text-3xl font-black text-white mb-3">
                      Sign In for Personalized Recommendations
                    </h3>
                    <p className="text-zinc-500 text-lg leading-relaxed mb-6">
                      Create an account or log in to get personalized video recommendations based on your watch history.
                    </p>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-6 py-3 rounded-xl font-bold transition-all bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      Sign In to Continue
                    </button>
                  </>
                ) : (
                  <>
                    <h3 className="text-3xl font-black text-white mb-3">
                      Build Your Personalized Feed
                    </h3>
                    <p className="text-zinc-500 text-lg leading-relaxed mb-6">
                      Watch videos to automatically build your personalized recommendations, or customize your preferences now.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => setActiveCategory('All')}
                        className="px-6 py-3 rounded-xl font-bold transition-all bg-zinc-800 hover:bg-zinc-700 text-white"
                      >
                        Explore Videos
                      </button>
                      <button
                        onClick={() => navigate('/build-feed')}
                        className="px-6 py-3 rounded-xl font-bold transition-all bg-indigo-600 hover:bg-indigo-500 text-white"
                      >
                        Customize Feed
                      </button>
                    </div>
                  </>
                )
              ) : (
                <>
                  <h3 className="text-3xl font-black text-white mb-3">
                    No {activeCategory} Videos Found
                  </h3>
                  <p className="text-zinc-500 text-lg leading-relaxed mb-6">
                    We couldn't find videos matching "{activeCategory}". Check out trending content instead!
                  </p>
                  <button
                    onClick={() => navigate('/trending?tab=videos')}
                    className="px-6 py-3 rounded-xl font-bold transition-all bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    View Trending Videos
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}

      </div>
    </div>
  )
}