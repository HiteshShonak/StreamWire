import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Play, Ghost, MoreHorizontal, Eye, EyeOff, Trash2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { formatViews, formatDuration } from '../../utils/formatters'

const DashboardVideoCard = ({ video, onToggleStealth, onDelete, isStealth }) => {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
        group relative bg-zinc-900/50 rounded-xl overflow-hidden border transition-all
        ${isStealth || video.isStealthMode
                    ? 'border-green-500/20 hover:border-green-500/40'
                    : 'border-zinc-800 hover:border-zinc-700'
                }
      `}
        >
            {/* Thumbnail */}
            <div
                className="relative aspect-video cursor-pointer"
                onClick={() => navigate(`/cinema/${video._id}`)}
            >
                <img
                    src={video.thumbnail?.url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-12 h-12 text-white" />
                </div>

                {/* Duration Badge */}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-bold text-white">
                    {formatDuration(video.duration)}
                </div>

                {/* Stealth Badge */}
                {video.isStealthMode && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-green-500/90 rounded-lg flex items-center gap-1">
                        <Ghost className="w-3 h-3 text-white" />
                        <span className="text-[10px] font-bold text-white">STEALTH</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                    <h4
                        className="text-sm font-medium text-white line-clamp-2 cursor-pointer hover:text-indigo-300 transition-colors"
                        onClick={() => navigate(`/cinema/${video._id}`)}
                    >
                        {video.title}
                    </h4>

                    {/* Menu Button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1 text-zinc-500 hover:text-white transition-colors"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {/* Dropdown */}
                        <AnimatePresence>
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50 w-40"
                                    >
                                        <button
                                            onClick={() => {
                                                onToggleStealth.mutate({ videoId: video._id, currentStealth: video.isStealthMode });
                                                setShowMenu(false);
                                            }}
                                            className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors ${video.isStealthMode
                                                    ? 'text-sky-400 hover:bg-sky-500/10'
                                                    : 'text-green-400 hover:bg-green-500/10'
                                                }`}
                                        >
                                            {video.isStealthMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            {video.isStealthMode ? 'Make Public' : 'Go Stealth'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Delete this video permanently?')) {
                                                    onDelete.mutate(video._id);
                                                }
                                                setShowMenu(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <p className="text-xs text-zinc-500 mt-2">
                    {formatViews(video.views)} views • {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                </p>
            </div>
        </motion.div>
    );
}

export default DashboardVideoCard
