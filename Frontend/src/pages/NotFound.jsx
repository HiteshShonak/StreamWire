import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Compass, Ghost } from 'lucide-react'

const NotFound = () => {
   const navigate = useNavigate()

   return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6 lg:pl-72 lg:pr-72 overflow-hidden">

         {/* Ambient Background Effects */}
         <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {/* Floating Orbs */}
            <motion.div
               className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-indigo-600/10 to-purple-600/10 blur-3xl"
               animate={{
                  x: ['-20%', '10%', '-20%'],
                  y: ['-10%', '20%', '-10%'],
               }}
               transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
               style={{ top: '-10%', left: '-10%' }}
            />
            <motion.div
               className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-purple-600/8 to-pink-600/8 blur-3xl"
               animate={{
                  x: ['10%', '-15%', '10%'],
                  y: ['10%', '-10%', '10%'],
               }}
               transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
               style={{ bottom: '-15%', right: '-5%' }}
            />

            {/* Grid Pattern */}
            <div
               className="absolute inset-0 opacity-[0.02]"
               style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                  backgroundSize: '60px 60px'
               }}
            />
         </div>

         {/* Content */}
         <div className="relative z-10 text-center max-w-2xl mx-auto">

            {/* Floating 404 */}
            <motion.div
               className="relative mb-12"
               animate={{ y: [-10, 10, -10] }}
               transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
               {/* Ghost Icon Floating Above */}
               <motion.div
                  className="absolute -top-16 left-1/2 -translate-x-1/2"
                  animate={{
                     y: [-5, 5, -5],
                     rotate: [-5, 5, -5]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
               >
                  <Ghost className="w-12 h-12 text-indigo-400/60" />
               </motion.div>

               {/* 404 Number */}
               <h1 className="text-[180px] md:text-[220px] font-black leading-none tracking-tighter">
                  <span className="bg-gradient-to-b from-white via-zinc-400 to-zinc-700 bg-clip-text text-transparent">
                     4
                  </span>
                  <motion.span
                     className="inline-block bg-gradient-to-b from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent"
                     animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
                     transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  >
                     0
                  </motion.span>
                  <span className="bg-gradient-to-b from-white via-zinc-400 to-zinc-700 bg-clip-text text-transparent">
                     4
                  </span>
               </h1>

               {/* Glow Effect Under 404 */}
               <div className="absolute inset-x-0 -bottom-8 h-32 bg-gradient-to-t from-indigo-500/20 via-purple-500/10 to-transparent blur-2xl opacity-60" />
            </motion.div>

            {/* Message */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2, duration: 0.6 }}
               className="space-y-4 mb-12"
            >
               <h2 className="text-3xl md:text-4xl font-bold text-white">
                  Lost in the Void
               </h2>
               <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-lg mx-auto">
                  Either this page has been moved to a different dimension,
                  or it never existed in this one.
               </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4, duration: 0.6 }}
               className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
               <button
                  onClick={() => navigate(-1)}
                  className="group flex items-center gap-3 px-7 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-2xl font-bold transition-all duration-300"
               >
                  <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:-translate-x-1 transition-transform" />
                  <span className="text-zinc-300">Go Back</span>
               </button>

               <button
                  onClick={() => navigate('/home')}
                  className="group flex items-center gap-3 px-7 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold transition-all duration-300"
               >
                  <Home className="w-5 h-5" />
                  <span>Return Home</span>
               </button>

               <button
                  onClick={() => navigate('/cinema')}
                  className="group flex items-center gap-3 px-7 py-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-2xl font-bold transition-all duration-300"
               >
                  <Compass className="w-5 h-5 text-zinc-400 group-hover:rotate-12 transition-transform" />
                  <span className="text-zinc-300">Explore</span>
               </button>
            </motion.div>

            {/* Subtle Hint */}
            <motion.p
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.8, duration: 0.6 }}
               className="mt-16 text-sm text-zinc-600"
            >
               Error Code: <span className="font-mono text-zinc-500">PAGE_NOT_FOUND</span>
            </motion.p>
         </div>
      </div>
   )
}

export default NotFound
