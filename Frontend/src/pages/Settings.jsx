import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
   Settings as SettingsIcon, User,
   Shield, Lock, LogOut, Loader2, AlertTriangle, HelpCircle, Mail, Info
} from 'lucide-react'
import toast from 'react-hot-toast'
import { authService } from '../api/services/auth.service'
import { logout } from '../store/authSlice'

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
      onError: () => {
         dispatch(logout())
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
      onError: () => {
         dispatch(logout())
         navigate('/login')
      }
   })

   const settingSections = [
      {
         title: 'Account',
         icon: User,
         color: 'text-blue-400',
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
         <div className="relative min-h-screen bg-[#050505] text-white">
            <div className="relative z-10 lg:pl-72 lg:pr-72 pt-24 pb-20 px-6">
               <div className="max-w-4xl mx-auto">
                  <motion.div
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                     className="text-center py-32 border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20"
                  >
                     <SettingsIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                     <h3 className="text-xl font-bold text-zinc-400">Sign in to access settings.</h3>
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
         <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500 opacity-5 blur-[120px] pointer-events-none" />

         <div className="relative z-10 lg:pl-72 lg:pr-72 pt-24 pb-20 px-6">
            <div className="max-w-4xl mx-auto">

               {/* Header Section */}
               <div className="mb-12 text-center">
                  <motion.h1
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="text-4xl md:text-5xl font-black tracking-tight flex items-center justify-center gap-3 text-white"
                  >
                     <SettingsIcon className="w-10 h-10 text-indigo-400" />
                     Settings
                  </motion.h1>
                  <p className="text-zinc-500 mt-3 font-medium text-lg">
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
                        className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden"
                     >
                        {/* Section Header */}
                        <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-3">
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
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group"
                                 >
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-xl bg-zinc-800/50 flex items-center justify-center group-hover:bg-zinc-700/50 transition-colors">
                                          <item.icon className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                                       </div>
                                       <div className="text-left">
                                          <div className="font-medium text-white group-hover:text-indigo-400 transition-colors">
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
                     className="rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden"
                  >
                     {/* Section Header */}
                     <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-3">
                        <Shield className="w-5 h-5 text-red-400" />
                        <h2 className="font-bold text-white">Session Management</h2>
                     </div>

                     {/* Logout Options */}
                     <div className="divide-y divide-zinc-800/50">
                        {/* Sign Out */}
                        <button
                           onClick={() => logoutMutation.mutate()}
                           disabled={logoutMutation.isPending || logoutAllMutation.isPending}
                           className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group disabled:opacity-50"
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
                              <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                           )}
                        </button>

                        {/* Sign Out Everywhere */}
                        <button
                           onClick={() => logoutAllMutation.mutate()}
                           disabled={logoutMutation.isPending || logoutAllMutation.isPending}
                           className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group disabled:opacity-50"
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
                              <Loader2 className="w-5 h-5 text-red-400 animate-spin" />
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
                  className="mt-12 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 text-center"
               >
                  <img
                     src={user?.avatar?.url || user?.avatar}
                     alt={user?.username}
                     className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-zinc-700 object-cover"
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
