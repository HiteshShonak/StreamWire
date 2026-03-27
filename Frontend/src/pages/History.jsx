import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { History as HistoryIcon, Clock, Play } from 'lucide-react'

import { libraryService } from '../api/services/library.service'
import VideoCard from '../Components/VideoCard'
import { VideoGridSkeleton } from '../Components/Common/Skeleton'

export default function History() {
   const user = useSelector((state) => state.auth.userData)

   // Fetch watch history
   const { data: historyData, isLoading } = useQuery({
      queryKey: ['watch-history'],
      queryFn: () => libraryService.getHistory({ limit: 50 }),
      enabled: !!user
   })

   const history = historyData?.history || []
   const isEmpty = !isLoading && history.length === 0

   // Not logged in state
   if (!user) {
      return (
         <div className="relative min-h-screen bg-[#050505] text-white">
            <div className="relative z-10 lg:pl-72 pt-32 px-6 pb-20 max-w-7xl mx-auto">
               <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-32 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20"
               >
                  <HistoryIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-zinc-400">Sign in to see your watch history.</h3>
                  <Link to="/login" className="mt-6 inline-block text-indigo-400 hover:text-indigo-300 font-bold text-sm">
                     Sign In &rarr;
                  </Link>
               </motion.div>
            </div>
         </div>
      )
   }

   return (
      <div className="relative min-h-screen bg-[#050505] text-white">

         {/* Background Glow */}
         <div className="fixed top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-pink-500 opacity-5 blur-[120px] pointer-events-none gpu-layer" />

         <div className="relative z-10 lg:pl-72 pt-32 px-6 pb-20 max-w-7xl mx-auto">

            {/* Header Section */}
            <div className="flex flex-col gap-8 mb-12">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                     <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-black tracking-tight flex items-center gap-3 text-white"
                     >
                        <Clock className="w-10 h-10 text-pink-400" />
                        Watch History
                     </motion.h1>
                     <p className="text-zinc-500 mt-2 font-medium">
                        Videos you've watched recently.
                     </p>
                  </div>
               </div>
            </div>

            {/* Loader */}
            {isLoading && (
               <VideoGridSkeleton count={8} />
            )}

            {/* Empty State */}
            {isEmpty && (
               <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-32 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20"
               >
                  <HistoryIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-zinc-400">No watch history yet.</h3>
                  <p className="text-zinc-600 mt-2">
                     Videos you watch will appear here.
                  </p>
                  <Link to="/cinema" className="mt-6 inline-block text-pink-400 hover:text-pink-300 font-bold text-sm">
                     Browse Cinema &rarr;
                  </Link>
               </motion.div>
            )}

            {/* History Grid */}
            {history.length > 0 && (
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
               >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                     {history.map((item) => (
                        <div key={item._id} className="relative group">
                           <VideoCard video={item.video} />

                           {/* Progress Bar Overlay */}
                           {item.lastPosition > 0 && item.video?.duration > 0 && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-800">
                                 <div
                                    className="h-full bg-pink-500 transition-all"
                                    style={{ width: `${Math.min((item.lastPosition / item.video.duration) * 100, 100)}%` }}
                                 />
                              </div>
                           )}

                           {/* Resume Badge */}
                           {item.lastPosition > 0 && (
                              <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-white flex items-center gap-1">
                                 <Play className="w-3 h-3" />
                                 Resume
                              </div>
                           )}
                        </div>
                     ))}
                  </div>
               </motion.div>
            )}
         </div>
      </div>
   )
}
