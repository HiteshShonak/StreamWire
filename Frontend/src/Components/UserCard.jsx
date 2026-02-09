import { memo } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, UserCheck, Ghost, Shield } from 'lucide-react'
import { motion } from 'framer-motion'

const UserCard = memo(function UserCard({ user, onSubscribe }) {
  // 🎭 Check if this is a "Ghost" profile (Already masked by backend, but we style it)
  const isGhost = user.username === 'anonymous' || user.isIdentityCloaked

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all gap-4 ${isGhost ? "bg-zinc-900/50 border-green-900/20" : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"}`}>
      <Link to={`/c/${user.username}`} className="flex items-center gap-4 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          <img
            src={user.avatar?.url}
            alt={user.fullName}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ${isGhost ? "border-2 border-green-500/30 p-0.5" : ""}`}
          />
          {isGhost && (
            <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-1 border border-green-500/50">
              <Ghost className="w-3 h-3 text-green-500" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className={`font-bold text-sm truncate ${isGhost ? "text-green-500 font-mono tracking-wide" : "text-white"}`}>
            {user.fullName}
          </h4>
          <p className="text-xs text-zinc-500 truncate">
            @{user.username} • {user.subscribersCount || 0} subscribers
          </p>
          {/* If user provided a bio, show it (Backend masks bio if stealth) */}
          {user.bio && (
            <p className="text-xs text-zinc-400 mt-1 line-clamp-1 italic truncate">
              "{user.bio}"
            </p>
          )}
        </div>
      </Link>

      <button
        onClick={() => onSubscribe(user._id)}
        className={`w-full sm:w-auto px-4 py-2 sm:py-1.5 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 flex-shrink-0
          ${user.isSubscribed
            ? "bg-zinc-800 text-zinc-400 hover:text-red-400 border border-zinc-700"
            : "bg-white text-black hover:bg-zinc-200 border border-transparent"
          }
        `}
      >
        {user.isSubscribed ? (
          <>Subscribed <UserCheck className="w-3.5 h-3.5" /></>
        ) : (
          <>Subscribe <UserPlus className="w-3.5 h-3.5" /></>
        )}
      </button>
    </div>
  )
})

export default UserCard