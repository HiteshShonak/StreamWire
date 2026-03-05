import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  MessageSquare,
  Users,
  UserPlus,
  Ghost,
  Settings,
  Lock,
  Eye,
  Play,
  Clock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

import { authService } from '../api/services/auth.service';
import { videoService } from '../api/services/video.service';
import { tweetService } from '../api/services/tweet.service';
import { subscriptionService } from '../api/services/subscription.service';
import VideoCard from '../Components/VideoCard';
import WireCard from '../Components/WireCard';
import { ChannelPageSkeleton, VideoGridSkeleton, WireListSkeleton } from '../Components/Common/Skeleton';

export default function Channel() {
  const { username } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('videos'); // videos | tweets | about
  const [videoPage, setVideoPage] = useState(1);
  const [tweetPage, setTweetPage] = useState(1);

  // Fetch Channel Profile
  const { data: channel, isLoading: channelLoading } = useQuery({
    queryKey: ['channel', username],
    queryFn: () => authService.getChannelProfile(username),
    staleTime: 120000, // 2 minutes - profiles don't change often
  });

  // Fetch Channel Videos - Fetch all videos including stealth ones
  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['channel-videos', username, videoPage],
    queryFn: () => videoService.getAllVideos({ userId: channel?._id, page: videoPage, limit: 12 }),
    enabled: activeTab === 'videos' && !!channel?._id,
    staleTime: 60000, // 1 minute cache
  });

  // Fetch Channel Tweets (Wires) - publicView=true ensures stealth tweets are hidden for everyone
  const { data: tweets, isLoading: tweetsLoading } = useQuery({
    queryKey: ['channel-tweets', username, tweetPage],
    queryFn: () => tweetService.getUserTweets(channel?._id, { page: tweetPage, limit: 10, publicView: true }),
    enabled: activeTab === 'tweets' && !!channel?._id,
    staleTime: 60000, // 1 minute cache
  });



  // Subscribe/Unsubscribe Mutation
  const subscribeMutation = useMutation({
    mutationFn: () => subscriptionService.toggleSubscription(channel._id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['channel', username] });
      const previousChannel = queryClient.getQueryData(['channel', username]);

      // Optimistic update - only for public profiles or unsubscribe
      queryClient.setQueryData(['channel', username], (old) => ({
        ...old,
        isSubscribed: !old.isSubscribed,
        subscribersCount: old.isSubscribed ? old.subscribersCount - 1 : old.subscribersCount + 1,
      }));

      return { previousChannel };
    },
    onError: (err, vars, context) => {
      queryClient.setQueryData(['channel', username], context.previousChannel);
      const message = err.message?.includes('not found')
        ? 'Channel not found'
        : err.message?.includes('yourself')
          ? 'You cannot subscribe to your own channel'
          : err.message?.includes('unauthorized') || err.message?.includes('login')
            ? 'Please sign in to subscribe'
            : 'Could not update subscription. Please try again.';
      toast.error(message);
    },
    onSuccess: (data) => {
      if (data.isPending) {
        toast.success('Subscription request sent! Waiting for approval.');
      } else if (data.isSubscribed) {
        toast.success('Subscribed successfully!');
      } else {
        toast.success('Unsubscribed successfully');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['channel', username] });
    },
  });

  if (channelLoading) {
    return <ChannelPageSkeleton />;
  }

  if (!channel) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Channel not found</h1>
          <p className="text-zinc-400">The channel you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const isCloaked = channel.isIdentityCloaked;
  const isOwnChannel = channel.isOwner;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Cover Image */}
      <div className="relative h-56 bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 overflow-hidden border-b border-zinc-800/50">
        {channel.coverImage?.url ? (
          <img
            src={channel.coverImage.url}
            alt="Cover"
            className={`w-full h-full object-cover ${isCloaked ? 'opacity-30 grayscale' : 'opacity-40'}`}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-zinc-900/20 to-indigo-950/30" />
        )}

        {/* Noise Texture Overlay - Removed inline SVG for performance (2-3% GPU usage) */}
        {/* Can add subtle CSS noise via background-image if needed */}

        {/* Cloaked Overlay */}
        {isCloaked && (
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center">
            <div className="text-center">
              <Ghost className="w-16 h-16 text-green-500 mx-auto mb-2" />
              <p className="text-white font-bold text-lg">Identity Cloaked</p>
              <p className="text-zinc-400 text-sm mt-1">This profile is hidden</p>
            </div>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="relative -mt-20 pb-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Avatar */}
            <div className={`relative ${isCloaked ? 'opacity-80' : ''}`}>
              <div className="w-32 h-32 rounded-full border-4 border-zinc-950 overflow-hidden shadow-2xl ring-1 ring-zinc-800/50">
                <img
                  src={channel.avatar?.url || `https://ui-avatars.com/api/?name=${channel.fullName}&background=6366f1&color=fff`}
                  alt={channel.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
              {isCloaked && (
                <div className="absolute inset-0 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                  <Ghost className="w-8 h-8 text-green-500" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-1">
                {isCloaked ? 'Anonymous' : channel.fullName}
              </h1>
              <p className="text-zinc-500 mb-4 font-mono text-sm">@{channel.username}</p>

              {/* Stats Row */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xl text-white">{channel.subscribersCount || 0}</span>
                  <span className="text-zinc-500">Subscribers</span>
                </div>
                <div className="w-px h-4 bg-zinc-800" />
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xl text-white">{channel.channelsSubscribedToCount || 0}</span>
                  <span className="text-zinc-500">Following</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 md:self-end pb-1">
              {!isCloaked && (
                <button
                  onClick={() => !isOwnChannel && subscribeMutation.mutate()}
                  disabled={isOwnChannel || subscribeMutation.isPending}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg ${isOwnChannel
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-900/40 cursor-default'
                    : channel.isSubscribed
                      ? 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white shadow-black/20'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30'
                    }`}
                >
                  <UserPlus className="w-4 h-4" />
                  {isOwnChannel
                    ? 'Your Channel'
                    : subscribeMutation.isPending
                      ? 'Loading...'
                      : channel.isSubscribed
                        ? 'Subscribed'
                        : 'Subscribe'
                  }
                </button>
              )}
              {!isOwnChannel && !channel.isProfilePublic && !channel.isSubscribed && (
                <div className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-lg flex items-center gap-2 text-sm">
                  <Lock className="w-4 h-4" />
                  Private
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          {channel.bio && !isCloaked && (
            <p className="mt-6 text-zinc-400 max-w-3xl leading-relaxed">{channel.bio}</p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mt-4 border-b border-zinc-800/50">
          {['videos', 'tweets', 'about'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 font-medium capitalize transition-all relative group ${activeTab === tab ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              <div className="flex items-center gap-2">
                {tab === 'videos' && <Video className="w-4 h-4" />}
                {tab === 'tweets' && <MessageSquare className="w-4 h-4" />}
                {tab === 'about' && <Users className="w-4 h-4" />}
                {tab}
              </div>
              {activeTab === tab && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="py-8">
          <AnimatePresence mode="wait">
            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <motion.div
                key="videos"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {videosLoading ? (
                  <VideoGridSkeleton count={8} />
                ) : videos?.videos?.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.videos.map((video) => (
                      <VideoCard key={video._id} video={video} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Video className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-400">No videos yet</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Tweets Tab */}
            {activeTab === 'tweets' && (
              <motion.div
                key="tweets"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {tweetsLoading ? (
                  <WireListSkeleton count={4} />
                ) : tweets?.docs?.length > 0 ? (
                  <div className="max-w-2xl mx-auto space-y-4">
                    {tweets.docs.map((tweet) => (
                      <WireCard key={tweet._id} wire={tweet} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-400">No tweets yet</p>
                  </div>
                )}
              </motion.div>
            )}



            {/* About Tab */}
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="max-w-2xl"
              >
                <div className="space-y-6">
                  {/* Bio Section */}
                  {channel.bio && (
                    <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800/50">
                      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" />
                        About
                      </h3>
                      <p className="text-zinc-300 leading-relaxed">
                        {channel.bio}
                      </p>
                    </div>
                  )}

                  {/* Channel Stats */}
                  <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800/50">
                    <h3 className="text-lg font-bold text-white mb-4">Channel Stats</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-zinc-950/50 p-5 rounded-lg border border-zinc-800/30">
                        <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                          <UserPlus className="w-4 h-4" />
                          <span>Subscribers</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{channel.subscribersCount || 0}</p>
                      </div>
                      <div className="bg-zinc-950/50 p-5 rounded-lg border border-zinc-800/30">
                        <div className="flex items-center gap-2 text-zinc-400 text-sm mb-2">
                          <Users className="w-4 h-4" />
                          <span>Following</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{channel.channelsSubscribedToCount || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Information */}
                  <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800/50">
                    <h3 className="text-lg font-bold text-white mb-4">Profile Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-zinc-400">Username</span>
                        <span className="text-white font-mono">@{channel.username}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-t border-zinc-800/50">
                        <span className="text-zinc-400">Full Name</span>
                        <span className="text-white">{channel.fullName}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-t border-zinc-800/50">
                        <span className="text-zinc-400">Joined</span>
                        <span className="text-white">{new Date(channel.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800/50">
                    <h3 className="text-lg font-bold text-white mb-4">Privacy & Visibility</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2">
                          {channel.isProfilePublic ? (
                            <>
                              <Eye className="w-4 h-4 text-green-500" />
                              <span className="text-zinc-300">Public Profile</span>
                            </>
                          ) : (
                            <>
                              <Lock className="w-4 h-4 text-yellow-500" />
                              <span className="text-zinc-300">Private Profile</span>
                            </>
                          )}
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${channel.isProfilePublic
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                          {channel.isProfilePublic ? 'Everyone can see' : 'Subscribers only'}
                        </span>
                      </div>
                      {channel.isIdentityCloaked && (
                        <div className="flex items-center justify-between py-2 border-t border-zinc-800/50">
                          <div className="flex items-center gap-2">
                            <Ghost className="w-4 h-4 text-green-500" />
                            <span className="text-zinc-300">Identity Cloaked</span>
                          </div>
                          <span className="px-2 py-1 rounded text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            Active
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
