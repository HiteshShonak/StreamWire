import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, User, Command,
  Film, MessageSquare, VenetianMask,
  Upload, PenSquare, Radio, Ghost, X, Lock, ShieldCheck
} from 'lucide-react'

import CinemaIcon from '../assets/TheCinemaLogo.webp';
import WireIcon from '../assets/TheWireLogo.webp';
import ShadowsIcon from '../assets/TheShadowsLogo.webp';
import gatewayIcon from '../assets/favicon.webp';

export default function Header({ variant = 'gateway', onUploadClick: _onUploadClick }) {
  const { status, userData, loading } = useSelector((state) => state.auth)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const mobileInputRef = useRef(null)

  // Smart search logic
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isOnSearchPage = location.pathname === '/search'

  // Only show query value when on search page
  const [query, setQuery] = useState(isOnSearchPage ? (searchParams.get("query") || "") : "")

  // Clear query when navigating away from search page
  useEffect(() => {
    if (!isOnSearchPage) {
      setQuery("")
    } else {
      setQuery(searchParams.get("query") || "")
    }
  }, [isOnSearchPage, searchParams])

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      let targetTab = 'all'

      if (isOnSearchPage) {
        targetTab = searchParams.get('tab') || 'all'
      }
      else {
        switch (variant) {
          case 'cinema':
            targetTab = 'videos'
            break
          case 'wire':
            targetTab = 'tweets'
            break
          case 'shadows':
            targetTab = 'stealth'
            break
          case 'gateway':
          default:
            targetTab = 'all'
        }
      }

      // Navigate with Context
      navigate(`/search?query=${encodeURIComponent(query.trim())}&tab=${targetTab}`)
      setIsMobileSearchOpen(false)
    }
  }

  // Focus input when mobile search opens
  useEffect(() => {
    if (isMobileSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus()
    }
  }, [isMobileSearchOpen])


  const config = {
    gateway: {
      theme: "border-white/10 bg-[#0A0A0A]/80 shadow-black/50 backdrop-blur-xl",
      accent: "from-indigo-500 to-purple-600",
      placeholder: "Search the network...",
      icon: Radio,
      customIcon: gatewayIcon,
      logoColor: "text-white",
      actionLabel: "Create",
      ActionIcon: Plus,
      inputStyle: "bg-white/5 border-white/5 text-zinc-200 focus:border-indigo-500/50",
      buttonStyle: "bg-white text-black hover:bg-zinc-200"
    },
    cinema: {
      theme: "border-indigo-500/10 bg-[#050510]/90 shadow-indigo-900/20 backdrop-blur-xl",
      accent: "from-indigo-400 to-violet-600",
      placeholder: "Search cinema library...",
      icon: Film,
      customIcon: CinemaIcon,
      logoColor: "text-indigo-100",
      actionLabel: "Upload",
      ActionIcon: Upload,
      inputStyle: "bg-[#0f0f1a] border-indigo-500/20 text-indigo-100 focus:border-indigo-400/50",
      buttonStyle: "bg-indigo-600 text-white hover:bg-indigo-500"
    },
    wire: {
      theme: "border-sky-500/10 bg-[#0a0a0a]/90 shadow-sky-900/10 backdrop-blur-xl",
      accent: "from-sky-400 to-blue-600",
      placeholder: "Search wires & trends...",
      icon: MessageSquare,
      customIcon: WireIcon,
      logoColor: "text-sky-100",
      actionLabel: "Post",
      ActionIcon: PenSquare,
      inputStyle: "bg-[#0f0f11] border-sky-500/20 text-sky-100 focus:border-sky-400/50",
      buttonStyle: "bg-sky-500 text-white hover:bg-sky-400"
    },
    shadows: {
      theme: "border-zinc-800 bg-[#09090b]/90 shadow-2xl shadow-black backdrop-blur-xl",
      accent: "from-emerald-600 to-teal-700",
      placeholder: "Search secure channel...",
      icon: Lock,
      customIcon: ShadowsIcon,
      logoColor: "text-emerald-500 tracking-tight font-medium",
      actionLabel: "Secure Drop",
      ActionIcon: ShieldCheck,
      inputStyle: "bg-text-main border-zinc-800 text-zinc-300 placeholder:text-zinc-600 focus:border-emerald-500/30 focus:bg-[#202023]",
      buttonStyle: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20",
      isStealth: true
    }
  }

  const current = config[variant] || config.gateway
  const isStealth = current.isStealth

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "circOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none gpu-layer will-change-transform"
    >
      <div className={`
        pointer-events-auto w-full max-w-350 rounded-full transition-all duration-500 ease-out
        border ${current.theme}
        ${isMobileSearchOpen ? 'p-2' : 'p-2 pl-6'}
      `}>

        {/* ================= MOBILE SEARCH MODE ================= */}
        <AnimatePresence mode="wait">
          {isMobileSearchOpen ? (
            <motion.div
              key="mobile-search"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="w-full flex items-center gap-3"
            >
              <Search className={`w-5 h-5 ml-3 ${isStealth ? 'text-emerald-600' : 'text-zinc-400'}`} />
              <input
                ref={mobileInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder={current.placeholder}
                className={`
                            flex-1 bg-transparent border-none outline-none text-base h-10 
                            ${isStealth ? 'text-zinc-200 placeholder:text-zinc-600' : 'text-white placeholder:text-zinc-500'}
                        `}
              />
              <button
                onClick={() => setIsMobileSearchOpen(false)}
                className={`p-2 rounded-full ${isStealth ? 'bg-zinc-800 text-zinc-400' : 'bg-white/10 text-zinc-300'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="standard-header"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex items-center justify-between"
            >
              <Link to={variant === 'cinema' ? '/cinema' : variant === 'wire' ? '/wire' : variant === 'shadows' ? '/shadows' : '/home'} className="flex items-center gap-3 pr-6 mr-2 group">
                <div className="relative flex items-center justify-center">

                  <motion.div
                    animate={isStealth ? { opacity: [0.8, 1, 0.8] } : {}}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="relative z-10 flex items-center justify-center"
                  >
                    {current.customIcon ? (
                      <img
                        src={current.customIcon}
                        alt={`${variant} logo`}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <current.icon className={`w-5 h-5 ${isStealth ? 'text-emerald-500' : 'text-white'}`} />
                    )}
                  </motion.div>
                </div>

                <span className={`font-bold text-lg hidden md:block transition-colors duration-300 ${current.logoColor}`}>
                  {isStealth ? "The Shadows" : "StreamWire"}
                </span>
              </Link>


              {/* ================= CENTER: Search ================= */}
              <div className="flex-1 max-w-2xl px-4 hidden md:block">
                <div className="relative group/search">
                  <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isStealth ? 'text-zinc-600 group-focus-within/search:text-emerald-500' : 'text-zinc-500 group-focus-within/search:text-white'}`} />

                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    placeholder={current.placeholder}
                    className={`
                                    w-full h-10 rounded-full pl-11 pr-4 text-sm outline-none transition-all shadow-inner
                                    border ${current.inputStyle}
                                `}
                  />

                </div>
              </div>


              {/* ================= RIGHT: Actions ================= */}
              <div className="flex items-center gap-3 pl-6 border-l border-white/5">

                {/* Mobile Search Trigger */}
                <button
                  onClick={() => setIsMobileSearchOpen(true)}
                  className={`md:hidden p-2.5 rounded-full transition-colors ${isStealth ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-white/10 text-zinc-300'}`}
                >
                  <Search className="w-5 h-5" />
                </button>

                {status ? (
                  <>
                    {/* Upload Button (Cinema Only) */}
                    {variant === 'cinema' && (
                      <button
                        onClick={() => navigate('/upload')}
                        className="hidden sm:block"
                      >
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all ${current.buttonStyle}`}
                        >
                          <current.ActionIcon className="w-4 h-4" />
                          <span className="hidden lg:inline">{current.actionLabel}</span>
                        </motion.div>
                      </button>
                    )}

                    {/* User Avatar - Links to Dashboard */}
                    <div
                      className="ml-1 relative"
                      onMouseEnter={() => setShowTooltip(true)}
                      onMouseLeave={() => setShowTooltip(false)}
                    >
                      {loading ? (
                        /* Loading Skeleton with shimmer */
                        <div className="w-10 h-10 rounded-full skeleton" />
                      ) : (
                        <Link to="/dashboard" className="group/avatar block">
                          <div className={`w-10 h-10 rounded-full p-0.5 bg-linear-to-tr ${current.accent} hover:scale-110 transition-all duration-300 cursor-pointer relative group-hover/avatar:shadow-lg group-hover/avatar:shadow-indigo-500/50`}>
                            {/* Glow effect on hover */}
                            <div className="absolute inset-0 rounded-full bg-linear-to-tr from-indigo-500 to-purple-600 opacity-0 group-hover/avatar:opacity-30 blur-md transition-opacity duration-300" />

                            <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center border-2 border-black relative z-10">
                              {isStealth ? (
                                <motion.div
                                  key="stealth-avatar"
                                  initial={{ scale: 0.8, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <Ghost className="w-5 h-5 text-emerald-500" />
                                </motion.div>
                              ) : (
                                <AnimatePresence mode="wait">
                                  {userData?.avatar?.url ? (
                                    <motion.img
                                      key={userData.avatar.url}
                                      src={userData.avatar.url}
                                      initial={{ scale: 0.8, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0.8, opacity: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="w-full h-full object-cover"
                                      alt="User"
                                    />
                                  ) : (
                                    <motion.div
                                      key="avatar-fallback"
                                      initial={{ scale: 0.8, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0.8, opacity: 0 }}
                                      transition={{ duration: 0.3 }}
                                      className="text-sm font-bold text-white bg-zinc-800 w-full h-full flex items-center justify-center"
                                    >
                                      {userData?.fullName?.[0]}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              )}
                            </div>
                          </div>
                        </Link>
                      )}

                      {/* Tooltip */}
                      <AnimatePresence>
                        {showTooltip && !loading && userData && (
                          <motion.div
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full right-0 mt-2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl z-50 whitespace-nowrap pointer-events-none"
                          >
                            <p className="text-sm font-medium text-white">{userData.fullName}</p>
                            <p className="text-xs text-zinc-400">@{userData.username}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="hidden sm:block text-sm font-medium text-zinc-400 hover:text-white px-4 transition-colors">
                      Log in
                    </Link>
                    <Link to="/register">
                      <button className="px-6 py-2 rounded-full bg-white text-black text-sm font-bold hover:bg-zinc-200 transition-colors">
                        Sign Up
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  )
}