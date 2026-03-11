import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
   Bookmark, Clock, Heart
} from 'lucide-react'

import { libraryService } from '../api/services/library.service'
import VideoCard from '../Components/VideoCard'
import { VideoGridSkeleton } from '../Components/Common/Skeleton'

const tabs = [
   { id: 'watchlater', label: 'Watch Later', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500' },
   { id: 'liked', label: 'Liked Videos', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500' },
]

export default function Saved() {
   const user = useSelector((state) => state.auth.userData)
   const [searchParams, setSearchParams] = useSearchParams()

   const activeTab = searchParams.get("tab") || 'watchlater'

   const handleTabChange = (tabId) => {
      setSearchParams({ tab: tabId })
   }

   // Fetch watch later
   const { data: watchLaterData, isLoading: watchLaterLoading } = useQuery({
      queryKey: ['watch-later'],
      queryFn: () => libraryService.getWatchLater({ limit: 50 }),
      enabled: !!user && activeTab === 'watchlater'
   })

   // Fetch liked videos
   const { data: likedData, isLoading: likedLoading } = useQuery({
      queryKey: ['liked-videos'],
      queryFn: () => libraryService.getLikedVideos({ limit: 50 }),
      enabled: !!user && activeTab === 'liked'
   })

   const isLoading = watchLaterLoading || likedLoading
   const watchLater = watchLaterData?.list || []
   const liked = likedData?.videos || []

   const hasWatchLater = watchLater.length > 0
   const hasLiked = liked.length > 0
   const isEmpty = !isLoading && !hasWatchLater && !hasLiked

   const activeColor = tabs.find(t => t.id === activeTab)?.color || 'text-white'
   const activeBg = tabs.find(t => t.id === activeTab)?.bg || 'bg-white'

   // Not logged in state
   if (!user) {
      return (
         <div className="relative min-h-screen bg-[#050505] text-white">
            <div className="relative z-10 lg:pl-72 pt-32 px-6 pb-20 max-w-7xl mx-auto">
               <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-32 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20"
               >
                  <Bookmark className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-zinc-400">Sign in to see your saved content.</h3>
                  <Link to="/login" className="mt-6 inline-block text-indigo-400 hover:text-indigo-300 font-bold text-sm">
                     Sign In &rarr;
                  </Link>
               </motion.div>
            </div>
         </div>
      )
   }

   return (
      <div className="relative min-h-screen bg-[#050505] text-white">

         {/* Background Glow */}
         <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] ${activeBg} opacity-5 blur-[120px] pointer-events-none transition-colors duration-700 gpu-layer`} />

         <div className="relative z-10 lg:pl-72 pt-32 px-6 pb-20 max-w-7xl mx-auto">

            {/* Header Section */}
            <div className="flex flex-col gap-8 mb-12">

               <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                     <motion.h1
                        key={activeTab}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-4xl font-black tracking-tight flex items-center gap-3 ${activeColor} transition-colors duration-500`}
                     >
                        <Bookmark className="w-10 h-10" />
                        {activeTab === 'watchlater' ? 'Watch Later' : 'Liked Videos'}
                     </motion.h1>
                     <p className="text-zinc-500 mt-2 font-medium">
                        {activeTab === 'watchlater' ? 'Your watch later queue.' : 'Videos you\'ve liked.'}
                     </p>
                  </div>
               </div>

               {/* Tab Bar */}
               <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-1">{tabs.map((tab) => {
                  const isActive = activeTab === tab.id
                  return (
                     <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`
                                 relative px-6 py-3 rounded-t-lg text-sm font-bold transition-all duration-300 flex items-center gap-2
                                 ${isActive ? 'text-white bg-zinc-900/50' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}
                              `}
                     >
                        <tab.icon className={`w-4 h-4 ${isActive ? tab.color : 'text-zinc-600'}`} />
                        {tab.label}

                        {isActive && (
                           <motion.div
                              layoutId="savedActiveTab"
                              className={`absolute bottom-0 left-0 right-0 h-0.5 ${tab.bg}`}
                           />
                        )}
                     </button>
                  )
               })}
               </div>
            </div>

            {/* Loader */}
            {isLoading && (
               <VideoGridSkeleton count={8} />
            )}

            {/* Empty State */}
            {isEmpty && (
               <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-32 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20"
               >
                  <Bookmark className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-zinc-400">Nothing saved yet.</h3>
                  <p className="text-zinc-600 mt-2">
                     Save videos to watch later or like content to see it here.
                  </p>
                  <Link to="/cinema" className="mt-6 inline-block text-pink-400 hover:text-pink-300 font-bold text-sm">
                     Browse Cinema &rarr;
                  </Link>
               </motion.div>
            )}

            {/* Results Grid */}
            <div className="space-y-16">

               {/* Watch Later */}
               {activeTab === 'watchlater' && hasWatchLater && (
                  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {watchLater.map((item) => (
                           <VideoCard key={item._id} video={item.video} />
                        ))}
                     </div>
                  </motion.section>
               )}

               {/* Liked Videos */}
               {activeTab === 'liked' && hasLiked && (
                  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {liked.map((item) => (
                           <VideoCard key={item._id} video={item} />
                        ))}
                     </div>
                  </motion.section>
               )}
            </div>
         </div>
      </div>
   )
}
