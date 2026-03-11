import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
   Power, Shield, Eye, Check, Ghost, Sparkles
} from 'lucide-react'
import { LoadingDots } from '../Components/Common/LoadingIndicator'
import toast from 'react-hot-toast'

import { authService } from '../api/services/auth.service'

export default function KillSwitch() {
   const navigate = useNavigate()
   const queryClient = useQueryClient()
   const user = useSelector((state) => state.auth.userData)

   const [confirmingAction, setConfirmingAction] = useState(false)

   // Toggle anonymous identity
   const toggleIdentityMutation = useMutation({
      mutationFn: async () => {
         const newValue = !user?.isIdentityCloaked;
         const response = await authService.togglePrivacy({
            isIdentityCloaked: newValue
         });
         return response;
      },
      onSuccess: (res) => {
         const updatedUser = res?.data;
         const isNowCloaked = updatedUser?.isIdentityCloaked;

         toast.success(isNowCloaked
            ? 'Identity cloaked - you are now anonymous'
            : 'Identity revealed - your profile is visible'
         );

         // Refresh user data
         queryClient.invalidateQueries({ queryKey: ['currentUser'] });
         window.location.reload(); // Force refresh to update all components
         setConfirmingAction(false);
      },
      onError: (error) => {
         const message = error.message?.includes('not found')
            ? 'Account settings not found'
            : error.message?.includes('unauthorized') || error.message?.includes('login')
               ? 'Please sign in to update settings'
               : 'Could not update identity settings. Please try again.';
         toast.error(message);
      }
   })

   const handleAction = () => {
      setConfirmingAction(true)
   }

   const confirmAction = () => {
      toggleIdentityMutation.mutate()
   }

   const isLoading = toggleIdentityMutation.isPending

   // Not logged in state
   if (!user) {
      return (
         <div className="relative min-h-screen bg-[#050505] text-white">
            <div className="relative z-10 px-4 sm:px-6 lg:pl-72 lg:pr-72 pt-20 sm:pt-24 pb-20">
               <div className="max-w-4xl mx-auto">
                  <motion.div
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                     className="text-center py-32 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20"
                  >
                     <Power className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-zinc-400">Sign in to access Ghost Mode</h3>
                     <Link to="/login" className="mt-6 inline-block text-indigo-400 hover:text-indigo-300 font-bold text-sm">
                        Sign In &rarr;
                     </Link>
                  </motion.div>
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className="relative min-h-screen bg-[#050505] text-white">

         {/* Background Glow */}
         <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-red-500 opacity-5 blur-[120px] pointer-events-none gpu-layer" />

         <div className="relative z-10 px-4 sm:px-6 lg:pl-72 lg:pr-72 pt-20 sm:pt-24 pb-20">
            <div className="max-w-3xl mx-auto">

               {/* Header */}
               <div className="text-center mb-10 sm:mb-16">
                  <motion.div
                     initial={{ scale: 0.8, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-4 sm:mb-6 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30 flex items-center justify-center shadow-xl shadow-emerald-900/20"
                  >
                     <Ghost className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-emerald-400" />
                  </motion.div>

                  <motion.h1
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.1 }}
                     className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-3 sm:mb-4"
                  >
                     Ghost Mode
                  </motion.h1>

                  <motion.p
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 0.2 }}
                     className="text-zinc-400 mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed px-2 sm:px-0"
                  >
                     Your ultimate privacy control. Hide your identity across StreamWire with one click.
                     When enabled, you appear as "Anonymous" on all your content.
                  </motion.p>

                  <motion.div
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ delay: 0.3 }}
                     className="mt-6 flex items-center justify-center gap-2 text-sm text-zinc-500"
                  >
                     <Sparkles className="w-4 h-4 text-emerald-400" />
                     <span>Total anonymity. Complete control. Your choice.</span>
                  </motion.div>
               </div>

               {/* Identity Cloaking Card */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
               >
                  <button
                     onClick={handleAction}
                     disabled={isLoading}
                     className="w-full group p-5 sm:p-6 lg:p-8 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all text-left disabled:opacity-50"
                  >
                     <div className="flex items-start gap-4 sm:gap-6">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                           <Eye className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-emerald-400" />
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                 Anonymous Identity
                              </h3>
                              {user?.isIdentityCloaked && (
                                 <span className="px-3 py-1 text-xs font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                                    <Shield className="w-3 h-3" />
                                    ACTIVE
                                 </span>
                              )}
                           </div>
                           <p className="text-zinc-400 leading-relaxed text-sm sm:text-base">
                              {user?.isIdentityCloaked
                                 ? "Your identity is currently hidden. All your content displays 'Anonymous' instead of your name. Disable to reveal your profile on all posts, videos, and wires."
                                 : "Cloak your identity across the entire platform. Your name will appear as 'Anonymous' on all your content. This affects videos, wires, shadows, and comments."
                              }
                           </p>

                           {/* Status Indicator */}
                           <div className="mt-4 flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${user?.isIdentityCloaked ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                              <span className="text-sm font-medium text-zinc-500">
                                 Status: {user?.isIdentityCloaked ? 'Cloaked' : 'Visible'}
                              </span>
                           </div>
                        </div>
                        {isLoading && (
                           <LoadingDots size="lg" />
                        )}
                     </div>
                  </button>
               </motion.div>

               {/* Info Cards */}
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
               >
                  <div className="p-4 sm:p-5 lg:p-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
                     <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                           <Ghost className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h4 className="font-bold text-white">What's Hidden</h4>
                     </div>
                     <ul className="space-y-2 text-sm text-zinc-400">
                        <li className="flex items-center gap-2">
                           <div className="w-1 h-1 rounded-full bg-emerald-400" />
                           Your full name & username
                        </li>
                        <li className="flex items-center gap-2">
                           <div className="w-1 h-1 rounded-full bg-emerald-400" />
                           Profile picture & avatar
                        </li>
                        <li className="flex items-center gap-2">
                           <div className="w-1 h-1 rounded-full bg-emerald-400" />
                           All public content you create
                        </li>
                     </ul>
                  </div>

                  <div className="p-4 sm:p-5 lg:p-6 rounded-xl border border-zinc-800 bg-zinc-900/30">
                     <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                           <Shield className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h4 className="font-bold text-white">What's Preserved</h4>
                     </div>
                     <ul className="space-y-2 text-sm text-zinc-400">
                        <li className="flex items-center gap-2">
                           <div className="w-1 h-1 rounded-full bg-indigo-400" />
                           Your account & settings
                        </li>
                        <li className="flex items-center gap-2">
                           <div className="w-1 h-1 rounded-full bg-indigo-400" />
                           Subscriptions & followers
                        </li>
                        <li className="flex items-center gap-2">
                           <div className="w-1 h-1 rounded-full bg-indigo-400" />
                           All your content stays online
                        </li>
                     </ul>
                  </div>
               </motion.div>

               {/* Identity Preview */}
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-10 sm:mt-16"
               >
                  <div className="text-center mb-6">
                     <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Preview</h3>
                     <p className="text-zinc-500 text-sm">
                        {user?.isIdentityCloaked
                           ? "This is how you currently appear on all your content"
                           : "This is how others see you on your content"
                        }
                     </p>
                  </div>

                  <div className="p-5 sm:p-6 lg:p-8 rounded-2xl border-2 border-zinc-800 bg-zinc-900/50 text-center relative overflow-hidden">
                     {/* Animated background indicator */}
                     {user?.isIdentityCloaked && (
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5" />
                     )}

                     <div className="relative">
                        {user?.isIdentityCloaked ? (
                           <>
                              {/* Anonymous Avatar */}
                              <div className="w-18 h-18 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mx-auto mb-4 border-2 border-emerald-500/30 bg-emerald-950/30 flex items-center justify-center">
                                 <Ghost className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-emerald-400" />
                              </div>
                              <div className="flex items-center justify-center gap-2 mb-1">
                                 <p className="text-white font-bold text-lg sm:text-xl">Anonymous</p>
                                 <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30">
                                    CLOAKED
                                 </span>
                              </div>
                              <p className="text-zinc-500 text-sm mt-2">Your identity is hidden</p>
                           </>
                        ) : (
                           <>
                              {/* Real Profile */}
                              <img
                                 src={user?.avatar?.url || user?.avatar}
                                 alt={user?.username}
                                 className="w-18 h-18 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full mx-auto mb-4 border-2 border-zinc-700 object-cover"
                              />
                              <p className="text-white font-bold text-lg sm:text-xl">{user?.fullName}</p>
                              <p className="text-zinc-500 text-sm mt-1">@{user?.username}</p>
                              <p className="text-zinc-600 text-xs mt-2">Your identity is visible</p>
                           </>
                        )}
                     </div>
                  </div>

                  {/* Toggle hint */}
                  <div className="mt-4 text-center">
                     <p className="text-xs text-zinc-600">
                        Click the card above to {user?.isIdentityCloaked ? 'reveal' : 'hide'} your identity
                     </p>
                  </div>
               </motion.div>
            </div>
         </div>

         {/* Confirmation Modal */}
         <AnimatePresence>
            {confirmingAction && (
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
                  onClick={() => !isLoading && setConfirmingAction(false)}
               >
                  <motion.div
                     initial={{ scale: 0.9, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 0.9, opacity: 0 }}
                     onClick={(e) => e.stopPropagation()}
                     className="w-full max-w-md p-5 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-zinc-800 bg-zinc-900"
                  >
                     <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-emerald-500/20 border border-emerald-500/30">
                           <Eye className="w-8 h-8 text-emerald-400" />
                        </div>

                        <h3 className="text-xl sm:text-2xl font-black text-white mb-3">
                           {user?.isIdentityCloaked ? 'Reveal Your Identity?' : 'Go Anonymous?'}
                        </h3>

                        <p className="text-zinc-400 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                           {user?.isIdentityCloaked
                              ? 'Your real name will be visible on all your content across StreamWire. You can enable cloaking again at any time.'
                              : 'Your identity will be hidden across StreamWire. You will appear as "Anonymous" on all your content.'
                           }
                        </p>

                        <div className="flex gap-3">
                           <button
                              onClick={() => setConfirmingAction(false)}
                              disabled={isLoading}
                              className="flex-1 px-6 py-3.5 rounded-xl border border-zinc-700 text-zinc-300 hover:bg-zinc-800 font-bold transition-colors disabled:opacity-50"
                           >
                              Cancel
                           </button>
                           <button
                              onClick={confirmAction}
                              disabled={isLoading}
                              className="flex-1 px-6 py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 bg-emerald-500 hover:bg-emerald-400 text-white"
                           >
                              {isLoading ? (
                                 <LoadingDots size="md" />
                              ) : (
                                 <>
                                    <Check className="w-5 h-5" />
                                    Confirm
                                 </>
                              )}
                           </button>
                        </div>
                     </div>
                  </motion.div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   )
}
