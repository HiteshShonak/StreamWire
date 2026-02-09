import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { User, LayoutGrid, Radio, Ghost, Zap } from 'lucide-react'
import {
  CustomLogo,
  HeroSection,
  AIFeatures,
  BentoGrid,
  Footer
} from '../components/LandingPage'

// ==========================================
// 🧠 COMPONENT: Landing Header (Pill Style)
// ==========================================
const LandingHeader = ({ isStealth, isLoggedIn, userData }) => {
  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "circOut" }}
      className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
    >
      <div className={`
        pointer-events-auto w-full max-w-300 backdrop-blur-2xl rounded-full p-2 pl-6 flex items-center justify-between transition-all duration-700
        border shadow-xl
        ${isStealth
          ? 'bg-[#0A0A0A]/70 border-white/10 shadow-black/50'
          : 'bg-white/70 border-zinc-200/50 shadow-zinc-200/50'
        }
      `}>

        {/* LEFT: Logo */}
        <Link to="/" className="flex items-center gap-3 pr-6 group">
          <div className="relative flex items-center justify-center">
            <div className={`absolute inset-0 blur-lg rounded-full animate-pulse ${isStealth ? 'bg-green-500/20' : 'bg-indigo-500/20'}`} />
            <motion.div
              animate={isStealth ? { x: [-1, 1, -1, 0], opacity: [1, 0.8, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
            >
              {isStealth ? (
                <Ghost className="w-5 h-5 relative z-10 text-green-500" />
              ) : (
                <Radio className="w-5 h-5 relative z-10 text-indigo-600" />
              )}
            </motion.div>
          </div>

          <span className={`font-bold text-lg tracking-tight hidden sm:block transition-colors duration-500 ${isStealth ? 'text-white' : 'text-zinc-900'}`}>
            StreamWire
          </span>
        </Link>

        {/* RIGHT: Auth Actions */}
        <div className={`flex items-center gap-2 pl-6 border-l transition-colors duration-500 ${isStealth ? 'border-white/10' : 'border-zinc-200'}`}>
          {isLoggedIn ? (
            <>
              <Link to="/dashboard">
                <button className={`hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${isStealth
                  ? 'bg-white/10 text-white hover:bg-white/20'
                  : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                  }`}>
                  <LayoutGrid className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
              </Link>

              <Link to="/home">
                <div className={`w-10 h-10 rounded-full p-0.5 bg-linear-to-tr hover:scale-105 transition-transform cursor-pointer ${isStealth ? 'from-green-500 to-emerald-600' : 'from-indigo-500 to-violet-600'
                  }`}>
                  <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center border-2 border-transparent ${isStealth ? 'bg-black' : 'bg-white'}`}>
                    {userData?.avatar?.url ? (
                      <img src={userData.avatar.url} className="w-full h-full object-cover" alt="User" />
                    ) : (
                      <div className={`text-sm font-bold w-full h-full flex items-center justify-center ${isStealth ? 'bg-black text-white' : 'bg-white text-zinc-700'}`}>
                        {userData?.fullName?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className={`hidden sm:block text-sm font-bold px-4 transition-colors ${isStealth ? 'text-zinc-400 hover:text-white' : 'text-zinc-500 hover:text-zinc-900'
                }`}>
                Log in
              </Link>
              <Link to="/register">
                <button className={`group relative px-6 py-2.5 rounded-full text-sm font-bold overflow-hidden transition-all shadow-lg ${isStealth
                  ? 'bg-green-500 text-black hover:bg-green-400 shadow-green-900/20'
                  : 'bg-zinc-900 text-white hover:bg-black shadow-zinc-200'
                  }`}>
                  <span className="relative z-10">Get Started</span>
                </button>
              </Link>
            </>
          )}
        </div>

      </div>
    </motion.header>
  )
}

// ==========================================
// 🏠 MAIN PAGE COMPONENT
// ==========================================
export default function Landing() {
  const [isStealth, setIsStealth] = useState(false)
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

  // Get auth state from Redux
  const { status: isLoggedIn, userData } = useSelector((state) => state.auth)

  return (
    <div className={`min-h-screen w-full relative transition-colors duration-1000 ${isStealth ? 'bg-[#0a0a0a]' : 'bg-[#FDFDFD]'}`}>

      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.04] mix-blend-overlay">
        <svg className="w-full h-full">
          <filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.6" stitchTiles="stitch" /></filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none">
        <motion.div style={{ y: y1 }} animate={{ background: isStealth ? "radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.12), transparent 50%)" : "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.12), transparent 50%)" }} transition={{ duration: 1.5 }} className="absolute top-0 left-0 w-full h-full" />
        <motion.div style={{ y: y2 }} animate={{ background: isStealth ? "radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.08), transparent 40%)" : "radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.08), transparent 40%)" }} transition={{ duration: 1.5 }} className="absolute bottom-0 right-0 w-full h-full" />
      </div>

      <LandingHeader isStealth={isStealth} isLoggedIn={isLoggedIn} userData={userData} />

      <div className="pt-20">
        <HeroSection isStealth={isStealth} setIsStealth={setIsStealth} />
      </div>

      <AIFeatures isStealth={isStealth} />

      <BentoGrid isStealth={isStealth} />

      <Footer isStealth={isStealth} />

    </div>
  )
}