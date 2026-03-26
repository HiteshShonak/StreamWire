import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Film, MessageSquare, VenetianMask } from 'lucide-react'

export const InteractiveFeedDemo = ({ isStealth }) => {
  const [activeTab, setActiveTab] = useState('cinema')

  const tabs = [
    { id: 'cinema', label: 'Cinema', icon: Film },
    { id: 'wire', label: 'The Wire', icon: MessageSquare },
    { id: 'shadows', label: 'Shadows', icon: VenetianMask },
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4 shrink-0">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={`
              flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 border
              ${activeTab === tab.id 
                ? (isStealth ? "bg-green-500/10 text-green-400 border-green-500/30 shadow-lg shadow-green-500/10" : "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20") 
                : (isStealth ? "text-zinc-500 border-zinc-800 hover:text-zinc-300 hover:border-green-500/20 hover:bg-green-500/5" : "text-zinc-400 border-zinc-200 hover:text-zinc-600 hover:border-indigo-200 hover:bg-indigo-50")
              }
            `}
          >
            <tab.icon className="w-3 h-3" /> <span className="hidden xs:inline">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      <div className={`relative flex-1 min-h-0 rounded-xl border overflow-hidden p-3 sm:p-4 transition-colors duration-500 ${isStealth ? "bg-zinc-950/50 border-zinc-800" : "bg-white/60 border-zinc-100"}`}>
        <AnimatePresence mode="wait">
          {activeTab === 'cinema' && (
             <motion.div 
               key="cinema" 
               initial={{ opacity: 0, scale: 0.95 }} 
               animate={{ opacity: 1, scale: 1 }} 
               exit={{ opacity: 0 }} 
               transition={{ duration: 0.2 }} 
               className="h-full flex flex-col justify-center space-y-3"
             >
                <div className={`w-full aspect-video rounded-lg animate-pulse ${isStealth ? "bg-zinc-800" : "bg-zinc-200"}`} />
                <div className={`h-2.5 rounded-full w-3/4 animate-pulse ${isStealth ? "bg-zinc-800" : "bg-zinc-200"}`} />
                <div className={`h-2.5 rounded-full w-1/2 animate-pulse ${isStealth ? "bg-zinc-800" : "bg-zinc-100"}`} />
             </motion.div>
          )}
          
          {activeTab === 'wire' && (
             <motion.div 
               key="wire" 
               initial={{ opacity: 0, x: 20 }} 
               animate={{ opacity: 1, x: 0 }} 
               exit={{ opacity: 0, x: -20 }} 
               transition={{ duration: 0.2 }} 
               className="h-full flex flex-col justify-center space-y-3.5"
             >
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3">
                    <div className={`w-9 h-9 rounded-full shrink-0 animate-pulse ${isStealth ? "bg-zinc-800" : "bg-zinc-200"}`} />
                    <div className="space-y-2 w-full flex-1">
                      <div className={`h-2.5 rounded-full w-full animate-pulse ${isStealth ? "bg-zinc-800" : "bg-zinc-200"}`} />
                      <div className={`h-2.5 rounded-full w-2/3 animate-pulse ${isStealth ? "bg-zinc-800" : "bg-zinc-100"}`} />
                    </div>
                  </div>
                ))}
             </motion.div>
          )}

          {activeTab === 'shadows' && (
             <motion.div 
               key="shadows" 
               initial={{ opacity: 0, filter: "blur(4px)" }} 
               animate={{ opacity: 1, filter: "blur(0px)" }} 
               exit={{ opacity: 0 }} 
               transition={{ duration: 0.2 }} 
               className="h-full flex items-center justify-center p-1"
             >
                <div className="grid grid-cols-2 gap-2 w-full max-w-[240px]">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`aspect-square rounded-lg border p-2.5 flex items-end transition-colors duration-150 ${isStealth ? "bg-green-900/10 border-green-500/20" : "bg-zinc-900 text-white border-zinc-800"}`}>
                       <div className="w-full space-y-1">
                         <div className="h-1 bg-white/20 rounded-full w-full" />
                         <div className="h-1 bg-white/10 rounded-full w-2/3" />
                       </div>
                    </div>
                  ))}
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
