import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
   Settings as SettingsIcon, User,
   Shield, Lock, LogOut, AlertTriangle, HelpCircle, Mail, Info
} from 'lucide-react'
import { LoadingDots } from '../Components/Common/LoadingIndicator'
import toast from 'react-hot-toast'
import { authService } from '../api/services/auth.service'
import { logout } from '../store/authSlice'
import { toActionError } from '../utils/errorMessages'

export default function Settings() {
   const user = useSelector((state) => state.auth.userData)
   const navigate = useNavigate()
   const dispatch = useDispatch()
   const queryClient = useQueryClient()

   // Logout from this device
   const logoutMutation = useMutation({
      mutationFn: () => authService.logout(),
      onSuccess: () => {
         dispatch(logout())
         queryClient.clear()
         toast.success('Signed out successfully')
         navigate('/login')
      },
      onError: (error) => {
         const errorMessage = toActionError(error, 'Signed out on this device, but server cleanup may be delayed.', [
            {
               when: ['network error', 'failed to fetch', 'timeout'],
               message: 'Signed out locally. We could not reach the server to close all session data.'
            }
         ])
         dispatch(logout())
         queryClient.clear()
         toast.error(errorMessage)
         navigate('/login')
      }
   })

   // Logout from all devices
   const logoutAllMutation = useMutation({
      mutationFn: () => authService.logoutAll(),
      onSuccess: () => {
         dispatch(logout())
         queryClient.clear()
         toast.success('Signed out from all devices')
         navigate('/login')
      },
      onError: (error) => {
         const errorMessage = toActionError(error, 'Signed out on this device, but some remote sessions may stay active.', [
            {
               when: ['network error', 'failed to fetch', 'timeout'],
               message: 'Signed out locally. We could not confirm sign-out on all devices.'
            }
         ])
         dispatch(logout())
         queryClient.clear()
         toast.error(errorMessage)
         navigate('/login')
      }
   })

   const settingSections = [
      {
         title: 'Account',
         icon: User,
         color: 'text-zinc-400',
         items: [
            {
               label: 'Profile Information',
               description: 'Update your name, username, avatar and banner',
               icon: User,
               link: '/customize'
            },
            {
               label: 'Password & Security',
               description: 'Change password and manage account security',
               icon: Lock,
               link: '/change-password'
            },
         ]
      },
      {
         title: 'Help & Support',
         icon: HelpCircle,
         color: 'text-green-400',
         items: [
            {
               label: 'Contact Us',
               description: 'Get help or send feedback to our support team',
               icon: Mail,
               link: '/contact'
            },
            {
               label: 'About Us',
               description: 'Learn about StreamWire and our features',
               icon: Info,
               link: '/about'
            },
            {
               label: 'Support Center',
               description: 'Browse FAQs and documentation',
               icon: HelpCircle,
               link: '/support'
            },
         ]
      },
   ]

   // Not logged in state
   if (!user) {
      return (
         <div className="relative min-h-screen bg-zinc-950 text-white">
            <div className="relative z-10 px-4 sm:px-6 lg:pl-72 lg:pr-72 pt-20 sm:pt-24 pb-20">
               <div className="max-w-4xl mx-auto">
                  <motion.div
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                     className="text-center py-32 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20"
                  >
                     <SettingsIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-zinc-400">Sign in to access settings.</h3>
                     <Link to="/login" className="mt-6 inline-block text-zinc-300 hover:text-white font-bold text-sm">
                        Sign In &rarr;
                     </Link>
                  </motion.div>
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className="relative min-h-screen bg-zinc-950 text-white">

         {/* Background Glow */}
         <div className="fixed top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-zinc-500 opacity-5 blur-[120px] pointer-events-none gpu-layer" />

         <div className="relative z-10 px-4 sm:px-6 lg:pl-72 lg:pr-72 pt-20 sm:pt-24 pb-20">
            <div className="max-w-4xl mx-auto">

               {/* Header Section */}
               <div className="mb-12 text-center">
                  <motion.h1
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight flex items-center justify-center gap-2 sm:gap-3 text-white"
                  >
                     <SettingsIcon className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-300" />
                     Settings
                  </motion.h1>
                  <p className="text-zinc-500 mt-2 sm:mt-3 font-medium text-sm sm:text-lg">
                     Manage your account and preferences.
                  </p>
               </div>

               {/* Settings Sections */}
               <div className="space-y-8">
                  {settingSections.map((section, idx) => (
                     <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="rounded-xl sm:rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden"
                     >
                        {/* Section Header */}
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-800 flex items-center gap-3">
                           <section.icon className={`w-5 h-5 ${section.color}`} />
                           <h2 className="font-bold text-white">{section.title}</h2>
                        </div>

                        {/* Section Items */}
                        <div className="divide-y divide-zinc-800/50">
                           {section.items.map((item) => {
                              const Wrapper = item.link ? Link : 'button';
                              const wrapperProps = item.link ? { to: item.link } : {};

                              return (
                                 <Wrapper
                                    key={item.label}
                                    {...wrapperProps}
                                    className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
                                 >
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center group-hover:bg-zinc-700/50 transition-colors">
                                          <item.icon className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                                       </div>
                                       <div className="text-left">
                                          <div className="font-medium text-white group-hover:text-zinc-200 transition-colors">
                                             {item.label}
                                          </div>
                                          <div className="text-sm text-zinc-500">
                                             {item.description}
                                          </div>
                                       </div>
                                    </div>
                                 </Wrapper>
                              );
                           })}
                        </div>
                     </motion.div>
                  ))}

                  {/* Logout Section */}
                  <motion.div
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.2 }}
                     className="rounded-xl sm:rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden"
                  >
                     {/* Section Header */}
                     <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-800 flex items-center gap-3">
                        <Shield className="w-5 h-5 text-red-400" />
                        <h2 className="font-bold text-white">Session Management</h2>
                     </div>

                     {/* Logout Options */}
                     <div className="divide-y divide-zinc-800/50">
                        {/* Sign Out */}
                        <button
                           onClick={() => logoutMutation.mutate()}
                           disabled={logoutMutation.isPending || logoutAllMutation.isPending}
                           className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-white/5 transition-colors group disabled:opacity-50"
                        >
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                                 <LogOut className="w-5 h-5 text-amber-400" />
                              </div>
                              <div className="text-left">
                                 <div className="font-medium text-white group-hover:text-amber-400 transition-colors">
                                    Sign Out
                                 </div>
                                 <div className="text-sm text-zinc-500">
                                    Log out from this device only
                                 </div>
                              </div>
                           </div>
                           {logoutMutation.isPending && (
                              <LoadingDots size="md" />
                           )}
                        </button>

                        {/* Sign Out Everywhere */}
                        <button
                           onClick={() => logoutAllMutation.mutate()}
                           disabled={logoutMutation.isPending || logoutAllMutation.isPending}
                           className="w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-white/5 transition-colors group disabled:opacity-50"
                        >
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                 <AlertTriangle className="w-5 h-5 text-red-400" />
                              </div>
                              <div className="text-left">
                                 <div className="font-medium text-white group-hover:text-red-400 transition-colors">
                                    Sign Out Everywhere
                                 </div>
                                 <div className="text-sm text-zinc-500">
                                    Terminate all active sessions on every device
                                 </div>
                              </div>
                           </div>
                           {logoutAllMutation.isPending && (
                              <LoadingDots size="md" />
                           )}
                        </button>
                     </div>
                  </motion.div>
               </div>

               {/* User Info Card */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 sm:mt-12 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-zinc-800 bg-zinc-900/30 text-center"
               >
                  <img
                     src={user?.avatar?.url || user?.avatar}
                     alt={user?.username}
                     className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-3 sm:mb-4 border-2 border-zinc-700 object-cover"
                  />
                  <h3 className="font-bold text-white text-lg">{user?.fullName}</h3>
                  <p className="text-zinc-500">@{user?.username}</p>
                  <p className="text-zinc-600 text-sm mt-1">{user?.email}</p>
               </motion.div>
            </div>
         </div>
      </div>
   )
}
