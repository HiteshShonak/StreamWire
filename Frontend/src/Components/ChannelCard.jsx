import { memo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, CheckCircle, Lock, Sparkles } from 'lucide-react'

const ChannelCard = memo(function ChannelCard({ channel, subscriberCount, onUnsubscribe, isLoading }) {
   const avatar = channel?.avatar?.url || channel?.avatar
   const username = channel?.username || 'unknown'
   const fullName = channel?.fullName || 'Anonymous User'
   const isPrivate = channel?.isPrivateChannel

   return (
      <motion.div
         initial={{ opacity: 0, scale: 0.95 }}
         animate={{ opacity: 1, scale: 1 }}
         whileHover={{ scale: 1.01 }}
         transition={{ duration: 0.2 }}
         className="group relative overflow-hidden"
      >
         {/* Gradient Background */}
         <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

         {/* Card Content */}
         <div className="relative p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 group-hover:border-purple-500/50 group-hover:bg-zinc-900/80 transition-all duration-300 shadow-lg">
            {/* Channel Link */}
            <Link
               to={`/c/${username}`}
               className="block"
            >
               <div className="flex items-center gap-5">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                     <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-zinc-700 group-hover:border-purple-500 transition-colors duration-300 shadow-xl">
                        <img
                           src={avatar}
                           alt={username}
                           className="w-full h-full object-cover"
                           onError={(e) => {
                              e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fullName) + '&background=6366f1&color=fff';
                           }}
                        />
                     </div>
                     {isPrivate && (
                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center border-2 border-[#050505] shadow-lg">
                           <Lock className="w-3.5 h-3.5 text-black" />
                        </div>
                     )}
                  </div>

                  {/* Info - Takes remaining space */}
                  <div className="flex-1 min-w-0">
                     <h3 className="font-black text-white truncate group-hover:text-purple-400 transition-colors text-xl mb-1">
                        {fullName}
                     </h3>
                     <p className="text-sm text-zinc-500 truncate mb-3">
                        @{username}
                     </p>

                     {/* Subscriber Count & Subscribed Badge */}
                     <div className="flex items-center gap-4">
                        {subscriberCount !== undefined && (
                           <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 group-hover:text-purple-300 transition-colors">
                              <Users className="w-4 h-4" />
                              <span>{subscriberCount.toLocaleString()} {subscriberCount !== 1 ? 'subscribers' : 'subscriber'}</span>
                           </div>
                        )}

                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                           <CheckCircle className="w-4 h-4" />
                           Subscribed
                        </div>
                     </div>
                  </div>

                  {/* Unsubscribe Button - Right side */}
                  {onUnsubscribe && (
                     <div className="shrink-0">
                        <button
                           onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onUnsubscribe(channel._id);
                           }}
                           disabled={isLoading}
                           className="px-4 py-2 text-xs font-bold text-zinc-400 hover:text-red-400 border border-zinc-700 hover:border-red-500/50 rounded-xl hover:bg-red-500/10 transition-all disabled:opacity-50"
                        >
                           {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
                        </button>
                     </div>
                  )}
               </div>
            </Link>
         </div>
      </motion.div>
   )
})

export default ChannelCard
