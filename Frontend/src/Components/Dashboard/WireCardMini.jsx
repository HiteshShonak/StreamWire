import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Ghost, Heart, MessageSquare, Eye, EyeOff, Trash2, AlertTriangle, X } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteModal({ onConfirm, onCancel }) {
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
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-white text-center mb-1">Delete Wire?</h3>
                <p className="text-sm text-zinc-400 text-center mb-6">
                    This wire will be permanently deleted and cannot be undone.
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all font-semibold text-sm">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2">
                        <Trash2 className="w-4 h-4" /> Delete
                    </button>
                </div>
                <button onClick={onCancel} className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all">
                    <X className="w-4 h-4" />
                </button>
            </motion.div>
        </motion.div>,
        document.body
    )
}

// ─── WireCardMini ─────────────────────────────────────────────────────────────

const WireCardMini = ({ wire, onToggleStealth, onDelete, isStealth }) => {
    const navigate = useNavigate()
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const handleDelete = () => {
        setShowDeleteModal(false)
        onDelete()
    }

    return (
        <>
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                isStealth || wire.isStealthMode
                    ? 'bg-green-500/5 border-green-500/20 hover:border-green-500/40'
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
            }`}
            onClick={() => navigate(`/wire/${wire._id}`)}
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        {wire.isStealthMode && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 rounded-full">
                                <Ghost className="w-3 h-3 text-green-500" />
                                <span className="text-[10px] font-bold text-green-400">STEALTH</span>
                            </span>
                        )}
                        <span className="text-xs text-zinc-600">
                            {formatDistanceToNow(new Date(wire.createdAt), { addSuffix: true })}
                        </span>
                    </div>

                    <p className="text-sm text-zinc-300 line-clamp-2 group-hover:text-white transition-colors">
                        {wire.content}
                    </p>

                    <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {wire.likesCount || 0}
                        </span>
                        <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> {wire.commentsCount || 0}
                        </span>
                    </div>
                </div>

                {/* Actions — visible on hover */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                    <button
                        onClick={onToggleStealth}
                        className={`p-2 rounded-lg transition-colors ${wire.isStealthMode ? 'text-sky-400 hover:bg-sky-500/10' : 'text-green-400 hover:bg-green-500/10'}`}
                        title={wire.isStealthMode ? 'Make Public' : 'Go Stealth'}
                    >
                        {wire.isStealthMode ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>

        <AnimatePresence>
            {showDeleteModal && (
                <DeleteModal
                    onConfirm={handleDelete}
                    onCancel={() => setShowDeleteModal(false)}
                />
            )}
        </AnimatePresence>
        </>
    )
}

export default WireCardMini
