import { motion } from 'framer-motion'
import { LayoutGrid, TrendingUp, Fingerprint, MessageSquare } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'
import { InteractiveFeedDemo } from './InteractiveFeedDemo'

export const BentoGrid = ({ isStealth }) => {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-24 px-4 sm:px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="mb-8 sm:mb-12 md:mb-16 text-center">
            <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 tracking-tight transition-colors duration-700 ${isStealth ? "text-white" : "text-zinc-900"}`}>
              One App. Two Worlds.
            </h2>
            <p className="text-zinc-500 max-w-2xl mx-auto text-sm sm:text-base lg:text-lg">StreamWire isn't just a video platform. It's a complete ecosystem.</p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Triple Feed Engine Card */}
          <ScrollReveal delay={0.1}>
            <motion.div 
              initial={{ y: 0 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.08, ease: [0.4, 0.0, 0.2, 1] }}
              className={`md:col-span-2 md:row-span-2 h-[420px] sm:h-[450px] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border overflow-hidden relative group cursor-pointer ${isStealth ? "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]" : "bg-gradient-to-br from-indigo-50 via-white to-violet-50 border-indigo-100 hover:border-indigo-200 hover:shadow-[0_12px_40px_rgba(99,102,241,0.15)]"}`}
              style={{ transition: 'border-color 0.08s cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 0.08s cubic-bezier(0.4, 0.0, 0.2, 1)' }}>
              <div className="relative z-10 h-full flex flex-col">
                <div className="mb-3 sm:mb-4 flex-shrink-0">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2">
                    <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-colors duration-150 ${isStealth ? "bg-zinc-800 text-green-400" : "bg-indigo-100 text-indigo-600"}`}>
                      <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h3 className={`text-lg sm:text-xl font-bold transition-colors duration-700 ${isStealth ? "text-white" : "text-zinc-900"}`}>Triple Feed Engine</h3>
                  </div>
                  <p className={`text-xs sm:text-sm max-w-md leading-relaxed ${isStealth ? "text-zinc-500" : "text-zinc-600"}`}>Three content universes with unique algorithms</p>
                </div>
                <div className="flex-1 min-h-0">
                  <InteractiveFeedDemo isStealth={isStealth} />
                </div>
              </div>
            </motion.div>
          </ScrollReveal>

          {/* Viral Claim Card */}
          <ScrollReveal delay={0.2}>
            <motion.div 
              initial={{ y: 0 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.08, ease: [0.4, 0.0, 0.2, 1] }}
              className={`h-[420px] sm:h-[450px] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border relative overflow-hidden cursor-pointer ${isStealth ? "bg-zinc-950 border-green-500/30 hover:border-green-500/50 hover:shadow-[0_12px_40px_rgba(34,197,94,0.2)]" : "bg-gradient-to-br from-emerald-50 via-white to-green-50 border-emerald-200 hover:border-emerald-300 hover:shadow-[0_12px_40px_rgba(16,185,129,0.15)]"}`}
              style={{ transition: 'border-color 0.08s cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 0.08s cubic-bezier(0.4, 0.0, 0.2, 1)' }}>
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${isStealth ? "bg-gradient-to-br from-green-500/5 to-transparent" : "bg-gradient-to-br from-emerald-100/30 to-transparent"}`} />
              
              <div className="relative z-10 h-full flex flex-col">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-colors duration-150 flex-shrink-0 ${isStealth ? "bg-green-500/10 text-green-400 group-hover:bg-green-500/15" : "bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200"}`}>
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className={`text-base sm:text-lg font-bold mb-2 flex-shrink-0 ${isStealth ? "text-white" : "text-zinc-900"}`}>Viral Claim™</h3>
                <p className={`text-xs leading-relaxed mb-3 sm:mb-4 flex-shrink-0 ${isStealth ? "text-zinc-400" : "text-zinc-600"}`}>
                  Post anonymously. Claim authorship when it goes viral.
                </p>
                
                <div className={`flex-1 rounded-xl p-3 sm:p-4 mb-3 overflow-y-auto ${isStealth ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-emerald-100"}`}>
                  <h4 className={`text-[10px] sm:text-xs font-bold mb-2 sm:mb-3 uppercase tracking-wide ${isStealth ? "text-green-400" : "text-emerald-600"}`}>How It Works</h4>
                  <ul className={`space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs ${isStealth ? "text-zinc-400" : "text-zinc-600"}`}>
                    <li className="flex items-start gap-1.5">
                      <span className={`font-bold flex-shrink-0 ${isStealth ? "text-green-400" : "text-emerald-500"}`}>1.</span>
                      <span>Post anonymously in Shadows</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className={`font-bold flex-shrink-0 ${isStealth ? "text-green-400" : "text-emerald-500"}`}>2.</span>
                      <span>Monitor engagement & virality</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className={`font-bold flex-shrink-0 ${isStealth ? "text-green-400" : "text-emerald-500"}`}>3.</span>
                      <span>Claim ownership with one tap</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className={`font-bold flex-shrink-0 ${isStealth ? "text-green-400" : "text-emerald-500"}`}>4.</span>
                      <span>Transfer to public profile</span>
                    </li>
                  </ul>
                </div>

                <div className={`pt-3 border-t flex-shrink-0 ${isStealth ? "border-zinc-800" : "border-emerald-100"}`}>
                  <span className={`text-[10px] sm:text-xs font-bold ${isStealth ? "text-green-400" : "text-emerald-600"}`}>🎯 One-Tap Claiming</span>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>

          {/* Ghost Mode Card */}
          <ScrollReveal delay={0.3}>
            <motion.div 
              initial={{ y: 0 }}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.08, ease: [0.4, 0.0, 0.2, 1] }}
              className={`h-[420px] sm:h-[450px] rounded-2xl sm:rounded-3xl p-5 sm:p-6 border relative overflow-hidden cursor-pointer ${isStealth ? "bg-zinc-900/50 border-zinc-800 hover:border-red-500/30 hover:shadow-[0_12px_40px_rgba(239,68,68,0.15)]" : "bg-gradient-to-br from-red-50 via-white to-orange-50 border-red-100 hover:border-red-200 hover:shadow-[0_12px_40px_rgba(239,68,68,0.15)]"}`}
              style={{ transition: 'border-color 0.08s cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 0.08s cubic-bezier(0.4, 0.0, 0.2, 1)' }}>
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${isStealth ? "bg-gradient-to-br from-red-500/5 to-transparent" : "bg-gradient-to-br from-red-100/30 to-transparent"}`} />
              
              <div className="relative z-10 h-full flex flex-col">
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 sm:mb-4 transition-all duration-150 flex-shrink-0 ${isStealth ? "bg-red-900/20 text-red-400 group-hover:bg-red-900/30" : "bg-red-100 text-red-600 group-hover:bg-red-200"}`}>
                  <Fingerprint className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className={`text-base sm:text-lg font-bold mb-2 transition-colors duration-700 flex-shrink-0 ${isStealth ? "text-white" : "text-zinc-900"}`}>Ghost Mode</h3>
                <p className={`text-xs leading-relaxed mb-3 sm:mb-4 flex-shrink-0 ${isStealth ? "text-zinc-400" : "text-zinc-600"}`}>
                  Hide your identity instantly. Complete anonymity across the platform.
                </p>

                <div className={`flex-1 rounded-xl p-3 sm:p-4 mb-3 overflow-y-auto ${isStealth ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-red-100"}`}>
                  <h4 className={`text-[10px] sm:text-xs font-bold mb-2 sm:mb-3 uppercase tracking-wide ${isStealth ? "text-emerald-400" : "text-emerald-600"}`}>What Gets Masked</h4>
                  <ul className={`space-y-1.5 sm:space-y-2 text-[10px] sm:text-xs ${isStealth ? "text-zinc-400" : "text-zinc-600"}`}>
                    <li className="flex items-start gap-1.5">
                      <span className={`flex-shrink-0 ${isStealth ? "text-emerald-400" : "text-emerald-500"}`}>•</span>
                      <span>Your name appears as "Anonymous"</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className={`flex-shrink-0 ${isStealth ? "text-emerald-400" : "text-emerald-500"}`}>•</span>
                      <span>Profile picture replaced with ghost icon</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className={`flex-shrink-0 ${isStealth ? "text-emerald-400" : "text-emerald-500"}`}>•</span>
                      <span>All your videos, wires & shadows</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className={`flex-shrink-0 ${isStealth ? "text-emerald-400" : "text-emerald-500"}`}>•</span>
                      <span>Comments & interactions stay anonymous</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className={`flex-shrink-0 ${isStealth ? "text-emerald-400" : "text-emerald-500"}`}>•</span>
                      <span>Content remains online, identity hidden</span>
                    </li>
                  </ul>
                </div>

                <div className={`pt-3 border-t flex-shrink-0 ${isStealth ? "border-zinc-800" : "border-red-100"}`}>
                  <span className={`text-[10px] sm:text-xs font-bold ${isStealth ? "text-emerald-400" : "text-emerald-600"}`}>👻 Reversible Anytime</span>
                </div>
              </div>
            </motion.div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  )
}
