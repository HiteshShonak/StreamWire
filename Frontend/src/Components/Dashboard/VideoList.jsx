import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Film } from 'lucide-react'
import DashboardVideoCard, { UploadingGhostCard } from './DashboardVideoCard'
import { VideoGridSkeleton } from '../../Components/Common/Skeleton'
import { useUpload } from '../../context/UploadContext'

const VideoList = ({
    allVideos,
    videosLoading,
    navigate,
    toggleVideoStealthMutation,
    deleteVideoMutation
}) => {
    const { pendingUploads } = useUpload()

    return (
        <motion.div
            key="videos"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-white">All Videos</h2>
                    {pendingUploads.filter(u => u.status !== 'done').length > 0 && (
                        <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs font-bold text-indigo-400 animate-pulse">
                            {pendingUploads.filter(u => u.status !== 'done').length} uploading…
                        </span>
                    )}
                </div>
                <button
                    onClick={() => navigate('/upload')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-bold text-sm transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Upload New
                </button>
            </div>

            {videosLoading ? (
                <VideoGridSkeleton count={8} />
            ) : allVideos.length === 0 && pendingUploads.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
                    <Film className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No videos yet</h3>
                    <p className="text-zinc-500 mb-6">Upload your first video to get started</p>
                    <button
                        onClick={() => navigate('/upload')}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all"
                    >
                        Upload Video
                    </button>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {/* Ghost uploading cards at top */}
                    <AnimatePresence>
                        {pendingUploads.filter(u => u.status !== 'done').map(upload => (
                            <UploadingGhostCard key={`ghost-${upload.id}`} upload={upload} />
                        ))}
                    </AnimatePresence>

                    {/* Real video cards */}
                    {allVideos.map((video) => (
                        <DashboardVideoCard
                            key={video._id}
                            video={video}
                            onToggleStealth={toggleVideoStealthMutation}
                            onDelete={deleteVideoMutation}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    )
}

export default VideoList
