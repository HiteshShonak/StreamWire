import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion'
import { Film, MessageSquare, VenetianMask, ArrowRight, Zap } from 'lucide-react'
import Header from '../Components/Header' 
import { Footer } from '../components/LandingPage' 

// ==========================================
// 🎨 COMPONENT: Hyper-Responsive Spotlight Card
// ==========================================
const SpotlightCard = ({ id, title, subtitle, icon: Icon, path, gradient, accent, iconColor, iconBg }) => {
  const ref = useRef(null);

  // 1. Mouse Tracking Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 2. Spring Physics
  const mouseX = useSpring(x, { stiffness: 300, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 300, damping: 20 });

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    x.set(clientX - left);
    y.set(clientY - top);
  }

  return (
    <Link to={path} className="relative group perspective-1000">
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`
          relative w-full h-[450px] md:h-[500px] rounded-[2.5rem] overflow-hidden
          bg-zinc-900/40 backdrop-blur-xl border border-white/10
          flex flex-col justify-between p-8 md:p-10
          group-hover:border-white/20 transition-colors duration-200
        `}
      >
        {/* 🔦 Dynamic Spotlight */}
        <motion.div
          className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                650px circle at ${mouseX}px ${mouseY}px,
                rgba(255, 255, 255, 0.1),
                transparent 80%
              )
            `,
          }}
        />

        {/* ✨ Hover Gradient Bloom */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out`} />

        {/* Content Layer */}
        <div className="relative z-20 h-full flex flex-col justify-between">
            
            {/* Top Section */}
            <div>
                {/* 👇 REVERTED: Clean Icon Container */}
                <div className={`
                    w-14 h-14 rounded-2xl flex items-center justify-center mb-6
                    border border-white/10 
                    group-hover:scale-110 group-hover:border-white/20
                    transition-all duration-300 ease-out origin-left
                    shadow-lg shadow-black/20
                    ${iconBg} ${iconColor}
                `}>
                    <Icon className="w-7 h-7" strokeWidth={2} />
                </div>
                
                <h2 className="text-4xl font-black text-white mb-3 tracking-tighter uppercase italic transform group-hover:translate-x-2 transition-transform duration-300">
                    {title}
                </h2>
                <p className="text-zinc-400 text-sm font-medium leading-relaxed max-w-xs group-hover:text-zinc-100 transition-colors duration-200">
                    {subtitle}
                </p>
            </div>

            {/* Bottom Action Section */}
            <div>
                <div className="h-[1px] w-full bg-white/10 mb-6 group-hover:bg-white/30 transition-colors duration-300" />
                
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 group-hover:text-white transition-colors duration-200">
                    Enter Portal
                    </span>
                    
                    <motion.div 
                        whileHover={{ x: 5 }}
                        className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        border border-white/10 bg-white/5 
                        group-hover:bg-white group-hover:text-black group-hover:border-white
                        transition-all duration-200
                        `}
                    >
                    <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                    </motion.div>
                </div>
            </div>
        </div>

      </motion.div>
    </Link>
  )
}

// ==========================================
// 🏠 MAIN PAGE COMPONENT
// ==========================================
export default function Home() {
  const worlds = [
    {
      id: 'cinema',
      title: 'The Cinema',
      subtitle: 'Long-form masterpieces. Immerse yourself in high-fidelity streams.',
      icon: Film, // 👈 Generic Icon
      path: '/cinema',
      gradient: 'from-indigo-600/20 to-purple-600/20',
      accent: 'text-indigo-400',
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10'
    },
    {
      id: 'wire',
      title: 'The Wire',
      subtitle: 'The pulse of the network. Real-time discourse and breaking trends.',
      icon: MessageSquare, // 👈 Generic Icon
      path: '/wire',
      gradient: 'from-zinc-500/20 to-zinc-700/20',
      accent: 'text-zinc-300',
      iconColor: 'text-sky-400',
      iconBg: 'bg-sky-500/10'
    },
    {
      id: 'shadows',
      title: 'The Shadows',
      subtitle: 'Encrypted & Anonymous. Speak the truth without fear.',
      icon: VenetianMask, // 👈 Generic Icon
      path: '/shadows',
      gradient: 'from-emerald-600/20 to-green-600/20',
      accent: 'text-green-400',
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10'
    }
  ]

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 overflow-x-hidden relative">
      
      {/* 🌌 AMBIENT BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }} />
          
          {/* Noise Texture */}
          <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
      </div>

      {/* ⚡ THE GLOBAL HEADER (Gateway Variant) */}
      <Header variant="gateway" />

      {/* MAIN CONTENT */}
      <main className="relative z-30 pt-25 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center min-h-screen">
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6 backdrop-blur-md">
            <Zap className="w-3 h-3 text-yellow-400 fill-current" />
            <span>Select Protocol</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-white">
            CHOOSE YOUR <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-emerald-300 animate-gradient-x">REALITY</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Three isolated networks. One platform. <br/> Select a channel to initiate connection.
          </p>
        </motion.div>

        {/* ⚡ THE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {worlds.map((world, i) => (
            <motion.div
              key={world.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "backOut" }}
            >
              <SpotlightCard {...world} />
            </motion.div>
          ))}
        </div>

      </main>

      {/* FOOTER */}
      <div className="relative z-30 bg-black border-t border-white/10">
        <Footer isStealth={true} /> 
      </div>

    </div>
  )
}