import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { videoService } from '../api/services/video.service'
import toast from 'react-hot-toast'

const UploadContext = createContext(null)

export function useUpload() {
    const ctx = useContext(UploadContext)
    if (!ctx) throw new Error('useUpload must be used inside UploadProvider')
    return ctx
}

export function UploadProvider({ children }) {
    const [pendingUploads, setPendingUploads] = useState([]) // [{id, title, thumbnailUrl, progress, status, loaded, total, speed, eta, videoId}]
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const idCounter = useRef(0)

    const startUpload = useCallback(async (formData, meta) => {
        // meta: { title, thumbnailUrl (local blob preview) }
        const id = ++idCounter.current
        const ghost = {
            id,
            title: meta.title,
            thumbnailUrl: meta.thumbnailUrl || null,
            progress: 0,
            status: 'uploading', // uploading | done | error
            loaded: 0,
            total: 0,
            speed: 0,
            eta: null,
            videoId: null,
        }

        // 1. Add ghost immediately
        setPendingUploads(prev => [ghost, ...prev])

        // 3. Build FormData to send
        const body = new FormData()
        body.append('title', formData.title)
        body.append('description', formData.description || '')
        body.append('tags', formData.tags || '')
        body.append('videoFile', formData.videoFile)
        if (formData.thumbnail) body.append('thumbnail', formData.thumbnail)

        // 4. Fire upload — runs in background (don't await it here so we can return the ID synchronously)
        const uploadPromise = (async () => {
            try {
                const startTime = Date.now()
                const response = await videoService.publishVideo(body, (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                    const elapsed = (Date.now() - startTime) / 1000 // seconds
                    const speed = progressEvent.loaded / elapsed // bytes per sec
                    const remaining = progressEvent.total - progressEvent.loaded
                    const eta = speed > 0 ? remaining / speed : null // seconds

                    setPendingUploads(prev =>
                        prev.map(u => u.id === id ? {
                            ...u,
                            progress: percent,
                            loaded: progressEvent.loaded,
                            total: progressEvent.total,
                            speed,
                            eta
                        } : u)
                    )
                })

                // 5. Success: mark done, save videoId, refresh queries
                const vId = response?.data?._id || response?._id || response?.id || response?.video?._id;

                setPendingUploads(prev =>
                    prev.map(u => u.id === id ? {
                        ...u,
                        status: 'done',
                        progress: 100,
                        videoId: vId
                    } : u)
                )
                queryClient.invalidateQueries(['my-videos'])
                queryClient.invalidateQueries(['videos'])
                queryClient.invalidateQueries(['dashboard-stats'])
                toast.success('🎬 Video published! AI is generating your transcript...')
            } catch (err) {
                // 6. Error: mark ghost as failed
                setPendingUploads(prev =>
                    prev.map(u => u.id === id ? { ...u, status: 'error', progress: 0 } : u)
                )
                console.error('Background upload failed:', err)
                toast.error(err.message || 'Upload failed — see dashboard to retry')
            }
        })();

        // Return the tracking ID immediately so the caller can navigate or show local progress
        return id;
    }, [queryClient])

    const retryUpload = useCallback((id) => {
        // For now, remove the failed ghost and let user re-upload manually
        setPendingUploads(prev => prev.filter(u => u.id !== id))
        navigate('/upload')
        toast('Starting fresh — fill in the form again', { icon: '↩️' })
    }, [navigate])

    const dismissUpload = useCallback((id) => {
        setPendingUploads(prev => prev.filter(u => u.id !== id))
    }, [])

    return (
        <UploadContext.Provider value={{ pendingUploads, startUpload, retryUpload, dismissUpload }}>
            {children}
        </UploadContext.Provider>
    )
}
