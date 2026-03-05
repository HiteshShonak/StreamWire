import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Mail, Send, AlertCircle, CheckCircle2, User, MessageSquare, Radio } from 'lucide-react'
import { LoadingDots } from '../Components/Common/LoadingIndicator'
import toast from 'react-hot-toast'
import api from '../api/axios'
import Header from '../Components/Header'
import Sidebar from '../Components/Sidebar'

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

export default function Contact() {
   const [isSubmitting, setIsSubmitting] = useState(false)
   const [submitSuccess, setSubmitSuccess] = useState(false)
   const { register, handleSubmit, formState: { errors }, reset } = useForm()

   const onSubmit = async (data) => {
      setIsSubmitting(true)
      setSubmitSuccess(false)

      try {
         const response = await api.post('/contact/send', data)
         toast.success('Message sent successfully! We\'ll get back to you soon.')
         setSubmitSuccess(true)
         reset()

         // Reset success message after 5 seconds
         setTimeout(() => setSubmitSuccess(false), 5000)
      } catch (error) {
         const errorMessage = error.response?.data?.message
            || error.message
            || 'Failed to send message. Please try again or email us directly.'
         toast.error(errorMessage)
      } finally {
         setIsSubmitting(false)
      }
   }

   return (
      <>
         <Header />
         <Sidebar />

         <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden">
            <NoiseOverlay />

            {/* Background Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500 opacity-5 blur-[120px] pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[800px] h-[500px] bg-purple-500 opacity-5 blur-[120px] pointer-events-none" />

            <div className="relative z-10 lg:pl-72 lg:pr-72 pt-24 pb-20 px-6">
               <div className="max-w-5xl mx-auto">

                  {/* Header */}
                  <motion.div
                     initial={{ opacity: 0, y: -20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="text-center mb-16"
                  >
                     <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 mb-6 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Radio className="w-10 h-10 text-indigo-400 relative z-10" />
                     </div>
                     <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent">
                        Get in Touch
                     </h1>
                     <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        Have questions, feedback, or need support? We're here to help. Reach out to us and we'll respond as soon as possible.
                     </p>
                  </motion.div>

                  <div className="grid md:grid-cols-2 gap-8">

                     {/* Contact Info Card */}
                     <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                     >
                        <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-3xl p-8 h-full">
                           <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>

                           <div className="space-y-6">
                              {/* Official Email */}
                              <div className="group">
                                 <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 group-hover:bg-indigo-500/30 transition-colors">
                                       <Mail className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                       <h3 className="text-white font-semibold mb-2">Email Us</h3>
                                       <a
                                          href="mailto:contact.streamwire@gmail.com"
                                          className="text-indigo-400 hover:text-indigo-300 transition-colors text-sm break-all"
                                       >
                                          contact.streamwire@gmail.com
                                       </a>
                                       <p className="text-zinc-500 text-sm mt-1">We'll respond within 24 hours</p>
                                    </div>
                                 </div>
                              </div>

                              {/* Support Hours */}
                              <div className="group">
                                 <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0 group-hover:bg-purple-500/30 transition-colors">
                                       <MessageSquare className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                       <h3 className="text-white font-semibold mb-2">Support Hours</h3>
                                       <p className="text-zinc-400 text-sm">Monday - Friday</p>
                                       <p className="text-zinc-400 text-sm">9:00 AM - 6:00 PM EST</p>
                                       <p className="text-zinc-500 text-xs mt-2">Emergency support available 24/7</p>
                                    </div>
                                 </div>
                              </div>

                              {/* Quick Info */}
                              <div className="pt-4 border-t border-zinc-800">
                                 <h3 className="text-white font-semibold mb-3">Before You Contact</h3>
                                 <ul className="space-y-2 text-sm text-zinc-400">
                                    <li className="flex items-start gap-2">
                                       <span className="text-indigo-400 mt-0.5">•</span>
                                       <span>Check our FAQ section for quick answers</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                       <span className="text-indigo-400 mt-0.5">•</span>
                                       <span>Include relevant details in your message</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                       <span className="text-indigo-400 mt-0.5">•</span>
                                       <span>Attach screenshots if reporting issues</span>
                                    </li>
                                 </ul>
                              </div>
                           </div>
                        </div>
                     </motion.div>

                     {/* Contact Form */}
                     <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                     >
                        <div className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-3xl p-8">
                           <h2 className="text-2xl font-bold text-white mb-6">Send Us a Message</h2>

                           {/* Success Message */}
                           {submitSuccess && (
                              <motion.div
                                 initial={{ opacity: 0, y: -10 }}
                                 animate={{ opacity: 1, y: 0 }}
                                 className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-200 text-sm"
                              >
                                 <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                                 <p>Message sent successfully! We'll get back to you soon.</p>
                              </motion.div>
                           )}

                           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                              {/* Name */}
                              <div className="space-y-2 group/input">
                                 <label className="text-sm font-bold text-zinc-300">
                                    Full Name <span className="text-red-400">*</span>
                                 </label>
                                 <div className="relative">
                                    <User className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" />
                                    <input
                                       {...register("name", {
                                          required: "Name is required",
                                          minLength: { value: 2, message: "Name must be at least 2 characters" }
                                       })}
                                       className="w-full bg-black/20 border border-zinc-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:bg-black/40 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                       placeholder="John Doe"
                                    />
                                 </div>
                                 {errors.name && <p className="text-red-400 text-xs pl-1">{errors.name.message}</p>}
                              </div>

                              {/* Email */}
                              <div className="space-y-2 group/input">
                                 <label className="text-sm font-bold text-zinc-300">
                                    Email Address <span className="text-red-400">*</span>
                                 </label>
                                 <div className="relative">
                                    <Mail className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" />
                                    <input
                                       type="email"
                                       {...register("email", {
                                          required: "Email is required",
                                          pattern: {
                                             value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                             message: "Invalid email address"
                                          }
                                       })}
                                       className="w-full bg-black/20 border border-zinc-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:bg-black/40 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                       placeholder="john@example.com"
                                    />
                                 </div>
                                 {errors.email && <p className="text-red-400 text-xs pl-1">{errors.email.message}</p>}
                              </div>

                              {/* Subject */}
                              <div className="space-y-2 group/input">
                                 <label className="text-sm font-bold text-zinc-300">
                                    Subject <span className="text-red-400">*</span>
                                 </label>
                                 <input
                                    {...register("subject", {
                                       required: "Subject is required",
                                       minLength: { value: 5, message: "Subject must be at least 5 characters" }
                                    })}
                                    className="w-full bg-black/20 border border-zinc-700 rounded-xl py-3.5 px-4 text-white placeholder:text-zinc-600 focus:bg-black/40 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                                    placeholder="Brief description of your inquiry"
                                 />
                                 {errors.subject && <p className="text-red-400 text-xs pl-1">{errors.subject.message}</p>}
                              </div>

                              {/* Message */}
                              <div className="space-y-2 group/input">
                                 <label className="text-sm font-bold text-zinc-300">
                                    Message <span className="text-red-400">*</span>
                                 </label>
                                 <textarea
                                    {...register("message", {
                                       required: "Message is required",
                                       minLength: { value: 20, message: "Message must be at least 20 characters" }
                                    })}
                                    rows={6}
                                    className="w-full bg-black/20 border border-zinc-700 rounded-xl py-3.5 px-4 text-white placeholder:text-zinc-600 focus:bg-black/40 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                                    placeholder="Please provide as much detail as possible..."
                                 />
                                 {errors.message && <p className="text-red-400 text-xs pl-1">{errors.message.message}</p>}
                              </div>

                              {/* Submit Button */}
                              <button
                                 disabled={isSubmitting}
                                 type="submit"
                                 className="w-full group relative overflow-hidden bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
                              >
                                 <span className="relative z-10 flex items-center justify-center gap-2">
                                    {isSubmitting ? (
                                       <>
                                          <LoadingDots size="md" />
                                          Sending...
                                       </>
                                    ) : (
                                       <>
                                          <Send className="w-5 h-5" />
                                          Send Message
                                       </>
                                    )}
                                 </span>
                              </button>

                              <p className="text-xs text-zinc-500 text-center">
                                 By submitting this form, you agree to our privacy policy and terms of service.
                              </p>
                           </form>
                        </div>
                     </motion.div>

                  </div>
               </div>
            </div>
         </div>
      </>
   )
}
