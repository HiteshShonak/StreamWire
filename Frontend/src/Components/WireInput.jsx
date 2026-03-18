import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { tweetService } from '../api/services/tweet.service'
import { Image as ImageIcon, Send, X, BarChart2, Ghost, Plus } from 'lucide-react'
import { LoadingDots } from './Common/LoadingIndicator'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { compressImage, isValidImage } from '../utils/imageCompressor'

export default function WireInput({ onSuccess }) {
    const [content, setContent] = useState("")
    const [images, setImages] = useState([])
    const [isStealth, setIsStealth] = useState(false)
    const [isUploadingImage, setIsUploadingImage] = useState(false)
    const [isDragging, setIsDragging] = useState(false)

    // Poll State
    const [showPoll, setShowPoll] = useState(false)
    const [pollQuestion, setPollQuestion] = useState("")
    const [pollOptions, setPollOptions] = useState(["", ""]) // Start with 2 empty options

    const fileInputRef = useRef(null)

    // Limits
    const MAX_CHARS = 500
    const MAX_IMAGES = 1

    // Mutation
    const createMutation = useMutation({
        mutationFn: (payload) => {
            const formData = new FormData()
            formData.append('content', payload.content)
            formData.append('isStealthMode', payload.isStealthMode)

            // Append image file if present (single file only)
            if (payload.images && payload.images.length > 0) {
                formData.append('image', payload.images[0].file)
            }

            // Append poll data if present
            if (payload.isPoll) {
                formData.append('isPoll', payload.isPoll)
                formData.append('pollQuestion', payload.pollQuestion)
                formData.append('pollOptions', JSON.stringify(payload.pollOptions))
            }

            return tweetService.createTweet(formData)
        },
        onSuccess: () => {
            resetForm()
            toast.success(isStealth ? "Stealth signal sent" : "Wire transmitted!")
            if (onSuccess) onSuccess()
        },
        onError: (err) => {
            console.error('WireInput - Mutation error:', err);
            toast.error(err.message || "Transmission failed")
        }
    })

    const resetForm = () => {
        setContent("")
        // Revoke all blob URLs to free memory before clearing
        setImages(prev => { prev.forEach(img => URL.revokeObjectURL(img.url)); return [] })
        setIsStealth(false)
        setShowPoll(false)
        setPollQuestion("")
        setPollOptions(["", ""])
    }

    // Core file processing — shared by file picker and drag-and-drop
    const processFiles = async (rawFiles) => {
        const files = Array.from(rawFiles)

        if (images.length + files.length > MAX_IMAGES) {
            toast.error(`Maximum ${MAX_IMAGES} image allowed`)
            return
        }

        try {
            const validFiles = files.filter(file => {
                if (!isValidImage(file)) {
                    toast.error(`${file.name} is not a valid image type`)
                    return false
                }
                if (file.size > 10 * 1024 * 1024) {
                    toast.error(`${file.name} exceeds 10MB limit`)
                    return false
                }
                return true
            })

            if (validFiles.length === 0) return

            setIsUploadingImage(true)
            const uploadToast = toast.loading('Processing image...')

            const compressedFiles = await Promise.all(
                validFiles.map(file => compressImage(file, { maxWidth: 1800, quality: 0.85 }))
            )

            setIsUploadingImage(false)
            toast.dismiss(uploadToast)
            toast.success('Image ready')

            // Store file + pre-computed URL (created once, not per-render)
            const newEntries = compressedFiles.map(file => ({
                file,
                url: URL.createObjectURL(file)
            }))
            setImages(prev => [...prev, ...newEntries])

            if (showPoll) setShowPoll(false)
        } catch (error) {
            setIsUploadingImage(false)
            console.error('Image compression error:', error)
            toast.error(error.message || 'Failed to process image')
        }
    }

    // File picker onChange
    const handleImageUpload = async (e) => {
        await processFiles(e.target.files)
        e.target.value = ''
    }

    // Drag-and-drop handlers
    const handleDragEnter = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (images.length < MAX_IMAGES && !showPoll) setIsDragging(true)
    }
    const handleDragOver = (e) => {
        e.preventDefault()
        e.stopPropagation()
    }
    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        // Only clear drag state when leaving the container entirely
        if (!e.currentTarget.contains(e.relatedTarget)) setIsDragging(false)
    }
    const handleDrop = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
        if (showPoll) {
            toast.error('Cannot add image with poll')
            return
        }
        const dropped = e.dataTransfer.files
        if (dropped?.length) await processFiles(dropped)
    }

    const removeImage = (index) => {
        setImages(prev => {
            // Revoke URL for the removed entry to free memory
            if (prev[index]) URL.revokeObjectURL(prev[index].url)
            return prev.filter((_, i) => i !== index)
        })
        // Reset the file input so the same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    // Poll Handling
    const handleAddOption = () => {
        if (pollOptions.length >= 4) return toast.error("Max 4 options allowed")
        setPollOptions([...pollOptions, ""])
    }

    const handleRemoveOption = (index) => {
        if (pollOptions.length <= 2) return
        setPollOptions(pollOptions.filter((_, i) => i !== index))
    }

    const handleOptionChange = (index, value) => {
        const newOptions = [...pollOptions]
        newOptions[index] = value
        setPollOptions(newOptions)
    }

    const togglePoll = () => {
        if (images.length > 0) {
            toast.error("Remove image to add a poll")
            return
        }
        setShowPoll(!showPoll)
    }

    // Submission
    const handleSubmit = () => {
        if (!content.trim()) return

        const payload = {
            content,
            images,
            isStealthMode: isStealth
        }

        if (showPoll) {
            if (!pollQuestion.trim()) return toast.error("Poll question is required")
            const validOptions = pollOptions.filter(o => o.trim())
            if (validOptions.length < 2) return toast.error("Poll needs at least 2 options")

            payload.isPoll = true
            payload.pollQuestion = pollQuestion
            payload.pollOptions = validOptions
        }

        createMutation.mutate(payload)
    }

    return (
        <div className={`relative bg-[#0a0a0c] border rounded-2xl overflow-hidden transition-colors duration-300 ${isStealth ? "border-green-900/50" : "border-zinc-800"}`}>

            {/* Header */}
            <div className={`px-4 py-3 border-b flex justify-between items-center transition-colors ${isStealth ? "bg-green-900/10 border-green-900/30" : "bg-zinc-900/50 border-zinc-800"}`}>
                <span className={`text-xs font-bold uppercase tracking-wider ${isStealth ? "text-green-500" : "text-zinc-400"}`}>
                    {isStealth ? "Stealth Mode Active" : "What's on your mind?"}
                </span>

                {/* Stealth Toggle */}
                <button
                    onClick={() => setIsStealth(!isStealth)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all ${isStealth ? "text-green-400 bg-green-900/20" : "text-zinc-500 hover:text-zinc-300"}`}
                    title="Toggle Stealth Mode"
                >
                    <Ghost className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold">{isStealth ? "ON" : "OFF"}</span>
                </button>
            </div>

            {/* Input Area — accepts drag-and-drop */}
            <div
                className={`p-4 transition-colors duration-200 ${isDragging ? (isStealth ? 'bg-green-900/10 ring-1 ring-green-500/40 rounded-xl' : 'bg-indigo-500/5 ring-1 ring-indigo-500/40 rounded-xl') : ''}`}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {isDragging && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`absolute inset-0 z-20 flex items-center justify-center rounded-2xl pointer-events-none
                            ${isStealth
                                ? 'bg-[#0a0a0c]/90 border-2 border-dashed border-green-500/60'
                                : 'bg-[#0a0a0c]/90 border-2 border-dashed border-indigo-500/60'
                            }`}
                    >
                        <motion.div
                            initial={{ scale: 0.85, y: 8 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="flex flex-col items-center gap-3 select-none"
                        >
                            {/* Animated icon with pulse ring */}
                            <div className="relative">
                                <motion.div
                                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                                    transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                                    className={`absolute inset-0 rounded-full ${isStealth ? 'bg-green-500/30' : 'bg-indigo-500/30'}`}
                                />
                                <div className={`relative w-14 h-14 rounded-full flex items-center justify-center
                                    ${isStealth ? 'bg-green-500/10 border border-green-500/30' : 'bg-indigo-500/10 border border-indigo-500/30'}`}>
                                    <ImageIcon className={`w-6 h-6 ${isStealth ? 'text-green-400' : 'text-indigo-400'}`} />
                                </div>
                            </div>

                            {/* Headline */}
                            <motion.p
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.06 }}
                                className={`text-lg font-black tracking-tight leading-none
                                    ${isStealth ? 'text-green-300' : 'text-indigo-300'}`}
                            >
                                {isStealth ? 'Drop to transmit in stealth' : 'Drop to add image'}
                            </motion.p>

                            {/* Sub-hint */}
                            <motion.p
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.12 }}
                                className="text-xs font-medium text-zinc-500"
                            >
                                JPEG · PNG · WebP · GIF &nbsp;·&nbsp; max 10 MB
                            </motion.p>
                        </motion.div>
                    </motion.div>
                )}
                <textarea
                    value={content}
                    onChange={(e) => {
                        const newText = e.target.value
                        if (newText.length > MAX_CHARS) return
                        setContent(newText)
                    }}
                    placeholder={isStealth ? "Whisper into the void..." : "Share your thoughts..."}
                    className="w-full bg-transparent outline-none text-zinc-200 placeholder:text-zinc-600 resize-none min-h-[100px]"
                />

                {/* Poll Creator Interface */}
                <AnimatePresence>
                    {showPoll && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-3"
                        >
                            <div className="bg-zinc-900/30 rounded-xl p-3 border border-zinc-800">
                                <input
                                    type="text"
                                    value={pollQuestion}
                                    onChange={(e) => setPollQuestion(e.target.value)}
                                    placeholder="Ask a question..."
                                    className="w-full bg-transparent border-b border-zinc-700 pb-2 mb-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-sky-500/50 transition-colors"
                                />
                                <div className="space-y-2">
                                    {pollOptions.map((opt, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => handleOptionChange(i, e.target.value)}
                                                placeholder={`Option ${i + 1}`}
                                                className="flex-1 bg-zinc-800/50 rounded-lg px-3 py-1.5 text-sm text-zinc-200 outline-none focus:ring-1 focus:ring-zinc-600"
                                            />
                                            {pollOptions.length > 2 && (
                                                <button onClick={() => handleRemoveOption(i)} className="text-zinc-600 hover:text-red-400">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {pollOptions.length < 4 && (
                                    <button
                                        onClick={handleAddOption}
                                        className="mt-3 text-xs flex items-center gap-1 text-sky-500 hover:text-sky-400 font-medium"
                                    >
                                        <Plus className="w-3 h-3" /> Add Option
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Image Previews */}
                {images.length > 0 && (
                    <div className="flex gap-2 mt-3">
                        <AnimatePresence>
                            {images.map((img, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 group"
                                >
                                    <img src={img.url} alt="preview" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => removeImage(i)}
                                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                    {/* Compressed size badge */}
                                    <span className="absolute bottom-0.5 left-0.5 text-[9px] font-bold bg-black/60 text-indigo-300 px-1 rounded">
                                        {(img.file.size / 1024).toFixed(0)}KB
                                    </span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Footer / Controls */}
            <div className={`flex items-center justify-between px-4 py-3 border-t transition-colors ${isStealth ? "bg-green-900/10 border-green-900/30" : "bg-zinc-900/30 border-zinc-800"}`}>
                <div className="flex items-center gap-4">
                    {/* Image Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`transition-colors ${images.length >= MAX_IMAGES || showPoll ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-400 hover:text-white'}`}
                        disabled={images.length >= MAX_IMAGES || showPoll}
                        title={showPoll ? "Cannot add image with poll" : "Add Image"}
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden"
                        accept="image/*"
                    />

                    {/* Poll Button */}
                    <button
                        onClick={togglePoll}
                        className={`transition-colors ${images.length > 0 ? 'text-zinc-700 cursor-not-allowed' : showPoll ? 'text-sky-500' : 'text-zinc-400 hover:text-white'}`}
                        disabled={images.length > 0}
                        title={images.length > 0 ? "Cannot add poll with image" : "Create Poll"}
                    >
                        <BarChart2 className="w-5 h-5" />
                    </button>

                    {/* Character Counter */}
                    <div className="text-xs font-mono border-l border-zinc-800 pl-4">
                        <span className={content.length >= 450 ? "text-orange-500" : "text-zinc-400"}>
                            {content.length}
                        </span>
                        <span className="text-zinc-700">/{MAX_CHARS}</span>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!content.trim() || createMutation.isPending || isUploadingImage}
                    className={`
                        flex items-center justify-center gap-2 px-4 py-1.5 text-sm rounded-full font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed
                        ${isStealth
                            ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_15px_rgba(22,163,74,0.3)]'
                            : 'bg-zinc-100 hover:bg-white text-black shadow-sm'}
                    `}
                >
                    {createMutation.isPending ? (
                        <LoadingDots size="xs" />
                    ) : (
                        <>
                            {isStealth ? <Ghost className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                            <span>{isStealth ? "Whisper" : "Post"}</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}