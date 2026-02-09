import { motion } from 'framer-motion'
import stealthcat from '../../assets/stealth-cat.png'
import creatorcat from '../../assets/creator-cat.png'

export const HeroMascot = ({ isStealth, onToggle }) => {
  return (
    <div className="relative w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] md:w-[420px] md:h-[420px] lg:w-[480px] lg:h-[480px] flex items-center justify-center perspective-1000 select-none group">
      <motion.div 
        animate={{ 
          opacity: isStealth ? 0.4 : 0.2,
          scale: isStealth ? 1.15 : 1,
          background: isStealth 
            ? "radial-gradient(circle, rgba(34,197,94,0.5) 0%, transparent 70%)" 
            : "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)"
        }}
        className="absolute inset-0 blur-[80px] transition-all duration-700"
      />
      <motion.div
        className="relative w-full h-full z-10 cursor-pointer"
        onClick={onToggle}
        initial={false}
        animate={{ rotateY: isStealth ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center" style={{ backfaceVisibility: "hidden" }}>
           <img 
             src={creatorcat} 
             alt="Creator Mode" 
             className="w-full h-[85%] sm:h-[90%] object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105" 
             loading="lazy"
           />
           <div className="mt-2 sm:mt-4 bg-white/80 border border-indigo-100 px-3 sm:px-6 py-1.5 sm:py-2 rounded-full shadow-lg text-xs sm:text-sm font-bold text-zinc-600 backdrop-blur-md">
             👋 Identity: <span className="text-indigo-600">PUBLIC</span>
           </div>
        </div>
        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
           <img 
             src={stealthcat} 
             alt="Stealth Mode" 
             className="w-full h-[85%] sm:h-[90%] object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105" 
             style={{ transform: "rotate(48deg)" }}
             loading="lazy"
           />
           <div className="mt-2 sm:mt-4 bg-zinc-950/80 border border-green-500/30 px-3 sm:px-6 py-1.5 sm:py-2 rounded-full shadow-lg text-xs sm:text-sm font-bold text-green-400 backdrop-blur-md font-mono tracking-wider">
             🕵️ Identity: HIDDEN
           </div>
        </div>
      </motion.div>
    </div>
  )
}
