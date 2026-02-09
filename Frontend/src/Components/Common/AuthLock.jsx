import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Sparkles } from 'lucide-react'

const AuthLock = ({
    message = "Sign in to unlock",
    variant = "default", // default | cinema | wire | shadows
    size = "large", // large | compact
    onAction
}) => {
    const navigate = useNavigate()

    const handleAction = () => {
        if (onAction) {
            onAction()
        } else {
            navigate('/login')
        }
    }

    // Variant Styles
    const variants = {
        default: "from-indigo-500/10 to-purple-500/10 border-indigo-500/20 text-indigo-100",
        cinema: "from-indigo-600/10 to-violet-600/10 border-indigo-500/20 text-indigo-100",
        wire: "from-sky-500/10 to-blue-600/10 border-sky-500/20 text-sky-100",
        shadows: "from-green-500/10 to-emerald-600/10 border-green-500/20 text-emerald-100",
    }

    const btnVariants = {
        default: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25",
        cinema: "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/25",
        wire: "bg-sky-600 hover:bg-sky-500 shadow-sky-500/25",
        shadows: "bg-green-600 hover:bg-green-500 shadow-green-500/25",
    }

    const style = variants[variant] || variants.default
    const btnStyle = btnVariants[variant] || btnVariants.default

    if (size === "compact") {
        return (
            <div className={`relative w-full overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${style} p-4`}>
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md">
                            <Lock className="w-4 h-4 opacity-80" />
                        </div>
                        <p className="text-sm font-medium opacity-90">
                            {message}
                        </p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAction}
                        className={`px-5 py-2 rounded-lg text-xs font-bold text-white shadow-lg transition-all flex items-center gap-2 flex-shrink-0 ${btnStyle}`}
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        Sign In
                    </motion.button>
                </div>
            </div>
        )
    }

    return (
        <div className={`relative w-full overflow-hidden rounded-xl border backdrop-blur-sm bg-gradient-to-br ${style} p-8`}>
            {/* Background Glow Effects */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <div className="mb-4 p-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
                    <Lock className="w-6 h-6 opacity-80" />
                </div>

                <h3 className="text-xl font-bold mb-2 tracking-tight">Access Restricted</h3>
                <p className="text-sm opacity-70 mb-6 max-w-sm leading-relaxed">
                    {message}
                </p>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAction}
                    className={`px-8 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 ${btnStyle}`}
                >
                    <Sparkles className="w-4 h-4" />
                    Sign In to Continue
                </motion.button>
            </div>
        </div>
    )
}

export default AuthLock
