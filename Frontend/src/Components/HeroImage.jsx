import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Zap, Ghost, Lock, Play,
  ArrowRight, Globe, Users
} from 'lucide-react'

// The interactive stealth demo
const StealthDemo = () => {
  const [isStealth, setIsStealth] = useState(false)

  return (
    <div className="relative group cursor-default">
      {/* The Toggle Switch UI */}
      <div
        onClick={() => setIsStealth(!isStealth)}
        className={`
          absolute -top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer select-none transition-all duration-300 shadow-lg z-20 flex items-center gap-2
          ${isStealth ? "bg-green-500 text-black shadow-green-500/50" : "bg-zinc-800 text-zinc-400 border border-zinc-700"}
        `}
      >
        <div className={`w-2 h-2 rounded-full ${isStealth ? "bg-black animate-pulse" : "bg-zinc-500"}`} />
        {isStealth ? "Stealth Active" : "Public Mode"}
      </div>

      {/* The Profile Card */}
      <motion.div
        layout
        className={`
          relative w-72 p-6 rounded-2xl border backdrop-blur-xl transition-all duration-500 overflow-hidden
          ${isStealth
            ? "bg-zinc-950/80 border-green-500/30 shadow-2xl shadow-green-500/10"
            : "bg-white/80 border-zinc-200 shadow-xl shadow-indigo-500/10"
          }
        `}
      >
        {/* Matrix Rain Effect (Only in Stealth) */}
        <AnimatePresence>
          {isStealth && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/1/17/Matrix_code.gif')] bg-cover opacity-5 pointer-events-none mix-blend-screen"
            />
          )}
        </AnimatePresence>

        <div className="flex items-center gap-4 mb-4 relative z-10">
          <motion.div
            layout
            className={`w-12 h-12 rounded-full flex items-center justify-center text-xl overflow-hidden transition-colors duration-500 ${isStealth ? "bg-zinc-900 text-green-500 border border-green-500/50" : "bg-indigo-100 text-indigo-600"}`}
          >
            {isStealth ? <Ghost className="w-6 h-6" /> : <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />}
          </motion.div>
          <div>
            <motion.h3 layout className={`font-bold text-sm ${isStealth ? "text-green-500 font-mono" : "text-zinc-900"}`}>
              {isStealth ? "Anonymous_User_404" : "Felix Kjellberg"}
            </motion.h3>
            <motion.p layout className="text-xs text-zinc-500">
              {isStealth ? "Identity Encrypted" : "@felix_k • 2h ago"}
            </motion.p>
          </div>
        </div>

        <div className="space-y-2 relative z-10">
          <div className={`h-2 rounded-full w-3/4 ${isStealth ? "bg-green-900/30" : "bg-zinc-100"}`} />
          <div className={`h-2 rounded-full w-1/2 ${isStealth ? "bg-green-900/30" : "bg-zinc-100"}`} />
        </div>

        <div className="mt-6 flex justify-between items-center relative z-10">
          <div className={`text-xs font-medium px-2 py-1 rounded ${isStealth ? "bg-green-900/20 text-green-400 border border-green-500/20" : "bg-indigo-50 text-indigo-600"}`}>
            {isStealth ? "Untraceable" : "Verified Creator"}
          </div>
          <Shield className={`w-4 h-4 ${isStealth ? "text-green-500" : "text-zinc-300"}`} />
        </div>
      </motion.div>
    </div>
  )
}

// Main component
export default function Home() {
  const { status, userData } = useSelector((state) => state.auth)

  // View 1: Logged in
  if (status) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Welcome Header */}
        <section className="relative rounded-3xl bg-zinc-900 text-white p-8 md:p-12 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600 rounded-full blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-bold mb-4">
              ✨ Welcome back, {userData?.username || "Creator"}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
              Ready to create something <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">extraordinary?</span>
            </h1>
            <div className="flex gap-3">
              <Link to="/upload" className="bg-white text-zinc-900 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-100 transition-colors flex items-center gap-2">
                <Play className="w-4 h-4 fill-current" /> Resume Watching
              </Link>
              <button className="px-5 py-2.5 rounded-xl font-bold text-sm text-white border border-white/20 hover:bg-white/10 transition-colors">
                View Analytics
              </button>
            </div>
          </div>
        </section>

        {/* Video Grid Placeholder */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900 mb-4">Trending Now</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-video bg-zinc-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // View 2: Guest (landing page)
  return (
    <div className="min-h-screen">

      {/* HERO SECTION */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">

          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wide">
              <Zap className="w-3 h-3 fill-current" />
              <span>The Future of Streaming</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 leading-[1.1]">
              Stream Boldly. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                Speak Freely.
              </span>
            </h1>

            <p className="text-lg text-zinc-600 max-w-lg leading-relaxed">
              The first platform where you can switch between a <b>Public Creator</b> and a <b>Stealth Ghost</b> instantly. Build a brand, or speak the truth anonymously.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/register" className="px-8 py-4 bg-zinc-900 hover:bg-black text-white rounded-2xl font-bold text-lg shadow-xl shadow-zinc-900/20 transition-transform active:scale-95 flex items-center justify-center gap-2">
                Start Watching <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/about" className="px-8 py-4 bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 rounded-2xl font-bold text-lg transition-colors flex items-center justify-center">
                How it works
              </Link>
            </div>

            <div className="pt-8 flex items-center gap-6 text-sm font-medium text-zinc-500">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" /> Censorship Resistant
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-600" /> Community Owned
              </div>
            </div>
          </motion.div>

          {/* Right: Interactive Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Abstract Blobs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-3/4 w-[300px] h-[300px] bg-green-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* The Demo Component */}
            <div className="relative">
              <div className="absolute -inset-4 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/50 -z-10 rotate-6 scale-105"></div>
              <StealthDemo />
            </div>
          </motion.div>

        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="py-24 bg-white border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-zinc-900 mb-4">Why we built StreamWire</h2>
            <p className="text-zinc-500">Traditional platforms lock you into one identity. We believe you should have the freedom to express every side of yourself.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Ghost className="w-8 h-8 text-indigo-600" />}
              title="Stealth Mode"
              desc="Flip a switch to cloak your identity. Post anonymously, and reveal yourself only when you are ready to claim the fame."
            />
            <FeatureCard
              icon={<Lock className="w-8 h-8 text-indigo-600" />}
              title="Ghost Mode"
              desc="Feeling unsafe? One button wipes your digital footprint from specific interactions instantly. Total control."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-indigo-600" />}
              title="Viral Claim"
              desc="Go viral as a ghost. When your video hits 1M views, claim it to your main profile and transfer the stats."
            />
          </div>
        </div>
      </section>

    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-8 bg-[#F9FAFB] rounded-3xl border border-zinc-100 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/5 transition-all group">
      <div className="w-14 h-14 bg-white rounded-2xl border border-zinc-200 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-zinc-900 mb-3">{title}</h3>
      <p className="text-zinc-500 leading-relaxed">{desc}</p>
    </div>
  )
} 