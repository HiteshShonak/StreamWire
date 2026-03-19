import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ShieldCheck, Film, Ghost, MessageSquare } from 'lucide-react'
import DashboardVideoCard from './DashboardVideoCard'
import WireCardMini from './WireCardMini'

const StealthSection = ({
    stealthVideos,
    stealthWires,
    toggleVideoStealthMutation,
    deleteVideoMutation,
    toggleWireStealthMutation,
    deleteWireMutation
}) => {
    return (
        <motion.div
            key="stealth"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold text-white">Stealth Posts</h2>
                <Link
                    to="/shadows"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold text-sm transition-all text-white"
                >
                    <Ghost className="w-4 h-4" />
                    New Shadow
                </Link>
            </div>

            {/* Info Banner */}
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                    <h4 className="font-bold text-green-400 mb-1">Stealth Mode Active</h4>
                    <p className="text-sm text-green-300/70">
                        Posts in stealth mode appear as anonymous. Your identity is hidden from viewers.
                        You can claim them anytime to reveal your identity.
                    </p>
                </div>
            </div>

            {/* Stealth Videos */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Film className="w-5 h-5 text-green-400" />
                    Stealth Videos
                    <span className="px-2 py-0.5 bg-green-500/20 rounded-full text-xs text-green-400">{stealthVideos.length}</span>
                </h3>

                {stealthVideos.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                        <Ghost className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                        <p className="text-sm text-zinc-500">No stealth videos</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {stealthVideos.map((video) => (
                            <DashboardVideoCard
                                key={video._id}
                                video={video}
                                onToggleStealth={toggleVideoStealthMutation}
                                onDelete={deleteVideoMutation}
                                isStealth
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Stealth Wires */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-green-400" />
                    Stealth Wires
                    <span className="px-2 py-0.5 bg-green-500/20 rounded-full text-xs text-green-400">{stealthWires.length}</span>
                </h3>

                {stealthWires.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-900/30 border border-zinc-800 rounded-xl">
                        <Ghost className="w-10 h-10 text-zinc-700 mx-auto mb-2" />
                        <p className="text-sm text-zinc-500">No stealth wires</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-w-3xl">
                        {stealthWires.map((wire) => (
                            <WireCardMini
                                key={wire._id}
                                wire={wire}
                                onToggleStealth={() => toggleWireStealthMutation.mutate({ wireId: wire._id, currentStealth: wire.isStealthMode })}
                                onDelete={() => deleteWireMutation.mutate(wire._id)}
                                isStealth
                            />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    )
}

export default StealthSection
