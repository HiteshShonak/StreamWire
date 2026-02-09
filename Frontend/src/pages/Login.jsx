import { useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { Loader2, Lock, Mail, AlertCircle, ArrowRight, Radio, Eye, EyeOff } from "lucide-react"
import { motion } from "framer-motion"
import { login as authLogin } from "../store/authSlice"
import { authService } from "../api/services/auth.service"
import toast from "react-hot-toast"

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

const AmbientBackground = () => (
    <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen animate-pulse" style={{ animationDuration: '7s' }} />
    </div>
)

// ==========================================
// 🔐 MAIN LOGIN COMPONENT
// ==========================================
export default function Login() {
    const [serverError, setServerError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

    const onSubmit = async (data) => {
        setServerError("")
        try {
            await authService.login({
                identifier: data.identifier,
                password: data.password
            })

            // Fetch complete user data with avatar and all profile info
            const userData = await authService.getCurrentUser()

            if (userData) {
                dispatch(authLogin(userData))
                toast.success("Identity Verified. Access Granted.")
                navigate("/")
            }
        } catch (error) {
            // Map backend errors to user-friendly messages
            let errorMessage = error.message || "Login failed"

            if (error.message?.includes("does not exist")) {
                errorMessage = "No account found with this username or email"
            } else if (error.message?.includes("Invalid credentials")) {
                errorMessage = "Incorrect password. Please try again."
            } else if (error.message?.includes("scheduled for deletion")) {
                errorMessage = "Account pending deletion. Contact support to restore."
            } else if (error.message?.includes("suspended") || error.message?.includes("BANNED")) {
                errorMessage = "Account suspended due to policy violations."
            }

            setServerError(errorMessage)
            toast.error(errorMessage)
        }
    }

    return (
        <div className="min-h-screen w-full bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
            <NoiseOverlay />
            <AmbientBackground />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="w-full max-w-md relative z-20"
            >
                {/* 🔮 GLASS CARD */}
                <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/10 p-8 rounded-[2rem] shadow-2xl shadow-black/50 overflow-hidden relative group">

                    {/* Top Glow Accent */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50 blur-sm" />

                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-6 shadow-inner text-white relative overflow-hidden group-hover:border-white/20 transition-colors">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Radio className="w-7 h-7 relative z-10" />
                        </div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-2">Welcome Back</h1>
                        <p className="text-zinc-400 text-sm"> Authenticate to enter the <span className="text-indigo-400 font-semibold">Gateway</span>.</p>
                    </div>

                    {/* Error Message */}
                    {serverError && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200 text-sm backdrop-blur-sm"
                        >
                            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                            <p>{serverError}</p>
                        </motion.div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        {/* Identifier Field */}
                        <div className="space-y-1.5 group/input">
                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 group-focus-within/input:text-indigo-400 transition-colors">
                                Identity
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" />
                                <input
                                    {...register("identifier", { required: "Identity is required" })}
                                    autoComplete="username"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:bg-black/40 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all shadow-inner"
                                    placeholder="Username or Email"
                                />
                            </div>
                            {errors.identifier && <p className="text-red-400 text-xs pl-1">{errors.identifier.message}</p>}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1.5 group/input">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider group-focus-within/input:text-indigo-400 transition-colors">
                                    Passkey
                                </label>
                                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium hover:underline decoration-indigo-500/30">
                                    Recover Access?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password", { required: "Passkey is required" })}
                                    autoComplete="current-password"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-zinc-600 focus:bg-black/40 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all shadow-inner"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-3.5 text-zinc-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-400 text-xs pl-1">{errors.password.message}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full group relative overflow-hidden bg-white text-black font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 mt-4 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-white to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-screen" />
                            <span className="relative z-10 flex items-center justify-center gap-2">
                                {isSubmitting ? <Loader2 className="animate-spin h-5 w-5" /> : (
                                    <>
                                        Enter Gateway <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </span>
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-zinc-500 text-sm">
                            New to the network? <Link to="/register" className="text-white hover:text-indigo-300 font-bold hover:underline decoration-white/20 transition-colors">Initialize Account</Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}