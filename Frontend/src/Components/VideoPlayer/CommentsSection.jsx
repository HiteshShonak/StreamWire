import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Ghost, Send, Pin, BadgeCheck, Trash2, Eye, EyeOff } from 'lucide-react'
import { LoadingDots } from '../Common/LoadingIndicator'
import { formatDistanceToNow } from 'date-fns'
import AuthLock from '../../Components/Common/AuthLock'
import { CommentListSkeleton } from '../../Components/Common/Skeleton'

const CommentsSection = React.memo(({
    video, // commentsCount
    userData,

    commentsData,
    pinnedComments,
    commentsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    commentText,
    setCommentText,
    isStealthComment,
    setIsStealthComment,
    handleSubmitComment,
    addCommentMutation,
    deleteCommentMutation,
    togglePinMutation,
    toggleCommentStealthMutation,
    showAllComments: _showAllComments,
    setShowAllComments: _setShowAllComments,
    isOwner,
    navigate: _navigate // passed from parent
}) => {
    const pinnedCommentIds = useMemo(() =>
        new Set(pinnedComments.map(c => c._id)),
        [pinnedComments]
    );

    // Flatten infinite query pages
    const commentsList = useMemo(() =>
        commentsData?.pages?.flatMap(page => page.docs) || [],
        [commentsData]
    );

    // Filter out pinned comments from regular comments
    const regularComments = useMemo(() =>
        commentsList.filter(c => !pinnedCommentIds.has(c._id)),
        [commentsList, pinnedCommentIds]
    );

    const displayedComments = regularComments;

    return (
        <div id="comments-section" className="pt-6 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-indigo-400" />
                    Comments
                    <span className="text-sm font-normal text-zinc-500">({video.commentsCount || 0})</span>
                </h3>
            </div>

            {/* Comment Input */}
            {userData ? (
                <form onSubmit={handleSubmitComment} className="mb-6">
                    <div className="flex gap-3">
                        <img
                            src={isStealthComment
                                ? 'https://ui-avatars.com/api/?name=S&background=18181b&color=22c55e'
                                : userData?.avatar?.url || `https://ui-avatars.com/api/?name=${userData?.fullName}&background=6366f1&color=fff`
                            }
                            alt="Your avatar"
                            className="w-10 h-10 rounded-full object-cover border border-zinc-800 shrink-0"
                        />
                        <div className="flex-1 space-y-3">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Share your thoughts..."
                                rows={2}
                                className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 resize-none text-sm"
                            />
                            <div className="flex items-center justify-between">
                                {/* Stealth Toggle */}
                                <button
                                    type="button"
                                    onClick={() => setIsStealthComment(!isStealthComment)}
                                    className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${isStealthComment
                                            ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                                            : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300'
                                        }
                  `}
                                >
                                    <Ghost className="w-3.5 h-3.5" />
                                    Stealth
                                </button>

                                <button
                                    type="submit"
                                    disabled={!commentText.trim() || addCommentMutation.isPending}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg text-sm font-bold transition-colors disabled:cursor-not-allowed"
                                >
                                    {addCommentMutation.isPending ? (
                                        <LoadingDots size="xs" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="mb-6">
                    <AuthLock
                        message="Sign in to join the discussion"
                        variant="default"
                    />
                </div>
            )}

            {/* Comments List */}
            {commentsLoading ? (
                <CommentListSkeleton count={4} />
            ) : commentsList.length === 0 && pinnedComments.length === 0 ? (
                <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500">No comments yet. Be the first to share your thoughts!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Pinned Comments */}
                    {pinnedComments.length > 0 && (
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-xs text-amber-400 font-medium">
                                <Pin className="w-3.5 h-3.5" />
                                Pinned by creator
                            </div>
                            {pinnedComments.map((comment) => {
                                const isCommentOwner = userData?._id === comment.owner?._id;
                                const commentStealth = comment.isStealthMode || comment.owner?.isIdentityCloaked;
                                const commentAvatar = commentStealth
                                    ? 'https://ui-avatars.com/api/?name=S&background=18181b&color=22c55e'
                                    : comment.owner?.avatar?.url || `https://ui-avatars.com/api/?name=${comment.owner?.fullName || 'U'}&background=6366f1&color=fff`;
                                const commentName = commentStealth ? 'Anonymous' : comment.owner?.fullName;

                                return (
                                    <motion.div
                                        key={comment._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-3 group p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl"
                                    >
                                        <img
                                            src={commentAvatar}
                                            alt={commentName}
                                            className="w-9 h-9 rounded-full object-cover border-2 border-amber-500/30 shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-sm text-white">{commentName}</span>
                                                <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                {commentStealth && <Ghost className="w-3 h-3 text-green-500" />}
                                                <span className="text-xs text-zinc-600">
                                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-zinc-300 leading-relaxed">{comment.content}</p>
                                        </div>

                                        {/* Video Owner: Unpin button */}
                                        {isOwner && (
                                            <button
                                                onClick={() => togglePinMutation.mutate(comment._id)}
                                                disabled={togglePinMutation.isPending}
                                                className="p-2 text-amber-500 hover:bg-amber-500/10 transition-colors rounded-lg opacity-0 group-hover:opacity-100"
                                                title="Unpin comment"
                                            >
                                                <Pin className="w-4 h-4 fill-current" />
                                            </button>
                                        )}

                                        {/* Comment Owner Actions */}
                                        {isCommentOwner && (
                                            <button
                                                onClick={() => deleteCommentMutation.mutate(comment._id)}
                                                className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-lg opacity-0 group-hover:opacity-100"
                                                title="Delete comment"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}

                    {/* Regular Comments */}
                    {displayedComments.map((comment) => {
                        const isCommentOwner = userData?._id === comment.owner?._id;
                        const commentStealth = comment.isStealthMode || comment.owner?.isIdentityCloaked;
                        const commentAvatar = commentStealth
                            ? 'https://ui-avatars.com/api/?name=S&background=18181b&color=22c55e'
                            : comment.owner?.avatar?.url || `https://ui-avatars.com/api/?name=${comment.owner?.fullName || 'U'}&background=6366f1&color=fff`;
                        const commentName = commentStealth ? 'Anonymous' : comment.owner?.fullName;
                        const isPinned = pinnedCommentIds.has(comment._id);

                        return (
                            <motion.div
                                key={comment._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3 group"
                            >
                                <img
                                    src={commentAvatar}
                                    alt={commentName}
                                    className="w-9 h-9 rounded-full object-cover border border-zinc-800 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-sm text-white">{commentName}</span>
                                        {commentStealth && <Ghost className="w-3 h-3 text-green-500" />}
                                        {!commentStealth && comment.owner?.isSubscribed && (
                                            <BadgeCheck className="w-3 h-3 text-indigo-400" />
                                        )}
                                        <span className="text-xs text-zinc-600">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-300 leading-relaxed">{comment.content}</p>
                                </div>

                                {/* Video Owner: Pin button */}
                                {isOwner && !isPinned && (
                                    <button
                                        onClick={() => togglePinMutation.mutate(comment._id)}
                                        disabled={togglePinMutation.isPending}
                                        className="p-2 text-zinc-600 hover:text-amber-400 hover:bg-amber-500/10 transition-colors rounded-lg opacity-0 group-hover:opacity-100"
                                        title="Pin comment"
                                    >
                                        <Pin className="w-4 h-4" />
                                    </button>
                                )}

                                {/* Comment Owner Actions */}
                                {isCommentOwner && (
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        {/* Claim/Stealth Toggle */}
                                        <button
                                            onClick={() => toggleCommentStealthMutation.mutate({
                                                commentId: comment._id,
                                                currentStealth: comment.isStealthMode
                                            })}
                                            disabled={toggleCommentStealthMutation.isPending}
                                            className={`p-2 transition-colors rounded-lg ${comment.isStealthMode
                                                ? 'text-green-500 hover:bg-green-500/10'
                                                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800'
                                                }`}
                                            title={comment.isStealthMode ? 'Claim comment' : 'Go stealth'}
                                        >
                                            {comment.isStealthMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>

                                        {/* Delete */}
                                        <button
                                            onClick={() => deleteCommentMutation.mutate(comment._id)}
                                            className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors rounded-lg"
                                            title="Delete comment"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}

                    {/* Load More Button (Infinite Scroll) */}
                    {hasNextPage && (
                        <button
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="w-full py-3 my-4 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center justify-center gap-2 bg-zinc-900/50 rounded-xl"
                        >
                            {isFetchingNextPage ? (
                                <>
                                    <LoadingDots size="xs" />
                                    Loading more...
                                </>
                            ) : (
                                "Load More Comments"
                            )}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
})

export default CommentsSection
