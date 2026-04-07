import { useState } from "react"
import { useForm } from "react-hook-form"
import { useDispatch } from "react-redux"
import { Link, useNavigate } from "react-router-dom"
import { Mail, User, Shield, ArrowRight, CheckCircle2, Radio, Lock, AtSign, Eye, EyeOff } from "lucide-react"
import { LoadingDots } from '../Components/Common/LoadingIndicator'
import favicon from '../assets/favicon.webp'
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import { authService } from "../api/services/auth.service"
import { login } from "../store/authSlice"
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
        <div className="absolute top-[-10%] right-[-10%] w-125 h-125 bg-black/0 blur-[120px] rounded-full mix-blend-screen animate-pulse gpu-layer" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-[-10%] left-[-10%] w-125 h-125 bg-black/0 blur-[120px] rounded-full mix-blend-screen animate-pulse gpu-layer" style={{ animationDuration: '4s' }} />
    </div>
)

// Dark mode OTP input
const OTPInput = ({ length = 6, onComplete }) => {
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
                    autoFocus={index === 0}
                    className="w-10 h-12 sm:w-12 sm:h-14 bg-zinc-950 border border-zinc-800 rounded-xl text-center text-xl font-bold text-white focus:border-white focus:ring-2 focus:ring-white/20 outline-none transition-all focus:-translate-y-1"
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

// Register page
export default function Register() {
    const [step, setStep] = useState("DETAILS") // "DETAILS" | "OTP"
    const [tempData, setTempData] = useState(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isResending, setIsResending] = useState(false)

    const navigate = useNavigate()
    const dispatch = useDispatch()
    const { register, handleSubmit, formState: { errors } } = useForm()

    // Step 1: Request OTP
    const onRequestOTP = async (data) => {
        setIsSubmitting(true)
        try {
            const response = await authService.registerRequest({
                fullName: data.fullName,
                username: data.username,
                email: data.email,
                password: data.password
            })

            const isBypassed = response?.smtpBypassed || response?.data?.smtpBypassed || response?.data?.data?.smtpBypassed;

            // SMTP was blocked — user already created & logged in by backend
            if (isBypassed) {
                sessionStorage.setItem('pendingRedirect', 'true')
                dispatch(login(response?.data || response))
                toast.success("Account created successfully!")
                navigate("/customize?onboarding=true")
                return
            }

            // Normal flow — SMTP worked, show OTP screen
            setTempData(data)
            setStep("OTP")
            toast.success(`Verification code sent to ${data.email}`)
        } catch (error) {
            const errorMessage = toActionError(error, "Registration failed. Please try again.", [
                {
                    when: ({ statusCode, normalizedMessage }) =>
                        statusCode === 409 ||
                        normalizedMessage.includes('already exists') ||
                        normalizedMessage.includes('already registered') ||
                        normalizedMessage.includes('duplicate'),
                    message: "Username or email is already registered. Try logging in instead."
                },
                {
                    when: ({ statusCode, normalizedMessage }) =>
                        statusCode === 400 &&
                        (normalizedMessage.includes('fields') || normalizedMessage.includes('required')),
                    message: "All fields are required. Please fill in the form completely."
                },
                {
                    when: ({ statusCode }) => statusCode === 429,
                    message: "Too many registration attempts. Please wait and try again."
                }
            ])

            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Step 2: Verify & Create Account
    const onVerifyOTP = async (otp) => {
        setIsSubmitting(true)
        try {
            const response = await authService.verifyOtp({
                ...tempData,
                otp
            })

            // Axios interceptors might return the unwrapped object or the full response
            if (response?.user || response?.data?.user || response) {
                sessionStorage.setItem('pendingRedirect', 'true')
                dispatch(login(response?.data || response));
                toast.success("Identity Verified. Account Created.");
                navigate("/customize?onboarding=true");
            }
        } catch (error) {
            const errorMessage = toActionError(error, "Verification failed. Please try again.", [
                {
                    when: ({ statusCode, normalizedMessage }) =>
                        statusCode === 400 &&
                        (normalizedMessage.includes('invalid or expired otp') ||
                            normalizedMessage.includes('invalid otp') ||
                            normalizedMessage.includes('expired otp')),
                    message: "Invalid or expired code. Please request a new one."
                },
                {
                    when: ({ normalizedMessage }) => normalizedMessage.includes('session expired'),
                    message: "Session expired. Please start registration again."
                },
                {
                    when: ({ statusCode }) => statusCode === 429,
                    message: "Too many verification attempts. Please wait and try again."
                }
            ])

            toast.error(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Resend OTP
    const onResendOTP = async () => {
        setIsResending(true)
        try {
            await authService.resendOtp(tempData.email)
            toast.success("New verification code sent!")
        } catch (error) {
            const isSessionExpired = String(error?.message || '').toLowerCase().includes('session expired')
            const errorMessage = toActionError(error, "Failed to resend code. Please try again.", [
                {
                    when: ({ normalizedMessage }) => normalizedMessage.includes('session expired'),
                    message: "Session expired. Please restart registration."
                },
                {
                    when: ({ statusCode }) => statusCode === 429,
                    message: "Too many OTP requests. Please wait before requesting again."
                }
            ])

            if (isSessionExpired) {
                setStep("DETAILS")
            }

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
                <div className="bg-zinc-950 backdrop-blur-2xl border mt-8 border-zinc-800 p-8 rounded-4xl shadow-2xl shadow-black/50 overflow-hidden relative group">

                    {/* Header Section */}
                    <div className="text-center mb-8 relative z-10">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-6 shadow-inner text-white relative overflow-hidden group-hover:border-white/20 transition-colors">
                            <div className={`absolute inset-0 blur-xl opacity-0 group-hover:opacity-100 transition-opacity ${step === "DETAILS" ? "bg-white/10" : "bg-white/10"}`} />
                            {step === "DETAILS" ? (
                                <Radio className="w-7 h-7 relative z-10" />
                            ) : (
                                <div className="relative z-10">
                                    <img src={favicon} alt="StreamWire" className="w-8 h-8 object-contain" />
                                </div>
                            )}
                        </div>
                        <h1 className="font-display text-3xl font-black text-white tracking-tight mb-2">
                            {step === "DETAILS" ? "Initialize Account" : "Verify Identity"}
                        </h1>
                        <p className="text-zinc-400 text-sm">
                            {step === "DETAILS" ? "Join the secured network." : "Enter the verification code sent to your email."}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === "DETAILS" ? (
                            <motion.form
                                key="details-form"
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                onSubmit={handleSubmit(onRequestOTP)}
                                className="space-y-4"
                            >
                                {/* Full Name */}
                                <div className="space-y-1.5 group/input">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 group-focus-within/input:text-white transition-colors">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" />
                                        <input
                                            {...register("fullName", { required: "Required" })}
                                            autoComplete="name"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:bg-zinc-900 focus:border-white focus:ring-1 focus:ring-white outline-none transition-all shadow-inner"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    {errors.fullName && <p className="text-red-400 text-xs pl-1">{errors.fullName.message}</p>}
                                </div>

                                {/* Username */}
                                <div className="space-y-1.5 group/input">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 group-focus-within/input:text-white transition-colors">Username</label>
                                    <div className="relative">
                                        <AtSign className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" />
                                        <input
                                            {...register("username", { required: "Required" })}
                                            autoComplete="username"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:bg-zinc-900 focus:border-white focus:ring-1 focus:ring-white outline-none transition-all shadow-inner"
                                            placeholder="johndoe"
                                        />
                                    </div>
                                    {errors.username && <p className="text-red-400 text-xs pl-1">{errors.username.message}</p>}
                                </div>

                                {/* Email */}
                                <div className="space-y-1.5 group/input">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 group-focus-within/input:text-white transition-colors">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" />
                                        <input
                                            {...register("email", { required: "Required", pattern: { value: /^\S+@\S+$/i, message: "Invalid email" } })}
                                            autoComplete="email"
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-zinc-600 focus:bg-zinc-900 focus:border-white focus:ring-1 focus:ring-white outline-none transition-all shadow-inner"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    {errors.email && <p className="text-red-400 text-xs pl-1">{errors.email.message}</p>}
                                </div>

                                {/* Password */}
                                <div className="space-y-1.5 group/input">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 group-focus-within/input:text-white transition-colors">Password</label>
                                    <div className="relative">
                                        <Shield className="absolute left-4 top-3.5 h-5 w-5 text-zinc-500 group-focus-within/input:text-white transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            {...register("password", { required: "Required", minLength: { value: 8, message: "At least 8 characters, 1 uppercase, 1 lowercase & 1 number" } })}
                                            autoComplete="new-password"
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
                                    {errors.password && <p className="text-red-400 text-xs pl-1">{errors.password.message}</p>}
                                </div>

                                <button
                                    disabled={isSubmitting}
                                    type="submit"
                                    className="w-full group relative overflow-hidden bg-white text-black font-bold py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 mt-6 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                >
                                    <div className="absolute inset-0 bg-linear-to-r from-zinc-200 via-white to-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-screen" />
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {isSubmitting ? <LoadingDots size="md" /> : (
                                            <>
                                                Proceed <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </span>
                                </button>
                            </motion.form>
                        ) : (
                            <motion.div
                                key="otp-form"
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 20, opacity: 0 }}
                                className="space-y-6"
                            >
                                <div className="text-center bg-zinc-900 p-4 rounded-xl border border-zinc-700 backdrop-blur-md">
                                    <p className="text-zinc-300 text-sm mb-1">Code sent to</p>
                                    <p className="font-mono text-white font-bold tracking-wide">{tempData?.email}</p>
                                </div>

                                <OTPInput length={6} onComplete={onVerifyOTP} />

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
                                        disabled={isResending}
                                        className="text-zinc-400 hover:text-white font-semibold hover:underline decoration-zinc-500/30 transition-colors disabled:opacity-50"
                                    >
                                        {isResending ? "Sending..." : "Resend"}
                                    </button>
                                </div>

                                <button
                                    onClick={() => setStep("DETAILS")}
                                    className="w-full text-zinc-500 hover:text-white text-sm transition-colors mt-2 flex items-center justify-center gap-2"
                                >
                                    <ArrowRight className="w-4 h-4 rotate-180" /> Change email
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Footer */}
                    <div className="mt-8 text-center border-t border-white/5 pt-6">
                        <p className="text-zinc-500 text-sm">
                            Already authenticated? <Link to="/login" className="text-white hover:text-zinc-300 font-bold hover:underline decoration-white/20 transition-colors">Enter Gateway</Link>
                        </p>
                    </div>

                </div>
            </motion.div>
        </div>
    )
}