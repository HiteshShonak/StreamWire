import React from 'react'

// ==========================================
// Skeleton components library
// Premium shimmer-enabled loading placeholders
// Every skeleton needs to match its page layout exactly
// Same structure, same spacing, same responsive behavior
// ==========================================

/**
 * Base skeleton block with shimmer effect
 * Uses the .skeleton class from index.css for shimmer animation
 */
export const Skeleton = ({ className = '' }) => (
    <div className={`skeleton ${className}`} />
)

// ==========================================
// Video card skeleton
// Matches: Components/Cinema/VideoCard.jsx
// ==========================================
export const VideoCardSkeleton = () => (
    <div className="group cursor-pointer relative">
        {/* Thumbnail - matches aspect-video rounded-xl mb-3 */}
        <div className="skeleton aspect-video rounded-xl mb-3 shadow-lg shadow-black/40" />

        {/* Meta Data - matches flex gap-3 px-1 */}
        <div className="flex gap-3 px-1">
            {/* Avatar - matches w-9 h-9 rounded-full */}
            <div className="skeleton w-9 h-9 rounded-full shrink-0" />

            {/* Text - matches flex-1 min-w-0 */}
            <div className="flex-1 min-w-0 space-y-2">
                {/* Title - 2 lines */}
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
                {/* Channel name */}
                <div className="skeleton h-3 w-24 rounded" />
                {/* Views & time */}
                <div className="skeleton h-3 w-32 rounded" />
            </div>
        </div>
    </div>
)

// ==========================================
// Video grid skeleton
// Matches: CinemaFeed grid layout
// ==========================================
export const VideoGridSkeleton = ({ count = 8 }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(count)].map((_, i) => (
            <VideoCardSkeleton key={i} />
        ))}
    </div>
)

// ==========================================
// Wire card skeleton
// Matches: Components/WireCard.jsx layout exactly
// border-b style, p-3 sm:p-4 spacing, flex gap-3 sm:gap-4
// ==========================================
export const WireCardSkeleton = () => (
    <div className="border-b border-zinc-800 bg-[#0a0a0c] p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
            {/* Avatar - w-10 h-10 rounded-full */}
            <div className="skeleton w-10 h-10 rounded-full shrink-0" />

            {/* Content Column - flex-1 min-w-0 */}
            <div className="flex-1 min-w-0">
                {/* Header: Name, handle, time */}
                <div className="flex items-center gap-1.5 mb-1">
                    <div className="skeleton h-4 w-24 rounded" />
                    <div className="skeleton h-3 w-16 rounded" />
                    <div className="skeleton h-3 w-12 rounded" />
                </div>

                {/* Post Text - mb-3 */}
                <div className="space-y-2 mb-3">
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-5/6 rounded" />
                    <div className="skeleton h-4 w-3/4 rounded" />
                </div>

                {/* Action Buttons Footer - flex items-center justify-between max-w-md */}
                <div className="flex items-center justify-between max-w-md -ml-2">
                    <div className="skeleton h-8 w-12 rounded-full" />
                    <div className="skeleton h-8 w-12 rounded-full" />
                    <div className="skeleton h-8 w-12 rounded-full" />
                    <div className="skeleton h-8 w-8 rounded-full" />
                </div>
            </div>
        </div>
    </div>
)

// Alias for backward compatibility
export const TweetSkeleton = WireCardSkeleton

export const WireListSkeleton = ({ count = 5 }) => (
    <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#0a0a0c]">
        {[...Array(count)].map((_, i) => (
            <WireCardSkeleton key={i} />
        ))}
    </div>
)

// Alias for backward compatibility
export const TweetListSkeleton = WireListSkeleton

// ==========================================
// Shadow card skeleton
// Matches: Components/ShadowCard.jsx layout exactly
// border-zinc-900, border-l-emerald-900/40, bg-[#09090b]
// ==========================================
export const ShadowCardSkeleton = () => (
    <div className="border-b border-zinc-900 bg-[#09090b] p-3 sm:p-4 border-l-2 border-l-emerald-900/40">
        <div className="flex gap-3 sm:gap-4">
            {/* Avatar - w-10 h-10 rounded-full with ghost icon */}
            <div className="skeleton w-10 h-10 rounded-full shrink-0" />

            {/* Content Column */}
            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-1.5 mb-1">
                    <div className="skeleton h-4 w-24 rounded" />
                    <div className="skeleton h-3 w-16 rounded" />
                    <div className="skeleton h-3 w-12 rounded" />
                </div>

                {/* Post Text */}
                <div className="space-y-2 mb-3">
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-5/6 rounded" />
                    <div className="skeleton h-4 w-3/4 rounded" />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between max-w-md -ml-2">
                    <div className="skeleton h-8 w-12 rounded-full" />
                    <div className="skeleton h-8 w-12 rounded-full" />
                    <div className="skeleton h-8 w-12 rounded-full" />
                    <div className="skeleton h-8 w-8 rounded-full" />
                </div>
            </div>
        </div>
    </div>
)

export const ShadowListSkeleton = ({ count = 5 }) => (
    <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-[#09090b]">
        {[...Array(count)].map((_, i) => (
            <ShadowCardSkeleton key={i} />
        ))}
    </div>
)

// ==========================================
// Channel page skeleton
// Matches: pages/Channel.jsx layout exactly
// ==========================================
export const ChannelPageSkeleton = () => (
    <div className="min-h-screen bg-zinc-950">
        {/* Cover Image - h-56 */}
        <div className="skeleton h-56 rounded-none" />

        {/* Profile Info - max-w-6xl mx-auto px-6 -mt-20 */}
        <div className="max-w-6xl mx-auto px-6">
            <div className="relative -mt-20 pb-6">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                    {/* Avatar - w-32 h-32 rounded-full border-4 */}
                    <div className="skeleton w-32 h-32 rounded-full border-4 border-zinc-950" />

                    {/* Info - flex-1 */}
                    <div className="flex-1 pb-4 space-y-3">
                        <div className="skeleton h-8 w-48 rounded" />
                        <div className="flex items-center gap-4">
                            <div className="skeleton h-4 w-24 rounded" />
                            <div className="skeleton h-4 w-20 rounded" />
                        </div>
                        <div className="skeleton h-4 w-64 rounded" />
                    </div>

                    {/* Subscribe button */}
                    <div className="skeleton h-10 w-28 rounded-xl" />
                </div>
            </div>

            {/* Tabs - border-b border-zinc-800 */}
            <div className="flex gap-6 border-b border-zinc-800 mb-8 py-3">
                <div className="skeleton h-6 w-16 rounded" />
                <div className="skeleton h-6 w-16 rounded" />
                <div className="skeleton h-6 w-16 rounded" />
            </div>

            {/* Videos Grid - same as CinemaFeed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                {[...Array(6)].map((_, i) => (
                    <VideoCardSkeleton key={i} />
                ))}
            </div>
        </div>
    </div>
)

// ==========================================
// Video player page skeleton
// Matches: pages/VideoPlayer.jsx layout exactly
// ==========================================
export const VideoPlayerSkeleton = () => (
    <div className="lg:pl-[280px] pt-24 pb-20 px-4 md:px-6">
        <div className="max-w-[1800px] mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

                {/* Main Content - xl:col-span-2 space-y-6 */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Video Player - aspect-video rounded-2xl */}
                    <div className="skeleton aspect-video w-full rounded-2xl" />

                    {/* Video Info Section */}
                    <div className="space-y-4">
                        {/* Title */}
                        <div className="skeleton h-7 w-3/4 rounded" />

                        {/* Views and time */}
                        <div className="flex items-center gap-4">
                            <div className="skeleton h-4 w-24 rounded" />
                            <div className="skeleton h-4 w-24 rounded" />
                        </div>

                        {/* Creator Info with Subscribe */}
                        <div className="flex items-center justify-between py-4 border-y border-zinc-800/50">
                            <div className="flex items-center gap-4">
                                <div className="skeleton w-12 h-12 rounded-full" />
                                <div className="space-y-2">
                                    <div className="skeleton h-5 w-32 rounded" />
                                    <div className="skeleton h-3 w-24 rounded" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="skeleton h-10 w-28 rounded-xl" />
                                <div className="skeleton h-10 w-10 rounded-xl" />
                                <div className="skeleton h-10 w-10 rounded-xl" />
                            </div>
                        </div>

                        {/* Description Box */}
                        <div className="skeleton h-24 w-full rounded-xl" />

                        {/* AI Features Section */}
                        <div className="space-y-3">
                            <div className="skeleton h-14 w-full rounded-xl" />
                            <div className="skeleton h-14 w-full rounded-xl" />
                        </div>

                        {/* Comments Section Header */}
                        <div className="flex items-center gap-4 py-4">
                            <div className="skeleton h-6 w-32 rounded" />
                            <div className="skeleton h-6 w-20 rounded" />
                        </div>

                        {/* Comment Input */}
                        <div className="skeleton h-16 w-full rounded-xl" />

                        {/* Comments */}
                        <div className="space-y-4">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="flex gap-3">
                                    <div className="skeleton w-10 h-10 rounded-full shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="skeleton h-4 w-32 rounded" />
                                        <div className="skeleton h-4 w-full rounded" />
                                        <div className="skeleton h-4 w-2/3 rounded" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Related Videos */}
                <div className="space-y-4">
                    <div className="skeleton h-6 w-40 rounded" />
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="skeleton w-40 h-24 rounded-lg shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="skeleton h-4 w-full rounded" />
                                <div className="skeleton h-3 w-2/3 rounded" />
                                <div className="skeleton h-3 w-1/2 rounded" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
)

// ==========================================
// Dashboard stats skeleton
// Matches: components/Dashboard/StatsOverview.jsx
// ==========================================
export const StatsCardSkeleton = () => (
    <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
        <div className="skeleton w-10 h-10 rounded-xl mb-4" />
        <div className="skeleton h-8 w-16 rounded mb-1" />
        <div className="skeleton h-4 w-24 rounded" />
    </div>
)

export const StatsGridSkeleton = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
            <StatsCardSkeleton key={i} />
        ))}
    </div>
)

// ==========================================
// Dashboard full skeleton
// Matches: pages/Dashboard.jsx layout
// ==========================================
export const DashboardSkeleton = () => (
    <div className="space-y-8">
        {/* Stats Grid */}
        <StatsGridSkeleton />

        {/* Recent Content Section */}
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
            <div className="skeleton h-6 w-40 rounded mb-6" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i}>
                        <div className="skeleton aspect-video rounded-lg mb-2" />
                        <div className="skeleton h-4 w-3/4 rounded mb-1" />
                        <div className="skeleton h-3 w-1/2 rounded" />
                    </div>
                ))}
            </div>
        </div>
    </div>
)

// ==========================================
// Channel card skeleton
// Matches: Components/ChannelCard.jsx exactly
// p-6 rounded-2xl, w-20 h-20 rounded-2xl avatar
// ==========================================
export const ChannelCardSkeleton = () => (
    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
        <div className="flex items-center gap-5">
            {/* Avatar - w-20 h-20 rounded-2xl */}
            <div className="skeleton w-20 h-20 rounded-2xl shrink-0" />

            {/* Info - flex-1 min-w-0 */}
            <div className="flex-1 min-w-0 space-y-2">
                {/* Name - text-xl */}
                <div className="skeleton h-6 w-40 rounded" />
                {/* Username */}
                <div className="skeleton h-4 w-24 rounded" />
                {/* Subscriber count + badge */}
                <div className="flex items-center gap-4">
                    <div className="skeleton h-4 w-28 rounded" />
                    <div className="skeleton h-4 w-20 rounded" />
                </div>
            </div>

            {/* Unsubscribe button */}
            <div className="skeleton h-9 w-24 rounded-xl shrink-0" />
        </div>
    </div>
)

export const ChannelGridSkeleton = ({ count = 6 }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[...Array(count)].map((_, i) => (
            <ChannelCardSkeleton key={i} />
        ))}
    </div>
)

// Backward compatibility
export const ChannelListSkeleton = ChannelGridSkeleton

// ==========================================
// Comment skeleton
// Matches: VideoPlayer/CommentsSection.jsx comments layout
// ==========================================
export const CommentSkeleton = () => (
    <div className="flex gap-3">
        {/* Avatar - w-9 h-9 rounded-full */}
        <div className="skeleton w-9 h-9 rounded-full shrink-0" />

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
            {/* Name + timestamp */}
            <div className="flex items-center gap-2">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-3 w-16 rounded" />
            </div>
            {/* Comment text - 2 lines */}
            <div className="skeleton h-4 w-full rounded" />
            <div className="skeleton h-4 w-3/4 rounded" />
        </div>
    </div>
)

export const CommentListSkeleton = ({ count = 4 }) => (
    <div className="space-y-4">
        {[...Array(count)].map((_, i) => (
            <CommentSkeleton key={i} />
        ))}
    </div>
)

// ==========================================
// Wire post page skeleton
// Matches: Components/WirePost.jsx full post layout
// ==========================================
export const WirePostSkeleton = () => (
    <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <div className="skeleton h-9 w-24 rounded-full mb-8" />

        {/* Main Wire Card */}
        <div className="border border-zinc-800 rounded-2xl overflow-hidden bg-[#0a0a0c] p-4 sm:p-6">
            <div className="flex gap-3 sm:gap-4">
                {/* Avatar */}
                <div className="skeleton w-12 h-12 rounded-full shrink-0" />

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                        <div className="skeleton h-5 w-32 rounded" />
                        <div className="skeleton h-4 w-20 rounded" />
                        <div className="skeleton h-4 w-16 rounded" />
                    </div>

                    {/* Post content */}
                    <div className="space-y-2">
                        <div className="skeleton h-5 w-full rounded" />
                        <div className="skeleton h-5 w-5/6 rounded" />
                        <div className="skeleton h-5 w-2/3 rounded" />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-6 pt-4">
                        <div className="skeleton h-8 w-16 rounded-full" />
                        <div className="skeleton h-8 w-16 rounded-full" />
                        <div className="skeleton h-8 w-16 rounded-full" />
                        <div className="skeleton h-8 w-10 rounded-full" />
                    </div>
                </div>
            </div>
        </div>

        {/* Comments Section */}
        <div className="mt-8 pt-6 border-t border-zinc-800">
            <div className="skeleton h-6 w-36 rounded mb-6" />
            <CommentListSkeleton count={3} />
        </div>
    </div>
)

// ==========================================
// Search results skeleton
// Matches: Components/Search.jsx layout with context-aware sections
// ==========================================
export const SearchSkeleton = ({ showUsers = true, showVideos = true, showWires = true }) => (
    <div className="space-y-16">
        {/* Users/Channels Section */}
        {showUsers && (
            <div>
                <div className="skeleton h-7 w-36 rounded mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <UserCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        )}

        {/* Videos Section */}
        {showVideos && (
            <div>
                <div className="skeleton h-7 w-32 rounded mb-6" />
                <VideoGridSkeleton count={8} />
            </div>
        )}

        {/* Wires Section */}
        {showWires && (
            <div>
                <div className="skeleton h-7 w-28 rounded mb-6" />
                <WireListSkeleton count={4} />
            </div>
        )}
    </div>
)

// ==========================================
// User card skeleton (for search results)
// Matches smaller user result cards
// ==========================================
export const UserCardSkeleton = () => (
    <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
        <div className="flex items-center gap-4">
            <div className="skeleton w-14 h-14 rounded-xl shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
                <div className="skeleton h-5 w-32 rounded" />
                <div className="skeleton h-4 w-20 rounded" />
                <div className="skeleton h-3 w-24 rounded" />
            </div>
            <div className="skeleton h-9 w-24 rounded-lg shrink-0" />
        </div>
    </div>
)

// ==========================================
// Tag grid skeleton
// Matches: pages/BuildFeed.jsx tag selection grid
// ==========================================
export const TagGridSkeleton = ({ count = 20 }) => (
    <div className="flex flex-wrap gap-2 sm:gap-3">
        {[...Array(count)].map((_, i) => (
            <div
                key={i}
                className={`skeleton h-9 rounded-full ${i % 3 === 0 ? 'w-20' : i % 2 === 0 ? 'w-24' : 'w-16'}`}
            />
        ))}
    </div>
)

// ==========================================
// Content/text skeleton
// Generic lines of content
// ==========================================
export const ContentSkeleton = ({ lines = 3 }) => (
    <div className="space-y-3">
        {[...Array(lines)].map((_, i) => (
            <div
                key={i}
                className={`skeleton h-4 rounded ${i === lines - 1 ? 'w-2/3' : 'w-full'}`}
            />
        ))}
    </div>
)

// ==========================================
// Cinema feed skeleton
// Matches: pages/CinemaFeed.jsx full page
// ==========================================
export const CinemaFeedSkeleton = () => (
    <div className="space-y-8">
        {/* Hero Section Skeleton */}
        <div className="skeleton h-[400px] md:h-[500px] rounded-3xl" />

        {/* Category Tabs */}
        <div className="flex gap-3 overflow-x-auto pb-2">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton h-10 w-24 rounded-full shrink-0" />
            ))}
        </div>

        {/* Video Grid */}
        <VideoGridSkeleton count={8} />
    </div>
)

// ==========================================
// Wire feed skeleton
// Matches: pages/WireFeed.jsx layout
// ==========================================
export const WireFeedSkeleton = () => (
    <div className="max-w-2xl mx-auto space-y-4">
        {/* Composer box */}
        <div className="skeleton h-24 w-full rounded-2xl mb-6" />

        {/* Tweet list */}
        <TweetListSkeleton count={5} />
    </div>
)

// ==========================================
// History/saved page skeleton
// Matches: pages/History.jsx, pages/Saved.jsx
// ==========================================
export const LibraryPageSkeleton = () => (
    <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
            <div className="skeleton w-12 h-12 rounded-xl" />
            <div className="space-y-2">
                <div className="skeleton h-8 w-40 rounded" />
                <div className="skeleton h-4 w-24 rounded" />
            </div>
        </div>

        {/* Video Grid */}
        <VideoGridSkeleton count={8} />
    </div>
)

// ==========================================
// Trending page skeleton
// Matches: pages/Trending.jsx layout
// ==========================================
export const TrendingPageSkeleton = () => (
    <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
            <div className="skeleton w-12 h-12 rounded-xl" />
            <div className="space-y-2">
                <div className="skeleton h-8 w-48 rounded" />
                <div className="skeleton h-4 w-64 rounded" />
            </div>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-3">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton h-10 w-24 rounded-xl" />
            ))}
        </div>

        {/* Content Grid */}
        <VideoGridSkeleton count={8} />
    </div>
)

// ==========================================
// Exports
// ==========================================
export default {
    Skeleton,
    VideoCardSkeleton,
    VideoGridSkeleton,
    WireCardSkeleton,
    WireListSkeleton,
    ShadowCardSkeleton,
    ShadowListSkeleton,
    TweetSkeleton,
    TweetListSkeleton,
    CommentSkeleton,
    CommentListSkeleton,
    WirePostSkeleton,
    SearchSkeleton,
    UserCardSkeleton,
    TagGridSkeleton,
    ChannelPageSkeleton,
    VideoPlayerSkeleton,
    StatsCardSkeleton,
    StatsGridSkeleton,
    DashboardSkeleton,
    ChannelCardSkeleton,
    ChannelGridSkeleton,
    ChannelListSkeleton,
    ContentSkeleton,
    CinemaFeedSkeleton,
    WireFeedSkeleton,
    LibraryPageSkeleton,
    TrendingPageSkeleton
}


