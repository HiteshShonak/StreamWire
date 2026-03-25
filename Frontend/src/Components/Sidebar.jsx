import { useState, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutGrid, Flame, Folder,
  Settings, HelpCircle, Fingerprint,
  History, Bookmark, Users, Menu, X, ChevronRight
} from 'lucide-react'


const getContextTab = (pathname) => {
  if (pathname.startsWith('/cinema')) return 'videos'
  if (pathname.startsWith('/wire')) return 'tweets'
  if (pathname.startsWith('/shadows') || pathname.startsWith('/shadow')) return 'stealth'
  return null // Gateway or other pages - no context lock
}

const getContextPath = (basePath, contextTab) => {
  if (!contextTab) return basePath
  return `${basePath}?tab=${contextTab}`
}


const NavItem = ({ icon: Icon, label, path, isDanger = false, isCollapsed = false, onClick }) => {
  const location = useLocation()

  // Check if this path is active (handle query params)
  const isActive = location.pathname === path.split('?')[0] ||
    (path.includes('?') && location.pathname + location.search === path)

  return (
    <NavLink to={path} className="relative group w-full" onClick={onClick}>
      {() => (
        <div className={`
          relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
          ${isCollapsed ? 'justify-center px-3' : ''}
          ${isActive
            ? 'text-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]'
            : isDanger
              ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
              : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
          }
        `}>
          {/* Active Glow Indicator (Left Bar) */}
          {isActive && !isCollapsed && (
            <motion.div
              layoutId="activeNav"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_rgba(99,102,241,0.6)]"
            />
          )}

          {/* Active Dot for Collapsed State */}
          {isActive && isCollapsed && (
            <motion.div
              layoutId="activeNavDot"
              className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.6)]"
            />
          )}

          <Icon className={`w-5 h-5 transition-transform duration-300 shrink-0 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />

          {!isCollapsed && (
            <span className={`text-sm font-bold tracking-wide whitespace-nowrap ${isActive ? 'font-extrabold' : 'font-medium'}`}>
              {label}
            </span>
          )}

          {/* Hover Glow Background (Subtle) */}
          <div className="absolute inset-0 rounded-xl bg-linear-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Tooltip for Collapsed State */}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-sm font-medium text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 shadow-xl">
              {label}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-zinc-900 border-l border-b border-zinc-700 rotate-45" />
            </div>
          )}
        </div>
      )}
    </NavLink>
  )
}


export default function Sidebar() {
  const location = useLocation()
  const [isExpanded, setIsExpanded] = useState(false)

  // Detect current context for smart navigation
  const contextTab = useMemo(() => getContextTab(location.pathname), [location.pathname])

  // Don't show sidebar on Landing Page ("/") or Login/Register
  // But SHOW it on /home (Gateway) and feeds
  const hiddenRoutes = ['/', '/login', '/register']
  if (hiddenRoutes.includes(location.pathname)) return null

  // Close mobile sidebar on navigation
  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setIsExpanded(false)
    }
  }

  return (
    <>
      {/* Mobile toggle button (bottom left) */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed left-4 bottom-6 z-50 lg:hidden w-12 h-12 rounded-full bg-zinc-900/90 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white shadow-2xl shadow-black/50 hover:bg-zinc-800 transition-colors"
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-5 h-5" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden gpu-layer"
          />
        )}
      </AnimatePresence>

      {/* Desktop sidebar (always visible on lg+) */}
      <motion.aside
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "circOut" }}
        className="fixed left-4 top-28 bottom-6 w-64 hidden lg:flex flex-col z-40 gpu-layer will-change-transform"
      >
        <div className="flex-1 flex flex-col justify-between bg-[#0A0A0A]/60 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 shadow-2xl shadow-black/50 overflow-y-auto custom-scrollbar">

          {/* TOP SECTION: Main Navigation */}
          <nav className="space-y-1">
            <div className="px-4 py-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                Platform
              </span>
            </div>

            <NavItem icon={LayoutGrid} label="Gateway" path="/home" />
            <NavItem icon={Flame} label="Trending" path={getContextPath('/trending', contextTab)} />
            <NavItem icon={Users} label="Following" path="/following" />
          </nav>

          {/* MIDDLE SECTION: Library */}
          <nav className="space-y-1 mt-6">
            <div className="px-4 py-2 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                Library
              </span>
            </div>

            <NavItem icon={History} label="History" path="/history" />
            <NavItem icon={Bookmark} label="Saved" path="/saved" />
            <NavItem icon={Folder} label="Your Content" path="/dashboard" />
          </nav>

          {/* SPACER */}
          <div className="flex-1" />

          {/* BOTTOM SECTION: Utilities */}
          <nav className="space-y-1 mt-6 pt-6 border-t border-white/5">
            <NavItem icon={Settings} label="Settings" path="/settings" />
            <NavItem icon={HelpCircle} label="Help & Support" path="/support" />

            <div className="pt-2 mt-2">
              <NavItem icon={Fingerprint} label="Ghost Mode" path="/kill-switch" isDanger={true} />
            </div>
          </nav>

        </div>
      </motion.aside>

      {/* Mobile sidebar (slide-in from left) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-72 flex flex-col z-50 lg:hidden gpu-layer will-change-transform"
          >
            <div className="flex-1 flex flex-col bg-[#0A0A0A]/95 backdrop-blur-2xl border-r border-white/10 p-4 pt-6 shadow-2xl shadow-black/50 overflow-y-auto custom-scrollbar">

              {/* MOBILE HEADER */}
              <div className="flex items-center justify-between mb-6 px-2">
                <span className="text-lg font-black text-white tracking-tight">StreamWire</span>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* TOP SECTION: Main Navigation */}
              <nav className="space-y-1">
                <div className="px-4 py-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    Platform
                  </span>
                </div>

                <NavItem icon={LayoutGrid} label="Gateway" path="/home" onClick={handleNavClick} />
                <NavItem icon={Flame} label="Trending" path={getContextPath('/trending', contextTab)} onClick={handleNavClick} />
                <NavItem icon={Users} label="Following" path="/following" onClick={handleNavClick} />
              </nav>

              {/* MIDDLE SECTION: Library */}
              <nav className="space-y-1 mt-6">
                <div className="px-4 py-2 mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                    Library
                  </span>
                </div>

                <NavItem icon={History} label="History" path="/history" onClick={handleNavClick} />
                <NavItem icon={Bookmark} label="Saved" path="/saved" onClick={handleNavClick} />
                <NavItem icon={Folder} label="Your Content" path="/dashboard" onClick={handleNavClick} />
              </nav>

              {/* SPACER */}
              <div className="flex-1" />

              {/* BOTTOM SECTION: Utilities */}
              <nav className="space-y-1 mt-6 pt-6 border-t border-white/5">
                <NavItem icon={Settings} label="Settings" path="/settings" onClick={handleNavClick} />
                <NavItem icon={HelpCircle} label="Help & Support" path="/support" onClick={handleNavClick} />

                <div className="pt-2 mt-2">
                  <NavItem icon={Fingerprint} label="Ghost Mode" path="/kill-switch" isDanger={true} onClick={handleNavClick} />
                </div>
              </nav>

            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}