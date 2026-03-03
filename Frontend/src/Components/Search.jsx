import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search as SearchIcon, Film, MessageSquare, Users, Ghost, Globe, ArrowRight } from 'lucide-react'

// API & Services
import api from '../api/axios'
import { videoService } from '../api/services/video.service'
import { tweetService } from '../api/services/tweet.service'
import { userService } from '../api/services/user.service'
import { subscriptionService } from '../api/services/subscription.service'
import { likeService } from '../api/services/like.service'

// Components
import VideoCard from '../Components/VideoCard'
import WireCard from '../Components/WireCard'
import UserCard from '../Components/UserCard'
import { SearchSkeleton } from '../Components/Common/Skeleton'

export default function Search() {
   const [searchParams, setSearchParams] = useSearchParams()
   const query = searchParams.get("query") || ""
   const urlTab = searchParams.get("tab")

   // Context locking
   // If URL has a specific tab (like 'videos' from Cinema Header), we start "Locked".
   // Once unlocked, it stays unlocked during the session.
   const [isContextLocked, setIsContextLocked] = useState(!!urlTab && urlTab !== 'all')
   const [hasUnlocked, setHasUnlocked] = useState(!urlTab || urlTab === 'all') // Track if user has unlocked
   const [activeTab, setActiveTab] = useState(urlTab || "all")

   const queryClient = useQueryClient()

   // Sync state with URL changes (only on initial load, not on tab switches)
   useEffect(() => {
      if (urlTab) {
         setActiveTab(urlTab)
         // Only lock if user hasn't previously unlocked
         if (!hasUnlocked) {
            setIsContextLocked(urlTab !== 'all')
         }
      } else {
         setActiveTab('all')
         setIsContextLocked(false)
         setHasUnlocked(true)
      }
   }, [urlTab, hasUnlocked])

   // Update URL when Tab Changes
   const handleTabChange = (tab) => {
      // User is manually switching tabs, so unlock and keep unlocked
      setIsContextLocked(false)
      setHasUnlocked(true)
      setActiveTab(tab)
      setSearchParams({ query, tab })
   }

   // Unlock Context (Glassmorphic Button Action)
   const handleUnlockContext = () => {
      setIsContextLocked(false)
      setHasUnlocked(true)
      setActiveTab('all')
      setSearchParams({ query, tab: 'all' })
   }


   const tabs = [
      { id: 'all', label: 'All', icon: Globe, color: 'text-indigo-500', bg: 'bg-indigo-500' },
      { id: 'videos', label: 'Cinema', icon: Film, color: 'text-pink-500', bg: 'bg-pink-500' },
      { id: 'tweets', label: 'The Wire', icon: MessageSquare, color: 'text-sky-500', bg: 'bg-sky-500' },
      { id: 'stealth', label: 'Shadows', icon: Ghost, color: 'text-emerald-500', bg: 'bg-emerald-500' },
      { id: 'users', label: 'Channels', icon: Users, color: 'text-orange-500', bg: 'bg-orange-500' },
   ]

   // Figure out current mode for API calls
   const isStealthTab = activeTab === 'stealth'



   // Videos
   const { data: videoData, isLoading: videoLoading } = useQuery({
      queryKey: ['search', 'videos', query, activeTab],
      queryFn: () => videoService.getAllVideos({
         query,
         limit: 10,
         // If tab is Stealth, force True. If All/Videos, force False (Public).
         isStealthMode: isStealthTab ? true : undefined
      }),
      enabled: !!query && (activeTab === 'all' || activeTab === 'videos' || activeTab === 'stealth')
   })

   // Tweets
   const { data: tweetData, isLoading: tweetLoading } = useQuery({
      queryKey: ['search', 'tweets', query, activeTab],
      queryFn: () => tweetService.getAllTweets({
         query,
         limit: 10,
         isStealthMode: isStealthTab ? true : undefined
      }),
      enabled: !!query && (activeTab === 'all' || activeTab === 'tweets' || activeTab === 'stealth')
   })

   // Users (Only fetch on All or Users tab)
   const { data: userData, isLoading: userLoading } = useQuery({
      queryKey: ['search', 'users', query],
      queryFn: () => userService.searchUsers({ query, page: 1, limit: 10 }),
      enabled: !!query && (activeTab === 'all' || activeTab === 'users')
   })


   const subMutation = useMutation({
      mutationFn: subscriptionService.toggleSubscription,
      onSuccess: () => queryClient.invalidateQueries(['search', 'users'])
   })

   const likeTweetMutation = useMutation({
      mutationFn: likeService.toggleTweetLike,
      onSuccess: () => queryClient.invalidateQueries(['search', 'tweets'])
   })


   const isLoading = videoLoading || tweetLoading || userLoading
   const hasVideos = videoData?.videos?.length > 0
   const hasTweets = tweetData?.docs?.length > 0
   const hasUsers = userData?.docs?.length > 0
   const isEmpty = !isLoading && !hasVideos && !hasTweets && !hasUsers

   // Background Glow Logic
   const activeColor = tabs.find(t => t.id === activeTab)?.color || 'text-white'
   const activeBg = tabs.find(t => t.id === activeTab)?.bg || 'bg-white'

   return (
      <div className="relative min-h-screen bg-[#050505] text-white">

         {/* Immersive Background Glow */}
         <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] ${activeBg} opacity-5 blur-[120px] pointer-events-none transition-colors duration-700`} />

         {/* Main Content Container - Added pt-32 to clear Header */}
         <div className="relative z-10 lg:pl-72 pt-32 px-6 pb-20 max-w-7xl mx-auto">

            {/* Header section */}
            <div className="flex flex-col gap-8 mb-12">

               <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                     <motion.h1
                        key={activeTab} // Animate when tab changes
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-4xl font-black tracking-tight flex items-center gap-3 ${activeColor} transition-colors duration-500`}
                     >
                        {/* Render Active Icon */}
                        {(() => {
                           const Icon = tabs.find(t => t.id === activeTab)?.icon || SearchIcon;
                           return <Icon className="w-10 h-10" />
                        })()}

                        {/* Dynamic Title based on context lock */}
                        {isContextLocked
                           ? (activeTab === 'videos' ? 'Cinema Library' : activeTab === 'tweets' ? 'Wire Trends' : activeTab === 'stealth' ? 'Shadow Archives' : activeTab === 'users' ? 'Channels' : 'Search Results')
                           : activeTab === 'stealth' ? "Shadow Search" : `Results for "${query}"`
                        }
                     </motion.h1>
                     <p className="text-zinc-500 mt-2 font-medium">
                        {isContextLocked
                           ? `Searching exclusively in ${activeTab === 'stealth' ? 'The Shadows' : activeTab === 'videos' ? 'The Cinema' : activeTab === 'tweets' ? 'The Wire' : activeTab === 'users' ? 'Channels' : 'StreamWire'}.`
                           : activeTab === 'stealth'
                              ? "Encrypted signals found in the deep network."
                              : "Exploring the StreamWire ecosystem."}
                     </p>
                  </div>

                  {/* Unlock button (only when context locked) */}
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
                           <Globe className="w-4 h-4 text-zinc-400 group-hover:text-indigo-400 transition-colors" />
                           <span className="text-sm font-bold text-zinc-300 group-hover:text-white">Search Full Network</span>
                           <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-all opacity-50 group-hover:translate-x-1 group-hover:opacity-100" />
                        </motion.button>
                     )}
                  </AnimatePresence>
               </div>

               {/* 5-option tab bar (only visible when not context locked) */}
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

                              {/* Active Indicator Line */}
                              {isActive && (
                                 <motion.div
                                    layoutId="activeTab"
                                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${tab.bg}`}
                                 />
                              )}
                           </button>
                        )
                     })}
                  </div>
               )}
            </div>

            {/* Loader */}
            {isLoading && (
               <SearchSkeleton
                  showUsers={activeTab === 'all' || activeTab === 'users'}
                  showVideos={activeTab === 'all' || activeTab === 'videos'}
                  showWires={activeTab === 'all' || activeTab === 'tweets'}
               />
            )}

            {/* Empty state */}
            {isEmpty && query && (
               <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-32 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20"
               >
                  <Ghost className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-zinc-400">No signals detected.</h3>
                  <p className="text-zinc-600 mt-2">
                     {isContextLocked
                        ? "Try searching the full network instead?"
                        : "Try adjusting your query or switching worlds."}
                  </p>

                  {isContextLocked && (
                     <button onClick={handleUnlockContext} className="mt-6 text-indigo-400 hover:text-indigo-300 font-bold text-sm">
                        Search Everywhere &rarr;
                     </button>
                  )}
               </motion.div>
            )}

            {/* Results grid */}
            <div className="space-y-16">

               {/* CHANNELS (Users) */}
               {/* Logic: Show on 'All' or 'Users' tab only */}
               {(activeTab === 'all' || activeTab === 'users') && hasUsers && (
                  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {userData.docs.map(user => (
                           <UserCard key={user._id} user={user} onSubscribe={subMutation.mutate} />
                        ))}
                     </div>
                  </motion.section>
               )}

               {/* CINEMA (Videos) */}
               {/* Logic: Show on All, Videos, or Stealth */}
               {(activeTab === 'all' || activeTab === 'videos' || activeTab === 'stealth') && hasVideos && (
                  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                     {/* Section Header (Only if mixed view) */}
                     {(activeTab === 'all' || activeTab === 'stealth') && (
                        <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${activeTab === 'stealth' ? 'text-emerald-400' : 'text-pink-400'}`}>
                           <Film className="w-5 h-5" /> {activeTab === 'stealth' ? 'Shadow Archives' : 'Cinema Results'}
                        </h2>
                     )}
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {videoData.videos.map(video => (
                           <VideoCard key={video._id} video={video} />
                        ))}
                     </div>
                  </motion.section>
               )}

               {/* THE WIRE (Tweets) */}
               {(activeTab === 'all' || activeTab === 'tweets' || activeTab === 'stealth') && hasTweets && (
                  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                     {(activeTab === 'all' || activeTab === 'stealth') && (
                        <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${activeTab === 'stealth' ? 'text-emerald-400' : 'text-sky-400'}`}>
                           <MessageSquare className="w-5 h-5" /> {activeTab === 'stealth' ? 'Encrypted Wires' : 'Wire Results'}
                        </h2>
                     )}
                     <div className="space-y-0 border border-zinc-800 rounded-2xl overflow-hidden bg-[#0a0a0c]">
                        {tweetData.docs.map(wire => (
                           <WireCard
                              key={wire._id}
                              wire={wire}
                              onLike={(id) => likeTweetMutation.mutate(id)}
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