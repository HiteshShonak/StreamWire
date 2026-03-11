import { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
   Users, Film, MessageSquare, UserPlus, ExternalLink
} from 'lucide-react'

import { subscriptionService } from '../api/services/subscription.service'
import { videoService } from '../api/services/video.service'
import { tweetService } from '../api/services/tweet.service'
import { likeService } from '../api/services/like.service'

import VideoCard from '../Components/VideoCard'
import WireCard from '../Components/WireCard'
import ChannelCard from '../Components/ChannelCard'
import { ChannelGridSkeleton, VideoGridSkeleton, WireListSkeleton } from '../Components/Common/Skeleton'

export default function Following() {
   const queryClient = useQueryClient()
   const user = useSelector((state) => state.auth.userData)

   // Get subscribed channels - API returns { channels: [...], totalChannels, ... }
   const { data: subscriptionData, isLoading: channelsLoading, error: channelsError } = useQuery({
      queryKey: ['my-subscriptions', user?._id],
      queryFn: () => subscriptionService.getSubscribedChannels(user?._id),
      enabled: !!user?._id,
      select: (res) => {
         // Axios interceptor already extracts response.data
         return res.data || res;
      },
      retry: 1
   })

   // Extract channels array - each item has { _id, channel: { _id, username, fullName, avatar }, createdAt }
   const subscribedChannels = subscriptionData?.channels || []
   // Exclude identity-cloaked (anonymous) channels from the Following list
   const visibleSubscribedChannels = subscribedChannels.filter(sub => !sub.channel?.isIdentityCloaked)
   const subscribedIds = visibleSubscribedChannels.map(sub => sub.channel?._id).filter(Boolean)

   // Fetch videos from subscribed channels
   const { data: videoData, isLoading: videoLoading } = useQuery({
      queryKey: ['following-videos', subscribedIds],
      queryFn: async () => {
         if (subscribedIds.length === 0) return { videos: [] }
         const allVideos = await Promise.all(
            subscribedIds.slice(0, 10).map(userId =>
               videoService.getAllVideos({ userId, limit: 5, publicView: true })
                  .then(res => res.data.data?.videos || [])
                  .catch(() => [])
            )
         )
         return {
            videos: allVideos
               .flat()
               .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
               .slice(0, 20)
         }
      },
      enabled: subscribedIds.length > 0,
   })

   // Fetch tweets from subscribed channels
   const { data: tweetData, isLoading: tweetLoading } = useQuery({
      queryKey: ['following-tweets', subscribedIds],
      queryFn: async () => {
         if (subscribedIds.length === 0) return { docs: [] }
         const allTweets = await Promise.all(
            subscribedIds.slice(0, 10).map(userId =>
               tweetService.getUserTweets(userId, { limit: 5 })
                  .then(res => res.data.data?.docs || [])
                  .catch(() => [])
            )
         )
         return {
            docs: allTweets
               .flat()
               .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
               .slice(0, 20)
         }
      },
      enabled: subscribedIds.length > 0,
   })

   const likeTweetMutation = useMutation({
      mutationFn: (tweetId) => likeService.toggleTweetLike(tweetId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['following-tweets'] })
      }
   })

   const unsubscribeMutation = useMutation({
      mutationFn: (channelId) => subscriptionService.toggleSubscription(channelId),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['my-subscriptions'] })
         queryClient.invalidateQueries({ queryKey: ['following-videos'] })
         queryClient.invalidateQueries({ queryKey: ['following-tweets'] })
      }
   })

   // Memoized handlers for ChannelCard and WireCard (prevents memo from breaking)
   const handleUnsubscribe = useCallback((channelId) => {
      unsubscribeMutation.mutate(channelId)
   }, [unsubscribeMutation.mutate])

   const handleLikeTweet = useCallback((id) => {
      likeTweetMutation.mutate(id)
   }, [likeTweetMutation.mutate])

   const isLoading = channelsLoading
   const hasVideos = videoData?.videos?.length > 0
   const hasTweets = tweetData?.docs?.length > 0
   const hasChannels = visibleSubscribedChannels.length > 0
   const isEmpty = !isLoading && !hasChannels

   // Not logged in state
   if (!user) {
      return (
         <div className="relative min-h-screen bg-[#050505] text-white">
            <div className="relative z-10 lg:pl-72 lg:pr-72 pt-24 pb-20 px-6">
               <div className="max-w-7xl mx-auto">
                  <motion.div
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                     className="text-center py-32 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20"
                  >
                     <UserPlus className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-zinc-400">Sign in to see channels you follow</h3>
                     <Link to="/login" className="mt-6 inline-block text-indigo-400 hover:text-indigo-300 font-bold text-sm">
                        Sign In &rarr;
                     </Link>
                  </motion.div>
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className="relative min-h-screen bg-[#050505] text-white">

         {/* Background Glow */}
         <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-purple-500 opacity-5 blur-[120px] pointer-events-none gpu-layer" />

         <div className="relative z-10 lg:pl-72 lg:pr-72 pt-24 pb-20 px-6">
            <div className="max-w-[1400px] mx-auto">

               {/* Header */}
               <div className="mb-12">
                  <motion.h1
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-3 text-white mb-3"
                  >
                     <Users className="w-10 h-10 text-purple-400" />
                     Following
                  </motion.h1>
                  <p className="text-zinc-500 font-medium text-lg">
                     Channels you've subscribed to and their latest content.
                  </p>
               </div>

               {/* Loader - Full page skeleton matching content structure */}
               {isLoading && (
                  <div className="space-y-16">
                     {/* Subscriptions Grid Skeleton */}
                     <div>
                        <div className="skeleton h-8 w-48 rounded mb-8" />
                        <ChannelGridSkeleton count={4} />
                     </div>

                     {/* Videos Section Skeleton */}
                     <div>
                        <div className="skeleton h-7 w-36 rounded mb-6" />
                        <VideoGridSkeleton count={8} />
                     </div>

                     {/* Wires Section Skeleton */}
                     <div>
                        <div className="skeleton h-7 w-32 rounded mb-6" />
                        <WireListSkeleton count={4} />
                     </div>
                  </div>
               )}

               {/* Empty State */}
               {isEmpty && (
                  <motion.div
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                     className="text-center py-32 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20"
                  >
                     <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-zinc-400">You're not following anyone yet</h3>
                     <p className="text-zinc-600 mt-2">
                        Subscribe to channels to see their content here.
                     </p>
                     <Link to="/trending" className="mt-6 inline-block text-purple-400 hover:text-purple-300 font-bold text-sm">
                        Explore Trending &rarr;
                     </Link>
                  </motion.div>
               )}

               {/* Content */}
               {!isLoading && hasChannels && (
                  <div className="space-y-16">

                     {/* Subscribed Channels Grid */}
                     <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h2 className="text-2xl font-bold mb-8 flex items-center gap-2 text-purple-400">
                           <Users className="w-6 h-6" />
                           Your Subscriptions
                           <span className="ml-2 px-2.5 py-1 text-xs font-bold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                              {visibleSubscribedChannels.length}
                           </span>
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                           {visibleSubscribedChannels.map(sub => (
                              <ChannelCard
                                 key={sub._id}
                                 channel={sub.channel}
                                 subscriberCount={sub.channel?.subscribersCount}
                                 onUnsubscribe={(channelId) => unsubscribeMutation.mutate(channelId)}
                                 isLoading={unsubscribeMutation.isPending}
                              />
                           ))}
                        </div>
                     </motion.section>

                     {/* Latest Videos */}
                     {hasVideos && (
                        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                           <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-pink-400">
                              <Film className="w-5 h-5" /> Latest Videos
                           </h2>
                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                              {videoData.videos.map(video => (
                                 <VideoCard key={video._id} video={video} />
                              ))}
                           </div>
                        </motion.section>
                     )}

                     {/* Latest Wires */}
                     {hasTweets && (
                        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                           <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-sky-400">
                              <MessageSquare className="w-5 h-5" /> Latest Wires
                           </h2>
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
               )}
            </div>
         </div>
      </div>
   )
}
