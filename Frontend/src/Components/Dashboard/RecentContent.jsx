

import React from 'react'
import { Link } from 'react-router-dom'
import { Film, ChevronRight, Video, MessageSquare, Ghost } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { formatViews } from '../../utils/formatters'

const RecentContent = ({
    allVideos, // used for preview
    allWires,  // used for preview
    navigate,
    setActiveSection
}) => {
    return (
        <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Videos */}
            <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <Film className="w-5 h-5 text-zinc-400" />
                        Recent Videos
                    </h3>
                    <button
                        onClick={() => setActiveSection('videos')}
                        className="text-sm text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                        View all <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-3">
                    {allVideos.slice(0, 4).map((video) => (
                        <div
                            key={video._id}
                            onClick={() => navigate(`/cinema/${video._id}`)}
                            className="flex gap-3 p-2 -mx-2 rounded-lg hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                        >
                            <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-zinc-800 shrink-0">
                                <img src={video.thumbnail?.url} alt={video.title} className="w-full h-full object-cover" />
                                {video.isStealthMode && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <Ghost className="w-4 h-4 text-green-500" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-white truncate group-hover:text-zinc-200 transition-colors">
                                    {video.title}
                                </h4>
                                <p className="text-xs text-zinc-500 mt-1">
                                    {formatViews(video.views)} views • {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {allVideos.length === 0 && (
                        <div className="text-center py-8">
                            <Video className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                            <p className="text-sm text-zinc-500">No videos yet</p>
                            <button
                                onClick={() => navigate('/upload')}
                                className="mt-3 text-sm text-zinc-400 hover:text-white"
                            >
                                Upload your first video
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Wires */}
            <div className="p-6 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-zinc-400" />
                        Recent Wires
                    </h3>
                    <button
                        onClick={() => setActiveSection('wires')}
                        className="text-sm text-zinc-400 hover:text-white flex items-center gap-1"
                    >
                        View all <ChevronRight className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-3">
                    {allWires.slice(0, 4).map((wire) => (
                        <div
                            key={wire._id}
                            onClick={() => navigate(`/wire/${wire._id}`)}
                            className="p-3 -mx-2 rounded-lg hover:bg-zinc-800/50 cursor-pointer transition-colors group"
                        >
                            <div className="flex items-start gap-2">
                                {wire.isStealthMode && <Ghost className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />}
                                <p className="text-sm text-zinc-300 line-clamp-2 group-hover:text-white transition-colors">
                                    {wire.content}
                                </p>
                            </div>
                            <p className="text-xs text-zinc-600 mt-2">
                                {wire.likesCount || 0} likes • {wire.commentsCount || 0} comments
                            </p>
                        </div>
                    ))}

                    {allWires.length === 0 && (
                        <div className="text-center py-8">
                            <MessageSquare className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                            <p className="text-sm text-zinc-500">No wires yet</p>
                            <Link to="/wire" className="mt-3 text-sm text-zinc-400 hover:text-white block">
                                Post your first wire
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default RecentContent
