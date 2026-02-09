import { motion } from 'framer-motion'
import { Sparkles, Bot, FileText, Hash, Brain, MessageSquare } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

export const AIFeatures = ({ isStealth }) => {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
      <ScrollReveal>
        <div className="flex items-center gap-3 mb-8">
          <div className={`p-2 rounded-lg ${isStealth ? "bg-green-500/10 text-green-400" : "bg-indigo-50 text-indigo-600"}`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className={`text-2xl font-bold ${isStealth ? "text-white" : "text-zinc-900"}`}>AI Co-Pilot Suite</h2>
        </div>
      </ScrollReveal>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {[
          { icon: FileText, title: "Auto Transcription", desc: "Real-time speech-to-text with Groq Whisper AI. Makes your content searchable and accessible instantly." },
          { icon: Hash, title: "Smart Tag Generation", desc: "AI automatically generates relevant SEO tags from your video content to boost discoverability." },
          { icon: Brain, title: "Video Summarization", desc: "One-click AI summaries of any video. Get key insights and takeaways without watching the entire content." },
          { icon: MessageSquare, title: "AI Q&A Assistant", desc: "Ask questions about video content and get instant answers. Powered by Groq's Llama model." }
        ].map((feature, i) => (
          <ScrollReveal delay={i * 0.1} key={i}>
            <motion.div 
              initial={{ y: 0 }}
              whileHover={{ y: -4 }}
              transition={{ 
                duration: 0.08, 
                ease: [0.4, 0.0, 0.2, 1]
              }}
              className={`group h-full p-5 sm:p-6 rounded-2xl border cursor-pointer ${isStealth ? "bg-zinc-900/50 border-zinc-800 hover:border-green-500/40 hover:bg-zinc-900/70 hover:shadow-[0_8px_30px_rgba(34,197,94,0.15)]" : "bg-white border-zinc-100 hover:border-indigo-200 hover:shadow-[0_8px_30px_rgba(99,102,241,0.12)]"}`}
              style={{ transition: 'border-color 0.08s cubic-bezier(0.4, 0.0, 0.2, 1), background-color 0.08s cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 0.08s cubic-bezier(0.4, 0.0, 0.2, 1)' }}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isStealth ? "bg-green-500/10 text-green-400 group-hover:bg-green-500/15" : "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100"}`}
                style={{ transition: 'background-color 0.08s cubic-bezier(0.4, 0.0, 0.2, 1)' }}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className={`text-base sm:text-lg font-bold mb-2 ${isStealth ? "text-zinc-200" : "text-zinc-900"}`}>{feature.title}</h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${isStealth ? "text-zinc-400" : "text-zinc-600"}`}>{feature.desc}</p>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
