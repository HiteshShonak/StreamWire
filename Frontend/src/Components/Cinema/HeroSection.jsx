import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, Check, Plus, Upload, Eye, Film, Share2 } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { libraryService } from '../../api/services/library.service'
import { formatViews, formatTimeAgo } from '../../utils/formatters'
import { toActionError } from '../../utils/errorMessages'

const HeroSection = React.memo(({
    hasVideos: _hasVideos,
    featuredVideo,
    userData,
}) => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    // Share functionality
    const handleShare = async (videoId) => {
        const shareUrl = `${window.location.origin}/cinema/${videoId}`

        if (navigator.share) {
            try {
                await navigator.share({
                    title: featuredVideo?.title || 'Check out this video',
                    text: featuredVideo?.description || 'Watch this on StreamWire',
                    url: shareUrl
                })
                toast.success('Shared successfully!')
            } catch (_err) {
                if (_err.name !== 'AbortError') {
                    toast.error(toActionError(_err, 'Could not share this video. Please try again.'))
                }
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(shareUrl).then(() => {
                toast.success('Link copied to clipboard!')
            }).catch(() => {
                toast.error('Could not copy the video link. Please try again.')
            })
        }
    }

    // Check if featured video is in watch later
    const { data: watchLaterStatus, isLoading: watchLaterLoading } = useQuery({
        queryKey: ['watch-later-status', featuredVideo?._id],
        queryFn: () => libraryService.checkWatchLater(featuredVideo._id),
        enabled: !!featuredVideo?._id && !!userData,
        retry: false,
        staleTime: 5 * 60 * 1000,
    })

    // Toggle watch later mutation
    const toggleWatchLaterMutation = useMutation({
        mutationFn: (videoId) => libraryService.toggleWatchLater(videoId),
        onSuccess: (data) => {
            queryClient.setQueryData(['watch-later-status', featuredVideo?._id], data)
            queryClient.invalidateQueries(['watch-later'])
            if (data?.isInWatchLater) {
                toast.success('Added to My List')
            } else {
                toast.success('Removed from My List')
            }
        },
        onError: (err) => {
            toast.error(toActionError(err, 'Could not update My List. Please try again.', [
                {
                    when: ['unauthorized', 'login'],
                    message: 'Please sign in to manage your My List.'
                },
                {
                    when: ['not found'],
                    message: 'This video is no longer available.'
                }
            ]))
        }
    })

    const [isImageLoaded, setIsImageLoaded] = React.useState(false)

    if (!featuredVideo) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-[#050505] via-indigo-950/20 to-[#050505]">
                <div className="text-center max-w-2xl px-6 space-y-8">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, type: "spring" }}
                        className="relative inline-block"
                    >
                        <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center backdrop-blur-xl">
                            <Film className="w-16 h-16 text-indigo-400" />
                        </div>
                        <div className="absolute -top-4 -right-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-3xl"></div>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="space-y-4"
                    >
                        <h1 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-linear-to-r from-white via-indigo-200 to-purple-300 leading-tight">
                            Welcome to The Cinema
                        </h1>
                        <p className="text-xl text-zinc-400 leading-relaxed max-w-xl mx-auto">
                            The stage is set, the spotlight awaits. Be the first to share your vision with the world.
                        </p>
                    </motion.div>

                    <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                        whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(99, 102, 241, 0.5)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/upload')}
                        className="inline-flex items-center gap-3 px-10 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white font-bold text-lg shadow-lg hover:shadow-indigo-500/40 transition-all"
                    >
                        <Upload className="w-6 h-6" />
                        Upload Your First Video
                    </motion.button>

                    <p className="text-sm text-zinc-600 mt-6">
                        Your content. Your story. Amplified by AI.
                    </p>
                </div>
            </div>
        )
    }



    return (
        <>
            <div className="absolute inset-0 bg-[#050505]">
                {/* Placeholder / Blur Backdrop */}
                <div
                    className={`absolute inset-0 bg-linear-to-br from-indigo-900/20 to-purple-900/20 transition-opacity duration-1000 ${isImageLoaded ? 'opacity-0' : 'opacity-100'}`}
                />

                <img
                    src={featuredVideo?.thumbnail?.url}
                    alt={featuredVideo?.title || "Hero"}
                    className={`w-full h-full object-cover transition-opacity duration-1000 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    loading="eager"
                    fetchPriority="high"
                    onLoad={() => setIsImageLoaded(true)}
                />

                <div className="absolute inset-0 bg-linear-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                <div className="absolute inset-0 bg-linear-to-r from-black/80 via-transparent to-transparent" />
            </div>

            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:pl-75 pb-20 md:pb-32 flex flex-col justify-end h-full pointer-events-none">
                <div className="max-w-3xl pointer-events-auto animate-fade-in-up">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 backdrop-blur-md mb-6">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">
                            {featuredVideo ? 'Trending Now' : 'World Premiere'}
                        </span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-4 leading-[0.95] tracking-tight drop-shadow-2xl">
                        {featuredVideo?.title?.toUpperCase() || "INTERSTELLAR"} <br />
                        {featuredVideo?.subtitle && (
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 to-white font-light">
                                {featuredVideo.subtitle.toUpperCase()}
                            </span>
                        )}
                    </h1>

                    <p className="text-zinc-300 text-sm md:text-lg leading-relaxed line-clamp-3 mb-4 max-w-xl drop-shadow-lg">
                        {featuredVideo?.description || "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival. Now remastered in 8K with AI-enhanced visuals and never-before-seen footage."}
                    </p>

                    {featuredVideo && (
                        <div className="flex items-center gap-4 mb-4 text-sm text-zinc-400">
                            <span className="flex items-center gap-2">
                                <Eye size={16} />
                                {formatViews(featuredVideo.views)} views
                            </span>
                            <span>•</span>
                            <span>{formatTimeAgo(featuredVideo.createdAt)}</span>
                        </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4">
                        <button
                            onClick={() => featuredVideo && navigate(`/cinema/${featuredVideo._id}`)}
                            className="px-8 py-3.5 bg-white text-black rounded-xl font-bold text-base hover:bg-zinc-200 transition-transform active:scale-95 flex items-center gap-2 shadow-xl shadow-white/10"
                        >
                            <Play className="w-5 h-5 fill-current" /> Play Now
                        </button>
                        <button
                            onClick={() => {
                                if (!userData) {
                                    toast.error('Please sign in to add this video to My List.')
                                    return navigate('/login')
                                }
                                if (featuredVideo) toggleWatchLaterMutation.mutate(featuredVideo._id)
                            }}
                            disabled={toggleWatchLaterMutation.isPending || watchLaterLoading}
                            className={`px-8 py-3.5 rounded-xl font-bold text-base transition-transform active:scale-95 flex items-center gap-2 backdrop-blur-md disabled:opacity-50 ${watchLaterStatus?.isInWatchLater
                                ? 'bg-indigo-500/30 text-indigo-200 border border-indigo-400/30'
                                : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                                }`}
                        >
                            {watchLaterStatus?.isInWatchLater ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {watchLaterStatus?.isInWatchLater ? 'In My List' : 'My List'}
                        </button>
                        <button
                            onClick={() => featuredVideo && handleShare(featuredVideo._id)}
                            className="p-3.5 bg-white/10 text-white border border-white/20 rounded-xl hover:bg-white/20 transition-transform active:scale-95 backdrop-blur-md"
                            title="Share"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
})

export default HeroSection
