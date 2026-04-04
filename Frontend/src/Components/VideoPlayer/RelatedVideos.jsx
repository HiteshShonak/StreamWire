import React from 'react'
import { motion } from 'framer-motion'
import { Film } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { formatViews, formatDuration } from '../../utils/formatters'

const RelatedVideos = React.memo(({
    recommendedData,
    isStealthMode,
    displayName,
    navigate,
    currentVideoId // to filter out current video
}) => {
    if (isStealthMode) return null;

    const validRecommendations = recommendedData?.videos?.filter(v => v._id !== currentVideoId) || [];

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Film className="w-5 h-5 text-rose-400" />
                <h2 className="text-lg font-bold text-white">More from {displayName}</h2>
            </div>

            <div className="space-y-3">
                {validRecommendations.slice(0, 8).map((recVideo) => (
                    <motion.div
                        key={recVideo._id}
                        whileHover={{ x: 4 }}
                        onClick={() => navigate(`/cinema/${recVideo._id}`)}
                        className="flex gap-3 cursor-pointer group p-2 -mx-2 rounded-lg hover:bg-zinc-900/50 transition-colors"
                    >
                        <div className="relative w-36 md:w-40 aspect-video rounded-lg overflow-hidden shrink-0 bg-zinc-900">
                            <img
                                src={recVideo.thumbnail?.url}
                                alt={recVideo.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-bold text-white">
                                {formatDuration(recVideo.duration)}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                            <h4 className="text-sm font-medium text-white line-clamp-2 mb-1.5 group-hover:text-rose-300 transition-colors">
                                {recVideo.title}
                            </h4>
                            <p className="text-xs text-zinc-500 mb-0.5">
                                {formatViews(recVideo.views)} views
                            </p>
                            <p className="text-xs text-zinc-600">
                                {formatDistanceToNow(new Date(recVideo.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    </motion.div>
                ))}

                {validRecommendations.length === 0 && (
                    <div className="text-center py-8">
                        <Film className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                        <p className="text-sm text-zinc-500">No more videos from this creator</p>
                    </div>
                )}
            </div>
        </div>
    )
})

export default RelatedVideos
