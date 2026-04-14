import { useEffect, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react'

export default function ImageLightbox({ src, alt = 'Image', onClose }) {
    const [isZoomed, setIsZoomed] = useState(false)

    const handleKey = useCallback((e) => {
        if (e.key === 'Escape') onClose()
        if (e.key === 'z' || e.key === 'Z') setIsZoomed(z => !z)
    }, [onClose])

    useEffect(() => {
        document.addEventListener('keydown', handleKey)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', handleKey)
            document.body.style.overflow = ''
        }
    }, [handleKey])

    const handleDownload = (e) => {
        e.stopPropagation()
        const a = document.createElement('a')
        a.href = src
        a.download = alt || 'image'
        a.click()
    }

    return createPortal(
        // Backdrop: fixed, covers everything including Header + Sidebar
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center"
            onClick={onClose}
        >
            {/* Dark frosted background */}
            <div className="absolute inset-0 bg-black/92 backdrop-blur-xl" />

            {/* Top bar */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.2 }}
                className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-4"
                onClick={e => e.stopPropagation()}
            >
                <span className="text-zinc-500 text-xs font-medium tracking-wide select-none">
                    Click outside or{' '}
                    <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400 font-mono text-[10px]">ESC</kbd>
                    {' '}to close
                </span>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsZoomed(z => !z)}
                        className="p-2 rounded-full bg-zinc-900/80 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                        title={isZoomed ? 'Zoom out (Z)' : 'Zoom in (Z)'}
                    >
                        {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                    </button>

                    <button
                        onClick={handleDownload}
                        className="p-2 rounded-full bg-zinc-900/80 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
                        title="Download"
                    >
                        <Download className="w-4 h-4" />
                    </button>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-full bg-zinc-900/80 border border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 transition-all"
                        title="Close (ESC)"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>

            {/* Image: spring entrance, click to zoom */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="relative z-10"
                onClick={e => e.stopPropagation()}
            >
                <motion.img
                    src={src}
                    alt={alt}
                    animate={{ scale: isZoomed ? 1.85 : 1 }}
                    transition={{ type: 'spring', stiffness: 240, damping: 22 }}
                    onClick={() => setIsZoomed(z => !z)}
                    className={`
                        max-h-[88vh] max-w-[92vw] object-contain rounded-xl
                        shadow-2xl shadow-black/80 ring-1 ring-white/5
                        ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}
                    `}
                    draggable={false}
                />
            </motion.div>

            {/* Zoom-out badge */}
            <AnimatePresence>
                {isZoomed && (
                    <motion.div
                        key="zoom-badge"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-700/50 text-xs text-zinc-400 font-medium select-none pointer-events-none"
                    >
                        Click image to zoom out · Press Z to toggle
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>,
        document.body
    )
}


