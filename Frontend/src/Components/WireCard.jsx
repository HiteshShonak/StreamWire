import { useState, memo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
    Heart, MessageSquare, MoreHorizontal, Trash2,
    BadgeCheck, ShieldCheck, Share, BarChart2, Eye, EyeOff, UserCheck, UserPlus, Check
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { toActionError } from '../utils/errorMessages'

// Services (Imported for local mutation)
import { tweetService } from '../api/services/tweet.service'
import { subscriptionService } from '../api/services/subscription.service'
import ImageLightbox from './Common/ImageLightbox'

const WireCard = memo(function WireCard({ wire, onLike, onDelete }) {
    const { userData } = useSelector((state) => state.auth)
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [copied, setCopied] = useState(false)
    const [lightboxSrc, setLightboxSrc] = useState(null)
    const wireId = wire?._id
    const ownerId = wire?.owner?._id

    // Check ownership
    const isOwner = userData?._id === ownerId

    // Identity logic
    const isStealth = Boolean(wire?.isStealthMode || wire?.owner?.isIdentityCloaked)
    const displayName = isStealth ? "StreamWire User" : wire?.owner?.fullName
    const displayHandle = isStealth ? "@anonymous" : `@${wire?.owner?.username}`
    const avatarUrl = isStealth
        ? `https://ui-avatars.com/api/?name=S&background=18181b&color=22c55e`
        : wire?.owner?.avatar?.url

    const handleShare = (e) => {
        e.stopPropagation()
        const url = `${window.location.origin}/wire/${wireId}`
        navigator.clipboard.writeText(url)
            .then(() => {
                setCopied(true)
                toast.success('Link copied to clipboard')
                setTimeout(() => setCopied(false), 2000)
            })
            .catch((error) => {
                toast.error(toActionError(error, 'Could not copy wire link. Please try again.'))
            })
    }

    // Stealth / claim mutation
    const toggleStealthMutation = useMutation({
        mutationFn: () => {
            if (!wireId) throw new Error('Wire not available')
            return tweetService.updateTweet(wireId, { isStealthMode: !isStealth })
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['wire'])
            const message = isStealth ? "Wire claimed (Public)" : "Wire masked (Stealth)"
            toast.success(message)
        },
        onError: (err) => {
            toast.error(toActionError(err, 'Could not update wire privacy. Please try again.'))
        }
    })

    // Subscribe mutation
    const subscribeMutation = useMutation({
        mutationFn: () => {
            if (!ownerId) throw new Error('Channel not available')
            return subscriptionService.toggleSubscription(ownerId)
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['wire'])
            if (data.isPending) {
                toast.success('Subscription request sent!')
            } else if (data.isSubscribed) {
                toast.success('Subscribed!')
            } else {
                toast.success('Unsubscribed')
            }
        },
        onError: (err) => {
            toast.error(toActionError(err, 'Could not update subscription. Please try again.', [
                {
                    when: ['unauthorized', 'login'],
                    message: 'Please sign in to manage subscriptions.'
                },
                {
                    when: ['yourself'],
                    message: 'You cannot subscribe to your own channel.'
                }
            ]))
        }
    })

    // Navigation Handler
    const handleCardClick = (e) => {
        if (!wireId) return
        if (e.target.closest('button') || window.getSelection().toString().length > 0) return
        navigate(`/wire/${wireId}`)
    }

    // Guard against undefined wire
    if (!wire) return null

    return (
        <>
        <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            layout
            onClick={handleCardClick}
            className={`
                relative border-b border-zinc-800 bg-zinc-950 hover:bg-zinc-900 transition-colors cursor-pointer p-3 sm:p-4 contain-content
                ${isStealth ? "border-l-2 border-l-green-500/30 pl-3.5" : ""} 
            `}
        >
            <div className="flex gap-3 sm:gap-4">
                {/* Avatar Column */}
                <Link
                    to={isStealth ? "#" : `/c/${wire.owner?.username}`}
                    className="shrink-0"
                    onClick={(e) => { e.stopPropagation(); if (isStealth) e.preventDefault(); }}
                >
                    <img
                        src={avatarUrl}
                        alt="Avatar"
                        loading="lazy"
                        className={`w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-white/30 transition-all ${isStealth ? "border border-green-500/30" : ""}`}
                    />
                </Link>

                {/* Content Column */}
                <div className="flex-1 min-w-0">

                    {/* Header: Name, Badge, Handle, Time, Menu */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap overflow-hidden">
                            <Link
                                to={isStealth ? "#" : `/c/${wire.owner?.username}`}
                                onClick={(e) => { e.stopPropagation(); if (isStealth) e.preventDefault(); }}
                                className={`font-bold text-sm truncate hover:underline ${isStealth ? "text-green-500 font-mono tracking-tight" : "text-white"}`}
                            >
                                {displayName}
                            </Link>

                            {!isStealth && <BadgeCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                            {isStealth && <ShieldCheck className="w-3.5 h-3.5 text-green-500 shrink-0" />}

                            {isOwner && (
                                <span className="px-1.5 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] font-bold rounded border border-zinc-700">YOU</span>
                            )}
                            {userData && !isOwner && !isStealth && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        subscribeMutation.mutate();
                                    }}
                                    disabled={subscribeMutation.isPending}
                                    className={`px-2 py-0.5 text-[10px] font-bold rounded border flex items-center gap-0.5 transition-colors disabled:opacity-50 ${wire.owner?.isSubscribed
                                        ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700'
                                        : 'bg-white/10 hover:bg-white/15 text-white border-zinc-600'
                                        }`}
                                >
                                    {wire.owner?.isSubscribed ? (
                                        <><UserCheck className="w-2.5 h-2.5" /> SUBSCRIBED</>
                                    ) : (
                                        <><UserPlus className="w-2.5 h-2.5" /> SUBSCRIBE</>
                                    )}
                                </button>
                            )}

                            <span className="text-zinc-500 text-sm truncate font-mono">{displayHandle}</span>
                            <span className="text-zinc-600 text-xs">•</span>
                            <span className="text-zinc-500 text-xs hover:underline">
                                {formatDistanceToNow(new Date(wire.createdAt), { addSuffix: true })}
                            </span>
                        </div>

                        {/* Context Menu (Owner Only) */}
                        {isOwner && (
                            <div className="relative group/menu">
                                <button className="p-1 text-zinc-500 hover:text-white transition-colors rounded-full hover:bg-white/5">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-0 hidden group-hover/menu:block pt-6 z-20">
                                    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-1 shadow-xl w-36 overflow-hidden">

                                        {/* Claim / Go Stealth Button - Hidden when identity is globally cloaked */}
                                        {!wire.owner?.isIdentityCloaked && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    toggleStealthMutation.mutate()
                                                }}
                                                disabled={toggleStealthMutation.isPending}
                                                className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors ${isStealth
                                                    ? "text-white hover:bg-white/5"
                                                    : "text-green-400 hover:bg-green-500/10"
                                                    }`}
                                            >
                                                {isStealth ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                                {isStealth ? "Claim Wire" : "Go Stealth"}
                                            </button>
                                        )}

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onDelete(wireId)
                                            }}
                                            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg text-left transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Post Text */}
                    <div className="mb-3">
                        <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                            {wire.content}
                        </p>
                    </div>

                    {/* Image Attachment */}
                    {wire.image?.url && (
                        <div
                            className="mb-3 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/50 cursor-zoom-in"
                            onClick={e => { e.stopPropagation(); setLightboxSrc(wire.image.url) }}
                        >
                            <img
                                src={wire.image.url}
                                alt="Attachment"
                                className="w-full h-auto max-h-125 object-cover hover:opacity-90 transition-opacity"
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* Poll Visual (If exists) */}
                    {wire.poll && (
                        <div className="mb-3 p-3 border border-zinc-800 rounded-xl bg-zinc-900/30">
                            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                                <BarChart2 className="w-3.5 h-3.5" />
                                <span>Poll available</span>
                            </div>
                            <div className="space-y-1.5 opacity-60">
                                {wire.poll.options.slice(0, 2).map((opt, i) => (
                                    <div key={i} className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-zinc-600 w-1/4"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons Footer */}
                    <div className="flex items-center justify-between w-full mt-2 -ml-2 text-zinc-500">

                        {/* Comments */}
                        <button
                            className="group/btn flex items-center gap-1.5 p-2 rounded-full transition-colors hover:bg-white/5 hover:text-white"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/wire/${wireId}`);
                            }}
                        >
                            <MessageSquare className="w-4.5 h-4.5 transition-colors" />
                            <span className="text-xs font-medium">
                                {wire.commentsCount || 0}
                            </span>
                        </button>

                        {/* Likes */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                if (!userData) {
                                    navigate('/login')
                                    return
                                }
                                onLike(wireId)
                            }}
                            className={`group/btn flex items-center gap-1.5 p-2 rounded-full transition-colors hover:bg-red-500/10 hover:text-red-500 ${wire.isLiked ? 'text-red-500' : ''}`}
                        >
                            <Heart className={`w-4.5 h-4.5 transition-colors ${wire.isLiked ? "fill-red-500" : ""}`} />
                            <span className="text-xs font-medium">
                                {wire.likesCount || 0}
                            </span>
                        </button>

                        {/* Views */}
                        <div className="flex items-center gap-1.5 p-2">
                            <BarChart2 className="w-4.5 h-4.5" />
                            <span className="text-xs font-medium">
                                {wire.views || 0}
                            </span>
                        </div>

                        {/* Share */}
                        <button
                            onClick={handleShare}
                            className="group/btn flex items-center gap-1.5 p-2 rounded-full transition-colors hover:bg-white/5 hover:text-white"
                        >
                            {copied ? (
                                <Check className="w-4.5 h-4.5 text-white" />
                            ) : (
                                <Share className="w-4.5 h-4.5 transition-colors" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </motion.article>

        {/* Full-screen image lightbox */}
        {lightboxSrc && (
            <ImageLightbox
                src={lightboxSrc}
                alt="Wire image"
                onClose={() => setLightboxSrc(null)}
            />
        )}
        </>
    )
})

export default WireCard
