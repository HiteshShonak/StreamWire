import { motion } from 'framer-motion'
import { Sparkles, FileText, Hash, Brain, MessageSquare } from 'lucide-react'
import { ScrollReveal } from './ScrollReveal'

const featureCards = [
  {
    icon: FileText,
    title: 'Auto Transcription',
    signal: 'Whisper timeline sync',
    desc: 'Real-time speech-to-text with Groq Whisper AI. Makes your content searchable and accessible instantly.',
    lightIcon: 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100',
    lightCard: 'hover:border-indigo-200 hover:shadow-[0_8px_30px_rgba(99,102,241,0.14)]',
    lightGlow: 'from-indigo-100/70 via-indigo-50/40 to-transparent',
    lightSignal: 'text-indigo-600'
  },
  {
    icon: Hash,
    title: 'Smart Tag Generation',
    signal: 'SEO metadata in one pass',
    desc: 'AI automatically generates relevant SEO tags from your video content to boost discoverability.',
    lightIcon: 'bg-violet-50 text-violet-600 group-hover:bg-violet-100',
    lightCard: 'hover:border-violet-200 hover:shadow-[0_8px_30px_rgba(139,92,246,0.14)]',
    lightGlow: 'from-violet-100/70 via-violet-50/40 to-transparent',
    lightSignal: 'text-violet-600'
  },
  {
    icon: Brain,
    title: 'Video Summarization',
    signal: 'Key points, instantly',
    desc: 'One-click AI summaries of any video. Get key insights and takeaways without watching the entire content.',
    lightIcon: 'bg-sky-50 text-sky-600 group-hover:bg-sky-100',
    lightCard: 'hover:border-sky-200 hover:shadow-[0_8px_30px_rgba(14,165,233,0.14)]',
    lightGlow: 'from-sky-100/70 via-sky-50/40 to-transparent',
    lightSignal: 'text-sky-600'
  },
  {
    icon: MessageSquare,
    title: 'AI Q&A Assistant',
    signal: 'Context-aware responses',
    desc: "Ask questions about video content and get instant answers. Powered by Groq's Llama model.",
    lightIcon: 'bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100',
    lightCard: 'hover:border-emerald-200 hover:shadow-[0_8px_30px_rgba(16,185,129,0.14)]',
    lightGlow: 'from-emerald-100/70 via-emerald-50/40 to-transparent',
    lightSignal: 'text-emerald-600'
  }
]

export const AIFeatures = ({ isStealth }) => {
  return (
    <section className="py-8 sm:py-12 md:py-16 lg:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
      <ScrollReveal>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${isStealth ? 'bg-green-500/10 text-green-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className={`text-2xl font-bold ${isStealth ? 'text-white' : 'text-zinc-900'}`}>AI Co-Pilot Suite</h2>
          </div>
          <p className={`text-sm sm:text-base max-w-2xl ${isStealth ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Production-ready AI modules that transcribe, summarize, tag, and answer in real time.
          </p>
        </div>
      </ScrollReveal>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        {featureCards.map((feature, i) => (
          <ScrollReveal delay={i * 0.1} key={i}>
            <motion.div
              initial={{ y: 0 }}
              whileHover={{ y: -4 }}
              transition={{
                duration: 0.08,
                ease: [0.4, 0.0, 0.2, 1]
              }}
              className={`group relative h-full p-5 sm:p-6 rounded-2xl border cursor-pointer overflow-hidden ${isStealth ? 'bg-zinc-900/50 border-zinc-800 hover:border-green-500/40 hover:bg-zinc-900/70 hover:shadow-[0_8px_30px_rgba(34,197,94,0.15)]' : `bg-white border-zinc-100 ${feature.lightCard}`}`}
              style={{ transition: 'border-color 0.08s cubic-bezier(0.4, 0.0, 0.2, 1), background-color 0.08s cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 0.08s cubic-bezier(0.4, 0.0, 0.2, 1)' }}
            >
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 ${isStealth ? 'bg-linear-to-br from-green-500/5 to-transparent' : `bg-linear-to-br ${feature.lightGlow}`}`} />

              <div className={`relative z-10 w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isStealth ? 'bg-green-500/10 text-green-400 group-hover:bg-green-500/15' : feature.lightIcon}`}
                style={{ transition: 'background-color 0.08s cubic-bezier(0.4, 0.0, 0.2, 1)' }}
              >
                <feature.icon className="w-6 h-6" />
              </div>

              <h3 className={`relative z-10 text-base sm:text-lg font-bold mb-2 ${isStealth ? 'text-zinc-200' : 'text-zinc-900'}`}>{feature.title}</h3>
              <p className={`relative z-10 text-xs sm:text-sm leading-relaxed ${isStealth ? 'text-zinc-400' : 'text-zinc-600'}`}>{feature.desc}</p>
              <p className={`relative z-10 mt-3 text-[11px] sm:text-xs uppercase tracking-wide font-semibold ${isStealth ? 'text-zinc-500' : feature.lightSignal}`}>{feature.signal}</p>
            </motion.div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  )
}
