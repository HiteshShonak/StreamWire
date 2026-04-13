import { useState, memo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
    Heart, MessageSquare, MoreHorizontal, Trash2,
    Ghost, ShieldCheck, Share, BarChart2, Eye, UserCheck, Check
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { toActionError } from '../utils/errorMessages'

import { tweetService } from '../api/services/tweet.service'
import ImageLightbox from './Common/ImageLightbox'

const ShadowCard = memo(function ShadowCard({ shadow, onLike, onDelete }) {
    const { userData } = useSelector((state) => state.auth)
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [copied, setCopied] = useState(false)
    const [lightboxSrc, setLightboxSrc] = useState(null)
    const shadowId = shadow?._id

    // Check ownership (owner can still see their own anonymous posts)
    const isOwner = userData?._id === shadow?.owner?._id

    // ALL posts in shadows are anonymous
    const displayName = "Shadow User"
    const displayHandle = "@redacted"
    const pollQuestion = shadow?.poll?.question || shadow?.pollQuestion || ''

    const handleShare = (e) => {
        e.stopPropagation()
        const url = `${window.location.origin}/shadow/${shadowId}`
        navigator.clipboard.writeText(url)
            .then(() => {
                setCopied(true)
                toast.success('Link copied to clipboard')
                setTimeout(() => setCopied(false), 2000)
            })
            .catch((error) => {
                toast.error(toActionError(error, 'Could not copy shadow link. Please try again.'))
            })
    }

    // Claim shadow mutation (convert to public)
    const claimShadowMutation = useMutation({
        mutationFn: () => {
            if (!shadowId) throw new Error('Shadow not available')
            return tweetService.updateTweet(shadowId, { isStealthMode: false })
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['shadows'])
            toast.success("Shadow claimed and made public")
        },
        onError: (err) => {
            toast.error(toActionError(err, 'Could not claim this shadow. Please try again.'))
        }
    })

    // Navigation Handler
    const handleCardClick = (e) => {
        if (!shadowId) return
        if (e.target.closest('button') || window.getSelection().toString().length > 0) return
        navigate(`/shadow/${shadowId}`)
    }

    // Guard against undefined shadow
    if (!shadow) return null

    return (
        <>
        <motion.article
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            layout
            onClick={handleCardClick}
            className="relative border-b border-zinc-900 bg-black hover:bg-zinc-950 transition-colors cursor-pointer p-3 sm:p-4 border-l-2 border-l-emerald-900/40 contain-content font-mono"
        >
            <div className="flex gap-3 sm:gap-4">
                {/* Avatar Column - Anonymous Icon */}
                <div className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border border-emerald-900/30 flex items-center justify-center">
                        <Ghost className="w-5 h-5 text-emerald-500/70" />
                    </div>
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0">

                    {/* Header: Name, Badge, Handle, Time, Menu */}
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap overflow-hidden">
                            <span className="font-bold text-sm truncate text-emerald-400/80 font-mono tracking-tight">
                                {displayName}
                            </span>

                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/60 shrink-0" />

                            {isOwner && (
                                <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/30">YOU</span>
                            )}

                            <span className="text-zinc-600 text-sm truncate">{displayHandle}</span>
                            <span className="text-zinc-700 text-xs">•</span>
                            <span className="text-zinc-600 text-xs hover:underline">
                                {formatDistanceToNow(new Date(shadow.createdAt), { addSuffix: true })}
                            </span>
                        </div>

                        {/* Context Menu (Owner Only) */}
                        {isOwner && (
                            <div className="relative group/menu">
                                <button className="p-1 text-zinc-600 hover:text-emerald-500 transition-colors rounded-full hover:bg-emerald-500/10">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>

                                {/* Dropdown Menu */}
                                <div className="absolute right-0 top-0 hidden group-hover/menu:block pt-6 z-20">
                                    <div className="bg-black border border-zinc-800 rounded-xl p-1 shadow-xl w-36 overflow-hidden">

                                        {/* Claim Shadow Button - Hidden when identity is globally cloaked */}
                                        {!shadow.owner?.isIdentityCloaked && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    claimShadowMutation.mutate()
                                                }}
                                                disabled={claimShadowMutation.isPending}
                                                className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors text-red-500 hover:bg-red-500/10"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                Claim Shadow
                                            </button>
                                        )}

                                        {/* Delete Button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onDelete(shadowId)
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
                        <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                            {shadow.content}
                        </p>
                    </div>

                    {/* Image Attachment */}
                    {shadow.image?.url && (
                        <div
                            className="mb-3 rounded-xl overflow-hidden border border-zinc-900 bg-black/70 cursor-zoom-in"
                            onClick={e => { e.stopPropagation(); setLightboxSrc(shadow.image.url) }}
                        >
                            <img
                                src={shadow.image.url}
                                alt="Attachment"
                                className="w-full h-auto max-h-125 object-cover opacity-90 hover:opacity-100 transition-opacity"
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* Poll Visual (If exists) */}
                    {shadow.poll && (
                        <div className="mb-3 p-3 border border-zinc-900 rounded-xl bg-black/80">
                            <div className="flex items-center gap-2 text-xs text-emerald-500/60 mb-2">
                                <BarChart2 className="w-3.5 h-3.5" />
                                <span>Anonymous poll</span>
                            </div>
                            {pollQuestion && (
                                <p className="text-xs text-emerald-300/80 mb-2 line-clamp-2">{pollQuestion}</p>
                            )}
                            <div className="space-y-1.5 opacity-60">
                                {shadow.poll.options.slice(0, 2).map((opt, i) => (
                                    <div key={i} className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-900/40 w-1/4"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons Footer */}
                    <div className="flex items-center justify-between w-full mt-2 -ml-2 text-zinc-600">

                        {/* Comments */}
                        <button
                            className="group/btn flex items-center gap-1.5 p-2 rounded-full transition-colors hover:bg-emerald-500/10 hover:text-emerald-500"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/shadow/${shadowId}`);
                            }}
                        >
                            <MessageSquare className="w-4.5 h-4.5 transition-colors" />
                            <span className="text-xs font-medium">
                                {shadow.commentsCount || 0}
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
                                onLike(shadowId)
                            }}
                            className={`group/btn flex items-center gap-1.5 p-2 rounded-full transition-colors hover:bg-emerald-500/10 hover:text-emerald-500 ${shadow.isLiked ? 'text-emerald-500' : ''}`}
                        >
                            <Heart className={`w-4.5 h-4.5 transition-colors ${shadow.isLiked ? "fill-emerald-500" : ""}`} />
                            <span className="text-xs font-medium">
                                {shadow.likesCount || 0}
                            </span>
                        </button>

                        {/* Views */}
                        <div className="flex items-center gap-1.5 p-2">
                            <BarChart2 className="w-4.5 h-4.5" />
                            <span className="text-xs font-medium">
                                {shadow.views || 0}
                            </span>
                        </div>

                        {/* Share */}
                        <button
                            onClick={handleShare}
                            className="group/btn flex items-center gap-1.5 p-2 rounded-full transition-colors hover:bg-emerald-500/10 hover:text-emerald-500"
                        >
                            {copied ? (
                                <Check className="w-4.5 h-4.5 text-emerald-500" />
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
                alt="Shadow image"
                onClose={() => setLightboxSrc(null)}
            />
        )}
        </>
    )
})

export default ShadowCard
