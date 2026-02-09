import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Ghost, ArrowRight, RefreshCw } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'
import { HeroMascot } from './HeroMascot'

export const HeroSection = ({ isStealth, setIsStealth }) => {
  return (
    <section className="relative pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-8 sm:pb-12 md:pb-16 lg:pb-20 max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-6 sm:gap-8 md:gap-10 lg:gap-12 items-center z-20">
      
      <ScrollReveal>
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          <motion.div 
            layout
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wide w-fit backdrop-blur-sm transition-colors duration-500 ${isStealth ? "bg-green-900/10 border-green-500/20 text-green-500" : "bg-white border-zinc-200 text-indigo-600 shadow-sm"}`}
          >
            {isStealth ? <Ghost className="w-3 h-3" /> : <Zap className="w-3 h-3 fill-current" />}
            <AnimatePresence mode="wait">
              <motion.span key={isStealth ? "stealth-badge" : "creator-badge"} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: 0.15 }}>
                {isStealth ? "Encrypted • Anonymous • Secure" : "Create • Share • Monetize"}
              </motion.span>
            </AnimatePresence>
          </motion.div>

          <div className="h-auto sm:h-[200px] flex flex-col justify-center">
            <h1 className={`text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] transition-colors duration-700 ${isStealth ? 'text-white' : 'text-zinc-900'}`}>
              <AnimatePresence mode="wait">
                {isStealth ? (
                  <motion.div key="stealth-title" initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(8px)" }} transition={{ duration: 0.4 }}>
                    Stream <span className="font-mono text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Invisibly.</span> <br/> Speak Truthfully.
                  </motion.div>
                ) : (
                  <motion.div key="creator-title" initial={{ opacity: 0, filter: "blur(8px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} exit={{ opacity: 0, filter: "blur(8px)" }} transition={{ duration: 0.4 }}>
                    Stream Boldly. <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Speak Freely.</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </h1>
          </div>

          <div className="h-auto sm:h-[84px] max-w-lg">
            <AnimatePresence mode="wait">
              <motion.p 
                key={isStealth ? "stealth-desc" : "creator-desc"}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className={`text-sm sm:text-base lg:text-lg leading-relaxed transition-colors duration-700 ${isStealth ? 'text-zinc-400' : 'text-zinc-600'}`}
              >
                {isStealth 
                  ? "Your identity is hidden. Your data is encrypted. In this mode, share stories that need to be heard without fear."
                  : "Build your brand, grow your audience, and monetize content. StreamWire gives you the tools to become a global sensation."
                }
              </motion.p>
            </AnimatePresence>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <Link to="/home" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98, y: 0 }}
                transition={{ duration: 0.15, ease: [0.4, 0.0, 0.2, 1] }}
                className={`group relative w-full sm:w-[180px] lg:w-[200px] h-[48px] sm:h-[52px] lg:h-[56px] rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 overflow-hidden transition-all duration-150 ease-out ${
                  isStealth 
                    ? "bg-green-500 text-zinc-950 shadow-[0_4px_20px_rgba(34,197,94,0.3)] hover:bg-green-400 hover:shadow-[0_8px_30px_rgba(34,197,94,0.45)]" 
                    : "bg-zinc-900 text-white shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:bg-zinc-800 hover:shadow-[0_8px_30px_rgba(99,102,241,0.25)]"
                }`}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out ${
                  isStealth ? 'bg-gradient-to-t from-emerald-400/20 to-transparent' : 'bg-gradient-to-t from-indigo-500/20 to-transparent'
                }`} />
                
                <AnimatePresence mode="wait">
                  {isStealth ? (
                    <motion.span key="stealth-btn" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex items-center gap-2 relative z-10">
                      Explore <Ghost className="w-5 h-5 group-hover:scale-110 transition-all duration-150 ease-out" />
                    </motion.span>
                  ) : (
                    <motion.span key="creator-btn" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex items-center gap-2 relative z-10">
                      Enter Gateway <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-all duration-150 ease-out" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </Link>
            
            <motion.button
              onClick={() => setIsStealth(!isStealth)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98, y: 0 }}
              transition={{ duration: 0.15, ease: [0.4, 0.0, 0.2, 1] }}
              className={`group relative w-full sm:w-[160px] lg:w-[180px] h-[48px] sm:h-[52px] lg:h-[56px] rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 overflow-hidden transition-all duration-150 ease-out ${
                isStealth 
                  ? 'border-2 border-green-500/30 bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 text-zinc-100 backdrop-blur-xl shadow-[0_0_25px_rgba(34,197,94,0.15)] hover:border-green-400/50 hover:shadow-[0_0_35px_rgba(34,197,94,0.3)] hover:text-white' 
                  : 'border-2 border-zinc-200 bg-gradient-to-br from-white to-zinc-50 text-zinc-700 shadow-[0_4px_20px_rgba(0,0,0,0.08)] hover:border-indigo-300 hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] hover:text-indigo-600'
              }`}
            >
              <motion.div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ease-out ${
                  isStealth ? 'bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5' : 'bg-gradient-to-r from-indigo-500/5 via-violet-500/5 to-indigo-500/5'
                }`}
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              
              <span className="relative z-10 flex items-center gap-2">
                Switch Mode
                <motion.div animate={{ rotate: isStealth ? 180 : 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
              </span>
            </motion.button>
          </div>
        </div>
      </ScrollReveal>

      <div className="flex justify-center lg:justify-end">
        <HeroMascot isStealth={isStealth} onToggle={() => setIsStealth(!isStealth)} />
      </div>
    </section>
  )
}
