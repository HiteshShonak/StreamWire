import React from 'react'

// Skeleton components library

// base shimmer block
export const Skeleton = ({ className = '' }) => (
    <div className={`skeleton ${className}`} />
)

// Video card
export const VideoCardSkeleton = () => (
    <div className="group cursor-pointer relative">
        <div className="skeleton aspect-video rounded-xl mb-3 shadow-lg shadow-black/40" />
        <div className="flex gap-3 px-1">
            <div className="skeleton w-9 h-9 rounded-full shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
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

// Video grid
export const VideoGridSkeleton = ({ count = 8 }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(count)].map((_, i) => (
            <VideoCardSkeleton key={i} />
        ))}
    </div>
)

// Wire card
export const WireCardSkeleton = () => (
    <div className="border-b border-zinc-800 bg-[#0a0a0c] p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
            <div className="skeleton w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 min-w-0">
                {/* Header: Name, handle, time */}
                <div className="flex items-center gap-1.5 mb-1">
                    <div className="skeleton h-4 w-24 rounded" />
                    <div className="skeleton h-3 w-16 rounded" />
                    <div className="skeleton h-3 w-12 rounded" />
                </div>
                <div className="space-y-2 mb-3">
                    <div className="skeleton h-4 w-full rounded" />
                    <div className="skeleton h-4 w-5/6 rounded" />
                    <div className="skeleton h-4 w-3/4 rounded" />
                </div>
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

// Shadow card
export const ShadowCardSkeleton = () => (
    <div className="border-b border-zinc-900 bg-[#09090b] p-3 sm:p-4 border-l-2 border-l-emerald-900/40">
        <div className="flex gap-3 sm:gap-4">
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

// Channel page
export const ChannelPageSkeleton = () => (
    <div className="min-h-screen bg-zinc-950">
        <div className="skeleton h-56 rounded-none" />
        <div className="max-w-6xl mx-auto px-6">
            <div className="relative -mt-20 pb-6">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                    <div className="skeleton w-32 h-32 rounded-full border-4 border-zinc-950" />
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
            <div className="flex gap-6 border-b border-zinc-800 mb-8 py-3">
                <div className="skeleton h-6 w-16 rounded" />
                <div className="skeleton h-6 w-16 rounded" />
                <div className="skeleton h-6 w-16 rounded" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-8">
                {[...Array(6)].map((_, i) => (
                    <VideoCardSkeleton key={i} />
                ))}
            </div>
        </div>
    </div>
)

// Video player page
export const VideoPlayerSkeleton = () => (
    <div className="lg:pl-70 pt-24 pb-20 px-4 md:px-6">
        <div className="max-w-450 mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
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

// Dashboard stats
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

// Dashboard full
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

// Channel card
export const ChannelCardSkeleton = () => (
    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800">
        <div className="flex items-center gap-5">
            <div className="skeleton w-20 h-20 rounded-2xl shrink-0" />
            <div className="flex-1 min-w-0 space-y-2">
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

// Comment
export const CommentSkeleton = () => (
    <div className="flex gap-3">
        <div className="skeleton w-9 h-9 rounded-full shrink-0" />

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
            {/* Name + timestamp */}
            <div className="flex items-center gap-2">
                <div className="skeleton h-4 w-24 rounded" />
                <div className="skeleton h-3 w-16 rounded" />
            </div>
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

// Wire post page
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

// Search results
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

// User card skeleton (for search results)
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

// Tag grid
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

// Content/text
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

// Cinema feed
export const CinemaFeedSkeleton = () => (
    <div className="space-y-8">
        {/* Hero Section Skeleton */}
        <div className="skeleton h-[400px] md:h-125 rounded-3xl" />

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

// Wire feed
export const WireFeedSkeleton = () => (
    <div className="max-w-2xl mx-auto space-y-4">
        {/* Composer box */}
        <div className="skeleton h-24 w-full rounded-2xl mb-6" />

        {/* Tweet list */}
        <TweetListSkeleton count={5} />
    </div>
)

// History/saved page
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

// Trending page
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

// Auth form skeleton (Login, Register, ForgotPassword)
export const AuthFormSkeleton = ({ fieldCount = 2 }) => (
    <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-md relative z-20">
            <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/10 p-8 rounded-4xl shadow-2xl shadow-black/50 overflow-hidden relative">
                {/* Top Glow Accent */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-linear-to-r from-transparent via-indigo-500/50 to-transparent blur-sm" />

                {/* Header: icon + title + subtitle */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-6">
                        <div className="skeleton w-7 h-7 rounded" />
                    </div>
                    <div className="skeleton h-8 w-48 rounded mx-auto mb-2" />
                    <div className="skeleton h-4 w-56 rounded mx-auto" />
                </div>

                {/* Form fields */}
                <div className={fieldCount > 2 ? 'space-y-4' : 'space-y-5'}>
                    {[...Array(fieldCount)].map((_, i) => (
                        <div key={i} className="space-y-1.5">
                            <div className="skeleton h-3 w-20 rounded ml-1" />
                            <div className="skeleton h-12 w-full rounded-xl" />
                        </div>
                    ))}
                    {/* Submit button */}
                    <div className="skeleton h-[3.25rem] w-full rounded-xl mt-6" />
                </div>

                {/* Footer link */}
                <div className="mt-8 text-center border-t border-white/5 pt-6">
                    <div className="skeleton h-4 w-52 rounded mx-auto" />
                </div>
            </div>
        </div>
    </div>
)

// Change Password
export const ChangePasswordSkeleton = () => (
    <div className="relative min-h-screen bg-[#050505]">
        <div className="relative z-10 lg:pl-72 lg:pr-72 pt-24 pb-20 px-6">
            <div className="max-w-2xl mx-auto">
                {/* Back button */}
                <div className="skeleton h-5 w-36 rounded mb-8" />

                {/* Header: icon + title + subtitle */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 mb-6 mx-auto">
                        <div className="skeleton w-8 h-8 rounded" />
                    </div>
                    <div className="skeleton h-9 w-52 rounded mx-auto mb-2" />
                    <div className="skeleton h-4 w-72 rounded mx-auto" />
                </div>

                {/* Form Card */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8">
                    <div className="space-y-6">
                        {/* 3 password fields */}
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <div className="skeleton h-4 w-36 rounded" />
                                <div className="skeleton h-[3.25rem] w-full rounded-xl" />
                            </div>
                        ))}

                        {/* Password Requirements box */}
                        <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                            <div className="skeleton h-4 w-40 rounded mb-3" />
                            <div className="space-y-2">
                                <div className="skeleton h-3 w-48 rounded" />
                                <div className="skeleton h-3 w-52 rounded" />
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-4 pt-4">
                            <div className="skeleton h-[3.25rem] flex-1 rounded-xl" />
                            <div className="skeleton h-[3.25rem] flex-1 rounded-xl" />
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="mt-6 p-4 rounded-xl border border-zinc-700/50 bg-zinc-800/30">
                        <div className="skeleton h-3 w-full rounded mb-1" />
                        <div className="skeleton h-3 w-3/4 rounded" />
                    </div>
                </div>
            </div>
        </div>
    </div>
)

// Settings page skeleton (Settings)
export const SettingsPageSkeleton = () => (
    <div className="min-h-screen bg-[#050505]">
        <div className="lg:pl-72 lg:pr-72 pt-24 pb-20 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="skeleton w-10 h-10 rounded-xl" />
                        <div className="skeleton h-10 w-36 rounded" />
                    </div>
                    <div className="skeleton h-5 w-64 rounded mx-auto" />
                </div>

                {/* Setting Sections: Account (2 items) + Help (3 items) + Session (2 items) */}
                <div className="space-y-8">
                    {[{ items: 2 }, { items: 3 }, { items: 2 }].map((section, sectionIdx) => (
                        <div key={sectionIdx} className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
                            <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-3">
                                <div className="skeleton w-5 h-5 rounded" />
                                <div className="skeleton h-5 w-28 rounded" />
                            </div>
                            <div className="divide-y divide-zinc-800/50">
                                {[...Array(section.items)].map((_, itemIdx) => (
                                    <div key={itemIdx} className="px-6 py-4 flex items-center gap-4">
                                        <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="skeleton h-4 w-36 rounded" />
                                            <div className="skeleton h-3 w-56 rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* User Info Card */}
                <div className="mt-12 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 text-center">
                    <div className="skeleton w-20 h-20 rounded-full mx-auto mb-4" />
                    <div className="skeleton h-5 w-32 rounded mx-auto mb-2" />
                    <div className="skeleton h-4 w-24 rounded mx-auto mb-1" />
                    <div className="skeleton h-3 w-40 rounded mx-auto" />
                </div>
            </div>
        </div>
    </div>
)

// Content page skeleton (Support â€” FAQ list)
export const ContentPageSkeleton = () => (
    <div className="min-h-screen bg-[#050505]">
        <div className="lg:pl-72 lg:pr-72 pt-24 pb-20">
            <div className="max-w-4xl mx-auto px-6">
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="skeleton w-10 h-10 rounded-xl" />
                        <div className="skeleton h-10 w-48 rounded" />
                    </div>
                    <div className="skeleton h-5 w-72 rounded mx-auto" />
                </div>

                {/* Contact banner card */}
                <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 mb-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
                            <div className="space-y-2">
                                <div className="skeleton h-5 w-24 rounded" />
                                <div className="skeleton h-4 w-48 rounded" />
                            </div>
                        </div>
                        <div className="skeleton h-12 w-40 rounded-xl" />
                    </div>
                </div>

                {/* FAQ section title */}
                <div className="skeleton h-7 w-56 rounded mx-auto mb-6" />

                {/* FAQ Items */}
                <div className="space-y-3">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/30 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="skeleton w-5 h-5 rounded shrink-0" />
                                    <div className="skeleton h-5 rounded" style={{ width: `${140 + (i % 3) * 40}px` }} />
                                </div>
                                <div className="skeleton w-5 h-5 rounded shrink-0" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
)

// Contact page
export const ContactPageSkeleton = () => (
    <div className="min-h-screen bg-zinc-950">
        <div className="lg:pl-72 lg:pr-72 pt-24 pb-20 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 border border-white/20 mb-6 mx-auto">
                        <div className="skeleton w-10 h-10 rounded" />
                    </div>
                    <div className="skeleton h-12 w-64 rounded mx-auto mb-4" />
                    <div className="skeleton h-5 w-96 max-w-full rounded mx-auto mb-1" />
                    <div className="skeleton h-5 w-72 max-w-full rounded mx-auto" />
                </div>

                {/* 2-column grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left: Contact Info */}
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8">
                        <div className="skeleton h-7 w-48 rounded mb-6" />
                        <div className="space-y-6">
                            {[...Array(2)].map((_, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <div className="skeleton h-5 w-24 rounded" />
                                        <div className="skeleton h-4 w-48 rounded" />
                                        <div className="skeleton h-3 w-40 rounded" />
                                    </div>
                                </div>
                            ))}
                            <div className="pt-4 border-t border-zinc-800">
                                <div className="skeleton h-5 w-36 rounded mb-3" />
                                <div className="space-y-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="skeleton h-4 w-56 rounded" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8">
                        <div className="skeleton h-7 w-40 rounded mb-6" />
                        <div className="space-y-6">
                            {/* Name, Email, Subject fields */}
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="skeleton h-4 w-28 rounded" />
                                    <div className="skeleton h-[3.25rem] w-full rounded-xl" />
                                </div>
                            ))}
                            {/* Message textarea */}
                            <div className="space-y-2">
                                <div className="skeleton h-4 w-20 rounded" />
                                <div className="skeleton h-36 w-full rounded-xl" />
                            </div>
                            {/* Submit button */}
                            <div className="skeleton h-14 w-full rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
)

// About page
export const AboutPageSkeleton = () => (
    <div className="min-h-screen bg-zinc-950">
        <div className="lg:pl-72 lg:pr-72 pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto">
                {/* Hero */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/10 border border-white/20 mb-6 mx-auto">
                        <div className="skeleton w-10 h-10 rounded" />
                    </div>
                    <div className="skeleton h-14 w-96 max-w-full rounded mx-auto mb-6" />
                    <div className="skeleton h-6 w-full max-w-2xl rounded mx-auto mb-2" />
                    <div className="skeleton h-6 w-3/4 max-w-xl rounded mx-auto" />
                </div>

                {/* Mission box */}
                <div className="mb-20 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 md:p-12">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="skeleton h-8 w-40 rounded mx-auto mb-4" />
                        <div className="skeleton h-5 w-full rounded mb-2" />
                        <div className="skeleton h-5 w-full rounded mb-2" />
                        <div className="skeleton h-5 w-2/3 rounded mx-auto" />
                    </div>
                </div>

                {/* Stats grid 2x4 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 text-center">
                            <div className="skeleton h-10 w-16 rounded mx-auto mb-2" />
                            <div className="skeleton h-5 w-20 rounded mx-auto mb-1" />
                            <div className="skeleton h-3 w-28 rounded mx-auto" />
                        </div>
                    ))}
                </div>

                {/* Core Features (3 large cards) */}
                <div className="mb-20">
                    <div className="skeleton h-9 w-48 rounded mx-auto mb-4" />
                    <div className="skeleton h-5 w-72 rounded mx-auto mb-12" />
                    <div className="space-y-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 md:p-10">
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="skeleton w-20 h-20 rounded-2xl shrink-0" />
                                    <div className="flex-1 space-y-3">
                                        <div className="skeleton h-8 w-32 rounded" />
                                        <div className="skeleton h-4 w-full rounded" />
                                        <div className="skeleton h-4 w-3/4 rounded" />
                                        <div className="grid md:grid-cols-2 gap-2 mt-4">
                                            {[...Array(4)].map((_, j) => (
                                                <div key={j} className="skeleton h-4 w-48 rounded" />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Advanced Features Grid 3x2 */}
                <div className="mb-20">
                    <div className="skeleton h-9 w-56 rounded mx-auto mb-4" />
                    <div className="skeleton h-5 w-64 rounded mx-auto mb-12" />
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6">
                                <div className="skeleton w-14 h-14 rounded-xl mb-4" />
                                <div className="skeleton h-6 w-36 rounded mb-2" />
                                <div className="skeleton h-4 w-full rounded mb-1" />
                                <div className="skeleton h-4 w-3/4 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
)

// KillSwitch page
export const KillSwitchSkeleton = () => (
    <div className="relative min-h-screen bg-[#050505]">
        <div className="relative z-10 lg:pl-72 lg:pr-72 pt-24 pb-20">
            <div className="max-w-3xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <div className="skeleton w-12 h-12 rounded" />
                    </div>
                    <div className="skeleton h-12 w-52 rounded mx-auto mb-4" />
                    <div className="skeleton h-5 w-full max-w-2xl rounded mx-auto mb-2" />
                    <div className="skeleton h-5 w-3/4 max-w-xl rounded mx-auto mb-6" />
                    <div className="skeleton h-4 w-64 rounded mx-auto" />
                </div>

                {/* Main action card */}
                <div className="w-full p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800">
                    <div className="flex items-start gap-6">
                        <div className="skeleton w-16 h-16 rounded-2xl shrink-0" />
                        <div className="flex-1 space-y-3">
                            <div className="skeleton h-7 w-48 rounded" />
                            <div className="skeleton h-4 w-full rounded" />
                            <div className="skeleton h-4 w-3/4 rounded" />
                            <div className="flex items-center gap-2 mt-4">
                                <div className="skeleton w-2 h-2 rounded-full" />
                                <div className="skeleton h-4 w-24 rounded" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2-col info grid */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="skeleton w-10 h-10 rounded-lg" />
                                <div className="skeleton h-5 w-28 rounded" />
                            </div>
                            <div className="space-y-2">
                                {[...Array(3)].map((_, j) => (
                                    <div key={j} className="skeleton h-4 w-44 rounded" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Preview card */}
                <div className="mt-16">
                    <div className="skeleton h-6 w-20 rounded mx-auto mb-2" />
                    <div className="skeleton h-4 w-64 rounded mx-auto mb-6" />
                    <div className="p-8 rounded-2xl border-2 border-zinc-800 bg-zinc-900/50 flex flex-col items-center">
                        <div className="skeleton w-24 h-24 rounded-full mb-4" />
                        <div className="skeleton h-6 w-28 rounded mb-1" />
                        <div className="skeleton h-4 w-20 rounded" />
                    </div>
                </div>
            </div>
        </div>
    </div>
)

// Upload page
export const UploadPageSkeleton = () => (
    <div className="min-h-screen bg-[#050505]">
        <div className="lg:pl-72 lg:pr-72 pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-5xl mx-auto">
                {/* Back button + header */}
                <div className="mb-8">
                    <div className="skeleton h-5 w-40 rounded mb-6" />
                    <div className="flex items-center gap-4 mb-3">
                        <div className="skeleton w-16 h-16 rounded-2xl shrink-0" />
                        <div className="space-y-2">
                            <div className="skeleton h-9 w-48 rounded" />
                            <div className="skeleton h-4 w-56 rounded" />
                        </div>
                    </div>
                </div>

                {/* Form sections */}
                <div className="space-y-6">
                    {/* Video upload area */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="skeleton w-10 h-10 rounded-lg" />
                            <div className="space-y-1.5">
                                <div className="skeleton h-5 w-24 rounded" />
                                <div className="skeleton h-3 w-40 rounded" />
                            </div>
                        </div>
                        <div className="border-2 border-dashed border-zinc-700 rounded-xl p-12 flex flex-col items-center">
                            <div className="skeleton w-16 h-16 rounded-full mb-4" />
                            <div className="skeleton h-5 w-40 rounded mb-1" />
                            <div className="skeleton h-3 w-56 rounded" />
                        </div>
                    </div>

                    {/* Title field */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="skeleton w-10 h-10 rounded-lg" />
                            <div className="space-y-1.5">
                                <div className="skeleton h-5 w-12 rounded" />
                                <div className="skeleton h-3 w-48 rounded" />
                            </div>
                        </div>
                        <div className="skeleton h-12 w-full rounded-xl" />
                        <div className="skeleton h-3 w-24 rounded mt-2" />
                    </div>

                    {/* Description field */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="skeleton w-10 h-10 rounded-lg" />
                            <div className="space-y-1.5">
                                <div className="skeleton h-5 w-24 rounded" />
                                <div className="skeleton h-3 w-44 rounded" />
                            </div>
                        </div>
                        <div className="skeleton h-28 w-full rounded-xl" />
                        <div className="skeleton h-3 w-24 rounded mt-2" />
                    </div>

                    {/* Tags field */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="skeleton w-10 h-10 rounded-lg" />
                            <div className="space-y-1.5">
                                <div className="skeleton h-5 w-12 rounded" />
                                <div className="skeleton h-3 w-44 rounded" />
                            </div>
                        </div>
                        <div className="skeleton h-12 w-full rounded-xl" />
                    </div>

                    {/* Thumbnail section */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="skeleton w-10 h-10 rounded-lg" />
                            <div className="flex-1 space-y-1.5">
                                <div className="skeleton h-5 w-36 rounded" />
                                <div className="skeleton h-3 w-52 rounded" />
                            </div>
                            <div className="skeleton h-6 w-24 rounded-full" />
                        </div>
                        <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 flex flex-col items-center">
                            <div className="skeleton w-12 h-12 rounded-full mb-3" />
                            <div className="skeleton h-4 w-40 rounded mb-1" />
                            <div className="skeleton h-3 w-32 rounded" />
                        </div>
                    </div>

                    {/* Submit buttons */}
                    <div className="flex gap-4 pt-4">
                        <div className="skeleton h-14 flex-1 rounded-xl" />
                        <div className="skeleton h-14 flex-1 rounded-xl" />
                    </div>

                    {/* AI features info box */}
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6">
                        <div className="flex items-start gap-4">
                            <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
                            <div className="flex-1 space-y-3">
                                <div className="skeleton h-5 w-44 rounded" />
                                <div className="space-y-2">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="skeleton h-4 w-56 rounded" />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
)

// Customize page
export const CustomizePageSkeleton = () => (
    <div className="min-h-screen bg-[#050505]">
        <div className="lg:pl-72 lg:pr-72 pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                        <div className="skeleton w-10 h-10 rounded" />
                    </div>
                    <div className="skeleton h-10 w-64 rounded mx-auto mb-3" />
                    <div className="skeleton h-5 w-72 rounded mx-auto" />
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-12">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center">
                            <div className={`skeleton w-10 h-10 rounded-full ${i === 0 ? '!bg-indigo-500/30' : ''}`} />
                            {i < 4 && <div className="skeleton w-6 h-0.5 mx-1" />}
                        </div>
                    ))}
                </div>

                {/* Step Content Card */}
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="skeleton w-14 h-14 rounded-2xl" />
                        <div className="space-y-2">
                            <div className="skeleton h-7 w-36 rounded" />
                            <div className="skeleton h-4 w-48 rounded" />
                        </div>
                    </div>

                    {/* Form fields */}
                    <div className="space-y-6">
                        <div>
                            <div className="skeleton h-4 w-24 rounded mb-2" />
                            <div className="skeleton h-[3.25rem] w-full rounded-xl" />
                            <div className="skeleton h-3 w-12 rounded mt-2" />
                        </div>
                        <div>
                            <div className="skeleton h-4 w-20 rounded mb-2" />
                            <div className="skeleton h-[3.25rem] w-full rounded-xl" />
                            <div className="skeleton h-3 w-12 rounded mt-2" />
                        </div>
                    </div>
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center justify-between mt-8">
                    <div className="skeleton h-12 w-28 rounded-xl" />
                    <div className="skeleton h-12 w-28 rounded-xl" />
                </div>
            </div>
        </div>
    </div>
)

// Home page
export const HomePageSkeleton = () => (
    <div className="min-h-screen bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 pt-25 pb-20 flex flex-col items-center">
            {/* Title area */}
            <div className="text-center mb-16 max-w-3xl">
                {/* Badge */}
                <div className="skeleton h-7 w-32 rounded-full mx-auto mb-6" />
                {/* h1 */}
                <div className="skeleton h-12 md:h-16 w-80 md:w-[480px] rounded mx-auto mb-6" />
                {/* Subtitle */}
                <div className="skeleton h-5 w-96 max-w-full rounded mx-auto mb-1" />
                <div className="skeleton h-5 w-72 max-w-full rounded mx-auto" />
            </div>

            {/* 3 SpotlightCards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-[2.5rem] border border-white/10 bg-zinc-900/40 p-8 md:p-10 h-112.5 md:h-125 flex flex-col justify-between">
                        {/* Top: icon + title + desc */}
                        <div>
                            <div className="skeleton w-14 h-14 rounded-2xl mb-6" />
                            <div className="skeleton h-10 w-40 rounded mb-3" />
                            <div className="skeleton h-4 w-full rounded mb-2" />
                            <div className="skeleton h-4 w-3/4 rounded" />
                        </div>
                        {/* Bottom: divider + row */}
                        <div>
                            <div className="h-px w-full bg-white/10 mb-6" />
                            <div className="flex items-center justify-between">
                                <div className="skeleton h-3 w-24 rounded" />
                                <div className="skeleton w-10 h-10 rounded-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
)

// Landing page
export const LandingPageSkeleton = () => (
    <div className="min-h-screen bg-[#FDFDFD]">
        {/* Floating navbar: white glass */}
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
            <div className="w-full max-w-[75rem] backdrop-blur-2xl rounded-full p-2 pl-6 flex items-center justify-between border border-zinc-200/50 bg-white/70 shadow-xl shadow-zinc-200/50">
                <div className="flex items-center gap-3">
                    <div className="skeleton-light w-5 h-5 rounded-full" />
                    <div className="skeleton-light h-5 w-28 rounded hidden sm:block" />
                </div>
                <div className="flex items-center gap-2 pl-6 border-l border-zinc-200">
                    <div className="skeleton-light h-4 w-12 rounded hidden sm:block" />
                    <div className="skeleton-light h-10 w-28 rounded-full" />
                </div>
            </div>
        </div>

        {/* Hero section: 2-column grid */}
        <section className="relative pt-40 sm:pt-48 md:pt-52 lg:pt-56 pb-8 sm:pb-12 md:pb-16 lg:pb-20 max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center">
            {/* Left column: text content */}
            <div className="space-y-4 sm:space-y-6 md:space-y-8">
                {/* Badge */}
                <div className="skeleton-light h-8 w-56 rounded-full" />

                {/* Title lines */}
                <div className="space-y-3 sm:h-[200px] flex flex-col justify-center">
                    <div className="skeleton-light h-10 sm:h-14 lg:h-16 w-full max-w-[480px] rounded-lg" />
                    <div className="skeleton-light h-10 sm:h-14 lg:h-16 w-3/4 max-w-[360px] rounded-lg" />
                </div>

                {/* Description */}
                <div className="sm:h-[84px] max-w-lg space-y-2">
                    <div className="skeleton-light h-5 w-full rounded" />
                    <div className="skeleton-light h-5 w-5/6 rounded" />
                    <div className="skeleton-light h-5 w-2/3 rounded" />
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                    <div className="skeleton-light w-full sm:w-[200px] h-[48px] sm:h-[56px] rounded-xl sm:rounded-2xl" />
                    <div className="skeleton-light w-full sm:w-[180px] h-[48px] sm:h-[56px] rounded-xl sm:rounded-2xl border-2 border-zinc-200" />
                </div>
            </div>

            {/* Right column: mascot placeholder */}
            <div className="flex justify-center lg:justify-end">
                <div className="skeleton-light w-64 h-64 sm:w-80 sm:h-80 rounded-3xl" />
            </div>
        </section>

        {/* AI Features section */}
        <section className="py-8 sm:py-12 md:py-16 lg:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="skeleton-light w-10 h-10 rounded-lg" />
                <div className="skeleton-light h-7 w-44 rounded" />
            </div>

            {/* 4 feature cards in 3-col grid */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="p-5 sm:p-6 rounded-2xl border border-zinc-100 bg-white">
                        <div className="skeleton-light w-12 h-12 rounded-xl mb-4" />
                        <div className="skeleton-light h-5 w-40 rounded mb-2" />
                        <div className="skeleton-light h-4 w-full rounded mb-1" />
                        <div className="skeleton-light h-4 w-5/6 rounded" />
                    </div>
                ))}
            </div>
        </section>

        {/* Bento grid section */}
        <section className="py-8 sm:py-12 md:py-16 lg:py-24 px-4 sm:px-6 relative">
            <div className="max-w-7xl mx-auto">
                {/* Section heading */}
                <div className="mb-8 sm:mb-12 md:mb-16 text-center">
                    <div className="skeleton-light h-10 sm:h-12 w-72 sm:w-96 rounded mx-auto mb-3 sm:mb-4" />
                    <div className="skeleton-light h-5 w-80 max-w-full rounded mx-auto" />
                </div>

                {/* 3 cards: 1 large (2×2) + 2 tall */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Large card: spans 2 cols, 2 rows */}
                    <div className="md:col-span-2 md:row-span-2 h-[420px] sm:h-112.5 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-indigo-100 bg-linear-to-br from-indigo-50/50 via-white to-violet-50/50">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3">
                            <div className="skeleton-light w-9 h-9 sm:w-10 sm:h-10 rounded-xl" />
                            <div className="skeleton-light h-6 w-40 rounded" />
                        </div>
                        <div className="skeleton-light h-4 w-64 rounded mb-4" />
                        <div className="skeleton-light w-full h-[280px] sm:h-[310px] rounded-xl" />
                    </div>

                    {/* Tall card 1 */}
                    <div className="h-[420px] sm:h-112.5 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-emerald-200 bg-linear-to-br from-emerald-50/50 via-white to-green-50/50">
                        <div className="skeleton-light w-11 h-11 sm:w-12 sm:h-12 rounded-xl mb-3 sm:mb-4" />
                        <div className="skeleton-light h-5 w-28 rounded mb-2" />
                        <div className="skeleton-light h-4 w-full rounded mb-4" />
                        <div className="skeleton-light w-full h-[240px] rounded-xl mb-3" />
                        <div className="skeleton-light h-4 w-32 rounded" />
                    </div>

                    {/* Tall card 2 */}
                    <div className="h-[420px] sm:h-112.5 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-red-100 bg-linear-to-br from-red-50/50 via-white to-orange-50/50">
                        <div className="skeleton-light w-11 h-11 sm:w-12 sm:h-12 rounded-xl mb-3 sm:mb-4" />
                        <div className="skeleton-light h-5 w-28 rounded mb-2" />
                        <div className="skeleton-light h-4 w-full rounded mb-4" />
                        <div className="skeleton-light w-full h-[240px] rounded-xl mb-3" />
                        <div className="skeleton-light h-4 w-32 rounded" />
                    </div>
                </div>
            </div>
        </section>
    </div>
)

// Shadows feed page
export const ShadowsFeedSkeleton = () => (
    <div className="min-h-screen bg-[#050505]">
        <div className="relative z-10 px-6 md:px-12 lg:pl-6 pt-28 pb-20 lg:px-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="skeleton w-6 h-6 rounded" />
                        <div className="skeleton h-8 w-40 rounded" />
                    </div>
                    <div className="skeleton h-4 w-56 rounded mx-auto" />
                </div>

                {/* Shadow Input Composer */}
                <div className="mb-6">
                    <div className="bg-[#09090b] border border-emerald-900/30 rounded-2xl overflow-hidden">
                        <div className="px-4 py-3 border-b bg-emerald-950/20 border-emerald-900/30">
                            <div className="flex items-center justify-between">
                                <div className="skeleton h-3 w-28 rounded" />
                                <div className="skeleton h-5 w-20 rounded" />
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="skeleton h-24 w-full rounded-xl" />
                        </div>
                        <div className="flex items-center justify-between px-4 py-3 border-t bg-emerald-950/10 border-emerald-900/30">
                            <div className="flex items-center gap-4">
                                <div className="skeleton h-5 w-5 rounded" />
                                <div className="skeleton h-5 w-5 rounded" />
                            </div>
                            <div className="skeleton h-9 w-28 rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* Shadow Feed */}
                <ShadowListSkeleton count={5} />
            </div>
        </div>
    </div>
)

// Exports
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
    ShadowsFeedSkeleton,
    LibraryPageSkeleton,
    TrendingPageSkeleton,
    AuthFormSkeleton,
    ChangePasswordSkeleton,
    SettingsPageSkeleton,
    ContentPageSkeleton,
    ContactPageSkeleton,
    AboutPageSkeleton,
    KillSwitchSkeleton,
    UploadPageSkeleton,
    CustomizePageSkeleton,
    HomePageSkeleton,
    LandingPageSkeleton
}

