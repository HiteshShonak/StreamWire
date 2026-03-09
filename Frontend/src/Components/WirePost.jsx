import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart, MessageSquare, ArrowLeft, Send,
  Trash2, Ghost, BadgeCheck, ShieldCheck, MoreHorizontal, Eye, EyeOff, Share, UserCheck, UserPlus, BarChart2, Check
} from 'lucide-react'
import { LoadingDots } from './Common/LoadingIndicator'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

// Services
import { tweetService } from '../api/services/tweet.service'
import { likeService } from '../api/services/like.service'
import { commentService } from '../api/services/comment.service'
import { subscriptionService } from '../api/services/subscription.service'

import AuthLock from './Common/AuthLock'
import { WirePostSkeleton, CommentListSkeleton } from './Common/Skeleton'

export default function WirePost() {
  const { wireId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { userData } = useSelector((state) => state.auth)

  const [commentText, setCommentText] = useState('')
  const [isStealthComment, setIsStealthComment] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = () => {
    const url = `${window.location.origin}/wire/${wireId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      toast.success('Link copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // Fetch Wire
  const { data: wire, isLoading: wireLoading, error: wireError } = useQuery({
    queryKey: ['wire', wireId],
    queryFn: async () => await tweetService.getTweetById(wireId),
    retry: 1
  })

  // Fetch Comments
  const { data: commentsData, isLoading: commentsLoading } = useQuery({
    queryKey: ['wireComments', wireId],
    queryFn: async () => await commentService.getTweetComments(wireId, { page: 1, limit: 50 }),
    enabled: !!wireId
  })

  // Actions

  // Instant like (optimistic UI)
  const likeMutation = useMutation({
    mutationFn: likeService.toggleTweetLike,
    onMutate: async () => {
      await queryClient.cancelQueries(['wire', wireId])
      const previousWire = queryClient.getQueryData(['wire', wireId])

      queryClient.setQueryData(['wire', wireId], (old) => {
        if (!old) return old
        const isLiked = !old.isLiked
        return {
          ...old,
          isLiked: isLiked,
          likesCount: isLiked ? old.likesCount + 1 : old.likesCount - 1
        }
      })
      return { previousWire }
    },
    onError: (err, newTodo, context) => {
      if (context?.previousWire) {
        queryClient.setQueryData(['wire', wireId], context.previousWire)
      }
      toast.error("Like failed")
    },
    onSettled: () => {
      queryClient.invalidateQueries(['wire', wireId])
      queryClient.invalidateQueries(['wire']) // Update Feed Card
    }
  })

  // Vote mutation (optimistic)
  const voteMutation = useMutation({
    mutationFn: ({ tweetId, optionIndex }) => tweetService.voteOnPoll(tweetId, optionIndex),
    onMutate: async ({ optionIndex }) => {
      await queryClient.cancelQueries(['wire', wireId])
      const previousWire = queryClient.getQueryData(['wire', wireId])

      // Optimistically update poll
      queryClient.setQueryData(['wire', wireId], (old) => {
        if (!old || !old.poll) return old
        const newOptions = old.poll.options.map((opt, idx) => ({
          ...opt,
          votes: idx === optionIndex ? opt.votes + 1 : opt.votes
        }))
        return {
          ...old,
          poll: { ...old.poll, options: newOptions },
          userVote: optionIndex
        }
      })

      return { previousWire }
    },
    onError: (err, variables, context) => {
      if (context?.previousWire) {
        queryClient.setQueryData(['wire', wireId], context.previousWire)
      }
      toast.error(err.message || 'Vote failed')
    },
    onSettled: () => {
      queryClient.invalidateQueries(['wire', wireId])
      queryClient.invalidateQueries(['wire'])
    }
  })

  // Stealth toggle
  const toggleStealthMutation = useMutation({
    mutationFn: () => tweetService.updateTweet(wireId, { isStealthMode: !wire.isStealthMode }),
    onSuccess: () => {
      queryClient.invalidateQueries(['wire', wireId])
      queryClient.invalidateQueries(['wire'])
      const message = wire.isStealthMode ? "Wire claimed (Public)" : "Wire masked (Stealth)"
      toast.success(message)
    },
    onError: () => toast.error("Failed to update privacy")
  })

  const deleteMutation = useMutation({
    mutationFn: tweetService.deleteTweet,
    onMutate: async () => {
      // Navigate immediately for instant UX
      navigate(-1)
      toast.success('Wire deleted')
    },
    onSuccess: () => {
      // Background cleanup
      queryClient.invalidateQueries(['wire'])
    },
    onError: (err) => {
      // Revert navigation on error
      navigate(`/wire/${wireId}`)
      toast.error(err.message || 'Failed to delete wire')
      queryClient.invalidateQueries(['wire', wireId])
    }
  })

  const addCommentMutation = useMutation({
    mutationFn: ({ content, isStealthMode }) =>
      commentService.addTweetComment(wireId, content, isStealthMode),
    onMutate: async (newComment) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries(['wireComments', wireId])
      const previousComments = queryClient.getQueryData(['wireComments', wireId])

      // Optimistically update comments list
      queryClient.setQueryData(['wireComments', wireId], (old) => {
        if (!old) return old
        const optimisticComment = {
          _id: `temp-${Date.now()}`,
          content: newComment.content,
          isStealthMode: newComment.isStealthMode,
          owner: {
            _id: userData?._id,
            username: newComment.isStealthMode ? 'anonymous' : userData?.username,
            fullName: newComment.isStealthMode ? 'Shadow User' : userData?.fullName,
            avatar: { url: newComment.isStealthMode ? 'https://ui-avatars.com/api/?name=S&background=18181b&color=22c55e' : userData?.avatar?.url }
          },
          createdAt: new Date().toISOString()
        }
        return {
          ...old,
          docs: [optimisticComment, ...old.docs]
        }
      })

      // Clear input immediately
      setCommentText('')
      setIsStealthComment(false)
      return { previousComments }
    },
    onError: (err, newComment, context) => {
      // Revert on error
      if (context?.previousComments) {
        queryClient.setQueryData(['wireComments', wireId], context.previousComments)
      }
      toast.error(err.message || 'Failed to add comment')
    },
    onSettled: () => {
      // Refresh to get real data from server
      queryClient.invalidateQueries(['wireComments', wireId])
      queryClient.invalidateQueries(['wire', wireId])
      queryClient.invalidateQueries(['wire'])
    }
  })

  const deleteCommentMutation = useMutation({
    mutationFn: commentService.deleteComment,
    onMutate: async (commentId) => {
      // Cancel queries
      await queryClient.cancelQueries(['wireComments', wireId])
      const previousComments = queryClient.getQueryData(['wireComments', wireId])

      // Optimistically remove comment
      queryClient.setQueryData(['wireComments', wireId], (old) => {
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
        queryClient.setQueryData(['wireComments', wireId], context.previousComments)
      }
      toast.error(err.message || 'Failed to delete comment')
    },
    onSettled: () => {
      // Refresh data
      queryClient.invalidateQueries(['wireComments', wireId])
      queryClient.invalidateQueries(['wire', wireId])
      queryClient.invalidateQueries(['wire'])
    }
  })

  // Comment claim/unclaim toggle (optimistic)
  const toggleCommentClaimMutation = useMutation({
    mutationFn: ({ commentId, currentStealth }) =>
      commentService.updateComment(commentId, undefined, !currentStealth),
    onMutate: async ({ commentId, currentStealth }) => {
      await queryClient.cancelQueries(['wireComments', wireId])
      const previousComments = queryClient.getQueryData(['wireComments', wireId])

      // Optimistically toggle comment stealth mode
      queryClient.setQueryData(['wireComments', wireId], (old) => {
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
        queryClient.setQueryData(['wireComments', wireId], context.previousComments)
      }
      toast.error(err.message || 'Failed to update comment privacy')
    },
    onSuccess: (data, variables) => {
      const message = variables.currentStealth ? "Comment claimed (Public)" : "Comment masked (Stealth)"
      toast.success(message)
    },
    onSettled: () => {
      queryClient.invalidateQueries(['wireComments', wireId])
    }
  })

  // Subscribe mutation (for main post author)
  const subscribeToPostAuthorMutation = useMutation({
    mutationFn: () => subscriptionService.toggleSubscription(wire?.owner?._id),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['wire', wireId])
      queryClient.invalidateQueries(['wire'])
      if (data.isPending) {
        toast.success('Subscription request sent!')
      } else if (data.isSubscribed) {
        toast.success('Subscribed!')
      } else {
        toast.success('Unsubscribed')
      }
    },
    onError: (err) => toast.error(err.message || 'Failed to update subscription')
  })

  // Subscribe mutation (for comment authors)
  const subscribeFromCommentMutation = useMutation({
    mutationFn: (channelId) => subscriptionService.toggleSubscription(channelId),
    onMutate: async (channelId) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries(['wireComments', wireId])
      const previousComments = queryClient.getQueryData(['wireComments', wireId])

      // Optimistically update comment author's subscription status
      queryClient.setQueryData(['wireComments', wireId], (old) => {
        if (!old) return old
        return {
          ...old,
          docs: old.docs.map(comment =>
            comment.owner?._id === channelId
              ? { ...comment, owner: { ...comment.owner, isSubscribed: !comment.owner?.isSubscribed } }
              : comment
          )
        }
      })

      return { previousComments }
    },
    onError: (err, channelId, context) => {
      // Revert on error
      if (context?.previousComments) {
        queryClient.setQueryData(['wireComments', wireId], context.previousComments)
      }
      toast.error(err.message || 'Failed to update subscription')
    },
    onSuccess: (data) => {
      if (data.isPending) {
        toast.success('Subscription request sent!')
      } else if (data.isSubscribed) {
        toast.success('Subscribed!')
      } else {
        toast.success('Unsubscribed')
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(['wireComments', wireId])
    }
  })

  const handleAddComment = () => {
    if (!commentText.trim()) {
      toast.error('Comment cannot be empty')
      return
    }
    addCommentMutation.mutate({ content: commentText, isStealthMode: isStealthComment })
  }

  // Render

  if (wireLoading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-sky-500 opacity-5 blur-[120px] pointer-events-none" />
        <div className="relative z-10 px-3 sm:px-6 lg:pl-6 pt-24 sm:pt-28 pb-20 lg:px-6">
          <WirePostSkeleton />
        </div>
      </div>
    )
  }

  if (!wire) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-500">
        Wire not found
      </div>
    )
  }

  const isOwner = userData?._id === wire.owner?._id
  const isStealth = wire.isStealthMode || wire.owner?.isIdentityCloaked
  const displayName = isStealth ? "StreamWire User" : wire.owner?.fullName
  const displayHandle = isStealth ? "@anonymous" : `@${wire.owner?.username}`
  const avatarUrl = isStealth
    ? `https://ui-avatars.com/api/?name=S&background=18181b&color=22c55e`
    : wire.owner?.avatar?.url

  // Poll Data Logic
  const totalVotes = wire.poll?.options.reduce((acc, curr) => acc + curr.votes, 0) || 0
  const hasVoted = wire.userVote !== undefined && wire.userVote !== null

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-sky-500 opacity-5 blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 px-3 sm:px-6 lg:pl-6 pt-24 sm:pt-28 pb-20 lg:px-6">
        <div className="max-w-2xl mx-auto">

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Wire</span>
          </button>

          {/* Wire Post */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[#0a0a0c] border border-zinc-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-6 ${isStealth ? "border-l-2 border-l-green-500/30 pl-[14px]" : ""}`}
          >
            <div className="flex gap-4">
              {/* Avatar */}
              <Link
                to={isStealth ? "#" : `/c/${wire.owner?.username}`}
                className="flex-shrink-0"
              >
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className={`w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-sky-500/50 transition-all ${isStealth ? "border border-green-500/30" : ""
                    }`}
                />
              </Link>

              <div className="flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={isStealth ? "#" : `/c/${wire.owner?.username}`}
                        className={`font-bold text-sm hover:underline ${isStealth ? "text-green-500 font-mono tracking-tight" : "text-white"
                          }`}
                      >
                        {displayName}
                      </Link>
                      {!isStealth && <BadgeCheck className="w-3 h-3 text-sky-500" />}
                      {isStealth && <ShieldCheck className="w-3 h-3 text-green-500" />}

                      {isOwner && (
                        <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded border border-indigo-500/30">YOU</span>
                      )}
                      {!isOwner && !isStealth && (
                        <button
                          onClick={() => subscribeToPostAuthorMutation.mutate()}
                          disabled={subscribeToPostAuthorMutation.isPending}
                          className={`px-2 py-0.5 text-[10px] font-bold rounded border flex items-center gap-0.5 transition-colors disabled:opacity-50 ${wire.owner?.isSubscribed
                            ? 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border-sky-500/30'
                            : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                            }`}
                        >
                          {wire.owner?.isSubscribed ? (
                            <><UserCheck className="w-2.5 h-2.5" /> SUBSCRIBED</>
                          ) : (
                            <><UserPlus className="w-2.5 h-2.5" /> SUBSCRIBE</>
                          )}
                        </button>
                      )}
                    </div>
                    <span className="text-zinc-500 text-xs">
                      {displayHandle} • {formatDistanceToNow(new Date(wire.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {/* Context Menu (Owner Only) */}
                  {isOwner && (
                    <div className="relative group/menu">
                      <button className="p-1 text-zinc-500 hover:text-sky-500 transition-colors rounded-full hover:bg-sky-500/10">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      <div className="absolute right-0 top-0 hidden group-hover/menu:block pt-6 z-20">
                        <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-1 shadow-xl w-36 overflow-hidden">

                          {/* Claim / Go Stealth Button - Hidden when identity is globally cloaked */}
                          {!wire.owner?.isIdentityCloaked && (
                            <button
                              onClick={() => toggleStealthMutation.mutate()}
                              disabled={toggleStealthMutation.isPending}
                              className={`flex items-center gap-2 w-full px-3 py-2 text-xs font-medium rounded-lg text-left transition-colors ${isStealth
                                ? "text-sky-400 hover:bg-sky-500/10"
                                : "text-green-400 hover:bg-green-500/10"
                                }`}
                            >
                              {isStealth ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              {isStealth ? "Claim Wire" : "Go Stealth"}
                            </button>
                          )}

                          {/* Delete Button */}
                          <button
                            onClick={() => deleteMutation.mutate(wire._id)}
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
                <p className="text-zinc-200 text-sm leading-relaxed whitespace-pre-wrap mt-1 mb-3">
                  {wire.content}
                </p>

                {/* Image Attachment */}
                {wire.image?.url && (
                  <div className="rounded-xl overflow-hidden border border-zinc-800 mt-3 mb-3">
                    <img src={wire.image.url} alt="Attachment" className="w-full h-auto max-h-[400px] object-cover" />
                  </div>
                )}

                {/* Poll renderer */}
                {wire.poll && (
                  <div className="mb-4 space-y-2 mt-2">
                    {wire.poll.options.map((option, index) => {
                      const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0
                      const isVotedOption = wire.userVote === index

                      return (
                        <button
                          key={index}
                          onClick={() => {
                            if (!voteMutation.isPending) {
                              voteMutation.mutate({ tweetId: wire._id, optionIndex: index })
                            }
                          }}
                          disabled={voteMutation.isPending}
                          className={`relative w-full h-10 rounded-lg overflow-hidden border transition-all ${hasVoted
                            ? isVotedOption
                              ? "border-sky-500/50"
                              : "border-zinc-800"
                            : "border-zinc-700 hover:bg-zinc-800"
                            }`}
                        >
                          {/* Progress Bar */}
                          {hasVoted && (
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              className={`absolute inset-0 h-full opacity-20 ${isVotedOption ? "bg-sky-500" : "bg-zinc-600"}`}
                            />
                          )}

                          {/* Text Content */}
                          <div className="absolute inset-0 flex items-center justify-between px-4">
                            <span className={`text-sm font-medium ${isVotedOption ? "text-sky-400" : "text-zinc-300"}`}>
                              {option.text} {isVotedOption && "✓"}
                            </span>
                            {hasVoted && (
                              <span className="text-xs font-bold text-zinc-400">{percentage}%</span>
                            )}
                          </div>
                        </button>
                      )
                    })}
                    <div className="text-xs text-zinc-500 pl-1">
                      {totalVotes} votes • {hasVoted ? "Final results" : "Click to vote"}
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
                      likeMutation.mutate(wire._id)
                    }}
                    disabled={likeMutation.isPending}
                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${wire.isLiked ? "text-pink-500" : "text-zinc-400 hover:text-pink-400"
                      }`}
                  >
                    <Heart className={`w-4 h-4 ${wire.isLiked ? "fill-current" : ""}`} />
                    <span>{wire.likesCount || 0}</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <MessageSquare className="w-4 h-4" />
                    <span>{wire.commentsCount || 0}</span>
                  </div>

                  {/* Views (Analytics icon like Twitter/X) */}
                  <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                    <BarChart2 className="w-4 h-4" />
                    <span>{wire.views || 0}</span>
                  </div>

                  <button
                    onClick={handleShare}
                    className="text-zinc-400 hover:text-indigo-400 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-indigo-400" /> : <Share className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>



          {/* Comment Input */}
          <div className="mb-8">
            {userData ? (
              <div className="bg-[#0a0a0c] border border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <h3 className="text-lg font-bold mb-4 text-white">Add a Comment</h3>
                <div className="flex gap-4">
                  <img
                    src={isStealthComment ? "https://ui-avatars.com/api/?name=S&background=18181b&color=22c55e" : (userData?.avatar?.url || `https://ui-avatars.com/api/?name=${userData?.fullName}`)}
                    alt="Your avatar"
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0 ${isStealthComment ? "border border-green-500/50" : ""}`}
                  />
                  <div className="flex-1">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder={isStealthComment ? "Reply anonymously..." : "Share your thoughts..."}
                      className="w-full bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-sky-500/50 resize-none"
                      rows={3}
                    />
                    <div className="flex items-center justify-between mt-3 sm:mt-4">
                      {/* Stealth Toggle */}
                      <button
                        onClick={() => setIsStealthComment(!isStealthComment)}
                        className={`flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full border transition-colors ${isStealthComment
                          ? "bg-green-500/10 border-green-500/30 text-green-400"
                          : "border-zinc-700 text-zinc-500 hover:text-zinc-300"
                          }`}
                      >
                        <Ghost className="w-3.5 h-3.5" />
                        {isStealthComment ? "Stealth Mode" : "Public"}
                      </button>

                      {/* Submit Button */}
                      <button
                        onClick={handleAddComment}
                        disabled={!commentText.trim() || addCommentMutation.isPending}
                        className="flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-bold rounded-lg transition-colors"
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
                message="Sign in to join the discussion"
                variant="wire"
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
                <LoadingDots size="md" className="text-sky-500" />
              </div>
            ) : commentsData?.docs?.length > 0 ? (
              <AnimatePresence>
                {commentsData.docs.map((comment) => {
                  const commentIsStealth = comment.isStealthMode || comment.owner?.isIdentityCloaked
                  const commentOwner = userData?._id === comment.owner?._id
                  const commentDisplayName = commentIsStealth ? "Anonymous User" : comment.owner?.fullName
                  const commentDisplayHandle = commentIsStealth ? "@hidden" : `@${comment.owner?.username}`
                  const commentAvatarUrl = commentIsStealth
                    ? `https://ui-avatars.com/api/?name=A&background=18181b&color=22c55e`
                    : comment.owner?.avatar?.url

                  return (
                    <motion.div
                      key={comment._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`bg-[#0a0a0c] border border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 ${commentIsStealth ? "border-l-4 border-l-green-500/30" : ""
                        }`}
                    >
                      <div className="flex gap-4">
                        <Link
                          to={commentIsStealth ? "#" : `/c/${comment.owner?.username}`}
                          onClick={(e) => { e.stopPropagation(); if (commentIsStealth) e.preventDefault(); }}
                          className="flex-shrink-0"
                        >
                          <img
                            src={commentAvatarUrl}
                            alt="Commenter"
                            className={`w-11 h-11 rounded-full object-cover hover:ring-2 hover:ring-sky-500/50 transition-all ${commentIsStealth ? "border border-green-500/30" : ""
                              }`}
                          />
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link
                                  to={commentIsStealth ? "#" : `/c/${comment.owner?.username}`}
                                  onClick={(e) => { e.stopPropagation(); if (commentIsStealth) e.preventDefault(); }}
                                  className={`font-bold text-base hover:underline ${commentIsStealth ? "text-green-500 font-mono" : "text-white"
                                    }`}
                                >
                                  {commentDisplayName}
                                </Link>
                                {!commentIsStealth && <BadgeCheck className="w-4 h-4 text-sky-500" />}
                                {commentIsStealth && <ShieldCheck className="w-4 h-4 text-green-500" />}

                                {commentOwner && (
                                  <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/30">YOU</span>
                                )}
                                {!commentOwner && !commentIsStealth && (
                                  <button
                                    onClick={() => subscribeFromCommentMutation.mutate(comment.owner?._id)}
                                    disabled={subscribeFromCommentMutation.isPending}
                                    className={`px-2 py-0.5 text-[10px] font-bold rounded border flex items-center gap-0.5 transition-colors disabled:opacity-50 ${comment.owner?.isSubscribed
                                      ? 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 border-sky-500/30'
                                      : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border-indigo-500/30'
                                      }`}
                                  >
                                    {comment.owner?.isSubscribed ? (
                                      <><UserCheck className="w-2.5 h-2.5" /> SUBSCRIBED</>
                                    ) : (
                                      <><UserPlus className="w-2.5 h-2.5" /> SUBSCRIBE</>
                                    )}
                                  </button>
                                )}
                              </div>
                              <span className="text-zinc-500 text-sm">
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
                                    ? "text-green-500 hover:bg-green-500/10"
                                    : "text-sky-500 hover:bg-sky-500/10"
                                    }`}
                                  title={commentIsStealth ? "Claim comment" : "Hide identity"}
                                >
                                  {commentIsStealth ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <button
                                  onClick={() => deleteCommentMutation.mutate(comment._id)}
                                  className="text-zinc-500 hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>

                          <p className="text-zinc-200 text-base leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            ) : (
              <div className="text-center py-16 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 text-lg">No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}