import { motion } from 'framer-motion'
import { Radio } from 'lucide-react'

export const CustomLogo = ({ isStealth }) => {
  return (
    <motion.div 
      className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none"
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      <motion.div 
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-base sm:text-lg transition-all duration-500 ${
          isStealth 
            ? 'bg-linear-to-br from-green-500 to-emerald-600 text-zinc-950 shadow-lg shadow-green-500/20' 
            : 'bg-linear-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
        }`}
        animate={{ rotate: isStealth ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
      >
        <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
      </motion.div>
      <span className={`text-base sm:text-xl font-bold transition-colors duration-500 hidden xs:block ${
        isStealth ? 'text-white' : 'text-zinc-900'
      }`}>
        StreamWire
      </span>
    </motion.div>
  )
}
