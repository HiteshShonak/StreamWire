import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2, Shield } from 'lucide-react'
import { LoadingDots } from '../Components/Common/LoadingIndicator'
import toast from 'react-hot-toast'
import { authService } from '../api/services/auth.service'
import { toActionError } from '../utils/errorMessages'

export default function ChangePassword() {
   const navigate = useNavigate()
   const [serverError, setServerError] = useState("")
   const [showOldPassword, setShowOldPassword] = useState(false)
   const [showNewPassword, setShowNewPassword] = useState(false)
   const { register, handleSubmit, formState: { errors }, watch } = useForm()

   const newPassword = watch("newPassword")

   // Change password mutation
   const changePasswordMutation = useMutation({
      mutationFn: (data) => authService.changePassword({
         oldPassword: data.oldPassword,
         newPassword: data.newPassword
      }),
      onSuccess: (response) => {
         // backend returns { accessToken, refreshToken } (no user object)
         // old tokens were revoked, save the new ones
         if (response.accessToken) localStorage.setItem("accessToken", response.accessToken);
         if (response.refreshToken) localStorage.setItem("refreshToken", response.refreshToken);
         toast.success("Password changed successfully!")
         navigate('/settings')
      },
      onError: (error) => {
         const errorMessage = toActionError(error, "Failed to change password", [
            { when: ['invalid credentials', 'incorrect'], message: 'Current password is incorrect. Please try again.' },
            { when: 'same as', message: 'New password cannot be the same as current password.' },
            { when: 'required', message: 'All fields are required to change password.' },
            { when: ['unauthorized', 'not authorized', 'login'], message: 'Please sign in again before changing password.' },
         ])

         setServerError(errorMessage)
         toast.error(errorMessage)
      }
   })

   const onSubmit = async (data) => {
      setServerError("")
      if (data.newPassword !== data.confirmPassword) {
         setServerError("New passwords do not match")
         return
      }
      changePasswordMutation.mutate(data)
   }

   return (
      <div className="relative min-h-screen bg-[#050505] text-white">

         {/* Background Glow */}
         <div className="fixed top-0 left-1/2 -translate-x-1/2 w-250 h-150 bg-indigo-500 opacity-5 blur-[120px] pointer-events-none gpu-layer" />

         <div className="relative z-10 px-4 sm:px-6 lg:pl-72 lg:pr-72 pt-20 sm:pt-24 pb-20">
            <div className="max-w-2xl mx-auto">

               {/* Back Button */}
               <button
                  onClick={() => navigate('/settings')}
                  className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-8 group"
               >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Back to Settings</span>
               </button>

               {/* Header */}
               <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center mb-8 sm:mb-10"
               >
                  <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-indigo-500/20 border border-indigo-500/30 mb-4 sm:mb-6">
                     <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-400" />
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Change Password</h1>
                  <p className="text-zinc-400 text-sm sm:text-base">Update your password to keep your account secure</p>
               </motion.div>

               {/* Form Card */}
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-zinc-900/40 backdrop-blur-sm border border-zinc-800 rounded-2xl sm:rounded-3xl p-5 sm:p-8"
               >

                  {/* Error Message */}
                  {serverError && (
                     <motion.div
                        key={serverError}
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200 text-sm"
                     >
                        <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                        <p>{serverError}</p>
                     </motion.div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                     {/* Old Password */}
                     <div className="space-y-2 group/input">
                        <label className="text-sm font-bold text-zinc-300">
                           Current Password
                        </label>
                        <div className="relative">
                           <Lock className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" />
                           <input
                              type={showOldPassword ? "text" : "password"}
                              {...register("oldPassword", { required: "Current password is required" })}
                              className="w-full bg-black/20 border border-zinc-700 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder:text-zinc-600 focus:bg-black/40 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                              placeholder="Enter your current password"
                           />
                           <button
                              type="button"
                              onClick={() => setShowOldPassword(!showOldPassword)}
                              className="absolute right-4 top-3.5 text-zinc-500 hover:text-white transition-colors"
                           >
                              {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                           </button>
                        </div>
                        {errors.oldPassword && <p className="text-red-400 text-xs pl-1">{errors.oldPassword.message}</p>}
                     </div>

                     {/* New Password */}
                     <div className="space-y-2 group/input">
                        <label className="text-sm font-bold text-zinc-300">
                           New Password
                        </label>
                        <div className="relative">
                           <Lock className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" />
                           <input
                              type={showNewPassword ? "text" : "password"}
                              {...register("newPassword", {
                                 required: "New password is required",
                                 minLength: { value: 6, message: "Password must be at least 6 characters" }
                              })}
                              className="w-full bg-black/20 border border-zinc-700 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder:text-zinc-600 focus:bg-black/40 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                              placeholder="Enter your new password"
                           />
                           <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-4 top-3.5 text-zinc-500 hover:text-white transition-colors"
                           >
                              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                           </button>
                        </div>
                        {errors.newPassword && <p className="text-red-400 text-xs pl-1">{errors.newPassword.message}</p>}
                     </div>

                     {/* Confirm New Password */}
                     <div className="space-y-2 group/input">
                        <label className="text-sm font-bold text-zinc-300">
                           Confirm New Password
                        </label>
                        <div className="relative">
                           <CheckCircle2 className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" />
                           <input
                              type={showNewPassword ? "text" : "password"}
                              {...register("confirmPassword", {
                                 required: "Please confirm your new password",
                                 validate: value => value === newPassword || "Passwords do not match"
                              })}
                              className="w-full bg-black/20 border border-zinc-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:bg-black/40 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                              placeholder="Confirm your new password"
                           />
                        </div>
                        {errors.confirmPassword && <p className="text-red-400 text-xs pl-1">{errors.confirmPassword.message}</p>}
                     </div>

                     {/* Password Requirements */}
                     <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <p className="text-sm text-indigo-200 font-medium mb-2">Password Requirements:</p>
                        <ul className="text-sm text-zinc-400 space-y-1">
                           <li className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${newPassword?.length >= 6 ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                              At least 6 characters long
                           </li>
                           <li className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                              Different from current password
                           </li>
                        </ul>
                     </div>

                     {/* Buttons */}
                     <div className="flex gap-4 pt-4">
                        <button
                           type="button"
                           onClick={() => navigate('/settings')}
                           className="flex-1 px-6 py-3.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl font-bold transition-all"
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           disabled={changePasswordMutation.isPending}
                           className="flex-1 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                           {changePasswordMutation.isPending ? (
                              <>
                                 <LoadingDots size="md" />
                                 Updating...
                              </>
                           ) : (
                              'Change Password'
                           )}
                        </button>
                     </div>
                  </form>

                  {/* Security Notice */}
                  <div className="mt-6 p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-xl">
                     <p className="text-xs text-zinc-500 leading-relaxed">
                        <strong className="text-zinc-400">Security Notice:</strong> After changing your password, you'll be signed out from all other devices. You'll need to sign in again with your new password.
                     </p>
                  </div>
               </motion.div>
            </div>
         </div>
      </div>
   )
}
