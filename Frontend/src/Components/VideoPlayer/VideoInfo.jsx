import React, { useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Eye, Clock, BadgeCheck, Ghost, UserPlus, UserCheck,
    ThumbsUp, MessageSquare, Share2, Check, AlertTriangle, Trash2,
    ChevronUp, ChevronDown, EyeOff
} from 'lucide-react'
import { LoadingDots } from '../Common/LoadingIndicator'
import { formatDistanceToNow } from 'date-fns'
import { formatViews } from '../../utils/formatters'

const VideoInfo = React.memo(({
    video,
    isOwner,
    isStealthMode,
    displayName,
    avatarUrl,
    subscribeMutation,
    likeMutation,
    watchLaterMutation,
    watchLaterStatus,
    handleShare,
    toggleStealthMutation,
    showDeleteConfirm,
    setShowDeleteConfirm,
    deleteVideoMutation,
    showDescription,
    setShowDescription,
    copied,

    navigate, // passed from parent
    userData // needed for guest check
}) => {
    const handleLike = useCallback(() => {
        if (!userData) {
            navigate('/login')
            return
        }
        likeMutation.mutate()
    }, [userData, navigate, likeMutation]);

    return (
        <div className="space-y-4">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
                {video.title}
            </h1>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                <div className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {formatViews(video.views)} views
                </div>
                <span className="text-zinc-600">•</span>
                <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                </div>
            </div>

            {/* Creator Info & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                {/* ... Creator Info ... */}
                <div
                    className={`flex items-center gap-4 ${!isStealthMode ? 'cursor-pointer group' : ''}`}
                    onClick={() => !isStealthMode && navigate(`/c/${video.owner?.username}`)}
                >
                    <img
                        src={avatarUrl}
                        alt={displayName}
                        className={`w-12 h-12 rounded-full object-cover border-2 transition-all ${isStealthMode
                            ? 'border-green-500/30'
                            : 'border-zinc-800 group-hover:border-indigo-500/50'
                            }`}
                    />
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className={`font-bold transition-colors ${isStealthMode
                                ? 'text-green-500'
                                : 'text-white group-hover:text-indigo-400'
                                }`}>
                                {displayName}
                            </h3>
                            {!isStealthMode && <BadgeCheck className="w-4 h-4 text-indigo-400" />}
                            {isStealthMode && <Ghost className="w-4 h-4 text-green-500" />}
                        </div>
                        <p className="text-sm text-zinc-500">
                            {formatViews(video.owner?.subscribersCount || 0)} subscribers
                        </p>
                    </div>
                </div>

                {userData && !isOwner && !isStealthMode && (
                    <button
                        onClick={() => subscribeMutation.mutate()}
                        disabled={subscribeMutation.isPending}
                        className={`
              px-6 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center gap-2 justify-center
              ${video.isSubscribed
                                ? 'bg-zinc-800 hover:bg-zinc-700 text-white'
                                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                            }
            `}
                    >
                        {subscribeMutation.isPending ? (
                            <LoadingDots size="xs" />
                        ) : video.isSubscribed ? (
                            <><UserCheck className="w-4 h-4" /> Subscribed</>
                        ) : (
                            <><UserPlus className="w-4 h-4" /> Subscribe</>
                        )}
                    </button>
                )}
            </div>

            {/* Engagement Bar */}
            <div className="flex items-center gap-2 flex-wrap">
                <button
                    onClick={handleLike}
                    className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all
            ${video.isLiked
                            ? 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-300'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }
          `}
                >
                    <ThumbsUp className={`w-4 h-4 ${video.isLiked ? 'fill-current' : ''}`} />
                    {video.likesCount || 0}
                </button>

                <button
                    onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 rounded-xl font-medium text-sm transition-all"
                >
                    <MessageSquare className="w-4 h-4" />
                    {video.commentsCount || 0}
                </button>

                <button
                    onClick={() => userData ? watchLaterMutation.mutate() : navigate('/login')}
                    disabled={!userData ? false : (watchLaterMutation.isPending || !video)}
                    className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50
            ${watchLaterStatus?.isInWatchLater
                            ? 'bg-amber-500/20 border border-amber-500/30 text-amber-300'
                            : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                        }
          `}
                    title={watchLaterStatus?.isInWatchLater ? 'Remove from Watch Later' : 'Add to Watch Later'}
                >
                    {watchLaterMutation.isPending ? (
                        <LoadingDots size="xs" />
                    ) : (
                        <Clock className={`w-4 h-4 ${watchLaterStatus?.isInWatchLater ? 'fill-current' : ''}`} />
                    )}
                    {watchLaterStatus?.isInWatchLater ? 'Saved' : 'Watch Later'}
                </button>

                <div className="relative">
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 rounded-xl font-medium text-sm transition-all"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                        Share
                    </button>
                </div>

                {/* Owner: Stealth Toggle Button - Hidden when identity is globally cloaked */}
                {isOwner && !video.owner?.isIdentityCloaked && (
                    <button
                        onClick={() => toggleStealthMutation.mutate()}
                        disabled={toggleStealthMutation.isPending}
                        className={`
              flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-50
              ${isStealthMode
                                ? 'bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30'
                                : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                            }
            `}
                    >
                        {isStealthMode ? (
                            <><Eye className="w-4 h-4" /> Claim Video</>
                        ) : (
                            <><EyeOff className="w-4 h-4" /> Go Stealth</>
                        )}
                    </button>
                )}

                {/* Owner: Delete Video Button */}
                {isOwner && (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 rounded-xl font-medium text-sm transition-all"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowDeleteConfirm(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-500/10 rounded-full">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Delete Video</h3>
                                    <p className="text-sm text-zinc-500">This action cannot be undone</p>
                                </div>
                            </div>

                            <p className="text-zinc-400 text-sm mb-6">
                                Are you sure you want to delete "<span className="text-white font-medium">{video.title}</span>"?
                                This will permanently remove the video, all comments, and likes.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteVideoMutation.mutate()}
                                    disabled={deleteVideoMutation.isPending}
                                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {deleteVideoMutation.isPending ? (
                                        <LoadingDots size="xs" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                    Delete Forever
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Description */}
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                <button
                    onClick={() => setShowDescription(!showDescription)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <h4 className="font-bold text-white">Description</h4>
                    {showDescription ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
                </button>

                <AnimatePresence>
                    {showDescription && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-wrap mt-3 pt-3 border-t border-zinc-800">
                                {video.description}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
                <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <h4 className="font-bold text-white">Tags</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {video.tags.map((tag, index) => (
                            <button
                                key={index}
                                onClick={() => navigate(`/search?query=${encodeURIComponent(tag)}&tab=videos`)}
                                className="px-3 py-1.5 bg-zinc-800/80 border border-zinc-700 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-zinc-300 hover:text-indigo-300 rounded-lg text-sm font-medium transition-all"
                            >
                                #{tag}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
})

export default VideoInfo
