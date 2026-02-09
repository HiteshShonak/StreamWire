import { motion } from 'framer-motion'
// 1. ADDED IMPORTS
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import {
   Video, MessageSquare, Ghost, Radio, Shield, Eye, EyeOff,
   Sparkles, BookOpen, Heart, Share2, BarChart3, Lock,
   Users, Zap, Brain, Cloud, Bell, Settings
} from 'lucide-react'
import Header from '../Components/Header'
import Sidebar from '../Components/Sidebar'

// ==========================================
// 🎨 BACKGROUND COMPONENTS
// ==========================================
const NoiseOverlay = () => (
   <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.04] mix-blend-overlay">
      <svg className="w-full h-full">
         <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" stitchTiles="stitch" />
         </filter>
         <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
   </div>
)

export default function About() {
   // 2. GET AUTH STATUS
   const { status } = useSelector((state) => state.auth)

   const coreFeatures = [
      {
         icon: Video,
         title: "Cinema",
         description: "Premium video streaming platform with AI-powered features. Upload, share, and discover high-quality video content with automatic transcription, smart summaries, and interactive Q&A.",
         color: "from-indigo-500 to-sky-500",
         features: [
            "HD video streaming with custom playback speeds",
            "AI-generated transcripts automatically",
            "AI video summarization with one click",
            "Ask questions about video content (AI Q&A)",
            "Genre-based discovery and trending videos",
            "Watch Later and viewing history",
            "Creator dashboard with analytics"
         ]
      },
      {
         icon: MessageSquare,
         title: "Wire",
         description: "Real-time social feed for creators and followers. Share thoughts, updates, and engage with your community through a Twitter-like microblogging experience.",
         color: "from-blue-500 to-cyan-500",
         features: [
            "Quick text posts with rich formatting",
            "Like and comment on posts",
            "Follow/unfollow creators instantly",
            "Delete your own posts anytime",
            "View all creator wires on their channel"
         ]
      },
      {
         icon: Ghost,
         title: "Shadows",
         description: "Anonymous posting platform for privacy-conscious users. Share thoughts or feedback freely without revealing your identity - perfect for whistleblowers and honest opinions.",
         color: "from-emerald-500 to-teal-500",
         features: [
            "Complete anonymity - no author tracking",
            "Anonymous comments on videos too",
            "Like and engage without identity",
            "Community-driven content feed",
            "Protection for honest voices"
         ]
      }
   ]

   const advancedFeatures = [
      {
         icon: Brain,
         title: "AI-Powered Intelligence",
         description: "Advanced Groq AI integration that automatically generates transcripts, smart summaries, and answers questions about your video content in real-time.",
         gradient: "from-violet-400 to-indigo-400"
      },
      {
         icon: Shield,
         title: "Kill Switch Privacy",
         description: "Instantly toggle between public and completely anonymous browsing. Your identity is protected when you need it most.",
         gradient: "from-red-400 to-orange-400"
      },
      {
         icon: Lock,
         title: "Advanced Security",
         description: "Multi-session management, encrypted data storage, and OTP-verified authentication keep your account secure.",
         gradient: "from-blue-400 to-indigo-400"
      },
      {
         icon: BarChart3,
         title: "Creator Dashboard",
         description: "Comprehensive analytics for content creators. Track views, engagement, subscriber growth, and revenue metrics.",
         gradient: "from-green-400 to-emerald-400"
      },
      {
         icon: Users,
         title: "Subscription System",
         description: "Build your audience with a flexible subscription system. Support creators and get notified of new content.",
         gradient: "from-yellow-400 to-amber-400"
      },
      {
         icon: Cloud,
         title: "Smart Library",
         description: "Organize your content with Watch Later and viewing history. Keep track of videos you love and want to watch again.",
         gradient: "from-cyan-400 to-blue-400"
      }
   ]

   const privacyFeatures = [
      {
         icon: EyeOff,
         title: "Identity Cloaking",
         description: "Hide your profile and activity from public view with a single toggle."
      },
      {
         icon: Eye,
         title: "Granular Permissions",
         description: "Control who can see your content, comments, and personal information."
      },
      {
         icon: Bell,
         title: "Smart Notifications",
         description: "Stay updated without compromising privacy. Customize what you want to hear about."
      }
   ]

   const statistics = [
      { value: "3", label: "Core Platforms", desc: "Cinema, Wire & Shadows" },
      { value: "AI", label: "Powered", desc: "Smart transcription & summaries" },
      { value: "100%", label: "Anonymous", desc: "Shadows platform guarantee" },
      { value: "24/7", label: "Support", desc: "Help when you need it" }
   ]

   return (
      <>
         <Header />
         <Sidebar />

         <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
            <NoiseOverlay />

            {/* Background Effects */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500 opacity-5 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[800px] h-[500px] bg-indigo-500 opacity-5 blur-[120px] pointer-events-none" />

            <div className="relative z-10 lg:pl-72 lg:pr-72 pt-24 pb-20 px-6">
               <div className="max-w-7xl mx-auto">

                  {/* Hero Section */}
                  <motion.div
                     initial={{ opacity: 0, y: -20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="text-center mb-20"
                  >
                     <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 mb-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Radio className="w-10 h-10 text-indigo-400 relative z-10 animate-pulse" />
                     </div>

                     <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                        About StreamWire
                     </h1>

                     <p className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto leading-relaxed">
                        The revolutionary <span className="text-indigo-400 font-semibold">dual-mode streaming platform</span> where creators shine in the spotlight and whistleblowers speak freely in the shadows.
                     </p>
                  </motion.div>

                  {/* Mission Statement */}
                  <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.1 }}
                     className="mb-20 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-8 md:p-12"
                  >
                     <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
                        <p className="text-lg text-zinc-300 leading-relaxed">
                           StreamWire was built on the belief that <strong className="text-white">expression should be free</strong>,
                           whether you want to build a brand or expose the truth. We provide a single platform with two distinct experiences:
                           <span className="text-indigo-400 font-semibold"> Cinema & Wire</span> for public creators, and
                           <span className="text-emerald-400 font-semibold"> Shadows</span> for anonymous voices.
                           All powered by cutting-edge AI and uncompromising security.
                        </p>
                     </div>
                  </motion.div>

                  {/* Statistics */}
                  <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.2 }}
                     className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
                  >
                     {statistics.map((stat, idx) => (
                        <div
                           key={idx}
                           className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 text-center hover:border-indigo-500/50 transition-all hover:-translate-y-1"
                        >
                           <div className="text-4xl font-black text-indigo-400 mb-2">{stat.value}</div>
                           <div className="text-white font-bold mb-1">{stat.label}</div>
                           <div className="text-sm text-zinc-500">{stat.desc}</div>
                        </div>
                     ))}
                  </motion.div>

                  {/* Core Features */}
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 0.3 }}
                     className="mb-20"
                  >
                     <h2 className="text-4xl font-black text-center mb-4 text-white">Core Platforms</h2>
                     <p className="text-center text-zinc-400 mb-12 max-w-2xl mx-auto">
                        Three unique experiences, one unified platform. Choose how you want to engage.
                     </p>

                     <div className="space-y-8">
                        {coreFeatures.map((feature, idx) => (
                           <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.4 + idx * 0.1 }}
                              className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-3xl p-8 md:p-10 hover:border-zinc-700 transition-all group"
                           >
                              <div className="flex flex-col md:flex-row gap-8">
                                 {/* Icon */}
                                 <div className="flex-shrink-0">
                                    <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} p-[2px] group-hover:scale-110 transition-transform`}>
                                       <div className="w-full h-full rounded-2xl bg-zinc-900 flex items-center justify-center">
                                          <feature.icon className="w-10 h-10 text-white" />
                                       </div>
                                    </div>
                                 </div>

                                 {/* Content */}
                                 <div className="flex-1">
                                    <h3 className="text-3xl font-bold text-white mb-3">{feature.title}</h3>
                                    <p className="text-zinc-300 mb-6 leading-relaxed text-lg">
                                       {feature.description}
                                    </p>

                                    {/* Feature List */}
                                    <div className="grid md:grid-cols-2 gap-3">
                                       {feature.features.map((item, itemIdx) => (
                                          <div key={itemIdx} className="flex items-start gap-2">
                                             <Sparkles className="w-4 h-4 text-indigo-400 mt-1 flex-shrink-0" />
                                             <span className="text-sm text-zinc-400">{item}</span>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        ))}
                     </div>
                  </motion.div>

                  {/* Advanced Features Grid */}
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 0.6 }}
                     className="mb-20"
                  >
                     <h2 className="text-4xl font-black text-center mb-4 text-white">Advanced Features</h2>
                     <p className="text-center text-zinc-400 mb-12 max-w-2xl mx-auto">
                        Cutting-edge technology that sets StreamWire apart from the rest.
                     </p>

                     <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {advancedFeatures.map((feature, idx) => (
                           <motion.div
                              key={idx}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.7 + idx * 0.05 }}
                              className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all hover:-translate-y-2 group"
                           >
                              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-[2px] mb-4 group-hover:scale-110 transition-transform`}>
                                 <div className="w-full h-full rounded-xl bg-zinc-900 flex items-center justify-center">
                                    <feature.icon className="w-7 h-7 text-white" />
                                 </div>
                              </div>

                              <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                              <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
                           </motion.div>
                        ))}
                     </div>
                  </motion.div>

                  {/* Privacy Features */}
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 0.8 }}
                     className="mb-20"
                  >
                     <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-3xl p-8 md:p-12">
                        <div className="text-center mb-10">
                           <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mb-4">
                              <Shield className="w-8 h-8 text-emerald-400" />
                           </div>
                           <h2 className="text-4xl font-black text-white mb-3">Privacy First</h2>
                           <p className="text-zinc-300 max-w-2xl mx-auto">
                              Your privacy is not optional—it's fundamental. We've built multiple layers of protection into every feature.
                           </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                           {privacyFeatures.map((feature, idx) => (
                              <div
                                 key={idx}
                                 className="bg-black/20 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 text-center"
                              >
                                 <feature.icon className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                                 <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                                 <p className="text-sm text-zinc-400">{feature.description}</p>
                              </div>
                           ))}
                        </div>
                     </div>
                  </motion.div>

                  {/* Technology Stack */}
                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 0.9 }}
                     className="mb-20"
                  >
                     <h2 className="text-4xl font-black text-center mb-4 text-white">Built with Modern Technology</h2>
                     <p className="text-center text-zinc-400 mb-12 max-w-2xl mx-auto">
                        StreamWire leverages cutting-edge technologies to deliver a fast, secure, and reliable experience.
                     </p>

                     <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                           { name: "React 18", desc: "Modern UI framework" },
                           { name: "Node.js", desc: "Scalable backend" },
                           { name: "MongoDB", desc: "Flexible database" },
                           { name: "Groq AI", desc: "Smart features" },
                           { name: "Cloudinary", desc: "Media hosting" },
                           { name: "JWT", desc: "Secure auth" },
                           { name: "Nodemailer", desc: "Email service" },
                           { name: "RAM Cache", desc: "Fast OTP storage" }
                        ].map((tech, idx) => (
                           <div
                              key={idx}
                              className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 text-center hover:border-indigo-500/50 transition-all hover:-translate-y-1"
                           >
                              <div className="text-2xl font-bold text-indigo-400 mb-1">{tech.name}</div>
                              <div className="text-xs text-zinc-500">{tech.desc}</div>
                           </div>
                        ))}
                     </div>
                  </motion.div>

                  {/* 3. UPDATED CALL TO ACTION */}
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     transition={{ delay: 1 }}
                     className="text-center bg-indigo-500/10 border border-indigo-500/20 rounded-3xl p-12"
                  >
                     <h2 className="text-4xl font-black text-white mb-4">Ready to Get Started?</h2>
                     <p className="text-lg text-zinc-300 mb-8 max-w-2xl mx-auto">
                        Join thousands of creators and anonymous voices on StreamWire. Express yourself freely, your way.
                     </p>
                     <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        {status ? (
                           /* LOGGED IN: Show Dashboard Button */
                           <Link
                              to="/dashboard"
                              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all hover:scale-105"
                           >
                              Go to Dashboard
                           </Link>
                        ) : (
                           /* LOGGED OUT: Show Create Account Button */
                           <Link
                              to="/register"
                              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all hover:scale-105"
                           >
                              Create Account
                           </Link>
                        )}

                        <Link
                           to="/contact"
                           className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all hover:scale-105 border border-white/10"
                        >
                           Contact Us
                        </Link>
                     </div>
                  </motion.div>

               </div>
            </div>
         </div>
      </>
   )
}