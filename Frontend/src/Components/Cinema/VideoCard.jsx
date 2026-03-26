import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Play, List, BadgeCheck } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { libraryService } from '../../api/services/library.service'
import { formatViews, formatDuration, formatTimeAgo } from '../../utils/formatters'
import { toActionError } from '../../utils/errorMessages'

const VideoCard = React.memo(({ video }) => {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { userData } = useSelector((state) => state.auth)
    const [isHovering, setIsHovering] = useState(false)
    const hoverTimeoutRef = React.useRef(null)

    const handleMouseEnter = () => {
        hoverTimeoutRef.current = setTimeout(() => {
            setIsHovering(true)
        }, 2000) // 2s delay
    }

    const handleMouseLeave = () => {
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
        }
        setIsHovering(false)
    }

    const isStealthMode = video.isStealthMode
    const displayName = isStealthMode ? "Anonymous Creator" : video.owner?.fullName
    const avatarUrl = isStealthMode
        ? `https://ui-avatars.com/api/?name=S&background=18181b&color=22c55e`
        : video.owner?.avatar?.url || `https://ui-avatars.com/api/?name=${video.owner?.fullName || 'U'}&background=6366f1&color=fff`

    // Check if video is in watch later
    const { data: watchLaterStatus, isLoading: watchLaterLoading } = useQuery({
        queryKey: ['watchLaterStatus', video._id],
        queryFn: () => libraryService.checkWatchLater(video._id),
        enabled: !!video._id && !!userData,
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    // Watch later mutation
    const watchLaterMutation = useMutation({
        mutationFn: () => libraryService.toggleWatchLater(video._id),
        onSuccess: (data) => {
            // Update query cache with actual server response
            queryClient.setQueryData(['watchLaterStatus', video._id], data)
            queryClient.invalidateQueries(['watch-later'])

            // Show correct toast message
            if (data?.isInWatchLater) {
                toast.success('Added to Watch Later')
            } else {
                toast.success('Removed from Watch Later')
            }
        },
        onError: (err) => {
            toast.error(toActionError(err, 'Could not update Watch Later. Please try again.', [
                {
                    when: ['not found'],
                    message: 'Video not found.'
                },
                {
                    when: ['unauthorized', 'login'],
                    message: 'Please sign in to manage your Watch Later list.'
                }
            ]));
        }
    })

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group cursor-pointer relative"
        >
            {/* Thumbnail Wrapper */}
            <div
                onClick={() => navigate(`/cinema/${video._id}`)}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-lg shadow-black/40 group-hover:shadow-indigo-500/20 transition-all duration-300 bg-black"
            >
                {isHovering ? (
                    <video
                        src={video.videoFile?.url}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                    />
                ) : (
                    <img
                        src={video.thumbnail?.url}
                        alt={video.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                )}

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-xl">
                        <Play className="w-6 h-6 text-white fill-current translate-x-0.5" />
                    </div>
                </div>

                {/* Duration */}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded text-[10px] font-bold text-white tracking-wide">
                    {formatDuration(video.duration)}
                </div>

                {/* Watch Later Button - Top Right */}
                {userData && (
                    <motion.button
                        onClick={(e) => {
                            e.stopPropagation()
                            watchLaterMutation.mutate()
                        }}
                        disabled={watchLaterMutation.isPending || watchLaterLoading}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        title={watchLaterStatus?.isInWatchLater ? 'Remove from Watch Later' : 'Add to Watch Later'}
                        className={`absolute top-2 right-2 p-2 rounded-lg backdrop-blur-md border transition-all ${watchLaterStatus?.isInWatchLater
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                            : 'bg-black/50 border-white/20 text-white hover:bg-black/70'
                            }`}
                    >
                        <List className="w-4 h-4" />
                    </motion.button>
                )}
            </div>

            {/* Meta Data */}
            <div
                onClick={() => navigate(`/cinema/${video._id}`)}
                className="flex gap-3 px-1"
            >
                <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0"
                />
                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm leading-snug mb-1 line-clamp-2 group-hover:text-indigo-300 transition-colors">
                        {video.title}
                    </h3>
                    <div className="flex items-center gap-1 text-zinc-400 text-xs mb-0.5">
                        <span className="hover:text-white transition-colors">{displayName}</span>
                        {!isStealthMode && <BadgeCheck className="w-3 h-3 text-indigo-400" />}
                    </div>
                    <div className="text-zinc-500 text-[11px]">
                        {formatViews(video.views)} views • {formatTimeAgo(video.createdAt)}
                    </div>
                </div>
            </div>
        </motion.div>
    )
})

export default VideoCard
