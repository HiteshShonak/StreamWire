import { useState } from 'react'
import { motion } from 'framer-motion'
import {
   HelpCircle, MessageCircle, FileText, Mail,
   ExternalLink, ChevronDown, ChevronUp,
   Zap, Shield, Film, Users, BookOpen, AlertTriangle, PenSquare
} from 'lucide-react'

const faqs = [
   {
      question: "What is StreamWire?",
      answer: "StreamWire combines video streaming (Cinema), microblogging (Wire), and anonymous sharing (Shadows) in one platform.",
      icon: Zap
   },
   {
      question: "How does Stealth Mode work?",
      answer: "Stealth Mode lets you post content anonymously. When enabled, your identity is hidden from viewers, and you appear as 'Anonymous User'. Only you can see that you're the creator.",
      icon: Shield
   },
   {
      question: "How do I upload videos to Cinema?",
      answer: "Navigate to Cinema and click the upload button. You can drag and drop your video file, add a title and description, and optionally enable Stealth Mode. We support most video formats up to 100MB.",
      icon: Film
   },
   {
      question: "What are private channels?",
      answer: "Private channels require approval before users can subscribe. When someone requests to follow a private channel, the owner can accept or reject the request.",
      icon: Users
   },
   {
      question: "How do I contact support?",
      answer: "You can reach our support team via email at support@streamwire.io. We typically respond within 24-48 hours.",
      icon: Mail
   }
]

// Additional helpful FAQs
faqs.push(
   {
      question: "How do I report abusive content?",
      answer: "Use the report option on any post or profile. Our moderation team reviews reports and takes action according to our Community Guidelines.",
      icon: AlertTriangle
   },
   {
      question: "How can I delete my account?",
      answer: "Go to Settings > Account > Delete Account. Deleting is permanent; contact support if you need assistance before proceeding.",
      icon: Users
   },
   {
      question: "Can I change my username or handle?",
      answer: "Yes, visit Profile > Edit and update your username. Some usernames may be restricted or already taken.",
      icon: PenSquare
   }
)

// resources removed

export default function Support() {
   const [openFaq, setOpenFaq] = useState(null)

   const toggleFaq = (index) => {
      setOpenFaq(openFaq === index ? null : index)
   }

   return (
      <div className="relative min-h-screen bg-zinc-950 text-white">

         {/* Background Glow */}
         <div className="fixed top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-zinc-500 opacity-5 blur-[120px] pointer-events-none gpu-layer" />

         <div className="relative z-10 px-4 sm:px-6 lg:pl-72 lg:pr-72 pt-20 sm:pt-24 pb-20">
            <div className="max-w-4xl mx-auto">

               {/* Header Section */}
               <div className="mb-8 sm:mb-12 text-center">
                  <motion.h1
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight flex items-center justify-center gap-2 sm:gap-3 text-white"
                  >
                     <HelpCircle className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-300" />
                     Help & Support
                  </motion.h1>
                  <p className="text-zinc-500 mt-2 sm:mt-3 font-medium text-sm sm:text-lg">
                     Get answers to common questions or reach out for help.
                  </p>
               </div>

               {/* Contact Card */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-zinc-700 bg-linear-to-r from-zinc-800/40 to-transparent mb-8 sm:mb-12"
               >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center">
                           <MessageCircle className="w-6 h-6 text-zinc-300" />
                        </div>
                        <div>
                           <h2 className="font-bold text-white">Need help?</h2>
                           <p className="text-zinc-400 text-sm">Our support team is here to assist you.</p>
                        </div>
                     </div>
                     <a
                        href="mailto:support@streamwire.io"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold transition-colors"
                     >
                        <Mail className="w-4 h-4" />
                        Contact Support
                     </a>
                  </div>
               </motion.div>

               {/* FAQs */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-12"
               >
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center justify-center gap-2">
                     <HelpCircle className="w-6 h-6 text-zinc-300" />
                     Frequently Asked Questions
                  </h2>

                  <div className="space-y-3">
                     {faqs.map((faq, idx) => (
                        <div
                           key={idx}
                           className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden"
                        >
                           <button
                              onClick={() => toggleFaq(idx)}
                              className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                           >
                              <div className="flex items-center gap-4">
                                 <faq.icon className="w-5 h-5 text-zinc-400" />
                                 <span className="font-medium text-white text-left text-sm sm:text-base">{faq.question}</span>
                              </div>
                              {openFaq === idx ? (
                                 <ChevronUp className="w-5 h-5 text-zinc-400" />
                              ) : (
                                 <ChevronDown className="w-5 h-5 text-zinc-400" />
                              )}
                           </button>

                           {openFaq === idx && (
                              <motion.div
                                 initial={{ height: 0, opacity: 0 }}
                                 animate={{ height: 'auto', opacity: 1 }}
                                 exit={{ height: 0, opacity: 0 }}
                                 className="px-4 sm:px-6 pb-4"
                              >
                                 <p className="text-zinc-400 pl-9 text-sm sm:text-base">{faq.answer}</p>
                              </motion.div>
                           )}
                        </div>
                     ))}
                  </div>
               </motion.div>

               {/* Resources removed (no external redirects). */}
            </div>
         </div>
      </div>
   )
}
