import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
   TrendingUp, Film, MessageSquare, Ghost,
   Globe, ArrowRight, Flame, AlertCircle
} from 'lucide-react'

import { videoService } from '../api/services/video.service'
import { tweetService } from '../api/services/tweet.service'
import { likeService } from '../api/services/like.service'

import VideoCard from '../Components/VideoCard'
import WireCard from '../Components/WireCard'
import { VideoGridSkeleton, WireListSkeleton, ShadowListSkeleton } from '../Components/Common/Skeleton'
import { toActionError } from '../utils/errorMessages'

const tabs = [
   { id: 'all', label: 'All', icon: TrendingUp, color: 'text-white', bg: 'bg-white' },
   { id: 'videos', label: 'Cinema', icon: Film, color: 'text-zinc-200', bg: 'bg-zinc-200' },
   { id: 'tweets', label: 'The Wire', icon: MessageSquare, color: 'text-white', bg: 'bg-white' },
   { id: 'stealth', label: 'Shadows', icon: Ghost, color: 'text-emerald-400', bg: 'bg-emerald-500' },
]

export default function Trending() {
   const queryClient = useQueryClient()
   const [searchParams, setSearchParams] = useSearchParams()

   // Context Locking Logic
   const urlTab = searchParams.get("tab")
   const [isContextLocked, setIsContextLocked] = useState(!!urlTab && urlTab !== 'all')

   const activeTab = urlTab || 'all'

   const handleTabChange = (tabId) => {
      setSearchParams({ tab: tabId })
   }

   const handleUnlockContext = () => {
      setIsContextLocked(false)
      setSearchParams({ tab: 'all' })
   }

   // Fetch trending videos (sorted by trendScore highest to lowest)
   const {
      data: videoData,
      isLoading: videoLoading,
      isError: isVideoError,
      error: videoError,
   } = useQuery({
      queryKey: ['trending-videos', activeTab],
      queryFn: () => videoService.getTrendingVideos({
         limit: 20,
         isStealthMode: false
      }),
      enabled: activeTab === 'all' || activeTab === 'videos',
      staleTime: 60000, // 1 minute cache
   })

   // Fetch trending stealth videos (sorted by trendScore highest to lowest)
   const {
      data: stealthVideoData,
      isLoading: stealthVideoLoading,
      isError: isStealthVideoError,
      error: stealthVideoError,
   } = useQuery({
      queryKey: ['trending-stealth-videos'],
      queryFn: () => videoService.getTrendingVideos({
         limit: 20,
         isStealthMode: true
      }),
      enabled: activeTab === 'stealth',
      staleTime: 60000, // 1 minute cache
   })

   // Fetch trending wires (sorted by trendScore highest to lowest)
   const {
      data: tweetData,
      isLoading: tweetLoading,
      isError: isTweetError,
      error: tweetError,
   } = useQuery({
      queryKey: ['trending-tweets', activeTab],
      queryFn: () => tweetService.getTrendingTweets({
         limit: 20,
         isStealthMode: false
      }),
      enabled: activeTab === 'all' || activeTab === 'tweets',
      staleTime: 60000, // 1 minute cache
   })

   // Fetch trending shadow wires (sorted by trendScore highest to lowest)
   const {
      data: shadowTweetData,
      isLoading: shadowTweetLoading,
      isError: isShadowTweetError,
      error: shadowTweetError,
   } = useQuery({
      queryKey: ['trending-shadow-tweets'],
      queryFn: () => tweetService.getTrendingTweets({
         limit: 20,
         isStealthMode: true
      }),
      enabled: activeTab === 'stealth',
      staleTime: 60000, // 1 minute cache
   })

   // Like mutation
   const likeTweetMutation = useMutation({
      mutationFn: (tweetId) => likeService.toggleTweetLike(tweetId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['trending-tweets'] })
         queryClient.invalidateQueries({ queryKey: ['trending-shadow-tweets'] })
      },
      onError: (err) => {
         toast.error(toActionError(err, 'Could not update like. Please try again.', [
            { when: 'not found', message: 'Wire not found' },
            { when: ['unauthorized', 'not authorized', 'login'], message: 'Please sign in to like this wire' },
         ]))
      }
   })

   // Memoized handler for WireCard
   const handleLikeTweet = (id) => likeTweetMutation.mutate(id)

   const isLoading = videoLoading || tweetLoading || stealthVideoLoading || shadowTweetLoading

   const hasVideos = (activeTab === 'stealth' ? stealthVideoData?.videos?.length : videoData?.videos?.length) > 0
   const hasTweets = activeTab === 'stealth' ? shadowTweetData?.docs?.length > 0 : tweetData?.docs?.length > 0
   const hasAnyContent = hasVideos || hasTweets

   const activeErrorMessage = useMemo(() => {
      const mappings = [
         { when: ['unauthorized', 'not authorized', 'login'], message: 'Please sign in to view this trending feed.' },
      ]

      if (activeTab === 'stealth') {
         if (isStealthVideoError) {
            return toActionError(stealthVideoError, 'Could not load trending shadow videos right now.', mappings)
         }
         if (isShadowTweetError) {
            return toActionError(shadowTweetError, 'Could not load trending encrypted wires right now.', mappings)
         }
         return ''
      }

      if (activeTab === 'videos' && isVideoError) {
         return toActionError(videoError, 'Could not load trending cinema videos right now.', mappings)
      }

      if (activeTab === 'tweets' && isTweetError) {
         return toActionError(tweetError, 'Could not load trending wire posts right now.', mappings)
      }

      if (activeTab === 'all') {
         if (isVideoError) {
            return toActionError(videoError, 'Could not load trending cinema videos right now.', mappings)
         }
         if (isTweetError) {
            return toActionError(tweetError, 'Could not load trending wire posts right now.', mappings)
         }
      }

      return ''
   }, [activeTab, isStealthVideoError, stealthVideoError, isShadowTweetError, shadowTweetError, isVideoError, videoError, isTweetError, tweetError])

   const hasError = Boolean(activeErrorMessage)
   const isEmpty = !isLoading && !hasAnyContent && !hasError

   // Memoize tab color/bg calculations
   const activeColor = useMemo(() => tabs.find(t => t.id === activeTab)?.color || 'text-white', [activeTab])
   const activeBg = useMemo(() => tabs.find(t => t.id === activeTab)?.bg || 'bg-white', [activeTab])

   return (
      <div className="relative min-h-screen bg-zinc-950 text-white">

         {/* Background Glow */}
         <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-250 h-150 ${activeBg} opacity-5 blur-[120px] pointer-events-none transition-colors duration-700 gpu-layer`} />

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
                        <Flame className="w-10 h-10" />
                        {isContextLocked
                           ? (activeTab === 'videos' ? 'Trending in Cinema' : activeTab === 'tweets' ? 'Trending on Wire' : activeTab === 'stealth' ? 'Trending in Shadows' : 'Trending')
                           : 'Trending Now'
                        }
                     </motion.h1>
                     <p className="text-zinc-500 mt-2 font-medium">
                        {isContextLocked
                           ? `Hottest content in ${activeTab === 'stealth' ? 'The Shadows' : activeTab === 'videos' ? 'The Cinema' : activeTab === 'tweets' ? 'The Wire' : 'StreamWire'}.`
                           : "The hottest content across StreamWire right now."}
                     </p>
                  </div>

                  {/* Unlock Button */}
                  <AnimatePresence>
                     {isContextLocked && (
                        <motion.button
                           initial={{ opacity: 0, x: 20 }}
                           animate={{ opacity: 1, x: 0 }}
                           exit={{ opacity: 0, x: 20 }}
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={handleUnlockContext}
                           className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all group shrink-0"
                        >
                           <Globe className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                           <span className="text-sm font-bold text-zinc-300 group-hover:text-white">View All Trending</span>
                           <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-all opacity-50 group-hover:translate-x-1 group-hover:opacity-100" />
                        </motion.button>
                     )}
                  </AnimatePresence>
               </div>

               {/* Tab Bar */}
               {!isContextLocked && (
                  <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-1">
                     {tabs.map((tab) => {
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
                                    layoutId="trendingActiveTab"
                                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${tab.bg}`}
                                 />
                              )}
                           </button>
                        )
                     })}
                  </div>
               )}
            </div>

            {/* Loader - Context-aware skeletons */}
            {isLoading && (
               <div className="space-y-16">
                  {/* Video skeleton for all/videos/stealth tabs */}
                  {(activeTab === 'all' || activeTab === 'videos' || activeTab === 'stealth') && (
                     <div>
                        {activeTab === 'all' && (
                           <div className="skeleton h-7 w-56 rounded mb-6" />
                        )}
                        <VideoGridSkeleton count={8} />
                     </div>
                  )}

                  {/* Wire skeleton for all/tweets tabs */}
                  {(activeTab === 'all' || activeTab === 'tweets') && (
                     <div>
                        {activeTab === 'all' && (
                           <div className="skeleton h-7 w-48 rounded mb-6" />
                        )}
                        <WireListSkeleton count={5} />
                     </div>
                  )}
               </div>
            )}

            {/* Error State */}
            {!isLoading && hasError && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-24 border border-red-500/30 rounded-3xl bg-red-500/10"
               >
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white">Could Not Load Trending</h3>
                  <p className="text-red-200/80 mt-2 max-w-xl mx-auto">{activeErrorMessage}</p>
               </motion.div>
            )}

            {/* Empty State */}
            {isEmpty && (
               <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-32 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20"
               >
                  <TrendingUp className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-zinc-400">Nothing trending yet.</h3>
                  <p className="text-zinc-600 mt-2">
                     Check back soon for hot content.
                  </p>
               </motion.div>
            )}

            {/* Results Grid */}
            <div className="space-y-16">

               {/* Cinema (Videos) */}
               {(activeTab === 'all' || activeTab === 'videos') && videoData?.videos?.length > 0 && (
                  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                     {activeTab === 'all' && (
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                           <Film className="w-5 h-5" /> Trending in Cinema
                        </h2>
                     )}
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {videoData.videos.map(video => (
                           <VideoCard key={video._id} video={video} />
                        ))}
                     </div>
                  </motion.section>
               )}

               {/* Shadows (Stealth Videos) */}
               {activeTab === 'stealth' && stealthVideoData?.videos?.length > 0 && (
                  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                     <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-400">
                        <Ghost className="w-5 h-5" /> Shadow Archives
                     </h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {stealthVideoData.videos.map(video => (
                           <VideoCard key={video._id} video={video} />
                        ))}
                     </div>
                  </motion.section>
               )}

               {/* The Wire (Non-stealth Tweets) */}
               {(activeTab === 'all' || activeTab === 'tweets') && tweetData?.docs?.length > 0 && (
                  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                     {activeTab === 'all' && (
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
                           <MessageSquare className="w-5 h-5" /> Trending on Wire
                        </h2>
                     )}
                     <div className="space-y-0 border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950">
                        {tweetData.docs.map(wire => (
                           <WireCard
                              key={wire._id}
                              wire={wire}
                              onLike={handleLikeTweet}
                           />
                        ))}
                     </div>
                  </motion.section>
               )}

               {/* Shadows (Stealth Tweets / Encrypted Wires) */}
               {activeTab === 'stealth' && shadowTweetData?.docs?.length > 0 && (
                  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                     <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-400">
                        <MessageSquare className="w-5 h-5" /> Encrypted Wires
                     </h2>
                     <div className="space-y-0 border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950">
                        {shadowTweetData.docs.map(wire => (
                           <WireCard
                              key={wire._id}
                              wire={wire}
                              onLike={handleLikeTweet}
                           />
                        ))}
                     </div>
                  </motion.section>
               )}
            </div>
         </div>
      </div>
   )
}
