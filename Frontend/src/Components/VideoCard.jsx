import { memo } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Play, Clock, Ghost, UserCheck } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

// Format Duration (Seconds -> MM:SS) - Outside component to avoid recreation
const formatDuration = (seconds) => {
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec < 10 ? '0' : ''}${sec}`
}

const VideoCard = memo(function VideoCard({ video }) {
  const { userData } = useSelector((state) => state.auth)

  // Guard against undefined video
  if (!video) return null

  // Stealth Logic: If the video is stealth, we show generic info
  const isStealth = video.isStealthMode || video.owner?.isIdentityCloaked
  const isOwner = userData?._id === video.owner?._id
  const ownerName = isStealth ? "StreamWire User" : video.owner?.fullName
  const avatarUrl = isStealth
    ? "https://ui-avatars.com/api/?name=S&background=18181b&color=22c55e"
    : video.owner?.avatar?.url

  return (
    <div className="group relative contain-content">
      {/* Thumbnail Container */}
      <Link to={`/cinema/${video._id}`} className="block relative rounded-xl overflow-hidden aspect-video bg-zinc-900">
        <img
          src={video.thumbnail?.url}
          alt={video.title}
          loading="lazy"
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isStealth ? "opacity-80 grayscale-[0.5]" : ""}`}
        />

        {/* Overlay: Play Button */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
            <Play className="w-5 h-5 text-white fill-current ml-1" />
          </div>
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white">
          {formatDuration(video.duration)}
        </div>

        {/* Stealth Badge */}
        {isStealth && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/60 backdrop-blur-md border border-green-500/30 text-[10px] font-bold text-green-400 flex items-center gap-1">
            <Ghost className="w-3 h-3" /> STEALTH
          </div>
        )}
      </Link>

      {/* Meta Data */}
      <div className="flex gap-3 mt-3 px-1">
        {/* Avatar */}
        <Link
          to={isStealth ? "#" : `/c/${video.owner?.username}`}
          className="shrink-0"
          onClick={(e) => { if (isStealth) e.preventDefault(); }}
        >
          <img
            src={avatarUrl}
            alt={ownerName}
            loading="lazy"
            className="w-9 h-9 rounded-full object-cover border border-zinc-800 hover:ring-2 hover:ring-indigo-500/50 transition-all"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <Link to={`/cinema/${video._id}`}>
            <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-indigo-400 transition-colors">
              {video.title}
            </h3>
          </Link>

          <div className="mt-1 flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                to={isStealth ? "#" : `/c/${video.owner?.username}`}
                onClick={(e) => { if (isStealth) e.preventDefault(); }}
                className={`text-xs hover:text-white transition-colors ${isStealth ? "text-green-600 font-mono" : "text-zinc-400"}`}
              >
                {ownerName}
              </Link>
              {isOwner && (
                <span className="px-1 py-0.5 bg-indigo-500/20 text-indigo-400 text-[9px] font-bold rounded border border-indigo-500/30">YOU</span>
              )}
              {!isOwner && video.owner?.isSubscribed && (
                <span className="px-1 py-0.5 bg-sky-500/20 text-sky-400 text-[9px] font-bold rounded border border-sky-500/30 flex items-center gap-0.5">
                  <UserCheck className="w-2 h-2" />
                  SUBSCRIBED
                </span>
              )}
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1">
              <span>{video.views} views</span>
              <span>•</span>
              <span>{video.createdAt ? formatDistanceToNow(new Date(video.createdAt)) : 'Unknown time'} ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default VideoCard