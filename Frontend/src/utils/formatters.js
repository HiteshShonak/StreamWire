export const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
    return views?.toString() || '0'
}

export const formatTimeAgo = (date) => {
    const now = new Date()
    const uploadDate = new Date(date)
    const seconds = Math.floor((now - uploadDate) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`
    return `${Math.floor(seconds / 2592000)}mo ago`
}

export const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds === Infinity) return '0:00'
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
}
