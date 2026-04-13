import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  Heart, MessageSquare, ArrowLeft, Send,
  Trash2, Ghost, BadgeCheck, ShieldCheck, MoreHorizontal, Eye, EyeOff, Share, Check, BarChart2
} from 'lucide-react'
import { LoadingDots } from './Common/LoadingIndicator'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import { toActionError } from '../utils/errorMessages'

// Services
import { tweetService } from '../api/services/tweet.service'
import { likeService } from '../api/services/like.service'
import { commentService } from '../api/services/comment.service'

import AuthLock from './Common/AuthLock'
import { WirePostSkeleton } from './Common/Skeleton'

export default function ShadowPost() {
  const { shadowId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { userData } = useSelector((state) => state.auth)

  const [commentText, setCommentText] = useState('')
  // Allow users to toggle between stealth and public identity on shadow comments
  const [isStealthComment, setIsStealthComment] = useState(true)
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
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

  // Fetch Shadow
  const { data: shadow, isLoading: shadowLoading } = useQuery({
    queryKey: ['shadow', shadowId],
    queryFn: async () => await tweetService.getTweetById(shadowId),
    retry: 1
  })

  // Fetch Comments
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['shadowComments', shadowId],
    queryFn: async () => await commentService.getTweetComments(shadowId, { page: 1, limit: 50 }),
    enabled: !!shadowId
  })

  // Actions

  // Instant like (optimistic UI)
  const likeMutation = useMutation({
    mutationFn: likeService.toggleTweetLike,
    onMutate: async () => {
      await queryClient.cancelQueries(['shadow', shadowId])
      const previousShadow = queryClient.getQueryData(['shadow', shadowId])

      queryClient.setQueryData(['shadow', shadowId], (old) => {
        if (!old) return old
        const isLiked = !old.isLiked
        return {
          ...old,
          isLiked: isLiked,
          likesCount: isLiked ? old.likesCount + 1 : old.likesCount - 1
        }
      })
      return { previousShadow }
    },
    onError: (err, _variables, context) => {
      if (context?.previousShadow) {
        queryClient.setQueryData(['shadow', shadowId], context.previousShadow)
      }
      toast.error(toActionError(err, 'Could not update like. Please try again.', [
        {
          when: ['unauthorized', 'login'],
          message: 'Please sign in to like this shadow.'
        }
      ]))
    },
    onSettled: () => {
      queryClient.invalidateQueries(['shadow', shadowId])
      queryClient.invalidateQueries(['shadows'])
    }
  })

  // Vote mutation (optimistic)
  const voteMutation = useMutation({
    mutationFn: ({ tweetId, optionIndex }) => tweetService.voteOnPoll(tweetId, optionIndex),
    onMutate: async ({ optionIndex }) => {
      await queryClient.cancelQueries(['shadow', shadowId])
      const previousShadow = queryClient.getQueryData(['shadow', shadowId])

      // Optimistically update poll
      queryClient.setQueryData(['shadow', shadowId], (old) => {
        if (!old || !old.poll) return old
        const previousVote = old.userVote

        const isRemovingVote = previousVote === optionIndex
        const newOptions = old.poll.options.map((opt, idx) => {
          if (isRemovingVote) {
            return idx === optionIndex
              ? { ...opt, votes: Math.max(0, opt.votes - 1) }
              : opt
          }

          return {
            ...opt,
            votes:
              idx === optionIndex
                ? opt.votes + 1
                : idx === previousVote
                  ? Math.max(0, opt.votes - 1)
                  : opt.votes
          }
        })

        return {
          ...old,
          poll: { ...old.poll, options: newOptions },
          userVote: isRemovingVote ? null : optionIndex
        }
      })

      return {
        previousShadow,
        previousUserVote: previousShadow?.userVote,
        selectedOption: optionIndex
      }
    },
    onSuccess: (updatedShadow, _variables, context) => {
      // Sync with server-confirmed result to avoid local drift.
      if (updatedShadow?._id) {
        queryClient.setQueryData(['shadow', shadowId], updatedShadow)
      }
      const hasPreviousVote = context?.previousUserVote !== undefined && context?.previousUserVote !== null
      const isRemovingVote = hasPreviousVote && context?.previousUserVote === context?.selectedOption
      toast.success(isRemovingVote ? 'Vote removed!' : hasPreviousVote ? 'Vote updated!' : 'Vote recorded!')
    },
    onError: (err, variables, context) => {
      if (context?.previousShadow) {
        queryClient.setQueryData(['shadow', shadowId], context.previousShadow)
      }
      toast.error(toActionError(err, 'Could not submit your vote. Please try again.', [
        {
          when: ['unauthorized', 'login'],
          message: 'Please sign in to vote on this poll.'
        }
      ]))
    }
  })

  // Claim shadow (make public)
  const claimShadowMutation = useMutation({
    mutationFn: () => tweetService.updateTweet(shadowId, { isStealthMode: false }),
    onSuccess: () => {
      queryClient.invalidateQueries(['shadow', shadowId])
      queryClient.invalidateQueries(['shadows'])
      toast.success("Shadow claimed and made public")
    },
    onError: (err) => {
      toast.error(toActionError(err, 'Could not claim this shadow. Please try again.'))
    }
  })

  const deleteMutation = useMutation({
    mutationFn: tweetService.deleteTweet,
    onMutate: async () => {
      // Navigate immediately for instant UX
      navigate(-1)
      toast.success('Shadow deleted')
    },
    onSuccess: () => {
      // Background cleanup
      queryClient.invalidateQueries(['shadows'])
    },
    onError: (err) => {
      // Revert navigation on error
      navigate(`/shadows/${shadowId}`)
      toast.error(toActionError(err, 'Could not delete shadow. Please try again.'))
      queryClient.invalidateQueries(['shadow', shadowId])
    }
  })

  const addCommentMutation = useMutation({
    mutationFn: ({ content, isStealthMode }) =>
      commentService.addTweetComment(shadowId, content, isStealthMode),
    onMutate: async (newComment) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries(['shadowComments', shadowId])
      await queryClient.cancelQueries(['shadow', shadowId])
      const previousComments = queryClient.getQueryData(['shadowComments', shadowId])
      const previousShadow = queryClient.getQueryData(['shadow', shadowId])
      const tempId = `temp-${Date.now()}`

      // Optimistically update comments list
      queryClient.setQueryData(['shadowComments', shadowId], (old) => {
        if (!old) return old
        const optimisticComment = {
          _id: tempId,
          content: newComment.content,
          isStealthMode: newComment.isStealthMode,
          owner: {
            _id: userData?._id,
            username: newComment.isStealthMode ? 'anonymous' : userData?.username,
            fullName: newComment.isStealthMode ? 'Shadow User' : userData?.fullName,
            avatar: { url: newComment.isStealthMode ? 'https://ui-avatars.com/api/?name=S&background=18181b&color=22c55e' : userData?.avatar?.url }
          },
          createdAt: new Date().toISOString(),
          __optimisticMarker: true
        }
        return {
          ...old,
          docs: [optimisticComment, ...old.docs]
        }
      })

      // Keep comment count responsive without forcing a comments refetch.
      queryClient.setQueryData(['shadow', shadowId], (old) => {
        if (!old) return old
        return {
          ...old,
          commentsCount: (old.commentsCount || 0) + 1
        }
      })

      // Clear input immediately
      setCommentText('')
      return { previousComments, previousShadow, tempId }
    },
    onSuccess: (serverComment, _newComment, context) => {
      queryClient.setQueryData(['shadowComments', shadowId], (old) => {
        if (!old?.docs?.length) return old
        return {
          ...old,
          docs: old.docs.map((doc) => {
            if (doc._id !== context?.tempId) return doc

            const serverOwner =
              serverComment?.owner && typeof serverComment.owner === 'object' && !Array.isArray(serverComment.owner)
                ? serverComment.owner
                : null

            return {
              ...doc,
              ...serverComment,
              _id: serverComment?._id || doc._id,
              owner: serverOwner ? { ...doc.owner, ...serverOwner } : doc.owner,
              __optimisticMarker: false
            }
          })
        }
      })
      toast.success('Comment posted!')
    },
    onError: (err, newComment, context) => {
      // Revert on error
      if (context?.previousComments) {
        queryClient.setQueryData(['shadowComments', shadowId], context.previousComments)
      }
      if (context?.previousShadow) {
        queryClient.setQueryData(['shadow', shadowId], context.previousShadow)
      }
      toast.error(toActionError(err, 'Could not add your comment. Please try again.', [
        {
          when: ['unauthorized', 'login'],
          message: 'Please sign in to comment in Shadows.'
        }
      ]))
    }
  })

  const deleteCommentMutation = useMutation({
    mutationFn: commentService.deleteComment,
    onMutate: async (commentId) => {
      // Cancel queries
      await queryClient.cancelQueries(['shadowComments', shadowId])
      const previousComments = queryClient.getQueryData(['shadowComments', shadowId])

      // Optimistically remove comment
      queryClient.setQueryData(['shadowComments', shadowId], (old) => {
        if (!old) return old
        return {
          ...old,
          docs: old.docs.filter(comment => comment._id !== commentId)
        }
      })

      return { previousComments }
    },
    onError: (err, commentId, context) => {
      // Revert on error
      if (context?.previousComments) {
        queryClient.setQueryData(['shadowComments', shadowId], context.previousComments)
      }
      toast.error(toActionError(err, 'Could not delete this comment. Please try again.'))
    },
    onSettled: () => {
      // Refresh data
      queryClient.invalidateQueries(['shadowComments', shadowId])
      queryClient.invalidateQueries(['shadow', shadowId])
      queryClient.invalidateQueries(['shadows'])
    }
  })

  // Comment claim/unclaim toggle (optimistic)
  const toggleCommentClaimMutation = useMutation({
    mutationFn: ({ commentId, currentStealth }) =>
      commentService.updateComment(commentId, undefined, !currentStealth),
    onMutate: async ({ commentId, currentStealth }) => {
      await queryClient.cancelQueries(['shadowComments', shadowId])
      const previousComments = queryClient.getQueryData(['shadowComments', shadowId])

      // Optimistically toggle comment stealth mode
      queryClient.setQueryData(['shadowComments', shadowId], (old) => {
        if (!old) return old
        return {
          ...old,
          docs: old.docs.map(comment =>
            comment._id === commentId
              ? { ...comment, isStealthMode: !currentStealth }
              : comment
          )
        }
      })

      return { previousComments }
    },
    onError: (err, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['shadowComments', shadowId], context.previousComments)
      }
      toast.error(toActionError(err, 'Could not update comment privacy. Please try again.'))
    },
    onSuccess: (data, variables) => {
      const message = variables.currentStealth ? "Comment claimed (Public)" : "Comment masked (Stealth)"
      toast.success(message)
    },
    onSettled: () => {
      queryClient.invalidateQueries(['shadowComments', shadowId])
    }
  })

  const handleAddComment = () => {
    if (!commentText.trim()) {
      toast.error('Comment cannot be empty')
      return
    }
    // Allow users to choose stealth or public identity
    addCommentMutation.mutate({ content: commentText, isStealthMode: isStealthComment })
  }

  // Render

  if (shadowLoading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-black/0 opacity-5 blur-[120px] pointer-events-none gpu-layer" />
        <div className="relative z-10 px-3 sm:px-6 lg:pl-6 pt-24 sm:pt-28 pb-20 lg:px-6">
          <WirePostSkeleton />
        </div>
      </div>
    )
  }

  if (!shadow) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono">
        Shadow not found
      </div>
    )
  }

  const isOwner = userData?._id === shadow.owner?._id

  // ALL shadows are anonymous
  const displayName = "Shadow User"
  const displayHandle = "@redacted"

  // Poll Data Logic
  const totalVotes = shadow.poll?.options.reduce((acc, curr) => acc + curr.votes, 0) || 0
  const hasVoted = shadow.userVote !== undefined && shadow.userVote !== null
  const pollQuestion = shadow.poll?.question || shadow.pollQuestion || ''

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      {/* Background Glow - Emerald theme */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-black/0 opacity-3 blur-[120px] pointer-events-none gpu-layer" />

      {/* Main Content */}
      <div className="relative z-10 px-3 sm:px-6 lg:pl-6 pt-24 sm:pt-28 pb-20 lg:px-6">
        <div className="max-w-2xl mx-auto">

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-500 hover:text-emerald-400 mb-8 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Shadows</span>
          </button>

          {/* Shadow Post */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-black border border-zinc-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6 border-l-2 border-l-emerald-900/40"
          >
            <div className="flex gap-4">
              {/* Avatar - Ghost Icon */}
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-emerald-900/30 flex items-center justify-center shrink-0">
                <Ghost className="w-5 h-5 text-emerald-500/70" />
              </div>

              <div className="flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-emerald-400/80 font-mono tracking-tight">
                        {displayName}
                      </span>
                      <ShieldCheck className="w-3 h-3 text-emerald-500/60" />

                      {isOwner && (
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/30">YOU</span>
                      )}
                    </div>
                    <span className="text-zinc-600 text-xs">
                      {displayHandle} • {formatDistanceToNow(new Date(shadow.createdAt), { addSuffix: true })}
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
                              onClick={() => claimShadowMutation.mutate()}
                              disabled={claimShadowMutation.isPending}
                              className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors text-red-500 hover:bg-red-500/10"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Claim Shadow
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => deleteMutation.mutate(shadow._id)}
                            className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-lg text-left transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap mt-1 mb-3">
                  {shadow.content}
                </p>

                {/* Image Attachment */}
                {shadow.image?.url && (
                  <div className="rounded-xl overflow-hidden border border-zinc-900 mt-3 mb-3">
                    <img src={shadow.image.url} alt="Attachment" className="w-full h-auto max-h-100 object-cover opacity-90" />
                  </div>
                )}

                {/* Poll renderer */}
                {shadow.poll && (
                  <div className="mb-4 space-y-2 mt-2">
                    {pollQuestion && (
                      <p className="text-sm text-emerald-300/90 font-medium pl-1">{pollQuestion}</p>
                    )}
                    {shadow.poll.options.map((option, index) => {
                      const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
                      const isVotedOption = shadow.userVote === index

                      return (
                        <button
                          key={index}
                          onClick={() => {
                            if (!userData) {
                              navigate('/login')
                              return
                            }
                            if (!voteMutation.isPending) {
                              voteMutation.mutate({ tweetId: shadow._id, optionIndex: index })
                            }
                          }}
                          disabled={voteMutation.isPending}
                          className={`relative w-full h-10 rounded-lg overflow-hidden border transition-all ${hasVoted
                            ? isVotedOption
                              ? "border-emerald-500/50"
                              : "border-zinc-900"
                            : "border-zinc-800 hover:bg-zinc-900"
                            }`}
                        >
                          {/* Progress Bar */}
                          {hasVoted && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              className={`absolute inset-0 h-full opacity-20 ${isVotedOption ? "bg-emerald-500" : "bg-zinc-700"}`}
                            />
                          )}

                          {/* Text Content */}
                          <div className="absolute inset-0 flex items-center justify-between px-4">
                            <span className={`text-sm font-medium ${isVotedOption ? "text-emerald-400" : "text-zinc-400"}`}>
                              {option.text} {isVotedOption && "✓"}
                            </span>
                            {hasVoted && (
                              <span className="text-xs font-bold text-zinc-500">{percentage}%</span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                    <div className="text-xs text-zinc-600 pl-1">
                      {totalVotes} votes • {hasVoted ? "Live results" : "Poll is open"}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-6 mt-4">
                  <button
                    onClick={() => {
                      if (!userData) {
                        navigate('/login')
                        return
                      }
                      likeMutation.mutate(shadow._id)
                    }}
                    disabled={likeMutation.isPending}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${shadow.isLiked ? "text-emerald-500" : "text-zinc-600 hover:text-emerald-400"
                      }`}
                  >
                    <Heart className={`w-4 h-4 ${shadow.isLiked ? "fill-current" : ""}`} />
                    <span>{shadow.likesCount || 0}</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-600">
                    <MessageSquare className="w-4 h-4" />
                    <span>{shadow.commentsCount || 0}</span>
                  </div>

                  {/* Views */}
                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-600">
                    <BarChart2 className="w-4 h-4" />
                    <span>{shadow.views || 0}</span>
                  </div>

                  <button
                    onClick={handleShare}
                    className="text-zinc-600 hover:text-emerald-400 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>



          {/* Comment Input - Can be anonymous or public */}
          <div className="mb-8">
            {userData ? (
              <div className="bg-black border border-zinc-900 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
                  <Ghost className="w-4 h-4 text-emerald-500/70" />
                  Add a Comment
                </h3>
                <div className="flex gap-4">
                  <img
                    src={isStealthComment ? "https://ui-avatars.com/api/?name=S&background=18181b&color=22c55e" : (userData?.avatar?.url || `https://ui-avatars.com/api/?name=${userData?.fullName}`)}
                    alt="Your avatar"
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shrink-0 ${isStealthComment ? "border border-green-500/50" : ""}`}
                  />
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={isStealthComment ? "Reply anonymously..." : "Share your thoughts..."}
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 resize-none"
                      rows={3}
                    />
                    <div className="flex items-center justify-between mt-3 sm:mt-4">
                      {/* Stealth Toggle */}
                      <button
                        onClick={() => setIsStealthComment(!isStealthComment)}
                        className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full border transition-colors ${isStealthComment
                          ? "bg-red-500/10 border-red-500/30 text-red-500"
                          : "border-zinc-700 text-zinc-500 hover:text-red-400"
                          }`}
                      >
                        <Ghost className="w-3.5 h-3.5" />
                        {isStealthComment ? "Stealth Mode" : "Public"}
                      </button>

                      {/* Submit Button */}
                      <button
                        onClick={handleAddComment}
                        disabled={!commentText.trim() || addCommentMutation.isPending}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white text-sm font-bold rounded-lg transition-colors"
                      >
                        {addCommentMutation.isPending ? (
                          <LoadingDots size="xs" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Comment
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <AuthLock
                message="Sign in to whisper in the shadows"
                variant="shadows"
                size="compact"
              />
            )}
          </div>

          {/* Comments List */}
          <div className="space-y-5">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
              Comments ({commentsData?.docs?.length || 0})
            </h3>

            {commentsLoading ? (
              <div className="flex justify-center py-12">
                <LoadingDots size="md" className="text-emerald-500" />
              </div>
            ) : commentsData?.docs?.length > 0 ? (
              <>
                {commentsData.docs.map((comment) => {
                  const commentOwner = userData?._id === comment.owner?._id
                  const commentIsStealth = comment.isStealthMode
                  const commentDisplayName = commentIsStealth ? "Shadow User" : comment.owner?.fullName
                  const commentDisplayHandle = commentIsStealth ? "@hidden" : `@${comment.owner?.username}`
                  const commentAvatarUrl = commentIsStealth
                    ? `https://ui-avatars.com/api/?name=S&background=18181b&color=22c55e`
                    : comment.owner?.avatar?.url

                  return (
                    <motion.div
                      key={comment._id}
                      layout="position"
                      initial={comment.__optimisticMarker ? { opacity: 0, y: 10, scale: 0.98 } : false}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className={`bg-black border border-zinc-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 ${commentIsStealth ? "border-l-4 border-l-emerald-950/40" : ""
                        }`}
                    >
                      <div className="flex gap-4">
                        {commentIsStealth ? (
                          <div className="w-11 h-11 rounded-full bg-zinc-900 border border-emerald-900/30 flex items-center justify-center shrink-0">
                            <Ghost className="w-5 h-5 text-emerald-500/70" />
                          </div>
                        ) : (
                          <img
                            src={commentAvatarUrl}
                            alt="Commenter"
                            className="w-11 h-11 rounded-full object-cover shrink-0"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-base ${commentIsStealth ? "text-emerald-400/80 font-mono" : "text-white"
                                  }`}>
                                  {commentDisplayName}
                                </span>
                                {commentIsStealth && <ShieldCheck className="w-4 h-4 text-emerald-500/60" />}
                                {!commentIsStealth && <BadgeCheck className="w-4 h-4 text-emerald-500" />}
                              </div>
                              <span className="text-zinc-600 text-sm">
                                {commentDisplayHandle} • {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </span>
                            </div>

                            {commentOwner && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleCommentClaimMutation.mutate({
                                    commentId: comment._id,
                                    currentStealth: commentIsStealth
                                  })}
                                  disabled={toggleCommentClaimMutation.isPending}
                                  className={`p-2 rounded-full transition-colors ${commentIsStealth
                                    ? "text-red-500 hover:bg-red-500/10"
                                    : "text-red-500 hover:bg-red-500/10"
                                    }`}
                                  title={commentIsStealth ? "Claim comment" : "Hide identity"}
                                >
                                  {commentIsStealth ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => deleteCommentMutation.mutate(comment._id)}
                                  className="text-zinc-600 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>

                          <p className="text-zinc-300 text-base leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </>
            ) : (
              <div className="text-center py-16 border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/20">
                <MessageSquare className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                <p className="text-zinc-600 text-lg">No comments yet. Be the first to comment anonymously!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
