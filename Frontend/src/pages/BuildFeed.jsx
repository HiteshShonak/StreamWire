import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check, X, Search, TrendingUp, Film, ArrowLeft, Save, RefreshCw, Hash, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import Header from '../Components/Header'
import Sidebar from '../Components/Sidebar'
import { videoService } from '../api/services/video.service'
import { TagGridSkeleton } from '../Components/Common/Skeleton'

export default function BuildFeed() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const { userData } = useSelector((state) => state.auth)

    const [selectedTags, setSelectedTags] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [customTag, setCustomTag] = useState('')
    const [isInitialized, setIsInitialized] = useState(false)

    // Redirect if not logged in
    useEffect(() => {
        if (!userData) {
            toast.error('Please sign in to build your feed')
            navigate('/login')
        }
    }, [userData, navigate])

    // Fetch current feed preferences
    const { data: currentPrefs, isLoading: prefsLoading, refetch: refetchPrefs } = useQuery({
        queryKey: ['feed-preferences'],
        queryFn: () => videoService.getFeedPreferences(),
        enabled: !!userData,
        staleTime: 0,
    })

    // Fetch popular tags (50 tags from trending videos)
    const { data: popularTagsData, isLoading: tagsLoading } = useQuery({
        queryKey: ['popular-tags'],
        queryFn: () => videoService.getPopularTags(50),
        enabled: !!userData
    })

    // Fetch all available tags for search
    const { data: allTagsData } = useQuery({
        queryKey: ['all-tags'],
        queryFn: () => videoService.getAllTags(),
        enabled: !!userData
    })

    // Initialize selected tags
    useEffect(() => {
        if (currentPrefs && !isInitialized) {
            const tags = currentPrefs.feedPreferences || currentPrefs || []
            if (Array.isArray(tags) && tags.length > 0) {
                setSelectedTags(tags)
            }
            setIsInitialized(true)
        }
    }, [currentPrefs, isInitialized])

    // Save preferences mutation
    const saveMutation = useMutation({
        mutationFn: (tags) => videoService.updateFeedPreferences(tags),
        onSuccess: () => {
            toast.success('Feed preferences saved!')
            queryClient.invalidateQueries(['feed-preferences'])
            queryClient.invalidateQueries(['videos'])
            navigate('/cinema')
        },
        onError: (err) => toast.error(err.message || 'Failed to save preferences')
    })

    // Build from history mutation
    const buildMutation = useMutation({
        mutationFn: () => videoService.buildFeed(),
        onSuccess: (data) => {
            const tags = data?.feedPreferences || data || []
            if (Array.isArray(tags) && tags.length > 0) {
                setSelectedTags(tags)
                toast.success(`Built feed with ${tags.length} tags!`)
            } else {
                toast.info('No watch history found. Watch some videos first!')
            }
            refetchPrefs()
        },
        onError: (err) => toast.error(err.message || 'Failed to build feed')
    })

    const popularTags = popularTagsData?.tags || []
    const allTags = allTagsData?.tags || []

    // Filter tags based on search
    const getFilteredTags = () => {
        if (searchQuery) {
            return allTags.filter(tag =>
                typeof tag === 'string' && tag.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }
        return popularTags.map(t => typeof t === 'object' ? t.tag : t).filter(Boolean)
    }

    const filteredTags = getFilteredTags()

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag))
        } else if (selectedTags.length < 20) {
            setSelectedTags([...selectedTags, tag])
        } else {
            toast.error('Maximum 20 tags allowed')
        }
    }

    const removeTag = (tag) => setSelectedTags(selectedTags.filter(t => t !== tag))
    const clearAllTags = () => { setSelectedTags([]); toast.success('Cleared all tags') }

    const addCustomTag = () => {
        const tag = customTag.trim()
        if (!tag) return
        if (selectedTags.includes(tag)) { toast.error('Tag already added'); return }
        if (selectedTags.length >= 20) { toast.error('Maximum 20 tags allowed'); return }
        setSelectedTags([...selectedTags, tag])
        setCustomTag('')
    }

    if (!userData) return null

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-indigo-500/30">
            <Header variant="cinema" />
            <Sidebar />

            {/* Main Content - Responsive padding */}
            <div className="pt-16 sm:pt-20 px-4 sm:px-6 md:px-8 lg:pl-[280px] xl:pl-[300px] pb-32">

                {/* Back Button */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate('/cinema')}
                    className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-6 sm:mb-8 text-sm sm:text-base"
                >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline">Back to Cinema</span>
                    <span className="sm:hidden">Back</span>
                </motion.button>

                {/* Hero Section - Cinematic Style */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative mb-8 sm:mb-12"
                >
                    {/* Gradient Orb Background - Subtle Indigo */}
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative text-center">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4 sm:mb-6"
                        >
                            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
                            <span className="text-[10px] sm:text-xs font-bold text-indigo-300 uppercase tracking-[0.15em] sm:tracking-[0.2em]">
                                Personalize
                            </span>
                        </motion.div>

                        <h1 className="text-[clamp(1.75rem,5vw,3.5rem)] font-black text-white mb-3 sm:mb-4 leading-tight">
                            Build Your <span className="text-indigo-400">Feed</span>
                        </h1>

                        <p className="text-zinc-400 text-[clamp(0.875rem,2vw,1.125rem)] max-w-xl mx-auto leading-relaxed px-4">
                            Select up to 20 tags to personalize your "For You" recommendations
                        </p>
                    </div>
                </motion.div>

                {/* Loading State */}
                {prefsLoading && (
                    <div className="py-16">
                        <div className="skeleton h-8 w-40 rounded mb-8" />
                        <TagGridSkeleton count={12} />
                    </div>
                )}

                {!prefsLoading && (
                    <>
                        {/* Your Current Tags - Glass Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="relative mb-6 sm:mb-8 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-zinc-900/50 border border-zinc-800 overflow-hidden"
                        >
                            {/* Subtle gradient accent */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

                            <div className="flex items-center justify-between gap-3 flex-wrap mb-4 sm:mb-5">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                        <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
                                    </div>
                                    <h3 className="text-sm sm:text-base font-bold text-white">
                                        Your Tags
                                        <span className={`ml-1.5 text-xs font-normal ${selectedTags.length >= 20 ? 'text-amber-400' : 'text-zinc-500'}`}>
                                            ({selectedTags.length}/20)
                                        </span>
                                    </h3>
                                </div>

                                <div className="flex gap-2 sm:gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => buildMutation.mutate()}
                                        disabled={buildMutation.isPending}
                                        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-semibold transition-all disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${buildMutation.isPending ? 'animate-spin' : ''}`} />
                                        <span>{buildMutation.isPending ? 'Building...' : 'From History'}</span>
                                    </motion.button>

                                    {selectedTags.length > 0 && (
                                        <button
                                            onClick={clearAllTags}
                                            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-zinc-400 hover:text-white text-xs sm:text-sm font-medium transition-all"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Selected Tags */}
                            {selectedTags.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    <AnimatePresence mode="popLayout">
                                        {selectedTags.map(tag => (
                                            <motion.button
                                                key={tag}
                                                layout
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                onClick={() => removeTag(tag)}
                                                className="group flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 text-xs sm:text-sm font-medium hover:bg-red-500/15 hover:border-red-500/30 hover:text-red-200 transition-all"
                                            >
                                                <span>{tag}</span>
                                                <X className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                                            </motion.button>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-6 sm:py-8 text-center">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mb-3 sm:mb-4">
                                        <Film className="w-6 h-6 sm:w-8 sm:h-8 text-zinc-600" />
                                    </div>
                                    <p className="text-zinc-500 text-xs sm:text-sm mb-1">No tags selected</p>
                                    <p className="text-zinc-600 text-[10px] sm:text-xs">Click "From History" or select tags below</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Search & Add Custom */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8"
                        >
                            <div className="relative">
                                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Search tags..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.04] transition-all"
                                />
                            </div>

                            <div className="flex gap-2 sm:gap-3">
                                <input
                                    type="text"
                                    placeholder="Custom tag..."
                                    value={customTag}
                                    onChange={(e) => setCustomTag(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addCustomTag()}
                                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-all"
                                />
                                <button
                                    onClick={addCustomTag}
                                    disabled={!customTag.trim()}
                                    className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    Add
                                </button>
                            </div>
                        </motion.div>

                        {/* Popular Tags Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <div className="flex items-center gap-2 mb-4 sm:mb-5">
                                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                                <h3 className="text-base sm:text-lg font-bold text-white">
                                    {searchQuery ? 'Search Results' : 'Trending Tags'}
                                </h3>
                                <span className="text-xs text-zinc-600">
                                    ({filteredTags.length})
                                </span>
                            </div>

                            {tagsLoading ? (
                                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3">
                                    {[...Array(21)].map((_, i) => (
                                        <div key={i} className="h-10 sm:h-11 rounded-xl bg-zinc-800/50 animate-pulse" />
                                    ))}
                                </div>
                            ) : filteredTags.length > 0 ? (
                                <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3">
                                    {filteredTags.map(tag => {
                                        const isSelected = selectedTags.includes(tag)
                                        const tagData = popularTags.find(t => (typeof t === 'object' ? t.tag : t) === tag)
                                        const count = typeof tagData === 'object' ? tagData.count : null

                                        return (
                                            <motion.button
                                                key={tag}
                                                whileHover={{ scale: 1.03 }}
                                                whileTap={{ scale: 0.97 }}
                                                onClick={() => toggleTag(tag)}
                                                className={`relative flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all truncate ${isSelected
                                                    ? 'bg-indigo-600 text-white border border-indigo-500'
                                                    : 'bg-zinc-900/50 hover:bg-zinc-800/50 border border-zinc-800 hover:border-indigo-500/30 text-zinc-300 hover:text-white'
                                                    }`}
                                            >
                                                {isSelected && <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />}
                                                <span className="truncate">{tag}</span>
                                                {count && !isSelected && (
                                                    <span className="text-[10px] text-zinc-600 flex-shrink-0">·{count}</span>
                                                )}
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center py-12 text-center">
                                    <Film className="w-10 h-10 text-zinc-700 mb-3" />
                                    <p className="text-zinc-500 text-sm">
                                        {searchQuery ? 'No tags match your search' : 'No tags available'}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}

                {/* Floating Save Button */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 md:right-8 lg:right-12 z-50"
                >
                    <motion.button
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => saveMutation.mutate(selectedTags)}
                        disabled={saveMutation.isPending}
                        className="flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white font-bold text-sm sm:text-base shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                    >
                        {saveMutation.isPending ? (
                            <LoadingDots size="md" />
                        ) : (
                            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                        {saveMutation.isPending ? 'Saving...' : 'Save Feed'}
                    </motion.button>
                </motion.div>
            </div>
        </div>
    )
}
