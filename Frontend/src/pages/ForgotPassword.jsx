import { useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import { Mail, AlertCircle, ArrowRight, Radio, Eye, EyeOff, Lock, Key } from "lucide-react"
import { LoadingDots } from '../Components/Common/LoadingIndicator'
import { motion, AnimatePresence } from "framer-motion"
import { authService } from "../api/services/auth.service"
import toast from "react-hot-toast"
import { toActionError } from "../utils/errorMessages"

// Background components
const NoiseOverlay = () => (
    <div className="absolute inset-0 pointer-events-none z-10 opacity-4 mix-blend-overlay">
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
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-black/0 blur-[120px] rounded-full mix-blend-screen animate-pulse gpu-layer" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-black/0 blur-[120px] rounded-full mix-blend-screen animate-pulse gpu-layer" style={{ animationDuration: '7s' }} />
    </div>
)

// OTP input component
const OTPInput = ({ length = 6, onComplete, disabled = false }) => {
    const [otp, setOtp] = useState(new Array(length).fill(""))

    const handleChange = (e, index) => {
        if (isNaN(e.target.value)) return
        const newOtp = [...otp]
        newOtp[index] = e.target.value
        setOtp(newOtp)

        if (e.target.value && e.target.nextSibling) {
            e.target.nextSibling.focus()
        }

        if (newOtp.join("").length === length) {
            onComplete(newOtp.join(""))
        }
    }

    return (
        <div className="flex gap-2 justify-center my-8">
            {otp.map((data, index) => (
                <input
                    key={index}
                    type="text"
                    maxLength="1"
                    disabled={disabled}
                    autoFocus={index === 0}
                    className="w-10 h-12 sm:w-12 sm:h-14 bg-zinc-950 border border-zinc-800 rounded-xl text-center text-xl font-bold text-white focus:border-white focus:ring-2 focus:ring-white/20 outline-none transition-all focus:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    value={otp[index]}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[index] && e.target.previousSibling) {
                            e.target.previousSibling.focus()
                        }
                    }}
                />
            ))}
        </div>
    )
}

// Forgot password page
export default function ForgotPassword() {
    const [step, setStep] = useState(1) // 1: Enter identifier, 2: Enter OTP, 3: Enter new password
    const [email, setEmail] = useState("")
    const [otp, setOtp] = useState("")
    const [serverError, setServerError] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isResending, setIsResending] = useState(false)
    const navigate = useNavigate()
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm()

    // Step 1: Request OTP
    const onRequestOTP = async (data) => {
        setServerError("")
        try {
            const response = await authService.forgotPassword(data.identifier)
            setEmail(response.email)
            setStep(2)
            reset()
            toast.success(`Recovery code sent to ${response.email}!`)
        } catch (error) {
            const errorMessage = toActionError(error, "Failed to send recovery code. Please try again.", [
                {
                    when: ["no account", "does not exist"],
                    message: "No account found with this username or email."
                },
                {
                    when: ["required"],
                    message: "Please enter your username or email."
                }
            ])

            setServerError(errorMessage)
            toast.error(errorMessage)
        }
    }

    // Step 2: Verify OTP (move to step 3)
    const onVerifyOTP = async (otpValue) => {
        setServerError("")
        if (otpValue.length !== 6) {
            setServerError("OTP must be 6 digits")
            return
        }
        setOtp(otpValue)
        setStep(3)
        toast.success("OTP verified! Set your new password")
    }

    // Step 3: Reset Password
    const onResetPassword = async (data) => {
        setServerError("")
        try {
            await authService.resetPassword({
                email: email,
                otp: otp,
                newPassword: data.newPassword
            })
            toast.success("Password reset successfully! Please log in.")
            navigate("/login")
        } catch (error) {
            const errorMessage = toActionError(error, "Failed to reset password. Please try again.", [
                {
                    when: ["invalid or expired otp", "invalid otp", "expired otp"],
                    message: "Invalid or expired code. Please go back and request a new one."
                },
                {
                    when: ["no longer exists", "account not found"],
                    message: "Account not found. Please contact support."
                },
                {
                    when: ["required"],
                    message: "All fields are required to reset password."
                }
            ])

            setServerError(errorMessage)
            toast.error(errorMessage)
        }
    }

    // Resend OTP for password reset
    const onResendOTP = async () => {
        setIsResending(true)
        setServerError("")
        try {
            await authService.forgotPassword(email)
            toast.success("New recovery code sent!")
        } catch (error) {
            const sessionExpired = String(error?.message || '').toLowerCase().includes('no account')
            const errorMessage = toActionError(error, "Failed to resend code. Please try again.", [
                {
                    when: ["no account", "does not exist"],
                    message: "Session expired. Please start over."
                }
            ])

            if (sessionExpired) {
                setStep(1)
            }

            setServerError(errorMessage)
            toast.error(errorMessage)
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-black flex items-center justify-center p-4 relative overflow-hidden">
            <NoiseOverlay />
            <AmbientBackground />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "circOut" }}
                className="w-full max-w-md relative z-20"
            >
                {/* Glass Card */}
                <div className="bg-zinc-950 backdrop-blur-2xl border border-zinc-800 p-8 rounded-4xl shadow-2xl shadow-black/50 overflow-hidden relative group">

                    {/* Top Glow Accent */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-linear-to-r from-transparent via-zinc-700 to-transparent opacity-50 blur-sm" />

                    {/* Header Section */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-6 shadow-inner text-white relative overflow-hidden group-hover:border-white/20 transition-colors">
                            <div className="absolute inset-0 bg-white/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Key className="w-7 h-7 relative z-10" />
                        </div>
                        <h1 className="font-display text-3xl font-black text-white tracking-tight mb-2">
                            {step === 1 ? "Forgot Password" : step === 2 ? "Verify OTP" : "Reset Password"}
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            {step === 1
                                ? "Enter your email or username to receive an OTP"
                                : step === 2
                                    ? "Enter the 6-digit OTP sent to your email"
                                    : "Create a new password for your account"
                            }
                        </p>
                    </div>

                    {/* Error Message */}
                    {serverError && (
                        <motion.div
                            key={serverError}
                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.16, ease: "easeOut" }}
                            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200 text-sm backdrop-blur-sm"
                        >
                            <AlertCircle className="w-5 h-5 shrink-0 text-red-400" />
                            <p>{serverError}</p>
                        </motion.div>
                    )}

                    <AnimatePresence mode="wait">
                        {/* Step 1: Request OTP */}
                        {step === 1 && (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleSubmit(onRequestOTP)}
                                className="space-y-5"
                            >
                                {/* Identifier Field */}
                                <div className="space-y-1.5 group/input">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 group-focus-within/input:text-white transition-colors">
                                        Username or Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" />
                                        <input
                                            {...register("identifier", { required: "Username or Email is required" })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:bg-zinc-900 focus:border-white focus:ring-1 focus:ring-white outline-none transition-all shadow-inner"
                                            placeholder="john@example.com or @johndoe"
                                        />
                                    </div>
                                    {errors.identifier && <p className="text-red-400 text-xs pl-1">{errors.identifier.message}</p>}
                                </div>

                                {/* Submit Button */}
                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="w-full group relative overflow-hidden bg-white text-black font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 mt-4 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                >
                                    <div className="absolute inset-0 bg-linear-to-r from-zinc-200 via-white to-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-screen" />
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {isSubmitting ? <LoadingDots size="md" /> : (
                                            <>
                                                Send OTP <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </span>
                                </button>

                                {/* Back to Login */}
                                <div className="text-center text-sm pt-4">
                                    <span className="text-zinc-500">Remember your password? </span>
                                    <Link to="/login" className="text-zinc-400 hover:text-white font-semibold hover:underline decoration-zinc-500/30">
                                        Back to Login
                                    </Link>
                                </div>
                            </motion.form>
                        )}

                        {/* Step 2: Verify OTP */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-5"
                            >
                                {/* Email Display */}
                                <div className="text-center bg-zinc-900 p-4 rounded-xl border border-zinc-700 backdrop-blur-md">
                                    <p className="text-zinc-300 text-sm mb-1">Code sent to</p>
                                    <p className="font-mono text-white font-bold tracking-wide">{email}</p>
                                </div>

                                {/* OTP Input */}
                                <OTPInput length={6} onComplete={onVerifyOTP} disabled={isSubmitting} />

                                {isSubmitting && (
                                    <div className="flex justify-center text-white">
                                        <LoadingDots size="lg" />
                                    </div>
                                )}

                                {/* Resend OTP */}
                                <div className="flex items-center justify-center gap-2 text-sm">
                                    <span className="text-zinc-500">Didn't receive code?</span>
                                    <button
                                        type="button"
                                        onClick={onResendOTP}
                                        disabled={isResending || isSubmitting}
                                        className="text-zinc-400 hover:text-white font-semibold hover:underline decoration-zinc-500/30 transition-colors disabled:opacity-50"
                                    >
                                        {isResending ? "Sending..." : "Resend"}
                                    </button>
                                </div>

                                {/* Back Button */}
                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setServerError("") }}
                                    className="w-full text-zinc-500 hover:text-white text-sm transition-colors mt-2 flex items-center justify-center gap-2"
                                >
                                    <ArrowRight className="w-4 h-4 rotate-180" /> Change email
                                </button>
                            </motion.div>
                        )}

                        {/* Step 3: Reset Password */}
                        {step === 3 && (
                            <motion.form
                                key="step3"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleSubmit(onResetPassword)}
                                className="space-y-5"
                            >
                                {/* Success Message */}
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-sm">
                                    <div className="flex items-center gap-2 text-emerald-200">
                                        <Key className="w-4 h-4" />
                                        <span>OTP verified successfully!</span>
                                    </div>
                                </div>

                                {/* New Password Field */}
                                <div className="space-y-1.5 group/input">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 group-focus-within/input:text-white transition-colors">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            {...register("newPassword", {
                                                required: "New password is required",
                                                minLength: { value: 8, message: "At least 8 characters, 1 uppercase, 1 lowercase & 1 number" }
                                            })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-12 text-white placeholder:text-zinc-600 focus:bg-zinc-900 focus:border-white focus:ring-1 focus:ring-white outline-none transition-all shadow-inner"
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
                                    {errors.newPassword && <p className="text-red-400 text-xs pl-1">{errors.newPassword.message}</p>}
                                </div>

                                {/* Password Requirements */}
                                <div className="p-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl">
                                    <p className="text-xs text-zinc-400">
                                        <strong>Requirements:</strong> At least 8 characters, 1 uppercase, 1 lowercase & 1 number
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="w-full group relative overflow-hidden bg-white text-black font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 mt-4 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                >
                                    <div className="absolute inset-0 bg-linear-to-r from-zinc-200 via-white to-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-screen" />
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {isSubmitting ? <LoadingDots size="md" /> : (
                                            <>
                                                Reset Password <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </span>
                                </button>

                                {/* Back Button */}
                                <button
                                    type="button"
                                    onClick={() => { setStep(2); setServerError(""); reset() }}
                                    className="w-full text-zinc-400 hover:text-white text-sm py-2 transition-colors"
                                >
                                    ← Back to OTP
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}
