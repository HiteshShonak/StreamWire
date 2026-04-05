import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Plus, MessageSquare } from 'lucide-react'
import WireCardMini from './WireCardMini'
import { TweetListSkeleton } from '../../Components/Common/Skeleton'

const WireList = ({
    allWires,
    wiresLoading,
    toggleWireStealthMutation,
    deleteWireMutation
}) => {
    return (
        <motion.div
            key="wires"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">All Wires</h2>
                <Link
                    to="/wire"
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg font-bold text-sm transition-all"
                >
                    <Plus className="w-4 h-4" />
                    New Wire
                </Link>
            </div>

            {wiresLoading ? (
                <TweetListSkeleton count={5} />
            ) : allWires.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/30 border border-zinc-800 rounded-2xl">
                    <MessageSquare className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No wires yet</h3>
                    <p className="text-zinc-500 mb-6">Share your first thought</p>
                    <Link to="/wire" className="px-6 py-3 bg-white text-black hover:bg-zinc-200 rounded-xl font-bold transition-all inline-block">
                        Post Wire
                    </Link>
                </div>
            ) : (
                <div className="space-y-3 max-w-3xl">
                    {allWires.map((wire) => (
                        <WireCardMini
                            key={wire._id}
                            wire={wire}
                            onToggleStealth={() => toggleWireStealthMutation.mutate({ wireId: wire._id, currentStealth: wire.isStealthMode })}
                            onDelete={() => deleteWireMutation.mutate(wire._id)}
                        />
                    ))}
                </div>
            )}
        </motion.div>
    )
}

export default WireList
