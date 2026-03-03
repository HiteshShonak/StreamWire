import { useEffect, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Ghost, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

// API Services
import { tweetService } from '../api/services/tweet.service'
import { likeService } from '../api/services/like.service'

// Components
import ShadowInput from '../Components/ShadowInput'
import ShadowCard from '../Components/ShadowCard'
import AuthLock from '../Components/Common/AuthLock'
import { ShadowListSkeleton, ShadowCardSkeleton } from '../Components/Common/Skeleton'

export default function ShadowsFeed() {
    const { ref, inView } = useInView()
    const queryClient = useQueryClient()
    const { userData } = useSelector((state) => state.auth)

    // Only fetch stealth posts
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['shadows'],
        queryFn: async ({ pageParam = 1 }) => {
            return await tweetService.getAllTweets({
                page: pageParam,
                limit: 20,
                isStealthMode: true // Only fetch stealth posts
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

    // Actions

    // Instant Like (Optimistic UI)
    const likeMutation = useMutation({
        mutationFn: likeService.toggleTweetLike,
        onMutate: async (tweetId) => {
            await queryClient.cancelQueries(['shadows'])
            const previousFeed = queryClient.getQueryData(['shadows'])

            queryClient.setQueryData(['shadows'], (oldData) => {
                if (!oldData) return oldData
                return {
                    ...oldData,
                    pages: oldData.pages.map(page => ({
                        ...page,
                        docs: page.docs.map(shadow => {
                            if (shadow._id === tweetId) {
                                const wasLiked = shadow.isLiked
                                return {
                                    ...shadow,
                                    isLiked: !wasLiked,
                                    likesCount: wasLiked ? shadow.likesCount - 1 : shadow.likesCount + 1
                                }
                            }
                            return shadow
                        })
                    }))
                }
            })

            return { previousFeed }
        },
        onError: (err, tweetId, context) => {
            if (context?.previousFeed) {
                queryClient.setQueryData(['shadows'], context.previousFeed)
            }
            toast.error("Like failed")
        },
        onSettled: () => {
            queryClient.invalidateQueries(['shadows'])
        }
    })

    const deleteMutation = useMutation({
        mutationFn: tweetService.deleteTweet,
        onSuccess: () => {
            toast.success("Shadow deleted")
            queryClient.invalidateQueries(['shadows'])
        }
    })

    // Memoized handlers for ShadowCard (prevents memo from breaking)
    const handleLike = useCallback((id) => likeMutation.mutate(id), [likeMutation.mutate])
    const handleDelete = useCallback((id) => deleteMutation.mutate(id), [deleteMutation.mutate])

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Background Glow - Emerald theme for Shadows */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-emerald-500 opacity-[0.03] blur-[120px] pointer-events-none" />

            <div className="relative z-10 px-6 md:px-12 lg:pl-6 pt-28 pb-20 lg:px-6">
                <div className="max-w-2xl mx-auto">

                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <Ghost className="w-6 h-6 text-emerald-500/70" />
                            <h1 className="text-3xl font-bold text-white tracking-tight">The Shadows</h1>
                        </div>
                        <p className="text-zinc-500 text-sm">Anonymous thoughts from the void</p>
                    </div>

                    {/* Shadow Input */}
                    <div className="mb-6">
                        {userData ? (
                            <ShadowInput
                                onSuccess={() => queryClient.invalidateQueries(['shadows'])}
                            />
                        ) : (
                            <AuthLock
                                message="Sign in to post from the shadows"
                                variant="shadows"
                            />
                        )}
                    </div>

                    {/* Feed content */}
                    <div className="space-y-0 border border-zinc-900 rounded-2xl overflow-hidden bg-[#09090b]">
                        {status === 'pending' ? (
                            <ShadowListSkeleton count={5} />
                        ) : status === 'error' ? (
                            <div className="py-20 text-center text-red-400">
                                Error loading shadows feed.
                            </div>
                        ) : (
                            <>
                                {data.pages.map((page, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        {page.docs.map((shadow) => (
                                            <ShadowCard
                                                key={shadow._id}
                                                shadow={shadow}
                                                onLike={handleLike}
                                                onDelete={handleDelete}
                                            />
                                        ))}
                                    </motion.div>
                                ))}

                                {/* Infinite Scroll Loader */}
                                <div ref={ref} className="py-6 flex justify-center border-t border-zinc-900">
                                    {isFetchingNextPage && (
                                        <div className="w-full">
                                            <ShadowCardSkeleton />
                                        </div>
                                    )}
                                </div>

                                {/* End Message */}
                                {!hasNextPage && (
                                    <div className="py-8 text-center text-zinc-700 text-sm border-t border-zinc-900">
                                        You've reached the depths of the shadows.
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