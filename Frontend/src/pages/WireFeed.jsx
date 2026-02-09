import { useEffect, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import toast from 'react-hot-toast'

// 🔌 API Services
import { tweetService } from '../api/services/tweet.service'
import { likeService } from '../api/services/like.service'

// 🧩 Components
import WireInput from '../Components/WireInput'
import WireCard from '../Components/WireCard'
import AuthLock from '../components/Common/AuthLock'
import { WireListSkeleton, WireCardSkeleton } from '../Components/Common/Skeleton'

export default function WireFeed() {
    const { ref, inView } = useInView()
    const queryClient = useQueryClient()

    const { userData } = useSelector((state) => state.auth)

    // =========================================
    // 📡 FETCHING STRATEGY
    // =========================================
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['wire'],
        queryFn: async ({ pageParam = 1 }) => {
            return await tweetService.getAllTweets({
                page: pageParam,
                limit: 20,
                // 🟢 REMOVED 'isStealthMode: false' 
                // Passing undefined/nothing here tells the backend to fetch EVERYTHING (Public + Stealth)
            })
        },
        getNextPageParam: (lastPage) => lastPage.hasNextPage ? lastPage.nextPage : undefined,
        staleTime: 60000, // 1 minute - prevents unnecessary refetches
    })

    // Infinite Scroll Trigger
    useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage()
        }
    }, [inView, hasNextPage, fetchNextPage])

    // =========================================
    // ⚡ ACTIONS (Memoized for React.memo)
    // =========================================

    // ⚡ Instant Like (Optimistic UI)
    const likeMutation = useMutation({
        mutationFn: likeService.toggleTweetLike,
        onMutate: async (tweetId) => {
            // 1. Cancel outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries(['wire'])

            // 2. Snapshot the previous value
            const previousFeed = queryClient.getQueryData(['wire'])

            // 3. Optimistically update the cache
            queryClient.setQueryData(['wire'], (oldData) => {
                if (!oldData) return oldData
                return {
                    ...oldData,
                    pages: oldData.pages.map(page => ({
                        ...page,
                        docs: page.docs.map(tweet => {
                            if (tweet._id === tweetId) {
                                const wasLiked = tweet.isLiked
                                return {
                                    ...tweet,
                                    isLiked: !wasLiked,
                                    likesCount: wasLiked ? tweet.likesCount - 1 : tweet.likesCount + 1
                                }
                            }
                            return tweet
                        })
                    }))
                }
            })

            // Return snapshot for rollback on error
            return { previousFeed }
        },
        onError: (err, tweetId, context) => {
            // Rollback on error
            if (context?.previousFeed) {
                queryClient.setQueryData(['wire'], context.previousFeed)
            }
            toast.error("Like failed")
        },
        onSettled: () => {
            // Sync with server eventually
            queryClient.invalidateQueries(['wire'])
        }
    })

    const deleteMutation = useMutation({
        mutationFn: tweetService.deleteTweet,
        onSuccess: () => {
            toast.success("Wire deleted")
            queryClient.invalidateQueries(['wire'])
        }
    })

    // Memoized handlers for WireCard (prevents memo from breaking)
    const handleLike = useCallback((id) => likeMutation.mutate(id), [likeMutation.mutate])
    const handleDelete = useCallback((id) => deleteMutation.mutate(id), [deleteMutation.mutate])

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Background Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-sky-500 opacity-5 blur-[120px] pointer-events-none" />

            <div className="relative z-10 px-6 md:px-12 lg:pl-6 pt-28 pb-20 lg:px-6">
                <div className="max-w-2xl mx-auto">

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <Zap className="w-6 h-6 text-sky-500/70" />
                            <h1 className="text-3xl font-bold text-white tracking-tight">The Wire</h1>
                        </div>
                        <p className="text-zinc-500 text-sm">Connect with the community</p>
                    </div>

                    {/* ✍️ WIRE INPUT */}
                    <div className="mb-6">
                        {userData ? (
                            <WireInput
                                defaultMode="short"
                                onSuccess={() => queryClient.invalidateQueries(['wire'])}
                            />
                        ) : (
                            <AuthLock
                                message="Sign in to post on the Wire"
                                variant="wire"
                            />
                        )}
                    </div>

                    {/* 📜 FEED CONTENT */}
                    <div className="space-y-0 border border-zinc-800 rounded-2xl overflow-hidden bg-[#0a0a0c]">
                        {status === 'pending' ? (
                            <WireListSkeleton count={5} />
                        ) : status === 'error' ? (
                            <div className="py-20 text-center text-red-400">
                                Error loading wire feed.
                            </div>
                        ) : (
                            <>
                                {data.pages.map((page, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        {page.docs.map((wire) => (
                                            <WireCard
                                                key={wire._id}
                                                wire={wire}
                                                onLike={handleLike}
                                                onDelete={handleDelete}
                                            />
                                        ))}
                                    </motion.div>
                                ))}

                                {/* Infinite Scroll Loader */}
                                <div ref={ref} className="py-6 flex justify-center border-t border-zinc-800">
                                    {isFetchingNextPage && (
                                        <div className="w-full">
                                            <WireCardSkeleton />
                                        </div>
                                    )}
                                </div>

                                {/* End Message */}
                                {!hasNextPage && (
                                    <div className="py-8 text-center text-zinc-600 text-sm border-t border-zinc-800">
                                        You've reached the end of the wire.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}