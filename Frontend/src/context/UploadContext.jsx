/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { videoService } from '../api/services/video.service'
import toast from 'react-hot-toast'
import { deleteUploadPayload, getUploadPayload, saveUploadPayload } from '../utils/uploadPayloadStore'
import { CHUNK_UPLOAD_SIZE_BYTES, ENABLE_CHUNKED_UPLOAD } from '../constants/upload.constants'

const UploadContext = createContext(null)
const PENDING_UPLOADS_STORAGE_KEY = 'streamwire.pendingUploads.v1'
const PERSISTED_UPLOAD_STATUSES = ['queued', 'uploading', 'error']

const getUploadErrorMessage = (error) => {
    const statusCode = error?.statusCode || error?.response?.status
    const rawMessage = error?.response?.data?.message || error?.message || 'Upload failed. Please retry.'
    const normalized = String(rawMessage).toLowerCase()

    if (normalized.includes('file type not supported')) {
        return 'Unsupported file type. Use valid video/image formats and retry.'
    }

    if (normalized.includes('file too large') || normalized.includes('must be less than')) {
        return rawMessage
    }

    if (statusCode === 413) {
        return 'File is too large for the server upload limit.'
    }

    if (statusCode === 401 || statusCode === 403) {
        return 'You are not authorized to upload right now. Please log in again.'
    }

    if (normalized.includes('network error')) {
        return 'Network issue during upload. Check connection and retry.'
    }

    return rawMessage
}

export function useUpload() {
    const ctx = useContext(UploadContext)
    if (!ctx) throw new Error('useUpload must be used inside UploadProvider')
    return ctx
}

export function UploadProvider({ children }) {
    const [pendingUploads, setPendingUploads] = useState([]) // [{id, title, thumbnailUrl, progress, status, loaded, total, speed, eta, videoId, errorMessage}]
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const idCounter = useRef(0)
    const uploadPayloadRef = useRef(new Map())
    const uploadAbortControllersRef = useRef(new Map())
    const hasHydratedRef = useRef(false)

    useEffect(() => {
        let isUnmounted = false

        const hydratePendingUploads = async () => {
            let parsedUploads = []

            try {
                const raw = localStorage.getItem(PENDING_UPLOADS_STORAGE_KEY)
                if (raw) {
                    const parsed = JSON.parse(raw)
                    if (Array.isArray(parsed)) {
                        parsedUploads = parsed
                    }
                }
            } catch (error) {
                console.error('Failed to read pending uploads:', error)
            }

            const restoredUploads = parsedUploads
                .filter((item) => Number.isFinite(item?.id))
                .map((item) => {
                    const wasActive = item.status === 'queued' || item.status === 'uploading'

                    return {
                        id: item.id,
                        title: item.title || 'Untitled upload',
                        thumbnailUrl: null,
                        progress: 0,
                        status: 'error',
                        loaded: 0,
                        total: 0,
                        speed: 0,
                        eta: null,
                        videoId: null,
                        requiresFileReselect: Boolean(item.requiresFileReselect),
                        cancelReason: null,
                        errorMessage: wasActive
                            ? 'Upload interrupted after refresh. Retry to continue.'
                            : item.errorMessage || 'Upload failed. Please retry.',
                    }
                })

            const restoredPayloadEntries = await Promise.all(
                restoredUploads.map(async (upload) => {
                    try {
                        const payload = await getUploadPayload(upload.id)
                        return [upload.id, payload]
                    } catch (error) {
                        console.error('Failed to restore upload payload:', error)
                        return [upload.id, null]
                    }
                })
            )
            const restoredPayloadMap = new Map(restoredPayloadEntries)

            if (isUnmounted) return

            const payloadMap = new Map()
            const finalizedUploads = restoredUploads.map((upload) => {
                const payload = restoredPayloadMap.get(upload.id)

                if (payload?.formData?.videoFile) {
                    payloadMap.set(upload.id, payload)
                    return upload
                }

                return {
                    ...upload,
                    requiresFileReselect: true,
                    errorMessage: 'Saved file data is missing. Select files again and re-upload.',
                }
            })

            uploadPayloadRef.current = payloadMap

            if (finalizedUploads.length > 0) {
                setPendingUploads(finalizedUploads)
                const maxId = finalizedUploads.reduce((max, upload) => Math.max(max, upload.id), 0)
                idCounter.current = Math.max(idCounter.current, maxId)
            }

            hasHydratedRef.current = true
        }

        hydratePendingUploads()

        return () => {
            isUnmounted = true
        }
    }, [])

    useEffect(() => {
        if (!hasHydratedRef.current) return

        const serializableUploads = pendingUploads
            .filter((upload) => PERSISTED_UPLOAD_STATUSES.includes(upload.status))
            .map((upload) => ({
                id: upload.id,
                title: upload.title,
                status: upload.status,
                requiresFileReselect: Boolean(upload.requiresFileReselect),
                errorMessage: upload.errorMessage || null,
            }))

        try {
            if (serializableUploads.length > 0) {
                localStorage.setItem(PENDING_UPLOADS_STORAGE_KEY, JSON.stringify(serializableUploads))
            } else {
                localStorage.removeItem(PENDING_UPLOADS_STORAGE_KEY)
            }
        } catch (error) {
            console.error('Failed to persist pending uploads:', error)
        }
    }, [pendingUploads])

    // warn before closing tab when uploads are active
    useEffect(() => {
        const isActive = pendingUploads.some(
            (u) => u.status === 'queued' || u.status === 'uploading'
        )
        if (!isActive) return

        const handler = (e) => {
            e.preventDefault()
            e.returnValue = ''
        }

        window.addEventListener('beforeunload', handler)
        return () => window.removeEventListener('beforeunload', handler)
    }, [pendingUploads])

    const runUpload = useCallback(async (id, payload) => {
        if (uploadAbortControllersRef.current.has(id)) return

        const { formData } = payload
        const controller = new AbortController()
        uploadAbortControllersRef.current.set(id, controller)

        setPendingUploads((prev) =>
            prev.map((u) =>
                u.id === id
                    ? {
                        ...u,
                        status: 'uploading',
                        progress: 0,
                        loaded: 0,
                        total: 0,
                        speed: 0,
                        eta: null,
                        requiresFileReselect: false,
                        cancelReason: null,
                        errorMessage: null,
                    }
                    : u
            )
        )

        try {
            const startTime = Date.now()
            const totalVideoBytes = formData.videoFile?.size || 0
            const shouldUseChunkedUpload =
                ENABLE_CHUNKED_UPLOAD && totalVideoBytes > CHUNK_UPLOAD_SIZE_BYTES * 2

            const updateProgress = (loaded) => {
                const total = totalVideoBytes
                const safeLoaded = Math.min(Math.max(0, loaded || 0), total)
                const percent = total > 0 ? Math.round((safeLoaded * 100) / total) : 0
                const elapsed = (Date.now() - startTime) / 1000
                const speed = elapsed > 0 ? safeLoaded / elapsed : 0
                const remaining = total - safeLoaded
                const eta = speed > 0 && remaining > 0 ? remaining / speed : null

                setPendingUploads((prev) =>
                    prev.map((u) =>
                        u.id === id
                            ? {
                                ...u,
                                progress: percent,
                                loaded: safeLoaded,
                                total,
                                speed,
                                eta,
                            }
                            : u
                    )
                )
            }

            let response

            if (shouldUseChunkedUpload) {
                const totalChunks = Math.ceil(totalVideoBytes / CHUNK_UPLOAD_SIZE_BYTES)

                if (!payload.chunkSessionId) {
                    const initResult = await videoService.initChunkedVideoUpload(
                        {
                            title: formData.title,
                            description: formData.description || '',
                            tags: formData.tags || '',
                            isStealthMode: formData.isStealthMode || false,
                            fileName: formData.videoFile?.name || 'video-upload',
                            mimeType: formData.videoFile?.type || 'application/octet-stream',
                            totalSize: totalVideoBytes,
                            totalChunks,
                            chunkSize: CHUNK_UPLOAD_SIZE_BYTES,
                        },
                        controller.signal
                    )

                    payload.chunkSessionId = initResult?.sessionId
                    uploadPayloadRef.current.set(id, payload)
                    saveUploadPayload(id, payload).catch((persistError) => {
                        console.error('Failed to persist chunk upload session:', persistError)
                    })
                }

                const sessionId = payload.chunkSessionId
                if (!sessionId) {
                    throw new Error('Failed to initialize chunk upload session.')
                }

                const status = await videoService.getChunkedUploadStatus(sessionId, controller.signal)
                let nextChunkIndex = Number(status?.nextChunkIndex || 0)

                if (!Number.isFinite(nextChunkIndex) || nextChunkIndex < 0) {
                    nextChunkIndex = 0
                }

                for (let chunkIndex = nextChunkIndex; chunkIndex < totalChunks; chunkIndex += 1) {
                    const start = chunkIndex * CHUNK_UPLOAD_SIZE_BYTES
                    const end = Math.min(start + CHUNK_UPLOAD_SIZE_BYTES, totalVideoBytes)
                    const chunkBlob = formData.videoFile.slice(start, end, formData.videoFile.type)

                    await videoService.uploadVideoChunk(
                        sessionId,
                        chunkBlob,
                        chunkIndex,
                        controller.signal,
                        (progressEvent) => {
                            const loadedInChunk = progressEvent?.loaded || 0
                            updateProgress(start + loadedInChunk)
                        }
                    )

                    updateProgress(end)
                }

                response = await videoService.completeChunkedVideoUpload(
                    sessionId,
                    formData.thumbnail,
                    controller.signal
                )
            } else {
                const body = new FormData()
                body.append('title', formData.title)
                body.append('description', formData.description || '')
                body.append('tags', formData.tags || '')
                body.append('videoFile', formData.videoFile)
                if (formData.thumbnail) body.append('thumbnail', formData.thumbnail)

                response = await videoService.publishVideo(
                    body,
                    (progressEvent) => {
                        updateProgress(progressEvent.loaded || 0)
                    },
                    controller.signal
                )
            }

            const vId = response?.data?._id || response?._id || response?.id || response?.video?._id

            setPendingUploads((prev) =>
                prev.map((u) =>
                    u.id === id
                        ? {
                            ...u,
                            status: 'done',
                            progress: 100,
                            errorMessage: null,
                            videoId: vId,
                        }
                        : u
                )
            )

            uploadPayloadRef.current.delete(id)
            await deleteUploadPayload(id)

            queryClient.invalidateQueries(['my-videos'])
            queryClient.invalidateQueries(['videos'])
            queryClient.invalidateQueries(['dashboard-stats'])
            toast.success('🎬 Video published! AI is generating your transcript...')
        } catch (err) {
            const isCanceled =
                err?.code === 'ERR_CANCELED' ||
                err?.name === 'CanceledError' ||
                String(err?.message || '').toLowerCase().includes('canceled')

            const errorMessage = getUploadErrorMessage(err)

            setPendingUploads((prev) =>
                prev.map((u) =>
                    u.id === id
                        ? {
                            ...u,
                            status: isCanceled ? 'canceled' : 'error',
                            progress: 0,
                            eta: null,
                            errorMessage: isCanceled
                                ? (u.errorMessage || u.cancelReason || 'Upload canceled')
                                : errorMessage,
                        }
                        : u
                )
            )

            if (!isCanceled) {
                console.error('Background upload failed:', err)
                toast.error(errorMessage)
            }
        } finally {
            uploadAbortControllersRef.current.delete(id)
        }
    }, [queryClient])

    const startUpload = useCallback(async (formData, meta) => {
        const id = ++idCounter.current
        const payload = { formData }
        uploadPayloadRef.current.set(id, payload)

        saveUploadPayload(id, payload).catch((error) => {
            console.error('Failed to persist upload payload:', error)
        })

        const ghost = {
            id,
            title: meta.title,
            thumbnailUrl: meta.thumbnailUrl || null,
            progress: 0,
            status: 'queued', // queued | uploading | done | error | canceled
            loaded: 0,
            total: 0,
            speed: 0,
            eta: null,
            videoId: null,
            requiresFileReselect: false,
            cancelReason: null,
            errorMessage: null,
        }

        setPendingUploads(prev => [ghost, ...prev])

        // run async upload in background after queued state is set
        setTimeout(() => {
            const payload = uploadPayloadRef.current.get(id)
            if (payload) {
                runUpload(id, payload)
            }
        }, 0)

        return id
    }, [runUpload])

    const retryUpload = useCallback(async (id) => {
        let payload = uploadPayloadRef.current.get(id)

        if (!payload?.formData?.videoFile) {
            try {
                payload = await getUploadPayload(id)
                if (payload?.formData?.videoFile) {
                    uploadPayloadRef.current.set(id, payload)
                }
            } catch (error) {
                console.error('Failed to restore retry payload:', error)
            }
        }

        if (!payload?.formData?.videoFile) {
            await deleteUploadPayload(id).catch(() => {})
            setPendingUploads((prev) => prev.filter((u) => u.id !== id))
            navigate('/upload')
            toast('Retry data expired. Select files and upload again.', { icon: '↩️' })
            return
        }

        setPendingUploads((prev) =>
            prev.map((u) =>
                u.id === id
                    ? {
                        ...u,
                        status: 'queued',
                        progress: 0,
                        loaded: 0,
                        total: 0,
                        speed: 0,
                        eta: null,
                        requiresFileReselect: false,
                        cancelReason: null,
                        errorMessage: null,
                    }
                    : u
            )
        )

        runUpload(id, payload)
        toast('Retrying upload...', { icon: '🔄' })
    }, [navigate, runUpload])

    const dismissUpload = useCallback((id, reason = 'Upload canceled by user.') => {
        const controller = uploadAbortControllersRef.current.get(id)
        if (controller) {
            controller.abort()
        }

        const payload = uploadPayloadRef.current.get(id)
        if (payload?.chunkSessionId) {
            videoService.cancelChunkedVideoUpload(payload.chunkSessionId).catch(() => {})
        }

        uploadPayloadRef.current.delete(id)
        deleteUploadPayload(id).catch(() => {})

        setPendingUploads((prev) =>
            prev.map((u) =>
                u.id === id
                    ? {
                        ...u,
                        status: 'canceled',
                        eta: null,
                        cancelReason: reason,
                        errorMessage: reason,
                    }
                    : u
            )
        )

        setTimeout(() => {
            setPendingUploads((prev) => prev.filter((u) => u.id !== id))
        }, 2500)
    }, [])

    return (
        <UploadContext.Provider value={{ pendingUploads, startUpload, retryUpload, dismissUpload }}>
            {children}
        </UploadContext.Provider>
    )
}
