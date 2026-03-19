import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Play, Ghost, MoreHorizontal, Eye, EyeOff, Trash2, Upload, AlertTriangle, X, RefreshCw } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { formatViews, formatDuration } from '../../utils/formatters'
import { useUpload } from '../../context/UploadContext'

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteModal({ title, onConfirm, onCancel }) {
    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center px-4"
            onClick={onCancel}
        >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                className="relative z-10 w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {/* Icon */}
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>

                <h3 className="text-lg font-bold text-white text-center mb-1">Delete Video?</h3>
                <p className="text-sm text-zinc-400 text-center mb-6 line-clamp-2">
                    <span className="text-zinc-300 font-medium">"{title}"</span> will be permanently deleted.
                    This cannot be undone.
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all font-semibold text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>

                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all"
                >
                    <X className="w-4 h-4" />
                </button>
            </motion.div>
        </motion.div>,
        document.body
    )
}

// ─── Uploading Ghost Card ─────────────────────────────────────────────────────

function UploadingGhostCard({ upload }) {
    const { retryUpload, dismissUpload } = useUpload()
    const navigate = useNavigate()
    const isError = upload.status === 'error'

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={() => navigate(`/uploading/${upload.id}`)}
            className={`relative rounded-xl overflow-hidden border cursor-pointer hover:border-indigo-500/50 transition-colors ${
                isError ? 'border-red-500/30 bg-red-950/20' : 'border-indigo-500/30 bg-indigo-950/10'
            }`}
        >
            {/* Thumbnail area */}
            <div className="relative aspect-video bg-zinc-900/80 overflow-hidden">
                {upload.thumbnailUrl ? (
                    <img src={upload.thumbnailUrl} alt="Uploading" className="w-full h-full object-cover opacity-40" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Upload className={`w-10 h-10 ${isError ? 'text-red-500/50' : 'text-indigo-500/50'}`} />
                    </div>
                )}

                {/* Status badge */}
                <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg flex items-center gap-1.5 text-[10px] font-bold ${isError ? 'bg-red-500/90' : 'bg-indigo-600/90'}`}>
                    {isError ? (
                        <><AlertTriangle className="w-3 h-3" /> FAILED</>
                    ) : (
                        <><Upload className="w-3 h-3 animate-bounce" /> UPLOADING</>
                    )}
                </div>

                {/* Progress bar overlay */}
                {!isError && upload.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${upload.progress}%` }}
                            transition={{ duration: 0.4, ease: 'easeOut' }}
                            className="h-full bg-indigo-500"
                        />
                    </div>
                )}

                {/* Shimmer overlay when uploading */}
                {!isError && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent animate-pulse" />
                )}
            </div>

            {/* Info */}
            <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-white line-clamp-2">{upload.title}</p>

                    <button
                        onClick={(e) => { e.stopPropagation(); dismissUpload(upload.id); }}
                        className="p-1 text-zinc-600 hover:text-zinc-400 transition-colors flex-shrink-0"
                        title="Dismiss"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                {isError ? (
                    <button
                        onClick={(e) => { e.stopPropagation(); retryUpload(upload.id); }}
                        className="mt-2 flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors font-medium"
                    >
                        <RefreshCw className="w-3 h-3" /> Retry upload
                    </button>
                ) : (
                    <p className="text-xs text-indigo-400 mt-1">
                        {upload.progress > 0 ? `${upload.progress}% uploaded` : 'Preparing…'}
                    </p>
                )}
            </div>
        </motion.div>
    )
}

// ─── Main DashboardVideoCard ──────────────────────────────────────────────────

const DashboardVideoCard = ({ video, onToggleStealth, onDelete, isStealth }) => {
    const navigate = useNavigate()
    const [showMenu, setShowMenu] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const handleDelete = () => {
        setShowDeleteModal(false)
        setShowMenu(false)
        onDelete.mutate(video._id)
    }

    return (
        <>
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group relative bg-zinc-900/50 rounded-xl border transition-all z-10 hover:z-20 ${
                isStealth || video.isStealthMode
                    ? 'border-green-500/20 hover:border-green-500/40'
                    : 'border-zinc-800 hover:border-zinc-700'
            }`}
        >
            {/* Thumbnail */}
            <div className="relative aspect-video cursor-pointer" onClick={() => navigate(`/cinema/${video._id}`)}>
                <img
                    src={video.thumbnail?.url}
                    alt={video.title}
                    className="w-full h-full object-cover rounded-t-xl"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-t-xl">
                    <Play className="w-12 h-12 text-white drop-shadow" />
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-[10px] font-bold text-white">
                    {formatDuration(video.duration)}
                </div>

                {/* Stealth badge */}
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

                    {/* Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-1 text-zinc-500 hover:text-white transition-colors rounded"
                        >
                            <MoreHorizontal className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.12 }}
                                        className="absolute right-0 top-full mt-1 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50 w-44"
                                    >
                                        {/* Stealth toggle */}
                                        <button
                                            onClick={() => {
                                                onToggleStealth.mutate({ videoId: video._id, currentStealth: video.isStealthMode })
                                                setShowMenu(false)
                                            }}
                                            className={`w-full px-4 py-2.5 text-left text-sm flex items-center gap-2 transition-colors ${
                                                video.isStealthMode
                                                    ? 'text-sky-400 hover:bg-sky-500/10'
                                                    : 'text-green-400 hover:bg-green-500/10'
                                            }`}
                                        >
                                            {video.isStealthMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            {video.isStealthMode ? 'Make Public' : 'Go Stealth'}
                                        </button>

                                        <div className="h-px bg-zinc-800 mx-2" />

                                        {/* Delete */}
                                        <button
                                            onClick={() => { setShowDeleteModal(true); setShowMenu(false) }}
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
                    {formatViews(video.views)} views · {formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}
                </p>
            </div>
        </motion.div>

        {/* Delete confirmation modal via portal */}
        <AnimatePresence>
            {showDeleteModal && (
                <DeleteModal
                    title={video.title}
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
        </AnimatePresence>
        </>
    )
}

export { UploadingGhostCard }
export default DashboardVideoCard
